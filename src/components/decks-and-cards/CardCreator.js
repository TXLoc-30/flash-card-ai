/**
 * Renders the card creator with AI-powered features.
 * Supports:
 * - Auto-generate multiple cards from description
 * - Manual card creation with AI assistance (generate back from front)
 */

import React, { useState, useContext } from 'react';
import { firebaseAuth } from '../../provider/AuthProvider';
import { dbMethods } from '../../firebase/dbMethods';
import { generateCards, generateCardBack, translateCard } from '../../services/chatgptService';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus, faMagic, faLanguage, faSpinner } from '@fortawesome/free-solid-svg-icons';

const CardCreator = ({
  deckId,
  deckTags = [],
  deckConfig = {} // Contains purpose, languagePair, academicDescription, etc.
}) => {
  const { user } = useContext(firebaseAuth);
  const [mode, setMode] = useState('manual'); // 'manual' or 'auto'
  const [isOpen, setIsOpen] = useState(false);
  
  // Manual mode states
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Auto mode states
  const [description, setDescription] = useState("");
  const [cardCount, setCardCount] = useState(5);
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInput = (event) => {
    if (event.target.name === "front") {
      setFront(event.target.value);
    } else if (event.target.name === "back") {
      setBack(event.target.value);
    } else if (event.target.name === "description") {
      setDescription(event.target.value);
    } else if (event.target.name === "cardCount") {
      setCardCount(parseInt(event.target.value) || 5);
    }
    if (error) setError("");
    if (success) setSuccess("");
  }

  // Generate back side from front using AI
  const handleGenerateBack = async () => {
    if (!front.trim()) {
      setError("Vui lòng nhập nội dung ở mặt trước");
      return;
    }

    setIsGenerating(true);
    setError("");
    setSuccess("");

    try {
      const purpose = deckConfig.purpose || 'translation';
      const generatedBack = await generateCardBack(front, purpose, deckConfig, deckTags);
      setBack(generatedBack);
      setSuccess("Đã tạo nội dung mặt sau thành công!");
    } catch (err) {
      console.error("Generate back error:", err);
      let errorMsg = err.message || "Không thể tạo nội dung. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.";
      
      // Provide more helpful error messages
      if (errorMsg.includes('quota') || errorMsg.includes('billing') || errorMsg.includes('insufficient_quota')) {
        errorMsg = '⚠️ Đã hết quota OpenAI. Vui lòng kiểm tra billing tại https://platform.openai.com/account/billing và nạp tiền vào tài khoản.';
      } else if (errorMsg.includes('API key') || errorMsg.includes('invalid')) {
        errorMsg = '⚠️ API key không hợp lệ. Vui lòng kiểm tra cấu hình REACT_APP_OPENAI_API_KEY trong file .env';
      } else if (errorMsg.includes('rate_limit')) {
        errorMsg = '⚠️ Đã vượt quá giới hạn. Vui lòng thử lại sau vài giây.';
      }
      
      setError(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  // Translate front side (for translation decks)
  const handleTranslate = async () => {
    if (!front.trim()) {
      setError("Vui lòng nhập nội dung ở mặt trước để dịch");
      return;
    }

    setIsGenerating(true);
    setError("");
    setSuccess("");

    try {
      const translated = await translateCard(front, deckConfig, deckTags);
      setBack(translated);
      setSuccess("Đã dịch thành công!");
    } catch (err) {
      console.error("Translation error:", err);
      let errorMsg = err.message || "Không thể dịch. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.";
      
      // Provide more helpful error messages
      if (errorMsg.includes('quota') || errorMsg.includes('billing') || errorMsg.includes('insufficient_quota')) {
        errorMsg = '⚠️ Đã hết quota OpenAI. Vui lòng kiểm tra billing tại https://platform.openai.com/account/billing và nạp tiền vào tài khoản.';
      } else if (errorMsg.includes('API key') || errorMsg.includes('invalid')) {
        errorMsg = '⚠️ API key không hợp lệ. Vui lòng kiểm tra cấu hình REACT_APP_OPENAI_API_KEY trong file .env';
      } else if (errorMsg.includes('rate_limit')) {
        errorMsg = '⚠️ Đã vượt quá giới hạn. Vui lòng thử lại sau vài giây.';
      }
      
      setError(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  // Create a single card manually
  const createCard = async (event) => {
    event.preventDefault();
    if (!front.trim() || !back.trim()) {
      setError("Vui lòng điền đầy đủ cả hai mặt của thẻ");
      return;
    }
    
    console.log("Creating new card.");
    dbMethods.createCard(user, deckId, front, back);
    setFront("");
    setBack("");
    setError("");
    setSuccess("");
    setIsOpen(false);
  }

  // Auto-generate multiple cards
  const handleGenerateCards = async () => {
    if (cardCount < 1 || cardCount > 50) {
      setError("Số lượng thẻ phải từ 1 đến 50");
      return;
    }

    setIsGeneratingCards(true);
    setError("");
    setSuccess("");

    try {
      const purpose = deckConfig.purpose || 'translation';
      const cards = await generateCards({
        description,
        count: cardCount,
        purpose,
        deckConfig,
        tags: deckTags
      });

      // Create all cards
      let successCount = 0;
      for (const card of cards) {
        if (card.front && card.back) {
          dbMethods.createCard(user, deckId, card.front, card.back);
          successCount++;
        }
      }

      setSuccess(`Đã tạo thành công ${successCount}/${cards.length} thẻ!`);
      setDescription("");
      setCardCount(5);
      
      // Close after a delay
      setTimeout(() => {
        setIsOpen(false);
        setSuccess("");
      }, 2000);
    } catch (err) {
      console.error("Generate cards error:", err);
      let errorMsg = err.message || "Không thể tạo thẻ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.";
      
      // Provide more helpful error messages
      if (errorMsg.includes('quota') || errorMsg.includes('billing') || errorMsg.includes('insufficient_quota')) {
        errorMsg = '⚠️ Đã hết quota OpenAI. Vui lòng:\n1. Kiểm tra billing tại https://platform.openai.com/account/billing\n2. Thêm payment method và nạp tiền\n3. Kiểm tra usage limits tại https://platform.openai.com/usage';
      } else if (errorMsg.includes('API key') || errorMsg.includes('invalid')) {
        errorMsg = '⚠️ API key không hợp lệ. Vui lòng kiểm tra cấu hình REACT_APP_OPENAI_API_KEY trong file .env';
      } else if (errorMsg.includes('rate_limit')) {
        errorMsg = '⚠️ Đã vượt quá giới hạn. Vui lòng thử lại sau vài giây.';
      }
      
      setError(errorMsg);
    } finally {
      setIsGeneratingCards(false);
    }
  };

  if (!isOpen) return (
    <button className="btn btn-tertiary"
      onClick={() => setIsOpen(true)}
    >
      Thêm thẻ <FontAwesomeIcon icon={faPlus} className="icon" />
    </button>
  );

  return (
    <>
      <button id="add" className="btn btn-tertiary highlighted"
        onClick={() => {
          setIsOpen(false);
          setMode('manual');
          setFront("");
          setBack("");
          setDescription("");
          setError("");
          setSuccess("");
        }}
      >
        Thêm thẻ <FontAwesomeIcon icon={faMinus} className="icon"/>
      </button>

      {/* Mode Selection */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          type="button"
          className={`btn ${mode === 'manual' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('manual')}
        >
          Tạo thủ công
        </button>
        <button
          type="button"
          className={`btn ${mode === 'auto' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('auto')}
        >
          <FontAwesomeIcon icon={faMagic} /> Tạo tự động (AI)
        </button>
      </div>

      {/* Manual Mode */}
      {mode === 'manual' && (
      <form className="card-editor" onSubmit={createCard}>
        <div className="input-block">
          <textarea
            name="front"
            id="new-front"
            value={front}
            onChange={handleInput}
              placeholder="Nhập nội dung mặt trước..."
          />
            <label htmlFor="new-front">Mặt trước</label>
            {front.trim() && (
              <div className="ai-actions" style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {deckConfig.purpose === 'translation' ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleTranslate}
                    disabled={isGenerating}
                    title="Dịch nội dung"
                  >
                    <FontAwesomeIcon icon={faLanguage} /> 
                    {isGenerating ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin style={{ marginLeft: '5px' }} /> Đang dịch...
                      </>
                    ) : (
                      " Dịch"
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleGenerateBack}
                    disabled={isGenerating}
                    title="Tạo nội dung mặt sau bằng AI"
                  >
                    <FontAwesomeIcon icon={faMagic} /> 
                    {isGenerating ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin style={{ marginLeft: '5px' }} /> Đang tạo...
                      </>
                    ) : (
                      " Tạo mặt sau"
                    )}
                  </button>
                )}
              </div>
            )}
        </div>
        <div className="input-block">
          <textarea
            name="back"
            id="new-back"
            value={back}
            onChange={handleInput}
              placeholder="Nhập nội dung mặt sau hoặc sử dụng nút AI để tạo tự động..."
          />        
            <label htmlFor="new-back">Mặt sau</label>
          </div>
          {error && (
            <div className="error-message" style={{ color: 'red', margin: '10px 0', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
              {error}
            </div>
          )}
          {success && (
            <div className="success-message" style={{ color: 'green', margin: '10px 0', padding: '10px', backgroundColor: '#e6ffe6', borderRadius: '4px' }}>
              {success}
            </div>
          )}
          <button className="btn btn-primary" type="submit" disabled={isGenerating}>
            Tạo thẻ
          </button>
        </form>
      )}

      {/* Auto Mode */}
      {mode === 'auto' && (
        <form className="card-editor" onSubmit={(e) => { e.preventDefault(); handleGenerateCards(); }}>
          <div className="input-block">
            <label htmlFor="description">Mô tả các thẻ bạn muốn tạo (tùy chọn)</label>
            <textarea
              name="description"
              id="description"
              value={description}
              onChange={handleInput}
              placeholder="Ví dụ: Tạo 10 thẻ từ vựng tiếng Anh về thể thao, hoặc Tạo 5 thẻ về công thức hóa học cơ bản... (Để trống để AI tự động tạo dựa trên mô tả bộ thẻ)"
              style={{ minHeight: '100px' }}
            />
          </div>
          <div className="input-block">
            <label htmlFor="cardCount">Số lượng thẻ</label>
            <input
              type="number"
              name="cardCount"
              id="cardCount"
              value={cardCount}
              onChange={handleInput}
              min="1"
              max="50"
              required
              style={{ width: '100px', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
            <p style={{ marginTop: '5px', fontSize: '0.9em', color: '#666' }}>
              Số lượng thẻ từ 1 đến 50
            </p>
          </div>
          {error && (
            <div className="error-message" style={{ color: 'red', margin: '10px 0', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
              {error}
            </div>
          )}
          {success && (
            <div className="success-message" style={{ color: 'green', margin: '10px 0', padding: '10px', backgroundColor: '#e6ffe6', borderRadius: '4px' }}>
              {success}
        </div>
          )}
          <button 
            className="btn btn-primary" 
            type="submit" 
            disabled={isGeneratingCards}
          >
            {isGeneratingCards ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin /> Đang tạo thẻ...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faMagic} /> Tạo {cardCount} thẻ tự động
              </>
            )}
          </button>
      </form>
      )}
    </>
  );
}

export default CardCreator;
