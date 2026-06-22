# Kế hoạch Nâng cấp EV Service Center AI Chatbot

Kế hoạch này trình bày chi tiết lộ trình 4 giai đoạn để nâng cấp hệ thống AI Chatbot, biến nó từ một hệ thống hỏi-đáp tĩnh đơn giản thành một trợ lý ảo thông minh, có ngữ cảnh và có khả năng tương tác sâu với các microservices khác.

> **Trạng thái hiện tại (Cập nhật phiên làm việc mới nhất):**
> - **Giai đoạn 1:** Đã hoàn thành 100%. (Đã tích hợp `session_id` và Langchain Memory).
> - **Giai đoạn 2:** Đã hoàn thành 100%. (Đã thêm các Tool Đặt lịch hẹn `create_appointment` và Lấy danh sách trung tâm `get_service_centers`).
> - **Giai đoạn 3:** Đã hoàn thành 90%. (Đã tích hợp JWT Token, xử lý trường hợp Khách vãng lai, và gọi Tool kiểm tra xe `get_user_vehicles`).
> - Đã fix các lỗi nghiêm trọng về Model (Đổi sang `gemini-2.5-flash`), fix lỗi Empty String (`MALFORMED_FUNCTION_CALL`) khi không đăng nhập, và fix lỗi Frontend không đính kèm JWT Token.

---

## Giai đoạn 1: Bổ sung Trí nhớ (Conversation Memory) - [✅ Đã hoàn thành]
**Mục tiêu:** Cho phép AI nhớ được ngữ cảnh của đoạn chat hiện tại, giúp người dùng có thể hỏi các câu nối tiếp nhau một cách tự nhiên.

### Thay đổi dự kiến:
#### 1. Backend (`ev-service-center-backend/ai-chat-service/app.py`)
- Cập nhật model `ChatRequest` (Pydantic) để nhận thêm trường tùy chọn `session_id`.
- Thiết lập một Dictionary toàn cục `chat_history_store` để lưu trữ lịch sử tin nhắn tạm thời theo `session_id`.
- Triển khai lớp `BaseChatMessageHistory` (hoặc cấu hình lại `AgentExecutor`) với thư viện `RunnableWithMessageHistory` của LangChain.
- Nếu request không truyền lên `session_id`, hệ thống sẽ tự động tạo một ID ngẫu nhiên.

#### 2. Frontend (`ev-service-center-frontend/src/components/chat/AIChatWidget.tsx`)
- Cập nhật UI Chat của Next.js: Tự động sinh `session_id` khi người dùng mở hoặc làm mới khung chat.
- Đính kèm `session_id` này vào payload gửi POST request lên `/api/ai-chat`.

---

## Giai đoạn 2: Tương tác ghi dữ liệu (Booking Tool) - [✅ Đã hoàn thành]
**Mục tiêu:** Đưa Chatbot từ "đọc" (RAG) sang "ghi" (Action/Tool Calling).

### Thay đổi dự kiến:
- Tạo thêm LangChain `@tool` có tên `create_appointment(name, phone, date, center_id)`.
- Cấu hình Tool này để gọi HTTP POST request tới `http://booking-service:5002/appointment` kèm header xác thực `INTERNAL_SERVICE_TOKEN`.
- Cập nhật System Prompt để AI biết chủ động đóng vai trò CSKH, hỏi thông tin còn thiếu và tự động dùng tool đặt lịch.

---

## Giai đoạn 3: Cá nhân hóa (Authentication Integration) - [🔄 Đang thực hiện]
**Mục tiêu:** AI nhận diện được người dùng đang trò chuyện để trả lời cá nhân hóa.

### Thay đổi dự kiến:
- Đọc JWT từ Header API `/api/ai-chat` để trích xuất `userId`.
- Thêm Tool kiểm tra thông tin xe và tình trạng bảo dưỡng của riêng user đó bằng cách gọi sang `vehicle-service` và `workorder-service`.

---

## Giai đoạn 4: Trải nghiệm mượt mà (Streaming) - [Sẽ thực hiện cuối]
**Mục tiêu:** Tối ưu hiệu năng UI/UX cho Production.

### Thay đổi dự kiến:
- Thay đổi endpoint trả lời tin nhắn sang cấu trúc `StreamingResponse`. Chữ sẽ được đẩy về Frontend theo từng chunk (thời gian thực).
- (Tùy chọn) Viết Endpoint ẩn để kích hoạt chạy lại `ingest_data.py` tự động từ giao diện Admin.

---

## Kế hoạch Kiểm thử (Cho Giai đoạn 1)
- Gọi API `/api/ai-chat` với 2 câu hỏi nối tiếp có cùng `session_id`.
  1. Gửi: `{"message": "Lốp xe giá bao nhiêu?", "session_id": "test-123"}` -> AI báo giá lốp.
  2. Gửi: `{"message": "Thay luôn 4 cái thì hết tổng bao nhiêu?", "session_id": "test-123"}` -> AI tự động nhân 4 lần số tiền dựa vào ngữ cảnh câu 1.
