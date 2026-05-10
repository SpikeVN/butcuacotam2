# Bụt của cô Tấm

![Logo](assets/images/logo-transparent-light.avif)

**Bụt của cô Tấm** là trò chơi Visual Novel chính thức cho **DSTC 2026**, phát triển bởi **CLB Khoa học Công nghệ trong Kinh tế và Kinh doanh (CTE)**.

Dựa trên câu chuyện cổ tích Tấm Cám quen thuộc, nhưng được đặt trong bối cảnh hiện đại tại Hà Nội, trò chơi đưa bạn vào vai Tấm - một cô gái phải đối mặt với những thử thách công nghệ và cuộc sống "drama" thời đại số.

## Công nghệ sử dụng

### Frontend

- **Framework:** [Solid.js](https://solidjs.com/) - Hiệu năng cao và phản hồi nhanh.
- **Ngôn ngữ:** TypeScript.
- **Styling:** Tailwind CSS & Plain CSS.
- **Animation:** GSAP (GreenSock Animation Platform).
- **Build Tool:** Vite.

### Backend

- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python).
- **Database:** SQLite (với `aiosqlite`).
- **Auth:** JWT Authentication.

## Cài đặt và Chạy thử

### 1. Yêu cầu hệ thống

- **Node.js** (khuyên dùng v20+) hoặc **Bun**.
- **Python** 3.12+ (cho backend).

### 2. Cài đặt Frontend

```bash
# Cài đặt dependencies
npm install # hoặc bun install

# Chạy ở chế độ phát triển
npm run dev
```

Truy cập `http://localhost:5173` để chơi game.

### 3. Cài đặt Backend

Di chuyển vào thư mục `backend`:

```bash
cd backend

# Cài đặt dependencies
pip install -r requirements.txt # hoặc sử dụng pyproject.toml

# Chạy server
uvicorn main:app --host 0.0.0.0 --port 6942 --reload
```

Server sẽ chạy tại `http://localhost:6942`.

## Cấu trúc thư mục

- `src/`: Toàn bộ mã nguồn frontend.
    - `challenges/`: Các mini-game thử thách.
    - `engine/`: Hệ thống xử lý kịch bản, âm thanh, cửa sổ.
    - `storyline/`: Các chương truyện và màn hình chính.
- `backend/`: Mã nguồn server và cơ sở dữ liệu.
- `assets/`: Hình ảnh, font chữ và âm nhạc.
- `static/`: Dữ liệu phục vụ cho các thử thách.

## Giấy phép

Dự án này được phát hành theo giấy phép **GNU Affero General Public License v3.0 (AGPL-3.0)**. Xem tệp [LICENSE](LICENSE) để biết thêm chi tiết.

---

**Phát triển bởi CTE FTU**
[Facebook Fanpage](https://www.facebook.com/cteftu) | [Website](https://cteftu.com)
