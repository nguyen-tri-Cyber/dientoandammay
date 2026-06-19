import os
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.vectorstores import FAISS
from langchain.tools.retriever import create_retriever_tool
from langchain.agents import tool, AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate

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

# Global variable for Agent Executor
agent_executor = None

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

@app.on_event("startup")
def startup_event():
    global agent_executor
    
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

    # 2. Tạo LLM (Gemini 2.5 Flash)
    llm = ChatGoogleGenerativeAI(model="models/gemini-2.5-flash", temperature=0.3, google_api_key=os.getenv("GEMINI_API_KEY"))

    # Tổng hợp Tools (Cẩm nang + API Database)
    tools = [retriever_tool, get_service_centers]

    # 3. Khởi tạo Prompt cho AI Agent
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Bạn là trợ lý ảo AI thông minh của Trung tâm dịch vụ xe điện EV Service Center. "
                   "Bạn ĐƯỢC TRANG BỊ CÁC CÔNG CỤ (TOOLS). Khi trả lời người dùng, hãy LUÔN LUÔN xem xét dùng công cụ nào cho phù hợp:\n"
                   "- Nếu khách hỏi về ĐỊA CHỈ, CHI NHÁNH, TÌM CƠ SỞ: BẮT BUỘC dùng công cụ 'get_service_centers'.\n"
                   "- Nếu khách hỏi về BẢNG GIÁ, SỬA CHỮA, LỖI XE: BẮT BUỘC dùng công cụ 'search_ev_manual'.\n"
                   "- Nếu bạn không biết, hãy nói bạn không biết. Hãy trả lời bằng tiếng Việt, lịch sự và chuyên nghiệp."),
        ("human", "{input}"),
        ("placeholder", "{agent_scratchpad}"),
    ])

    # 4. Khởi tạo Tool Calling Agent
    agent = create_tool_calling_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
    
    print("🚀 AI Agent (Tool-Calling) đã khởi tạo thành công!")

@app.post("/api/ai-chat")
@app.post("/api/ai-chat/ask")
async def ai_chat(request: ChatRequest):
    if not agent_executor:
        raise HTTPException(status_code=503, detail="Hệ thống AI Agent chưa sẵn sàng.")
    
    try:
        # Kích hoạt Agent với câu hỏi của User
        response = agent_executor.invoke({"input": request.message})
        return {"reply": response["output"]}
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "Quota exceeded" in error_msg:
            return {"reply": "Xin lỗi, hệ thống AI đang bị quá tải do vượt quá giới hạn truy cập miễn phí của Google (20 câu/phút). Bạn vui lòng đợi khoảng 30 giây rồi hỏi lại nhé!"}
        raise HTTPException(status_code=500, detail=error_msg)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5009)
