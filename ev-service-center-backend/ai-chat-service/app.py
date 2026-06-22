import os
import requests
import jwt
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.vectorstores import FAISS
from langchain.tools.retriever import create_retriever_tool
from langchain.agents import tool, AgentExecutor, create_tool_calling_agent
from langchain.globals import set_debug

set_debug(True)

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
import uuid
from typing import Optional

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

# Global variable for Agent Executor
agent_with_history = None
chat_history_store = {}

def get_session_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in chat_history_store:
        chat_history_store[session_id] = ChatMessageHistory()
    return chat_history_store[session_id]

@tool
def get_service_centers() -> str:
    """Sử dụng công cụ này ĐỂ LẤY DANH SÁCH TẤT CẢ CÁC TRUNG TÂM DỊCH VỤ / CHI NHÁNH / ĐỊA CHỈ hiện có trong cơ sở dữ liệu. LUÔN LUÔN DÙNG công cụ này khi khách hàng hỏi về địa chỉ, chi nhánh."""
    try:
        # Gọi API nội bộ sang booking-service (chạy trong cùng mạng Docker)
        response = requests.get("http://booking-service:5002/service-center")
        if response.status_code == 200:
            data = response.json()
            # Dữ liệu trả về có dạng { data: [...] } hoặc tuỳ cấu trúc
            centers = data.get("data", []) if isinstance(data, dict) else data
            
            if not centers:
                return "Hiện tại chưa có chi nhánh nào hoạt động."
            
            result = "Danh sách chi nhánh (Real-time từ Database):\n"
            for c in centers:
                name = c.get('name', 'N/A')
                address = c.get('address', 'N/A')
                phone = c.get('phone', 'N/A')
                result += f"- {name}: {address} (SĐT: {phone})\n"
            return result
        else:
            return f"Không thể lấy danh sách chi nhánh do lỗi HTTP {response.status_code}."
    except Exception as e:
        return f"Lỗi kết nối tới hệ thống chi nhánh: {str(e)}"

@tool
def get_user_vehicles(user_id: str) -> str:
    """Sử dụng công cụ này ĐỂ LẤY DANH SÁCH XE CỦA KHÁCH HÀNG đang chat. BẮT BUỘC cung cấp user_id."""
    if not str(user_id).isdigit():
        return "Xin lỗi, bạn cần đăng nhập tài khoản trước thì tôi mới có thể kiểm tra danh sách xe của bạn được."
    try:
        headers = {"Authorization": "Bearer internal-booking-token"}
        response = requests.get(f"http://vehicle-service:5006/api/vehicle/user/{int(user_id)}", headers=headers)
        if response.status_code == 200:
            data = response.json()
            vehicles = data.get("data", [])
            if not vehicles:
                return "Khách hàng hiện chưa có chiếc xe nào được đăng ký trong hệ thống."
            result = "Danh sách xe của khách hàng:\n"
            for v in vehicles:
                result += f"- Xe {v.get('brand')} {v.get('model')} (Năm {v.get('year')}), Biển số: {v.get('licensePlate')}, ID xe: {v.get('id')}\n"
            return result
        return f"Lỗi gọi API: HTTP {response.status_code}"
    except Exception as e:
        return f"Lỗi kết nối tới hệ thống quản lý xe: {str(e)}"

@tool
def create_appointment(name: str, phone: str, date: str, center_id: int, user_id: str) -> str:
    """Sử dụng công cụ này ĐỂ ĐẶT LỊCH HẸN BẢO DƯỠNG/SỬA CHỮA khi khách hàng cung cấp đủ Tên, Số điện thoại, Ngày muốn đến (YYYY-MM-DD), ID của Chi nhánh (center_id) và user_id của họ. LUÔN hỏi đủ thông tin trước khi dùng công cụ này."""
    if not str(user_id).isdigit():
        return "Xin lỗi, bạn cần đăng nhập tài khoản trước thì tôi mới có thể tạo lịch hẹn bảo dưỡng cho bạn được."
    try:
        payload = {
            "userId": int(user_id),
            "serviceCenterId": center_id,
            "date": date,
            "timeSlot": "08:00 - 10:00",
            "startTime": f"{date}T08:00:00.000Z",
            "notes": f"Tên KH: {name}, SĐT: {phone}"
        }
        headers = {
            "INTERNAL_SERVICE_TOKEN": "internal-booking-token"
        }
        response = requests.post("http://booking-service:5002/appointment", json=payload, headers=headers)
        if response.status_code in [200, 201]:
            return "Đặt lịch hẹn thành công! Hãy thông báo cho khách hàng là lịch hẹn đã được ghi nhận."
        else:
            return f"Đặt lịch hẹn thất bại. Lỗi: {response.text}"
    except Exception as e:
        return f"Lỗi kết nối tới hệ thống đặt lịch: {str(e)}"

@app.on_event("startup")
def startup_event():
    global agent_with_history
    
    if not os.path.exists("faiss_index"):
        print("Cảnh báo: Không tìm thấy faiss_index. Hãy chạy ingest_data.py trước.")
        return

    # 1. Khởi tạo Embeddings & RAG Retriever
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001", google_api_key=os.getenv("GEMINI_API_KEY"))
    vector_store = FAISS.load_local("faiss_index", embeddings, allow_dangerous_deserialization=True)
    retriever = vector_store.as_retriever(search_kwargs={"k": 3})

    # Tạo Tool 1: Đọc cẩm nang
    retriever_tool = create_retriever_tool(
        retriever,
        "search_ev_manual",
        "Sử dụng công cụ này ĐỂ TÌM KIẾM THÔNG TIN về BẢNG GIÁ DỊCH VỤ, HƯỚNG DẪN SỬ DỤNG XE, LỖI THƯỜNG GẶP của xe điện từ Cẩm nang nội bộ."
    )

    # 2. Tạo LLM
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.3, max_retries=1, google_api_key=os.getenv("GEMINI_API_KEY"))

    # Tổng hợp Tools (Cẩm nang + API Database + Booking + Xe User)
    tools = [retriever_tool, get_service_centers, create_appointment, get_user_vehicles]

    # 3. Khởi tạo Prompt cho AI Agent
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Bạn là trợ lý ảo AI thông minh của Trung tâm dịch vụ xe điện EV Service Center. "
                   "Bạn ĐƯỢC TRANG BỊ CÁC CÔNG CỤ (TOOLS). Khi trả lời người dùng, hãy LUÔN LUÔN xem xét dùng công cụ nào cho phù hợp:\n"
                   "- Khách hàng đang chat có User ID là: {user_id}. Hãy sử dụng ID này khi gọi các tool cần thiết.\n"
                   "- Nếu khách hỏi về ĐỊA CHỈ, CHI NHÁNH, TÌM CƠ SỞ: BẮT BUỘC dùng công cụ 'get_service_centers'.\n"
                   "- Nếu khách hỏi về BẢNG GIÁ, SỬA CHỮA, LỖI XE: BẮT BUỘC dùng công cụ 'search_ev_manual'.\n"
                   "- Nếu khách hỏi về THÔNG TIN XE CỦA HỌ (xe của tôi, biển số xe tôi): BẮT BUỘC dùng công cụ 'get_user_vehicles' với {user_id} được cung cấp.\n"
                   "- Nếu khách muốn ĐẶT LỊCH HẸN: BẮT BUỘC dùng công cụ 'create_appointment'. Hãy chủ động đóng vai trò CSKH, hỏi thông tin còn thiếu (Tên, Số điện thoại, Ngày đến, Chi nhánh). LƯU Ý QUAN TRỌNG: Tool 'create_appointment' yêu cầu truyền vào 'center_id' (là một số nguyên). Nếu khách hàng chỉ cung cấp tên chi nhánh (VD: Trung tâm A3), bạn PHẢI TỰ ĐỘNG gọi tool 'get_service_centers' trước để tra cứu lấy ID của chi nhánh đó, sau đó mới tiến hành đặt lịch. KHÔNG ĐƯỢC BẮT KHÁCH HÀNG TỰ TÌM ID CHI NHÁNH.\n"
                   "- BẮT BUỘC: Sau khi gọi công cụ và nhận được kết quả (VD: danh sách xe, danh sách chi nhánh), BẠN PHẢI TRẢ LỜI CHO KHÁCH HÀNG BẰNG NGÔN NGỮ TỰ NHIÊN. TUYỆT ĐỐI KHÔNG ĐƯỢC TRẢ VỀ CHUỖI RỖNG!\n"
                   "- Nếu bạn không biết, hãy nói bạn không biết. Hãy trả lời bằng tiếng Việt, lịch sự và chuyên nghiệp."),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
        ("placeholder", "{agent_scratchpad}"),
    ])

    # 4. Khởi tạo Tool Calling Agent
    agent = create_tool_calling_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
    
    # 5. Bọc Agent với Memory
    agent_with_history = RunnableWithMessageHistory(
        agent_executor,
        get_session_history,
        input_messages_key="input",
        history_messages_key="chat_history",
    )
    
    print("🚀 AI Agent (Tool-Calling) đã khởi tạo thành công!")

@app.post("/api/ai-chat")
@app.post("/api/ai-chat/ask")
async def ai_chat(chat_req: ChatRequest, req: Request):
    if not agent_with_history:
        raise HTTPException(status_code=503, detail="Hệ thống AI Agent chưa sẵn sàng.")
    
    # 1. Trích xuất JWT để lấy userId
    auth_header = req.headers.get("Authorization")
    user_id = None
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(token, options={"verify_signature": False})
            user_id = payload.get("id")
        except Exception as e:
            print("Failed to decode JWT:", e)
            
    # Xử lý trường hợp không có userId
    safe_user_id = user_id if user_id is not None else "Khách vãng lai (Chưa đăng nhập)"
    
    session_id = chat_req.session_id or str(uuid.uuid4())
    
    try:
        # Kích hoạt Agent với câu hỏi của User kèm session_id và user_id
        response = agent_with_history.invoke(
            {"input": chat_req.message, "user_id": safe_user_id},
            config={"configurable": {"session_id": session_id}}
        )
        return {
            "reply": response["output"],
            "session_id": session_id
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        error_msg = str(e)
        if "429" in error_msg or "Quota exceeded" in error_msg:
            return {"reply": "Xin lỗi, hệ thống AI đang bị quá tải do vượt quá giới hạn truy cập miễn phí của Google (20 câu/phút). Bạn vui lòng đợi khoảng 30 giây rồi hỏi lại nhé!"}
        raise HTTPException(status_code=500, detail=error_msg)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5009)
