# TÀI LIỆU PHÂN TÍCH KIẾN TRÚC KỸ THUẬT DỰ ÁN
**EV Service Center Management System**

> [!TIP]
> Tài liệu này được biên soạn dưới dạng "Phân tích Kiến trúc Kỹ thuật" (Technical Architecture Deep-dive). Thay vì học thuộc lòng câu hỏi, bạn hãy đọc hiểu bản chất hoạt động của từng phân hệ. Khi nắm vững các khái niệm này, bạn có thể tự tin diễn giải lại bằng lời văn của mình trước hội đồng.

---

## 1. Phân Tích Bài Toán Thực Tế
Ngành xe điện (EV) đòi hỏi quy trình bảo dưỡng phức tạp hơn xe xăng truyền thống (quản lý phần mềm, tình trạng pin, linh kiện chuyên dụng). Hệ thống **EV Service Center** ra đời nhằm số hóa toàn diện quy trình này:
- **Trải nghiệm khách hàng:** Cung cấp giao diện đặt lịch bảo dưỡng, quản lý hồ sơ phương tiện.
- **Vận hành trung tâm:** Số hóa quy trình quản lý lệnh sửa chữa (Workorder), kho phụ tùng (Inventory), nhân sự và xuất hóa đơn tài chính (Finance).

---

## 2. Mô hình Triển Khai Hạ Tầng (Cloud & DevOps)
Dự án không chạy trên máy tính cá nhân mà được triển khai thực tế trên môi trường Điện toán đám mây.

**2.1. Hạ tầng IaaS (Infrastructure as a Service):**
Dự án sử dụng Google Cloud Compute Engine (Máy ảo Ubuntu 22.04). Đây là mô hình IaaS cung cấp sức mạnh tính toán (CPU, RAM) thô để tự do cấu hình mạng và cài đặt phần mềm.

**2.2. Công nghệ Ảo hóa (Containerization):**
Toàn bộ dự án áp dụng **Docker**. Thay vì cài đặt Node.js hay MySQL thủ công lên hệ điều hành dễ gây xung đột, mọi thành phần (Frontend, Gateway, 7 Backend Services, Database) được đóng gói thành các khối Container biệt lập.
- Cấu hình **Docker Compose** đóng vai trò là kịch bản điều phối (Orchestration), giúp khởi động đồng loạt 11 services theo đúng thứ tự (ví dụ: Đợi Database khởi động xong mới chạy Backend).

---

## 3. Kiến Trúc Microservices & Cơ Sở Dữ Liệu
Thay vì xây dựng phần mềm dạng khối (Monolithic), dự án chia nhỏ thành 7 dịch vụ độc lập (Auth, Booking, Finance, Inventory, Notification, Vehicle, Workorder).

**3.1. Độc Lập Rủi Ro (Fault Isolation):**
Nhờ Microservices, nếu phân hệ Quản lý Kho (Inventory) bị sập do quá tải, tính năng Đặt lịch (Booking) hay Đăng nhập (Auth) của khách hàng vẫn hoạt động bình thường, bảo vệ trải nghiệm người dùng khỏi hiệu ứng "sụp đổ dây chuyền".

**3.2. Chiến lược Dữ liệu (Database per Service):**
Hệ thống tuân thủ chặt chẽ nguyên tắc "Mỗi dịch vụ một Database". MySQL 8.0 được chia thành 7 schema tách biệt.
- **Không dùng Khóa Ngoại (No Foreign Keys):** Việc truy vấn chéo giữa các database bị cấm. Ví dụ, bảng `Appointments` (thuộc Booking DB) chỉ lưu thông tin `user_id` ở dạng số nguyên, không được dùng Khóa ngoại trỏ sang bảng `Users` (thuộc Auth DB).
- **Cách gom dữ liệu (Data Aggregation):** Để hiển thị Tên khách hàng trong Lịch hẹn, Backend Code (Booking Service) sẽ gọi API nội bộ sang Auth Service để lấy thông tin Tên, sau đó tự ghép lại (map) trước khi trả về cho Frontend. Điều này đảm bảo tính độc lập dữ liệu tuyệt đối.

---

## 4. Bảo Mật & Phân Phối Luồng Mạng (Networking)
Luồng dữ liệu đi từ Trình duyệt khách hàng đến Database phải vượt qua 3 lớp phòng ngự:

**Lớp 1: Danh tính Mạng (Domain & DNS)**
- Dùng tên miền động **DuckDNS** (`api.dichvuxedienev.duckdns.org`) để thay thế cho IP tĩnh của máy ảo.
- Khắc phục lỗi Network Timeout: Trình duyệt của khách hàng không thể hiểu URL nội bộ Docker (`http://api-gateway:8080`). Việc thiết lập tên miền public vào biến `.env` giúp trình duyệt có thể băng qua Internet tìm đúng máy ảo.

**Lớp 2: Bảo vệ Biên giới (Reverse Proxy & SSL)**
- **Nginx** được cài đặt làm Reverse Proxy. Nginx đứng ở cổng ngoài cùng (Port 443), trực tiếp nhận yêu cầu từ khách hàng.
- Nginx nắm giữ chứng chỉ mã hóa **Let's Encrypt SSL**. Toàn bộ dữ liệu truyền tải đều được mã hóa bất đối xứng (**HTTPS**), chống việc nghe lén gói tin trên Internet. Lõi ứng dụng bên trong không cần quan tâm đến giải mã HTTPS.

**Lớp 3: Trạm Điều Phối (API Gateway)**
- Dữ liệu thô (HTTP) sau khi qua Nginx sẽ được đẩy vào **API Gateway** (Port 8080).
- Gateway che giấu hoàn toàn hệ thống 7 Microservices phức tạp bên trong. Nó đóng vai trò "người gác cổng", kiểm tra tính hợp lệ của Token đăng nhập (JWT).
- Dùng thư viện `http-proxy-middleware`, Gateway tiến hành **Định tuyến (Routing)**. Nếu đường dẫn là `/api/booking`, nó sẽ bẻ lái luồng dữ liệu ném sang container `booking-service` ở cổng 5002.

---

## 5. Frontend & Rendering
Giao diện người dùng được xây dựng bằng **Next.js** và **Tailwind CSS**.

- **Giao tiếp API:** `httpClient.ts` (dựa trên Axios) là trái tim của Frontend, tự động gài Token bảo mật vào mọi Request gửi đi và bắt lỗi hệ thống trả về.
- **Xử lý Hydration:** Khi đưa hệ thống lên môi trường thực tế, trình duyệt khách hàng thường có các extension can thiệp giao diện (như Google Translate). Việc này làm cấu trúc HTML thay đổi, gây ra lỗi Crash ReactJS (Hydration Mismatch). Giải pháp đưa ra là khai báo `suppressHydrationWarning` và vô hiệu hóa dịch tự động trên thẻ gốc để bảo vệ tính toàn vẹn của ứng dụng.

---

## 6. Tổng Kết: Luồng Chạy Của Một Request Thực Tế
Ví dụ khi khách hàng ấn nút **"Đặt lịch bảo dưỡng"**:
1. **Frontend** đóng gói thông tin (ngày giờ, ID xe) thành JSON, gửi POST lên `https://api.dichvuxedienev...`
2. **Nginx** nhận gói tin HTTPS, giải mã và đẩy vào **API Gateway**.
3. **API Gateway** bóc Header lấy Token. Phát hiện Token hợp lệ, nó định tuyến (route) lệnh POST này sang `Booking Service`.
4. **Booking Service** tiếp nhận, kiểm tra tính hợp lệ của dữ liệu, và gọi lệnh `INSERT` vào schema `db-booking` trong MySQL.
5. **Database** lưu xong, trả tín hiệu về. Dòng phản hồi (Response 200 OK) đi ngược lại lộ trình trên và Frontend hiển thị thông báo thành công cho người dùng.

---

## 7. Các Lệnh Vận Hành Dự Án (Cheatsheet)
Dưới đây là danh sách các lệnh quản trị Docker Compose thiết yếu nhất bạn cần ghi nhớ để vận hành, bật/tắt hoặc sửa lỗi dự án trên máy ảo Google Cloud:

**Bước 1: Di chuyển vào thư mục chứa cấu hình Docker**
Mọi lệnh Docker đều phải chạy ở thư mục `infra` (nơi chứa file `docker-compose.yml`):
```bash
cd ~/ev-service-centerev_organ/infra
```

**Bước 2: Khởi động toàn bộ hệ thống**
Lệnh này sẽ tải các image (nếu thiếu) và bật ngầm (chữ `-d`) toàn bộ 11 container lên:
```bash
sudo docker compose up -d
```

**Bước 3: Tắt hệ thống an toàn**
Tắt các container nhưng vẫn giữ lại Dữ liệu MySQL (Volume):
```bash
sudo docker compose down
```

**Bước 4: Xem màn hình "Giám sát" (Log)**
Nếu web bị lỗi 502 hoặc không truy cập được, dùng lệnh này để xem lịch sử hoạt động của tất cả các service theo thời gian thực (nhấn `Ctrl + C` để thoát màn hình log):
```bash
sudo docker compose logs -f
```

**Bước 5: Xóa bộ nhớ đệm và Build lại khi có Code mới**
Nếu bạn sửa code (ví dụ code Frontend) và muốn hệ thống cập nhật thay đổi đó, bạn phải ép Docker build lại từ đầu bằng cờ `--no-cache`, sau đó bật lại:
```bash
sudo docker compose build --no-cache frontend
sudo docker compose up -d
```
