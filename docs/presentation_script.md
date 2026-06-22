# KỊCH BẢN THUYẾT TRÌNH VÀ BẢO VỆ ĐỒ ÁN (FULL SCRIPT)
**Môn học:** Điện toán đám mây
**Dự án:** Hệ thống Quản lý Trung tâm Bảo dưỡng Xe điện (EV Service Center)

> [!TIP]
> **Hướng dẫn sử dụng:** 
> Kịch bản này đã được bổ sung phần giải nghĩa từ vựng/công cụ ở trong các dấu ngoặc. Khi đọc, bạn hãy lướt qua để nhớ bản chất của công cụ đó là gì nhé!

---

## PHẦN I: THUYẾT TRÌNH CHÍNH (10 - 12 Phút)

### 1. Chào hỏi & Đặt vấn đề (2 phút)
**Bạn (Tươi cười, dõng dạc):**
"Dạ em chào Thầy/Cô và các bạn sinh viên đang có mặt trong buổi bảo vệ đồ án hôm nay. Em xin phép được trình bày đồ án kết thúc môn Điện toán đám mây. Dự án của em mang tên: **Hệ thống Quản lý Trung tâm Bảo dưỡng Xe điện (EV Service Center)**. 

Mục tiêu của dự án là xây dựng một nền tảng toàn diện giúp khách hàng đặt lịch sửa chữa xe điện, đồng thời giúp trung tâm quản lý kho phụ tùng, nhân sự. 

Tuy nhiên, điểm nhấn quan trọng nhất của đồ án này không chỉ nằm ở chức năng phần mềm, mà nằm ở **Kiến trúc Cloud và Bảo mật** mà em đã thiết kế để hệ thống có thể chịu tải và chạy thực tế (Production-ready)."

### 2. Hạ tầng Cloud & Công cụ triển khai (4 phút)
**Bạn (Chỉ tay vào sơ đồ hoặc màn hình):**
"Toàn bộ hệ thống này đang được host (lưu trữ) trực tiếp trên nền tảng **Google Cloud Platform (GCP)** - *đây là dịch vụ điện toán đám mây của Google cung cấp hạ tầng máy chủ ảo mạnh mẽ*. Cụ thể, em sử dụng một máy ảo chạy hệ điều hành **Ubuntu 22.04** - *hệ điều hành lõi Linux chuyên biệt siêu nhẹ và bảo mật cho máy chủ*.

Thay vì code toàn bộ dự án thành một khối khổng lồ dễ sụp đổ, em áp dụng **Kiến trúc Microservices (Dịch vụ vi mô)**. Hệ thống được xé nhỏ thành 7 dịch vụ độc lập như: Xác thực, Đặt lịch, Kho phụ tùng... 

Để triển khai số lượng dịch vụ lớn như vậy lên Cloud, em sử dụng **Docker** - *đây là công nghệ ảo hóa (Containerization) giúp đóng gói toàn bộ code và thư viện của em vào những chiếc 'thùng container', cam kết mang đi máy chủ nào cũng chạy được y chang nhau*. 
Đi kèm với đó, em dùng **Docker Compose** - *một công cụ kịch bản (Orchestration) giúp em chỉ cần gõ 1 lệnh duy nhất là khởi động đồng loạt cả 11 container này lên cùng lúc một cách trơn tru.*"

### 3. Giải pháp Cơ sở dữ liệu & Bảo mật mạng (4 phút)
> [!IMPORTANT]
> (Nhấn mạnh phần này, đây là chỗ lấy điểm cao)

**Bạn:**
"Về Cơ sở dữ liệu, em áp dụng mẫu thiết kế **Database per Service** (Mỗi dịch vụ một DB). Em dùng hệ quản trị **MySQL 8.0** chạy bên trong Docker và chia thành 7 khối DB riêng. Tức là nếu dịch vụ Đặt lịch (Booking) bị sập DB, thì dịch vụ Đăng nhập (Auth) vẫn chạy bình thường.

Đặc biệt, để đưa hệ thống ra Internet một cách an toàn, em đã xây dựng 3 lớp khiên bảo vệ bằng các công cụ chuyên dụng:
- **Lớp 1 (Tên miền):** Em dùng **DuckDNS** - *dịch vụ cung cấp tên miền động miễn phí*. Nó giúp em che giấu địa chỉ IP khô khan của máy ảo bằng một tên miền thân thiện là `dichvuxedienev.duckdns.org`.
- **Lớp 2 (Bảo vệ cổng):** Em cài đặt **Nginx** - *một phần mềm máy chủ web đóng vai trò làm Reverse Proxy (Proxy ngược)*. Nginx sẽ đứng ở ranh giới ngoài cùng, hứng toàn bộ kết nối từ người dùng, rồi mới âm thầm điều hướng vào các cổng bị giấu kín bên trong Docker. Khách hàng sẽ không bao giờ biết cấu trúc nội bộ của hệ thống.
- **Lớp 3 (Mã hóa):** Em sử dụng công cụ **Certbot** để tự động xin cấp phát chứng chỉ bảo mật từ **Let's Encrypt** *(một tổ chức cung cấp SSL miễn phí toàn cầu)*. Nhờ đó, toàn bộ dữ liệu trao đổi trên web đều được mã hóa bằng chuẩn **HTTPS (Ổ khóa xanh)** chống nghe lén tuyệt đối."

### 4. Demo Trực Tiếp (Live Demo) (4 phút)
**Bạn:**
"Bây giờ em xin phép được Demo trực tiếp trên môi trường Cloud. Mọi người có thể thấy trên thanh địa chỉ, trình duyệt hiện rõ ổ khóa xanh an toàn.

*(Thao tác mở trình duyệt Ẩn Danh - vai Khách hàng)*
Đầu tiên, em sẽ đăng nhập bằng tài khoản Khách hàng `nguoidunga@gmail.com` (pass: 123456). Khách hàng sẽ tiến hành xem xe và Đặt một lịch bảo dưỡng.

*(Thao tác mở trình duyệt Bình thường - vai Admin)*
Tiếp theo, em chuyển qua tab của Ban Quản Trị đang đăng nhập tài khoản `administrator@example.com`. 
Người quản lý sẽ xem được Lịch hẹn vừa đổ về hệ thống theo thời gian thực và tiến hành duyệt. Tất cả các yêu cầu này đều được **API Gateway** *(Trạm kiểm soát trung tâm)* định tuyến vào đúng Microservice tương ứng bên trong.

Phần trình bày đồ án của em đến đây là kết thúc. Em xin chân thành cảm ơn Thầy/Cô và các bạn đã lắng nghe ạ!"

---

## PHẦN II: TƯƠNG TÁC Q&A (HỎI ĐÁP PHẢN BIỆN)
> [!TIP]
> Kho vũ khí ngôn từ để tự vệ khi bị hỏi khó.

**1. Thầy Cô hỏi:** *"Em dùng công nghệ gì để quản lý Database? Nếu máy ảo Google bị hỏng ổ cứng thì mất hết dữ liệu à?"*
**Bạn trả lời:** "Dạ thưa Thầy/Cô, hiện tại MySQL đang chạy trong Docker, và em đã dùng tính năng **Docker Volumes** *(cơ chế gắn ổ cứng ngoài cho container)* để lưu dữ liệu thẳng ra ổ cứng của máy ảo, nên container có xóa đi dữ liệu vẫn còn. Tuy nhiên em đồng ý là nếu hỏng nguyên máy ảo thì rủi ro rất cao. Giải pháp cho môi trường Thực tế của em là sẽ chuyển hẳn MySQL lên dịch vụ **Google Cloud SQL** *(dịch vụ quản trị DB chuyên nghiệp)* để được Google tự động backup hàng ngày ạ."

**2. Sinh viên hỏi:** *"Trang web của bạn bị trình duyệt báo màn hình đỏ là trang web lừa đảo (Phishing), có phải bảo mật HTTPS của bạn làm bị lỗi không?"*
**Bạn trả lời:** "Bạn yên tâm, lỗi không nằm ở kiến trúc bảo mật. Bạn click vào ổ khóa xanh sẽ thấy chứng chỉ mã hóa Let's Encrypt vẫn là Valid (Hợp lệ). 
Trình duyệt báo đỏ là vì mình đang dùng công cụ cấp tên miền miễn phí là **DuckDNS**. Hacker hay dùng nền tảng này làm web giả mạo nên Google Chrome/Cốc Cốc tự động đánh dấu nghi ngờ. Nếu dự án mua một tên miền `.com` trỏ vào thì sẽ hoàn toàn sạch sẽ, vì phần lõi hệ thống bảo mật SSL của mình đã thiết lập chuẩn 100% rồi."

**3. Thầy Cô hỏi:** *"Tại sao em không gộp chung Database lại cho dễ truy vấn mà phải tách ra 7 cái?"*
**Bạn trả lời:** "Dạ thưa Thầy/Cô, đây là bản chất cốt lõi của Kiến trúc Microservices. Việc tách DB giúp em đạt được sự **Độc lập rủi ro (Fault Isolation)**. Nếu dịch vụ Kho phụ tùng bị lỗi treo Database, thì dịch vụ Đặt lịch hẹn vẫn chạy bình thường. Đồng thời nó mang lại khả năng **Mở rộng (Scalability)**: Khi chức năng Đặt lịch bị quá tải, em có thể bốc riêng DB của nó qua một máy chủ cấu hình mạnh hơn mà không chạm vào các khối DB còn lại ạ."

**4. Sinh viên hỏi:** *"Trong lúc làm, ông gặp lỗi gì khoai nhất và giải quyết sao?"*
**Bạn trả lời:** "Lỗi đau đầu nhất là **Network Timeout (Lỗi mất kết nối mạng)** giữa Frontend và API Gateway khi đưa từ máy tính cá nhân lên Cloud. 
Do đặc thù của Frontend là code chạy trên **trình duyệt của người dùng (Client-side)**, nên trình duyệt không thể hiểu URL nội bộ `http://api-gateway:8080` của Docker là gì. Mình đã phải xử lý bằng cách khai báo lại **Biến môi trường (.env)**, gán cứng URL thành cái tên miền Public `https://api.dichvuxedienev...`. Khi đó trình duyệt khách hàng mới biết đường chạy xuyên qua Internet vào tới máy ảo."
