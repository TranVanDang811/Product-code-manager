# 🛡️ DC ĐẲNG CẤP - PRODUCT CODE MANAGER (PCM)

> **Hệ thống Quản lý Ánh xạ Mã Vạch EAN-13 & Mã Nội Bộ 6 Số (Quan hệ 1 - 1)**  
> Kiến trúc Serverless hiện đại: Đồng bộ đám mây thời gian thực với **Google Cloud Firestore**, giao diện Web Quản trị React Vite và Ứng dụng Di động React Native Expo chuyên dụng.

---

## 📌 1. Giới thiệu tổng quan

Hệ thống **Product Code Manager (PCM)** giải quyết bài toán cốt lõi trong bán lẻ, kiểm toán và vận hành kho hàng:

* **Ánh xạ ràng buộc 1 - 1 tuyệt đối:** Mỗi Mã vạch EAN-13 (13 chữ số) chỉ tương ứng với duy nhất 1 Mã sản phẩm nội bộ (6 chữ số).
* **Thuật toán GS1 Modulo-10 Checksum:** Tự động kiểm tra tính hợp lệ của mã vạch quốc tế, phân tích Check Digit và ngăn chặn sai sót nhập liệu ngay tại nguồn.
* **Đồng bộ thời gian thực (Real-time Cloud):** Kết nối trực tiếp cơ sở dữ liệu Google Cloud Firestore với độ trễ cực thấp, không cần duy trì cụm máy chủ backend phức tạp.
* **Quét mã vạch đa nền tảng:**
  * **Web Admin:** Hỗ trợ quét qua Camera (sử dụng thư viện ZXing Barcode Engine) hoặc nhập liệu tra cứu nhanh bằng bàn phím / máy quét barcode USB.
  * **Mobile App:** Sử dụng Camera phần cứng quét liên tục, tự động nhận diện và gán mã vào biểu mẫu sản phẩm.
* **Chuẩn giao diện Tương phản cao (High-Contrast Stealth Charcoal):** Phong cách Đen xám tối giản hiện đại, bảo vệ mắt khi vận hành trong kho hàng, đảm bảo tương phản tuyệt đối (nền tối chữ trắng sáng, nền sáng chữ đen rõ nét).

---

## 🏗️ 2. Kiến trúc công nghệ (Tech Stack)

| Phân hệ | Công nghệ | Vai trò kỹ thuật |
| :--- | :--- | :--- |
| **Cơ sở dữ liệu đám mây** | Google Firebase Cloud Firestore | Lưu trữ dữ liệu NoSQL phân tán thời gian thực: Danh mục sản phẩm, bảng tra cứu mã vạch, lịch sử quét mã, thông tin kiểm toán |
| **Web Admin Dashboard** | React 19, Vite, Tailwind CSS, Redux Toolkit, Lucide Icons | Trang quản trị nghiệp vụ: thống kê số liệu, quản lý sản phẩm, đối soát lịch sử quét mã, gán và hủy mã vạch |
| **Mobile App (Android)** | React Native, Expo SDK, Expo Camera, Expo Image Picker | Ứng dụng di động chuyên dụng cho nhân viên kho: quét mã camera, chụp ảnh thực tế, đồng bộ trực tiếp |
| **Đóng gói Android APK** | EAS Build (Expo Application Services) | Đóng gói bộ cài đặt Android APK độc lập (.apk) cài trực tiếp không qua CH Play |

---

## 📁 3. Cấu trúc thư mục dự án

```text
product-code-manager/
├── frontend-web/              # Phân hệ Web Quản trị React 19 + Vite
│   ├── src/
│   │   ├── api/               # Tầng dịch vụ gọi dữ liệu Firestore
│   │   ├── components/        # Components dùng chung (Badge, Modal, Table, Scanner...)
│   │   ├── context/           # Theme Context (Đen xám tối giản)
│   │   ├── firebase/          # Khởi tạo kết nối Firebase SDK
│   │   ├── pages/             # Dashboard, Sản phẩm, Lịch sử, Tra cứu
│   │   ├── routes/            # Điều hướng React Router
│   │   └── utils/             # Thuật toán GS1 EAN-13, định dạng ngày giờ
│   ├── package.json           # Thư viện phụ thuộc Web
│   └── vite.config.js         # Cấu hình Vite Build Tool
│
├── mobile-app/                # Phân hệ Ứng dụng Di động React Native Expo
│   ├── assets/                # Biểu tượng ứng dụng, Splash Screen, Logo
│   ├── src/
│   │   ├── components/        # Modal thêm mới, Card sản phẩm, Badge
│   │   ├── context/           # Theme Context & Auth Context
│   │   ├── screens/           # Màn hình Quét mã, Danh mục, Chi tiết, Cài đặt
│   │   ├── services/          # Tầng kết nối Firebase Mobile SDK
│   │   └── utils/             # Thuật toán Modulo-10 và kiểm tra EAN-13
│   ├── app.json               # Cấu hình quyền truy cập Camera & Định danh App
│   ├── eas.json               # Cấu hình Build profile Android APK độc lập
│   └── package.json           # Thư viện phụ thuộc Mobile
│
├── .env.example               # Mẫu khai báo biến môi trường (KHÔNG chứa secret)
├── .gitignore                 # Loại trừ file môi trường, cache, node_modules và artifacts
├── start-all-services.bat     # Khởi động nhanh Web Admin Dashboard (Port 5173)
├── start-mobile-app.bat       # Khởi động ứng dụng di động qua Expo Go
├── build-apk.bat              # Script đóng gói file Android APK qua EAS Build
└── README.md                  # Tài liệu hướng dẫn sử dụng & triển khai
```


## 🚀 4. Hướng dẫn cài đặt & Khởi chạy

### Yêu cầu tiên quyết
* **Node.js**: Phiên bản 18 trở lên (Khuyến nghị Node v20 LTS hoặc v24).
* **Trình quản lý gói**: `npm` hoặc `yarn`.
* Thiết bị Android hoặc ứng dụng **Expo Go** (nếu kiểm thử trên điện thoại).

---

### A. Khởi chạy Web Admin Dashboard

1. Mở cửa sổ dòng lệnh tại thư mục `frontend-web`:
   ```bash
   cd frontend-web
   npm install
   npm run dev
   ```
2. Hoặc nhấp đúp trực tiếp vào file tiện ích:
   👉 **`start-all-services.bat`**
3. Truy cập hệ thống tại: **`http://localhost:5173`**
4. Đăng nhập bằng tài khoản quản trị đã thiết lập trong file `.env`.

---

### B. Khởi chạy Ứng dụng Di động (Môi trường phát triển)

1. Mở cửa sổ dòng lệnh tại thư mục `mobile-app`:
   ```bash
   cd mobile-app
   npm install
   npx expo start -c
   ```
2. Hoặc nhấp đúp trực tiếp vào file:
   👉 **`start-mobile-app.bat`**
3. Cài đặt ứng dụng **Expo Go** từ Google Play Store trên điện thoại Android.
4. Mở Expo Go và quét mã QR hiển thị trên màn hình Terminal để trải nghiệm ứng dụng tức thì.

---

### C. Đóng gói file cài đặt Android APK độc lập (EAS Build)

Ứng dụng hỗ trợ xuất trực tiếp file `.apk` độc lập (không cần thông qua cửa hàng ứng dụng) để cài trực tiếp lên điện thoại Android của nhân viên:

1. Đăng nhập tài khoản Expo CLI (nếu chưa đăng nhập):
   ```bash
   npx eas-cli login
   ```
2. Chạy lệnh đóng gói:
   ```bash
   cd mobile-app
   npx eas-cli build --platform android --profile preview
   ```
3. Hoặc nhấp đúp vào file tiện ích:
   👉 **`build-apk.bat`**
4. Sau khi tiến trình build trên Expo Cloud hoàn tất, hệ thống sẽ trả về đường dẫn tải trực tiếp file `.apk`. Tải file về điện thoại và tiến hành cài đặt.

---

## 🛡️ 5. Quy tắc Nghiệp vụ cốt lõi

```
[Mã vạch EAN-13 (13 chữ số)]  <====== (Quan hệ 1 - 1 tuyệt đối) ======>  [Mã nội bộ (6 chữ số)]
```

1. **Ràng buộc EAN-13:**
   * Đúng định dạng 13 chữ số chuẩn quốc tế GS1.
   * Chữ số thứ 13 là **Check Digit** được tính toán theo thuật toán Modulo-10:
     $$\text{Check Digit} = (10 - (\sum \text{vị trí lẻ} + 3 \times \sum \text{vị trí chẵn}) \bmod 10) \bmod 10$$
   * Một mã vạch chỉ được gán cho duy nhất một sản phẩm tại một thời điểm.
2. **Ràng buộc Mã nội bộ 6 số:**
   * Đúng 6 chữ số (`000001` đến `999999`).
   * Mã sản phẩm là duy nhất trong toàn hệ thống.
3. **Tra cứu & Kiểm toán:**
   * Mọi lượt quét mã từ Camera Web hoặc Mobile đều được tự động lưu lại lịch sử gồm: Thời gian quét, Mã quét, Kết quả đối soát (`FOUND`, `NOT_FOUND`, `INVALID`), Tên thiết bị và Thông tin sản phẩm liên kết.

---

## 🎨 6. Thiết kế Giao diện (UI/UX)

* **Phong cách:** Minimalist Stealth Charcoal (Đen xám tối giản hiện đại).
* **Bảng màu:**
  * Nền chính: Zinc 950 (`#09090b`)
  * Thẻ dữ liệu & Card: Charcoal Zinc 900 (`#121214` / `#18181b`)
  * Đường viền: Neutral Zinc 800 (`#27272a`)
  * Trạng thái Khớp mã (`FOUND`): Neon Emerald (`#10b981`)
  * Trạng thái Chưa có (`NOT_FOUND`): Neon Rose (`#f43f5e`)
  * Trạng thái Sai chuẩn (`INVALID`): Neon Amber (`#f59e0b`)
* **Nguyên tắc tương phản:**
  * Mọi nội dung trên nền tối đều dùng chữ trắng sáng (`#ffffff`) hoặc xám bạc (`#d4d4d8`).
  * Mọi nút bấm hoặc thẻ lọc mang nền sáng/trắng đều dùng chữ đen đậm (`#000000`) nhằm đảm bảo khả năng đọc tốt nhất trong mọi điều kiện ánh sáng.

---

## 📄 7. Bản quyền & Giấy phép

* **Đơn vị phát triển:** DC ĐẲNG CẤP
* **Phiên bản:** v1.0.6 (Serverless Edition)

