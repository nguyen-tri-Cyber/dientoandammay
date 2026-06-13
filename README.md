# EV Service Center Management

Dự án môn Điện toán đám mây mô phỏng hệ thống quản lý trung tâm dịch vụ xe điện theo kiến trúc microservices.

## Kiến trúc

- Frontend: Next.js, React, TypeScript, Tailwind CSS.
- API Gateway: Express + http-proxy-middleware, port `8080`.
- Backend services:
  - `auth-service`, port `5001`
  - `booking-service`, port `5002`
  - `finance-service`, port `5003`
  - `inventory-service`, port `5004`
  - `notification-service`, port `5005`
  - `vehicle-service`, port `5006`
  - `workorder-service`, port `5007`
- Database: MySQL 8, container port `3306`, host port `3307`.
- NiFi: host port `8888`.
- Chat: frontend đang dùng Firebase chat; REST `chat-service` hiện chưa bật trong Docker Compose.

## Yêu cầu

- Docker Desktop + Docker Compose.
- Node.js 18+.
- Windows PowerShell: ưu tiên dùng `npm.cmd` nếu `npm` bị chặn bởi execution policy.

## Chạy nhanh để demo

Tại thư mục gốc project:

```powershell
npm.cmd run compose:config
npm.cmd run demo:up
npm.cmd run frontend:dev
```

Truy cập:

- Frontend: `http://localhost:3000`
- API Gateway: `http://localhost:8080`
- NiFi: `http://localhost:8888`

## Tài khoản demo

Auth service tự tạo admin mặc định nếu chưa tồn tại:

- Email: `Admin001@gmail.com`
- Password: `123456`
- Role: `admin`

Database seed cũng có thêm nhiều user demo trong `db/db-auth.sql`. Nếu không chắc mật khẩu seed, dùng admin mặc định ở trên hoặc đăng ký user mới từ UI.

## Kiểm tra health/API nhanh

```powershell
Invoke-RestMethod http://localhost:8080/health
Invoke-RestMethod http://localhost:8080/api/chat/send -Method POST -ContentType "application/json" -Body "{}"
```

`/api/chat` mặc định trả `503` có chủ đích vì REST chat service chưa bật. Đây không phải lỗi gateway.

Đăng nhập qua gateway:

```powershell
Invoke-RestMethod http://localhost:8080/api/auth/login `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"Admin001@gmail.com","password":"123456"}'
```

## Lệnh vận hành

```powershell
npm.cmd run demo:up       # build và chạy backend + MySQL + NiFi
npm.cmd run demo:logs     # xem log các container
npm.cmd run demo:down     # dừng container, giữ volume dữ liệu
npm.cmd run frontend:dev  # chạy Next.js dev server
```

Rebuild một nhóm service sau khi sửa backend:

```powershell
docker compose -f infra/docker-compose.yml up -d --build api-gateway auth-service booking-service finance-service vehicle-service workorder-service
```

Reset database seed từ đầu, chỉ dùng khi muốn xóa dữ liệu demo hiện tại:

```powershell
docker compose -f infra/docker-compose.yml down -v
npm.cmd run demo:up
```

## API Gateway routes chính

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/users`
- `GET|POST /api/booking`
- `GET|POST /api/service-center`
- `GET|POST /api/inventory/parts`
- `GET|POST /api/notification`
- `GET|POST /api/vehicle`
- `GET|POST /api/workorder`
- `GET|POST /api/invoice`
- `GET /api/finance/stats/dashboard`

## Ghi chú triển khai cloud

- Không dùng secret demo như `JWT_SECRET=123456789` hoặc MySQL password `123456789` cho môi trường thật.
- Nên đưa secret vào `.env` hoặc secret manager của cloud provider.
- Frontend cần `NEXT_PUBLIC_API_URL` trỏ về API Gateway public URL khi deploy.
- MySQL cần persistent volume/managed database.
- Nếu bật lại REST chat service, cần thêm service đó vào `infra/docker-compose.yml` và set `CHAT_SERVICE_ENABLED=true` cho API Gateway.

## Kiểm tra trước khi nộp/demo

```powershell
npm.cmd run compose:config
Push-Location ev-service-center-frontend
npm.cmd exec tsc -- --noEmit --incremental false
npm.cmd exec eslint -- .\src
Pop-Location
```

Nếu `next build` bị lỗi tải Google Font trong môi trường mạng bị chặn, chạy dev server để demo local hoặc chuyển font sang local asset trước khi build production.
