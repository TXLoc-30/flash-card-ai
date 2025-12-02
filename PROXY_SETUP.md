# Hướng dẫn thiết lập Proxy Server

## Vấn đề CORS

Hugging Face Inference API không hỗ trợ CORS từ browser, nên cần một proxy server để giải quyết vấn đề này.

## Cài đặt

1. **Cài đặt dependencies** (nếu chưa có):
   ```bash
   npm install node-fetch@2
   ```

2. **Thiết lập biến môi trường** (tùy chọn nhưng khuyến nghị):
   Tạo hoặc cập nhật file `.env` trong thư mục gốc:
   ```
   REACT_APP_HUGGINGFACE_API_TOKEN=your_token_here
   PORT=3001
   ```
   
   **Quan trọng về Token:**
   - Lấy token tại: https://huggingface.co/settings/tokens
   - Tạo token mới với quyền **"write"** (không phải "read")
   - Token với quyền "read" sẽ không hoạt động với Inference Providers
   - Nếu không có token, có thể gặp rate limiting nghiêm ngặt

## Chạy Proxy Server

### Cách 1: Sử dụng npm script
```bash
npm run serve
```

### Cách 2: Chạy trực tiếp
```bash
node server/server.js
```

Proxy server sẽ chạy tại: `http://localhost:3001`

## Chạy ứng dụng

1. **Mở terminal thứ nhất** - Chạy proxy server:
   ```bash
   npm run serve
   ```

2. **Mở terminal thứ hai** - Chạy React app:
   ```bash
   npm start
   ```

## Kiểm tra

1. **Kiểm tra proxy server đang chạy:**
   - Mở browser: http://localhost:3001/api/health
   - Nếu thấy `{"status":"ok","message":"Proxy server is running"}` → Proxy server đang chạy
   - Nếu không thấy → Proxy server chưa chạy, cần chạy `npm run serve`

2. **Kiểm tra React app:**
   - React app: http://localhost:3000 (hoặc port khác nếu 3000 bị chiếm)

3. **Kiểm tra logs:**
   - Terminal chạy proxy server sẽ hiển thị logs khi có request
   - Nếu thấy `POST /api/generate` hoặc `POST /api/translate` → Request đã đến proxy server
   - Nếu không thấy → Request chưa đến proxy server (có thể do CORS hoặc URL sai)

## Cấu trúc

- `server/server.js` - Proxy server Express
- `src/services/aiService.js` - Client service gọi proxy

## Lưu ý

- Proxy server phải chạy trước khi sử dụng tính năng dịch/định nghĩa
- Nếu thay đổi port, cập nhật `REACT_APP_PROXY_URL` trong `.env` của React app
- API token là tùy chọn nhưng khuyến nghị để tránh rate limiting

