# 🛡️ DC ĐẲNG CẤP - PRODUCT CODE MANAGER (PCM)

> **Hệ thống Quản lý Ánh xạ Mã Vạch EAN-13 & Mã Nội Bộ 6 Số (Quan hệ 1 - 1)**  
> Giải pháp toàn diện cho quản lý kho hàng và bán lẻ: Gồm Backend RESTful API, Web Admin Dashboard và Ứng dụng Di động Quét mã Barcode chuyên dụng.

---

## 📌 1. Giới thiệu tổng quan

Hệ thống **Product Code Manager (PCM)** giải quyết bài toán cốt lõi trong bán lẻ và vận hành kho hàng:
- **Ánh xạ ràng buộc 1 - 1 tuyệt đối:** Mỗi Mã vạch EAN-13 (13 chữ số) chỉ tương ứng với duy nhất 1 Mã hàng nội bộ (6 chữ số).
- **Thuật toán GS1 Modulo-10 Checksum:** Tự động kiểm tra tính hợp lệ của mã vạch quốc tế, ngăn chặn sai sót nhập liệu.
- **Tra cứu thời gian thực < 50ms:** Tìm kiếm tức thì khi quét bằng camera điện thoại hoặc máy quét mã vạch chuyên dụng.
- **Giao diện di động linh hoạt:** Hỗ trợ chuyển đổi mượt mà giữa chế độ **Tối (Dark Luxury Neon)** và **Sáng (Modern Clean)**.
- **Truy cập từ xa bảo mật:** Tích hợp kênh truyền mã hóa HTTPS (Cloudflare Tunnel), cho phép nhân viên sử dụng mạng 4G/5G hoặc Wi-Fi ngoài cửa hàng để quét mã an toàn.

---

## 🏗️ 2. Kiến trúc công nghệ (Tech Stack)

| Phân hệ | Công nghệ | Vai trò kỹ thuật |
| :--- | :--- | :--- |
| **Backend API** | Java 21, Spring Boot 3.4, Spring Security, JWT (HMAC-SHA256), Spring Data JPA, Flyway Migration | Xử lý nghiệp vụ lõi, xác thực phân quyền, bảo vệ toàn vẹn dữ liệu |
| **Cơ sở dữ liệu** | MySQL 8.4 LTS | Lưu trữ quan hệ ACID: sản phẩm, mã vạch, lịch sử quét và người dùng |
| **Web Admin** | React 19, Vite, Tailwind CSS, Redux Toolkit, Axios, Lucide Icons | Trang quản trị danh mục, thống kê kho, phân trang và tìm kiếm |
| **Mobile App** | React Native, Expo SDK 58, Expo Camera, SecureStore | Ứng dụng quét mã vạch tốc độ cao trên thiết bị di động |
| **Lưu trữ đám mây** | Cloudinary REST API | Lưu trữ và tối ưu hóa hình ảnh sản phẩm tự động |
| **Kết nối từ xa** | Cloudflare Tunnel | Kênh truyền HTTPS mã hóa kết nối tới máy chủ mà không cần mở cổng Router |
| **Đóng gói** | Docker, Docker Compose, EAS Build | Container hóa hệ thống và xuất file cài đặt Android APK độc lập |

---

## 📁 3. Cấu trúc thư mục dự án

```text
product-code-manager/
├── backend/                   # Mã nguồn Spring Boot REST API
│   ├── src/main/java/         # Controllers, Services, Repositories, Security
│   ├── src/main/resources/    # Cấu hình application.yml & Migration SQL
│   └── Dockerfile             # Container hóa Backend
│
├── frontend-web/              # Giao diện Web Quản trị React
│   ├── src/                   # Components, Pages, Store, API Clients
│   ├── public/                # Tài nguyên tĩnh và trang tải ứng dụng di động
│   └── Dockerfile             # Container hóa Web Frontend
│
├── mobile-app/                # Ứng dụng Di động Quét mã (Expo / React Native)
│   ├── assets/                # Logo thương hiệu, Biểu tượng ứng dụng, Splash
│   ├── src/screens/           # Màn hình Quét mã, Danh mục, Chi tiết, Cài đặt
│   └── app.json               # Cấu hình quyền truy cập Camera & Thông số App
│
├── docs/                      # Tài liệu phân tích nghiệp vụ & thiết kế Database
│   ├── BUSINESS_ANALYSIS.md   # Yêu cầu nghiệp vụ chi tiết
│   └── DATABASE_DESIGN.md     # Lược đồ quan hệ ERD & chỉ mục Index
│
├── backups/                   # Thư mục lưu trữ các bản sao lưu cơ sở dữ liệu (.sql)
│
├── .env                       # File cấu hình biến môi trường (Được bảo vệ, không đẩy lên Git)
├── .env.example               # File mẫu hướng dẫn thiết lập biến môi trường
├── .gitignore                 # Danh sách loại trừ các file bí mật, cache và build
├── docker-compose.yml         # Khởi chạy toàn bộ hệ thống bằng Docker
│
├── start-all-services.bat     # Khởi động nhanh toàn bộ dịch vụ trên Windows
├── run-cloudflare-tunnel.bat  # Kích hoạt đường hầm truy cập từ xa
├── backup-database.bat        # Sao lưu an toàn cơ sở dữ liệu MySQL
├── restore-database.bat       # Phục hồi dữ liệu từ bản sao lưu gần nhất
├── build-apk.bat              # Đóng gói file cài đặt Android APK
└── product-code-manager.apk   # File cài đặt ứng dụng Android mới nhất
```

---

## 🔒 4. Cấu hình biến môi trường an toàn

Dự án sử dụng cơ chế nạp biến môi trường tập trung. Để thiết lập hệ thống, tạo file `.env` từ file mẫu:

```bash
# Sao chép file mẫu
cp .env.example .env
```

Cấu trúc các biến cấu hình trong `.env` (Điền thông tin bảo mật của bạn):

```env
# 1. CẤU HÌNH SERVER
SPRING_PROFILES_ACTIVE=dev
PORT=8080

# 2. CƠ SỞ DỮ LIỆU MYSQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=product_code_manager
DB_USER=root
DB_PASSWORD=your_mysql_password_here

# 3. BẢO MẬT & XÁC THỰC JWT
JWT_SECRET=your_secure_random_hmac_secret_key_at_least_256_bits
JWT_EXPIRATION_MS=86400000
ADMIN_INITIAL_USERNAME=your_admin_username
ADMIN_INITIAL_PASSWORD=your_secure_admin_password

# 4. LƯU TRỮ HÌNH ẢNH (CLOUDINARY)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_FOLDER=products

# 5. GIAO DIỆN WEB QUẢN TRỊ
VITE_PORT=5173
VITE_API_BASE_URL=/api/v1
VITE_BACKEND_TARGET=http://localhost:8080

# 6. ĐỊA CHỈ KẾT NỐI CHO THIẾT BỊ DI ĐỘNG
EXPO_PUBLIC_CLOUDFLARE_URL=https://your-tunnel-domain.trycloudflare.com/api/v1
EXPO_PUBLIC_LOCAL_LAN_URL=http://your-local-ip:8080/api/v1
```

> [!IMPORTANT]
> **Quy tắc an toàn thông tin:**
> - Tuyệt đối không đẩy file `.env` chứa mật khẩu thực tế lên GitHub hoặc các nền tảng công khai.
> - File `.gitignore` của dự án đã được cấu hình mặc định để tự động bỏ qua toàn bộ file `.env`.

---

## 🚀 5. Hướng dẫn khởi động hệ thống

### Cách 1: Khởi động tự động bằng Script Windows (Khuyên dùng)
Nhấp đúp chuột vào file:
👉 **`start-all-services.bat`**

Kịch bản sẽ tự động mở lần lượt các dịch vụ:
1. Cơ sở dữ liệu MySQL container (Cổng `3306`).
2. Backend Spring Boot REST API (Cổng `8080`).
3. Kênh truyền Cloudflare Tunnel (Kết nối di động từ xa).
4. Web Admin Dashboard (Cổng `5173`).

---

### Cách 2: Khởi chạy bằng Docker Compose
Dành cho môi trường máy chủ hoặc triển khai độc lập:
```bash
# Khởi chạy nền toàn bộ dịch vụ
docker-compose up -d --build

# Kiểm tra trạng thái hoạt động
docker-compose ps
```

---

## 📱 6. Cài đặt Ứng dụng Di động (Mobile App)

### Cài đặt file APK trực tiếp:
1. Kết nối điện thoại với máy tính hoặc tải file cài đặt **`product-code-manager.apk`** được đặt tại thư mục gốc của dự án.
2. Mở file `.apk` trên điện thoại Android và chọn **Cài đặt**.
3. Mở ứng dụng, vào phần **⚙️ Cài đặt** để kiểm tra hoặc cập nhật đường dẫn máy chủ của bạn.

### Môi trường phát triển di động (Expo Dev):
```bash
cd mobile-app
npm install
npm start
```

---

## 💾 7. Sao lưu & Phục hồi Dữ liệu (Backup & Restore)

Để đảm bảo an toàn tuyệt đối cho dữ liệu hàng hóa, hệ thống tích hợp sẵn kịch bản tự động:
- **Sao lưu dữ liệu:** Chạy file `backup-database.bat` -> Toàn bộ dữ liệu được kết xuất ra file `.sql` nén an toàn trong thư mục `backups/`.
- **Khôi phục dữ liệu:** Chạy file `restore-database.bat` -> Tự động nhận diện bản sao lưu mới nhất để khôi phục khi có sự cố.

---

## 🧪 8. Kiểm thử tự động (Automated Tests)

Chạy bộ kiểm thử tích hợp toàn diện (Integration Tests) để xác nhận nghiệp vụ:
```bash
cd backend
mvn test "-DargLine=-XX:+EnableDynamicAgentLoading"
```

---

## 📄 9. Bản quyền & Bảo mật
- **Dự án:** DC ĐẲNG CẤP - Product Code Manager
- **Bản quyền:** Thuộc quyền sở hữu nội bộ của doanh nghiệp.
- **Bảo mật:** Không chia sẻ mã nguồn chứa cấu hình bảo mật ra bên ngoài.
