# Hướng dẫn sử dụng tính năng mới

## 1. Phân loại Deck theo Tags/Categories

### Cách sử dụng:
1. Khi tạo deck mới hoặc chỉnh sửa deck, bạn sẽ thấy trường "Tags/Categories"
2. Bạn có thể:
   - Nhập tag mới và nhấn Enter để thêm
   - Chọn từ danh sách gợi ý (Ngôn ngữ, Từ vựng, Cấu trúc, v.v.)
   - Xóa tag bằng cách click vào nút X trên tag

### Tags phổ biến:
- Ngôn ngữ
- Từ vựng
- Cấu trúc
- Ngữ pháp
- Lịch sử
- Địa lý
- Khoa học
- Toán học
- Văn học
- Nghệ thuật
- Thể thao
- Công nghệ
- Y học
- Kinh tế
- Triết học

## 2. Tích hợp AI - Dịch thuật và Định nghĩa

### ⚠️ Quan trọng: Cần chạy Proxy Server

Do các API không hỗ trợ CORS từ browser, bạn **PHẢI** chạy proxy server trước khi sử dụng tính năng này.

**Xem hướng dẫn chi tiết tại:** `PROXY_SETUP.md`

**Tóm tắt nhanh:**
1. Mở terminal thứ nhất: `npm run serve` (chạy proxy server)
2. Mở terminal thứ hai: `npm start` (chạy React app)

### Cấu hình API (Tùy chọn):

#### LibreTranslate API (Dịch thuật):
- **Mặc định**: Sử dụng public API tại `https://libretranslate.com/translate` (miễn phí, không cần API key)
- **Tùy chọn**: Có thể tự host LibreTranslate hoặc dùng instance khác
- **Cấu hình trong `.env`**:
  ```
  LIBRETRANSLATE_URL=https://libretranslate.com/translate
  LIBRETRANSLATE_API_KEY=your_api_key_here  # Tùy chọn, chỉ cần nếu dùng instance có yêu cầu
  ```

#### Hugging Face API (Định nghĩa - Gemma model):
- **Token**: Tùy chọn nhưng khuyến nghị để tránh rate limiting
- **Cấu hình trong `.env`**:
  ```
  REACT_APP_HUGGINGFACE_API_TOKEN=your_huggingface_token_here
  ```
- Lấy API token từ: https://huggingface.co/settings/tokens
  - Đăng ký tài khoản miễn phí tại: https://huggingface.co/join
  - Vào Settings > Access Tokens > Tạo token mới
  - **QUAN TRỌNG**: Chọn quyền **"write"** (không phải "read")
  - Token với quyền "read" sẽ không hoạt động với Inference Providers

### Cách sử dụng khi tạo thẻ:

1. Mở form tạo thẻ mới (click "Add card")
2. Nhập nội dung vào ô "Front" (mặt trước)
3. Bạn sẽ thấy 2 nút xuất hiện:
   - **Dịch**: Dịch nội dung sang tiếng Việt dựa trên tags của deck
   - **Định nghĩa**: Lấy định nghĩa hoặc giải thích nội dung theo chủ đề của deck
4. Click vào một trong hai nút để tự động điền vào ô "Back" (mặt sau)
5. Bạn có thể chỉnh sửa kết quả trước khi tạo thẻ

### Lưu ý:
- Tính năng dịch sử dụng LibreTranslate API (miễn phí, mã nguồn mở)
- Tính năng định nghĩa sử dụng Gemma model từ Hugging Face (miễn phí)
- Cần có kết nối internet để sử dụng tính năng này
- API token cho Hugging Face là tùy chọn nhưng khuyến nghị để tránh rate limiting
- Model có thể mất vài giây để load lần đầu tiên

### APIs và Models được sử dụng:
- **Dịch thuật**: LibreTranslate API (English ↔ Vietnamese và nhiều ngôn ngữ khác)
- **Định nghĩa**: Gemma 2B IT (google/gemma-2b-it) - Instruction-tuned model từ Google

### Xử lý lỗi:

#### Lỗi Model Loading:
- **"Model đang được tải"**: Model đang được load lần đầu (thường xảy ra sau khi không dùng một thời gian)
- **Giải pháp**: 
  1. Đợi 10-30 giây và thử lại
  2. Model sẽ được cache sau lần load đầu tiên

#### Lỗi Rate Limiting:
- **"Rate limit exceeded" hoặc "429"**: Đã vượt quá giới hạn request
- **Giải pháp cho LibreTranslate**: 
  1. Đợi vài phút rồi thử lại
  2. Có thể tự host LibreTranslate để tránh rate limit
- **Giải pháp cho Hugging Face**: 
  1. Đợi vài phút rồi thử lại
  2. Thêm Hugging Face API token vào `.env` để tăng giới hạn
  3. Lấy token tại: https://huggingface.co/settings/tokens

#### Lỗi API Token:
- **"Unauthorized" hoặc "sufficient permissions"**: Token không hợp lệ hoặc không có quyền
- **Giải pháp**: 
  1. Kiểm tra token trong file `.env`
  2. Đảm bảo token bắt đầu với `hf_`
  3. **Quan trọng**: Token phải có quyền **"write"**, không phải "read"
  4. Tạo token mới tại: https://huggingface.co/settings/tokens với quyền "write"
  5. Khởi động lại proxy server sau khi cập nhật token

#### Lỗi CORS:
- **"CORS policy" hoặc "Failed to fetch"**: Proxy server chưa chạy
- **Giải pháp**: 
  1. Đảm bảo proxy server đang chạy: `npm run serve`
  2. Kiểm tra proxy server tại: http://localhost:3001/api/health
  3. Xem hướng dẫn chi tiết tại `PROXY_SETUP.md`

#### Lỗi kết nối:
- **"Failed to fetch"**: Lỗi kết nối mạng hoặc proxy server không chạy
- **Giải pháp**: 
  1. Kiểm tra proxy server đang chạy
  2. Kiểm tra kết nối internet
  3. Kiểm tra port 3001 không bị chặn

#### Lưu ý:
- Bạn vẫn có thể tạo thẻ thủ công nếu tính năng AI không hoạt động
- Tính năng AI là tùy chọn, không bắt buộc để sử dụng ứng dụng
- LibreTranslate API miễn phí nhưng có rate limits (có thể tự host để tránh)
- Hugging Face API miễn phí nhưng có rate limits (cao hơn khi có token)

