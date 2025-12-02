# Firestore Security Rules Setup

## Vấn đề
Bạn đang gặp lỗi "Missing or insufficient permissions" khi truy cập collection `cards` trong Firestore.

## Giải pháp

### Bước 1: Truy cập Firebase Console
1. Đi tới [Firebase Console](https://console.firebase.google.com/)
2. Chọn project của bạn: `flash-cards-7b4c7`
3. Vào **Firestore Database** > **Rules** tab

### Bước 2: Cập nhật Security Rules
Copy và paste nội dung sau vào Rules editor:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user is the owner
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Helper function to check if user can read a deck
    function canReadDeck(deckId) {
      let deck = get(/databases/$(database)/documents/decks/$(deckId));
      return deck.data.private == false || isOwner(deck.data.owner);
    }
    
    // Rules cho collection 'users'
    match /users/{userId} {
      allow read, write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // Rules cho collection 'decks'
    match /decks/{deckId} {
      // Chỉ owner mới có thể đọc/ghi deck riêng tư
      allow read, write: if isAuthenticated() && request.auth.uid == resource.data.owner;
      
      // Ai cũng có thể đọc deck công khai
      allow read: if resource.data.private == false;
      
      // Chỉ user đã đăng nhập mới có thể tạo deck mới
      allow create: if isAuthenticated() && request.auth.uid == request.resource.data.owner;
    }
    
    // Rules cho collection 'cards'
    match /cards/{cardId} {
      // Cho phép đọc nếu:
      // 1. User là owner của card, HOẶC
      // 2. User có thể đọc deck chứa card (deck là public hoặc user là owner của deck)
      allow read: if isAuthenticated() && (
        request.auth.uid == resource.data.owner ||
        (resource.data.deckId != null && canReadDeck(resource.data.deckId))
      );
      
      // Chỉ owner của card mới có thể update/delete
      allow update, delete: if isAuthenticated() && request.auth.uid == resource.data.owner;
      
      // Chỉ user đã đăng nhập mới có thể tạo card mới và phải là owner
      allow create: if isAuthenticated() && request.auth.uid == request.resource.data.owner;
    }
  }
}
```

### Bước 3: Publish Rules
1. Click nút **Publish** ở góc trên bên phải
2. Chờ vài giây để rules được deploy

### Bước 4: Test lại ứng dụng
1. Refresh trang web
2. Đăng nhập lại (nếu cần)
3. Chọn 2 bộ thẻ và thử shuffle

## Giải thích Rules

### Decks Collection:
- **Read**: Cho phép đọc nếu deck là public (`private == false`) hoặc user là owner
- **Create/Update/Delete**: Chỉ cho phép nếu user là owner

### Cards Collection:
- **Read**: Cho phép đọc nếu:
  - User là owner của card, HOẶC
  - Deck chứa card là public, HOẶC
  - User là owner của deck chứa card
- **Create/Update/Delete**: Chỉ cho phép nếu user là owner của card

## Lưu ý
- Rules này đảm bảo người dùng chỉ có thể xem cards từ:
  - Decks public của người khác
  - Decks của chính họ (dù private hay public)
- Không thể xem cards từ decks private của người khác

