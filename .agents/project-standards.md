# Tiêu chuẩn Lập trình Dự án (Project Coding Standards)

Tài liệu này trình bày các mẫu thiết kế (coding patterns) và quy tắc (conventions) được sử dụng trong dự án dựa trên phân tích mã nguồn hiện tại.

## 1. Cấu trúc thư mục (Folder Structure Conventions)

Dự án sử dụng kiến trúc Microservices với mỗi service backend (Node.js/Express hoặc FastAPI) là một dự án độc lập, đi kèm với một ứng dụng Frontend (Next.js/React).

### Backend Service (Node.js/Express)
Cấu trúc cơ bản của một service backend:
```
ev-service-center-backend/<service-name>/
├── src/
│   ├── config/       # Cấu hình ứng dụng (Database, Môi trường)
│   ├── controllers/  # Xử lý logic của các API (Req/Res)
│   ├── models/       # Định nghĩa model cơ sở dữ liệu (Sequelize ORM)
│   ├── routes/       # Định nghĩa các endpoint API và gắn middleware
│   ├── middlewares/  # Các hàm trung gian (Xác thực, Phân quyền)
│   └── client/       # (Tùy chọn) Chứa HTTP clients gọi tới các service khác
├── Dockerfile        # Cấu hình Docker
└── package.json
```

### Frontend (React/Next.js)
```
ev-service-center-frontend/
├── src/
│   ├── app/          # Định tuyến các trang (App Router)
│   ├── components/   # Các UI Component có thể tái sử dụng
│   ├── lib/          # Các hàm tiện ích dùng chung (ví dụ: httpClient.ts)
│   └── (các thư mục context, hooks, v.v...)
```

## 2. Quy chuẩn API (API Conventions)

- **Định dạng dữ liệu:** Tất cả các API sử dụng dữ liệu JSON cho cả Request (body) và Response.
- **RESTful Routes:** Các routes được nhóm theo module và resource (ví dụ: `/api/appointments`).
- **Giao tiếp liên dịch vụ (Inter-service Communication):**
  - Các service nội bộ gọi nhau sử dụng token tĩnh `INTERNAL_SERVICE_TOKEN` gửi qua Header `Authorization: Bearer <token>`.
  - Frontend gọi API thông qua API Gateway (hoặc trực tiếp tới các service tương ứng) và đính kèm JWT Token của người dùng.
- **Cấu trúc Response:** Thường trả về JSON trực tiếp hoặc kèm thông báo. Phản hồi lỗi trả về mã HTTP thích hợp (400, 401, 403, 404, 500) và một đối tượng JSON có cấu trúc thông báo lỗi `{ message: "Thông báo lỗi" }` hoặc `{ error: "Thông báo lỗi" }`.

## 3. Quy chuẩn tầng Service (Service Layer Conventions)

Hiện tại, dự án **không** tách biệt hoàn toàn tầng Service (Service/Business Logic Layer) như một chuẩn thiết kế rõ ràng trong một thư mục riêng biệt.
- Logic nghiệp vụ đang được viết trực tiếp bên trong các hàm của **Controller**.
- Khi cần gọi tới một service khác (như gọi `userService` từ `bookingService`), các lệnh gọi API được đóng gói vào thư mục `src/client/` sử dụng `axios`. Điều này hoạt động như một tầng giao tiếp với dịch vụ bên ngoài, thay vì Service layer xử lý logic nội bộ.

*Khuyến nghị:* Trong tương lai nên tạo một thư mục `src/services/` để tách logic nghiệp vụ phức tạp ra khỏi Controller, giúp Controller chỉ đóng vai trò nhận Request, gọi Service và trả về Response.

## 4. Quy chuẩn tầng Repository (Repository Conventions)

Dự án hiện tại **không sử dụng** mẫu Repository (Repository Pattern).
- Tương tác với cơ sở dữ liệu (Database access) được thực hiện trực tiếp trong các **Controllers** thông qua các phương thức của **Sequelize ORM** (ví dụ: `Appointment.findAll()`, `User.findByPk()`).

*Khuyến nghị:* Mặc dù ORM đã đóng vai trò như một kho lưu trữ dữ liệu, việc đưa truy vấn CSDL trực tiếp vào Controller khiến mã khó kiểm thử và bảo trì nếu logic truy vấn phức tạp. Việc áp dụng Repository Pattern có thể được cân nhắc nếu dự án mở rộng.

## 5. Mẫu kiểm tra tính hợp lệ (Validation Patterns)

- **Mức CSDL (Database/Model Level):** Sử dụng các tính năng validation tích hợp sẵn của **Sequelize ORM**. Trong thư mục `models/`, mỗi trường được định nghĩa kiểu dữ liệu chặt chẽ và các ràng buộc (ví dụ: `allowNull: false`).
- **Mức Request (Controller Level):** Các validation đơn giản (kiểm tra trường bắt buộc, kiểm tra rỗng, trùng lặp) được thực hiện thủ công ngay đầu mỗi hàm trong Controller bằng các lệnh if/else: `if (!req.body.field) { return res.status(400)... }`. Dự án hiện chưa sử dụng một thư viện validation request chuyên nghiệp cho body (như Joi, Zod, hay express-validator).

## 6. Mẫu xử lý lỗi (Error Handling Patterns)

- **Khối Try/Catch:** Mọi hàm xử lý trong Controller đều được bao bọc bởi khối `try...catch` để bắt các Exception (lỗi ngoại lệ).
- **Trả về thông báo lỗi:** Bất kỳ lỗi nào phát sinh (catch) đều được trả về cho client thông qua status code 500: `res.status(500).json({ error: error.message || 'Lỗi server nội bộ' })`.
- **Frontend Interceptors:** Phía Frontend, thư viện `axios` được cấu hình (`httpClient.ts`) với HTTP interceptor để tự động bắt các lỗi như 401 Unauthorized, từ đó tự động xóa token và chuyển hướng người dùng về trang đăng nhập `/login`.

## 7. Mẫu kiểm thử (Testing Patterns)

- **Unit/Integration Test:** Hiện tại mã nguồn không chứa bất kỳ framework kiểm thử tự động nào (như Jest hay Mocha) và không có các tệp test (`*.spec.js` hoặc `*.test.js`) được định nghĩa cho cả Frontend và Backend.
- Quá trình phát triển dường như phụ thuộc vào **kiểm thử thủ công (manual testing)**.

## 8. Quy tắc đặt tên (Naming Conventions)

- **Tệp và Thư mục:**
  - Tên tệp JavaScript/TypeScript trong thư mục `controllers`, `routes`, `models` sử dụng dạng **camelCase** (ví dụ: `bookingController.js`, `appointment.js`).
  - Tệp component React ở frontend sử dụng **PascalCase** đối với các file React Component, hoặc dựa theo chuẩn cấu trúc framework hiện dùng (ví dụ: thư mục `app` của Next.js dùng `page.tsx`).
- **Biến và Hàm (Variables & Functions):** Sử dụng dạng **camelCase** (`fetchAppointments`, `userId`, `createBooking`).
- **Tên Class / Model Database:** Sử dụng dạng **PascalCase** cho tên file Model và đối tượng (ví dụ: `Appointment`, `Review`).
- **Môi trường (Environment Variables):** Sử dụng dạng **UPPER_SNAKE_CASE** (ví dụ: `DB_HOST`, `JWT_SECRET`, `INTERNAL_SERVICE_TOKEN`).
- **Tên Service / Repository Git:** Đặt tên dự án con / service dưới dạng **kebab-case** (ví dụ: `booking-service`, `ev-service-center-backend`).
