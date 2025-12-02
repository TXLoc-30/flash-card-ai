# Hướng dẫn cấu hình OpenAI API

## Lỗi "insufficient_quota" - Đã hết quota

Nếu bạn gặp lỗi này, có nghĩa là:
1. Tài khoản OpenAI của bạn đã hết quota (credit)
2. Chưa thêm payment method
3. Chưa nạp tiền vào tài khoản

## Cách khắc phục:

### Bước 1: Kiểm tra Billing
1. Truy cập: https://platform.openai.com/account/billing
2. Đăng nhập vào tài khoản OpenAI của bạn
3. Kiểm tra số dư và usage

### Bước 2: Thêm Payment Method
1. Vào trang Billing: https://platform.openai.com/account/billing
2. Click "Add payment method"
3. Thêm thẻ tín dụng hoặc PayPal
4. Xác nhận payment method

### Bước 3: Nạp tiền (Nếu cần)
1. Vào "Billing" > "Payment methods"
2. Click "Add funds" hoặc "Set up paid account"
3. Chọn số tiền muốn nạp
4. Xác nhận thanh toán

### Bước 4: Kiểm tra Usage Limits
1. Truy cập: https://platform.openai.com/usage
2. Kiểm tra rate limits và usage hiện tại
3. Nếu cần, nâng cấp plan để tăng limits

## Cấu hình API Key

### Bước 1: Lấy API Key
1. Truy cập: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Đặt tên cho key (ví dụ: "Flash Cards App")
4. Copy key ngay lập tức (sẽ không hiển thị lại)

### Bước 2: Thêm vào file .env
Tạo hoặc mở file `.env` trong thư mục gốc của project và thêm:

```
REACT_APP_OPENAI_API_KEY=sk-your-api-key-here
```

**Lưu ý quan trọng:**
- Không commit file `.env` lên Git
- API key bắt đầu với `sk-`
- Khởi động lại server sau khi thêm key

### Bước 3: Khởi động lại
1. Dừng proxy server (Ctrl+C)
2. Khởi động lại: `npm run serve`
3. Kiểm tra log để xác nhận key đã được load

## Kiểm tra cấu hình

Sau khi cấu hình, kiểm tra log của proxy server:
```
Proxy server running on http://localhost:3001
ChatGPT API: Configured  <-- Phải hiển thị "Configured"
```

Nếu hiển thị "Not configured", kiểm tra lại:
- File `.env` có tồn tại không?
- Key có đúng format không?
- Đã khởi động lại server chưa?

## Các lỗi thường gặp

### 1. "Invalid API key"
- **Nguyên nhân**: Key không đúng hoặc đã bị xóa
- **Giải pháp**: Tạo key mới tại https://platform.openai.com/api-keys

### 2. "Rate limit exceeded"
- **Nguyên nhân**: Gửi quá nhiều request trong thời gian ngắn
- **Giải pháp**: Đợi vài giây rồi thử lại, hoặc nâng cấp plan

### 3. "Insufficient quota"
- **Nguyên nhân**: Hết credit hoặc chưa có payment method
- **Giải pháp**: Xem hướng dẫn ở trên

### 4. "Model not found"
- **Nguyên nhân**: Model name không đúng
- **Giải pháp**: Kiểm tra code, model phải là `gpt-4o-mini` (model được sử dụng trong ứng dụng này)

## Chi phí

OpenAI API tính phí theo usage:
- **GPT-4o-mini**: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens (rất rẻ, tương đương GPT-3.5)
- **GPT-4**: ~$30 per 1M input tokens, ~$60 per 1M output tokens (đắt hơn nhiều)

Mỗi thẻ flashcard thường tốn khoảng 100-500 tokens, tức là:
- GPT-4o-mini: ~$0.000015-0.0003 per card (rất rẻ)
- 1000 thẻ ≈ $0.015-0.30 với GPT-4o-mini

**Lưu ý**: GPT-4o-mini là model mới, nhanh và rẻ, phù hợp cho hầu hết các tác vụ.

## Tối ưu chi phí

1. **Sử dụng GPT-4o-mini**: Model được cấu hình sẵn, nhanh và rẻ, đủ tốt cho hầu hết trường hợp
2. **Giới hạn số lượng thẻ**: Không tạo quá nhiều thẻ một lúc (giới hạn 50 thẻ/lần)
3. **Tái sử dụng**: Sửa thẻ thủ công thay vì tạo mới
4. **Monitor usage**: Kiểm tra usage thường xuyên tại https://platform.openai.com/usage

## Hỗ trợ

Nếu vẫn gặp vấn đề:
1. Kiểm tra logs trong terminal của proxy server
2. Kiểm tra browser console để xem error messages
3. Xem tài liệu OpenAI: https://platform.openai.com/docs

