# 💻 AN KHANG STORE – HỆ THỐNG QUẢN LÝ BÁN HÀNG (POS)

> **Môn học:** 503073 – Web Programming and Applications  
> **Trường Đại học Tôn Đức Thắng – Khoa Công nghệ Thông tin  
> Framework:** Laravel 10 (PHP 8.1+)

---

## 🧾 GIỚI THIỆU DỰ ÁN

**AN KHANG STORE** là một ứng dụng **Point of Sale (POS)** được xây dựng bằng **Laravel Framework**, phục vụ cho việc quản lý và bán hàng tại cửa hàng điện thoại và phụ kiện điện tử.  
Khác với website thương mại điện tử (E-commerce), **người mua hàng không thể truy cập hệ thống này** — ứng dụng chỉ dành cho **nhân viên bán hàng và quản trị viên nội bộ**.

Dự án được phát triển nhằm mục tiêu:
- Củng cố kiến thức lập trình web backend và frontend trong môi trường thực tế.
- Ứng dụng framework **Laravel 10** và các thư viện mở rộng như Livewire, DOMPDF, Toastr.
- Xây dựng hệ thống POS đơn giản, trực quan, hiệu quả cho cửa hàng điện thoại.
- Quản lý nhân viên, sản phẩm, khách hàng, giao dịch, báo cáo doanh thu.
- Hỗ trợ gửi email tự động, đăng nhập 1 phút cho nhân viên mới, phân quyền rõ ràng.

---

> ⚠️ **Lưu ý:** Dự án hiện **chưa được public/deploy online**. Hệ thống chỉ chạy **local (localhost)** để phục vụ mục đích học tập/demo.

---

## 👥 THÀNH VIÊN NHÓM

| Họ và Tên | MSSV | Vai trò |
|------------|-------|----------|
| Trần Khiết Lôi | 52200216 | Backend Developer |
| Trần Hồ Hoàng Vũ | 52200214 | Fullstack Developer |
| Phạm Tuấn Đạt | 52200207 | Frontend Developer |
| Nguyễn Đức Trung | 52200063 | Database & Testing |

---

## ⚙️ CÔNG NGHỆ SỬ DỤNG

### 🔹 Backend
- **Laravel 10** (PHP ≥ 8.1)
- **Laravel Sanctum** – Xác thực API / Token  
- **Laravel Livewire** – Giao diện động, phản hồi nhanh  
- **Barryvdh/Dompdf** – Xuất hóa đơn dạng PDF  
- **Yoeunes/Toastr** – Thông báo popup trực quan  
- **GuzzleHTTP** – Kết nối HTTP API  
- **MySQL** – Lưu trữ dữ liệu  

### 🔹 Frontend
- **Bootstrap 5** – Giao diện hiện đại, responsive  
- **jQuery / Livewire** – Tạo tương tác động  
- **Vite.js** – Biên dịch CSS/JS nhanh hơn cho Laravel  
- **Blade Template Engine** – Giao diện động phía server  

### 🔹 Công cụ phát triển
- Composer, Artisan CLI, PHPUnit, Laravel Pint  
- XAMPP / Laragon – Môi trường PHP & MySQL  
- GitHub, VS Code, Node.js, NPM  

---

## 🧩 CÁC CHỨC NĂNG CHÍNH

### 1️⃣ Quản lý tài khoản & phân quyền
- Tài khoản **Admin** mặc định: `admin / admin`
- Admin có thể:
  - Tạo tài khoản nhân viên (bắt buộc nhập Gmail)
  - Gửi **email tự động** chứa link kích hoạt hợp lệ trong **1 phút**
  - Khóa / mở khóa tài khoản nhân viên
  - Xem hồ sơ, avatar, doanh thu cá nhân của nhân viên
- Nhân viên:
  - Lần đầu phải đăng nhập qua email kích hoạt và đổi mật khẩu
  - Có thể cập nhật avatar, mật khẩu mới
  - Không truy cập được hệ thống nếu chưa đổi mật khẩu

---

### 2️⃣ Quản lý sản phẩm
- Admin có thể thêm, sửa, xóa, xem danh sách sản phẩm.  
- Mỗi sản phẩm có:
  - Mã vạch (barcode), tên, loại, thương hiệu, giá nhập, giá bán, ngày tạo, mô tả.
- Không thể xóa sản phẩm đã nằm trong đơn hàng.
- Nhân viên chỉ có quyền xem, không chỉnh sửa hay xóa.
- Giao diện ẩn các nút thao tác không được phép cho nhân viên.

---

### 3️⃣ Quản lý khách hàng
- Khi thanh toán, nhập **số điện thoại khách hàng**:
  - Nếu tồn tại → tự động hiển thị thông tin.
  - Nếu chưa có → hệ thống tự tạo khách hàng mới.
- Xem thông tin khách hàng, lịch sử mua hàng, chi tiết đơn hàng (sản phẩm, tổng tiền, tiền thừa,…).
- Tìm kiếm khách hàng bằng số điện thoại, xác minh từ cơ sở dữ liệu.

---

### 4️⃣ Xử lý giao dịch (Bán hàng)
- Nhân viên có thể:
  - Tìm sản phẩm bằng tên hoặc mã vạch.
  - Thêm/xóa/sửa số lượng sản phẩm trong giỏ hàng.
  - Hệ thống tự động cập nhật tổng tiền và tiền thừa.
  - Xuất hóa đơn **PDF** (file `order_invoice_pdf.blade.php`).
- Quy trình được xử lý qua các file:
  - `new_order_form.blade.php` – Tạo đơn hàng  
  - `confirm_order.blade.php` – Xác nhận đơn hàng  
  - `history_order.blade.php` – Lịch sử đơn hàng  
  - `order_detail.blade.php` – Chi tiết đơn hàng

---

### 5️⃣ Báo cáo & thống kê
- Hiển thị doanh thu và hoạt động theo thời gian:
  - Hôm nay, hôm qua, 7 ngày qua, tháng này, hoặc tùy chọn khoảng thời gian cụ thể.
- Dữ liệu gồm:
  - Tổng doanh thu, số đơn hàng, số sản phẩm bán ra.
  - Lợi nhuận (chỉ hiển thị cho admin).
- Có thể xem chi tiết từng hóa đơn và lọc theo nhân viên.

---

## 🧱 CẤU TRÚC THƯ MỤC DỰ ÁN

```
store.com/
│
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Backend/
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── DashboardController.php
│   │   │   │   ├── UserController.php
│   │   │   │   ├── SanPhamController.php
│   │   │   │   ├── CustomerController.php
│   │   │   │   ├── ProfileController.php
│   │   │   └── OrderController.php
│   │   └── Middleware/
│   ├── Models/
│   ├── Mail/
│   └── Providers/
│
├── resources/
│   ├── views/
│   │   ├── backend/
│   │   ├── layouts/
│   │   ├── customers/
│   │   ├── orders/
│   │   ├── products/
│   │   └── reports/
│   └── components/
│
├── routes/
│   └── web.php
│
├── database/
│   ├── migrations/
│   └── seeders/
│
├── public/
│   ├── assets/
│   ├── uploads/
│   └── index.php
│
├── composer.json
├── package.json
└── vite.config.js
```

---

## 🔑 TÀI KHOẢN MẪU (DEMO)

| Loại tài khoản | Username | Password |
|----------------|-----------|-----------|
| Admin | `admin` | `admin` |
| Nhân viên | `nhanvien01` | `nhanvien01` *(nhận email kích hoạt tự động)* |

📺 **Demo Video:** [YouTube Link](https://youtu.be/XLwuIJpsN-M)

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN

### Bước 1: Cài đặt môi trường
```bash
git clone https://github.com/<your_username>/store.com.git
cd store.com
composer install
npm install
cp .env.example .env
php artisan key:generate
```

### Bước 2: Cấu hình `.env`
```bash
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=store_db
DB_USERNAME=root
DB_PASSWORD=

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=<your_gmail>
MAIL_PASSWORD=<app_password>
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=<your_gmail>
MAIL_FROM_NAME="AN KHANG STORE"
```

### Bước 3: Khởi tạo dữ liệu
```bash
php artisan migrate --seed
```

### Bước 4: Chạy dự án
```bash
php artisan serve
npm run dev
```
Truy cập tại **http://127.0.0.1:8000**

---

## 📊 HƯỚNG PHÁT TRIỂN TƯƠNG LAI
- Xây dựng **API RESTful** cho ứng dụng mobile.
- Tích hợp **QR Code thanh toán tự động**.
- Thêm **dashboard realtime** cho admin.
- Nâng cấp UI với **Vue.js hoặc ReactJS**.
- Tối ưu bảo mật và phân quyền chi tiết hơn.
- Hỗ trợ **in hóa đơn trực tiếp** và thống kê nâng cao.

---

## 🧠 KIẾN THỨC ÁP DỤNG
- Laravel MVC Architecture  
- Livewire Component Lifecycle  
- Blade Template Engine  
- Laravel Mail (SMTP Gmail)  
- Toastr Notifications  
- DOMPDF Export  
- MySQL CRUD + Seeder  
- Middleware & Routing in Laravel  
- Bootstrap Responsive Layout  

---

## 📅 THÔNG TIN THÊM
- **Lớp:** 22050301  
- **Khoá:** 26  
- **Học kỳ:** 2/2023–2024  
- **Khoa:** Công nghệ Thông tin – Đại học Tôn Đức Thắng  

---

> © 2024 AN KHANG STORE Team – Trần Khiết Lôi, Trần Hồ Hoàng Vũ, Phạm Tuấn Đạt, Nguyễn Đức Trung  
> *Sản phẩm học thuật phục vụ môn học Lập trình Web và Ứng dụng*
