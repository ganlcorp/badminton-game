# 🏸 Sân Cầu Lông Nhà Mình

Game quản lý sân cầu lông chạy trên trình duyệt (HTML + CSS + JavaScript thuần, không cần bước build).

## Cấu trúc thư mục

```
badminton-game/
├── index.html            # Khung trang: thẻ HTML, nạp CSS và JS theo thứ tự
├── css/                  # Giao diện, NẠP THEO ĐÚNG THỨ TỰ trong index.html (file sau đè file trước)
│   ├── base.css          # Biến màu, thanh trên cùng, sân, quầy, popup, lớp phủ
│   ├── scene-theme.css   # Nền minh hoạ, màn hình mở đầu, hoạt hình nhỏ, khay kéo thả
│   ├── responsive.css    # Responsive cơ bản
│   ├── prep.css          # Màn chuẩn bị, bảng phấn, quầy pha chế, mã lưu game
│   ├── counters.css      # Quầy có chibi, menu tạm dừng, vay vốn, bàn pha, mốc thời gian chờ
│   ├── characters.css    # Chibi, nhân viên, người chơi trên sân, bong bóng chủ quán, tip
│   ├── layout-mobile.css # Bố cục 1 màn hình cho điện thoại
│   └── features.css      # Sự kiện VĐV, popup phục vụ, nấu nhiều bước, sự kiện chủ quán, sân hỏng
├── js/                   # Logic game, NẠP THEO ĐÚNG THỨ TỰ trong index.html
│   ├── art-loader.js     # Nạp tranh SVG từ assets/art
│   ├── config.js         # Hằng số, danh sách món, tên khách, tiện ích
│   ├── avatars.js        # Vẽ avatar khách
│   ├── reviews.js        # Review và phản hồi
│   ├── state.js          # Trạng thái, lưu/tải localStorage
│   ├── events-vip.js     # Sự kiện VĐV, cách tính sao (danh sách VĐV: mảng VIPS, LEGENDS)
│   ├── chat.js           # Lời chủ quán, chibi, chat
│   ├── logic.js          # Logic chính và vòng lặp step()
│   ├── owner-events.js   # Sự kiện chủ quán, sửa sân
│   ├── render.js         # Vẽ giao diện chính
│   ├── sheet.js          # Popup phục vụ khách, kho, review
│   ├── day-flow.js       # Màn chuẩn bị, tổng kết, màn hình mở đầu
│   ├── dialogs.js        # Hộp thoại tên quán, vay vốn
│   ├── save-code.js      # Mã lưu game SC2
│   ├── cloud-save.js     # Mã ngắn 6 ký tự (gọi /api/save)
│   ├── drag.js           # Kéo thả món
│   ├── orientation.js    # Xoay màn hình
│   └── main.js           # Gắn sự kiện, khởi động game
├── assets/art/           # Tranh SVG lớn (nền, chợ, màn hình mở đầu), sửa được bằng Figma/Illustrator
├── api/save.js           # Hàm máy chủ Vercel: lưu/lấy mã ngắn trên Redis
├── package.json          # Thư viện cho api/ (redis) và lệnh chạy thử
└── vercel.json           # Cấu hình Vercel (không build, phục vụ file tĩnh + api)
```

## Chạy thử trên máy

Game nạp tranh bằng `fetch`, nên **cần chạy qua máy chủ cục bộ** (mở trực tiếp file `index.html` sẽ thiếu tranh nền):

```bash
npm run dev          # hoặc: npx serve .   hoặc: python3 -m http.server 5173
```

Rồi mở http://localhost:5173

> Mã ngắn 6 ký tự (`/api/save`) chỉ chạy trên Vercel. Chạy thử trên máy thì dùng mã dài `SC2...`.

## Đưa lên Vercel

Push lên GitHub, Vercel tự deploy. Framework Preset để **Other**, không cần Build Command.
Mã ngắn cần gắn Redis (Vercel → Storage → Redis) để có biến `REDIS_URL` / `STORAGE_URL`, rồi Redeploy.

## Lưu ý khi sửa code

- Các file JS là **script thường dùng chung phạm vi toàn cục** (không phải ES module), nạp theo thứ tự trong `index.html`.
  Hàm và hằng số khai báo ở file trước dùng được ở file sau. Nếu thêm file mới, thêm thẻ `<script>` vào đúng vị trí.
- Lưu game trong `localStorage` với khoá `sancaulong-v2`. Đổi cấu trúc dữ liệu thì bổ sung vào hàm `norm()` (js/state.js) để save cũ vẫn chạy.
- Bước tiếp theo nên làm khi dự án lớn hơn: chuyển sang ES module + Vite, thêm ESLint/Prettier, viết test cho `js/logic.js`.

## Gộp thành 1 file (tuỳ chọn)

```bash
python3 tools/build-single.py   # tạo dist/game.html, mở trực tiếp được không cần máy chủ
```
