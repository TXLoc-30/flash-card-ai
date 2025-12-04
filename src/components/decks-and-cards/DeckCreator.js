/**
 * Handles the creation of new decks with purpose-based configuration.
 * Supports two purposes: Translation and Academic
 */

import React, { useState, useContext } from 'react';
import { dbMethods } from '../../firebase/dbMethods';
import { firebaseAuth } from '../../provider/AuthProvider';
import { useHistory } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeading, faLanguage, faGraduationCap, faInfoCircle, faGlobe, faLock } from '@fortawesome/free-solid-svg-icons';

import TextInput from '../TextInput';

const DeckCreator = ({
  setDeckToEdit,
  setSelectedDecks
}) => {
  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [tags, setTags] = useState([]);
  const [purpose, setPurpose] = useState(""); // 'translation' or 'academic'
  
  // Translation-specific fields
  const [languagePair, setLanguagePair] = useState("");
  const [translationDescription, setTranslationDescription] = useState("");
  
  // Academic-specific fields
  const [academicDescription, setAcademicDescription] = useState("");

  const { user } = useContext(firebaseAuth);
  const history = useHistory();

  const createDeck = async (event) => {
    event.preventDefault();
    
    if (!purpose) {
      alert("Vui lòng chọn mục đích của bộ thẻ (Dịch thuật hoặc Học thuật)");
      return;
    }

    if (purpose === 'translation' && !languagePair) {
      alert("Vui lòng chọn cặp ngôn ngữ");
      return;
    }

    if (purpose === 'translation' && !translationDescription.trim()) {
      alert("Vui lòng nhập mô tả bộ thẻ");
      return;
    }

    if (purpose === 'academic' && !academicDescription.trim()) {
      alert("Vui lòng nhập mô tả bộ thẻ");
      return;
    }

    const deckConfig = {
      purpose,
      languagePair: purpose === 'translation' ? languagePair : null,
      translationDescription: purpose === 'translation' ? translationDescription : null,
      academicDescription: purpose === 'academic' ? academicDescription : null,
    };

    try {
      const newDeck = await dbMethods.createDeck(user, title, isPublic, tags, deckConfig);
      
      // Set deck to edit và selected decks
      if (setDeckToEdit && setSelectedDecks) {
        setDeckToEdit({
          id: newDeck.id,
          title: newDeck.title,
          private: newDeck.private,
          tags: newDeck.tags || [],
          purpose: newDeck.purpose,
          languagePair: newDeck.languagePair,
          translationDescription: newDeck.translationDescription,
          academicDescription: newDeck.academicDescription,
        });
        setSelectedDecks([newDeck.id]);
      }
      
      // Chuyển đến trang chỉnh sửa
      history.push("/app/edit");
    } catch (err) {
      console.error("Error creating deck:", err);
      alert("Có lỗi xảy ra khi tạo bộ thẻ. Vui lòng thử lại.");
    }
  }

  const languagePairs = [
    { value: 'en-vi', label: 'Anh - Việt' },
    { value: 'vi-en', label: 'Việt - Anh' },
    { value: 'vi-zh', label: 'Việt - Trung' },
    { value: 'zh-vi', label: 'Trung - Việt' },
    { value: 'en-zh', label: 'Anh - Trung' },
    { value: 'zh-en', label: 'Trung - Anh' },
    { value: 'en-ja', label: 'Anh - Nhật' },
    { value: 'ja-en', label: 'Nhật - Anh' },
    { value: 'en-ko', label: 'Anh - Hàn' },
    { value: 'ko-en', label: 'Hàn - Anh' },
  ];



  return (
    <div className="deck-form-wrapper">
      <form 
        id="new-deck" 
        onSubmit={createDeck}
        className="deck-form"
      >
      {/* Basic Information Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 'bold', color: '#504f5b' }}>
          Thông tin cơ bản
        </h3>
      <TextInput 
          labelText="Tiêu đề"
        icon={<FontAwesomeIcon icon={faHeading} />}
        id="title"
        name="title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
          placeholder="Tên bộ thẻ"
        autocomplete="off"
          required
      />
      </div>

      {/* Purpose Selection */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 'bold', color: '#504f5b' }}>
          Mục đích của bộ thẻ <span style={{ color: 'red' }}>*</span>
        </h3>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '0.75rem',
          marginBottom: '1rem',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <button
            type="button"
            className={`btn ${purpose === 'translation' ? 'btn-primary' : 'btn-secondary btn-purpose'}`}
            onClick={() => setPurpose('translation')}
            style={{ 
              width: '100%', 
              padding: '1rem', 
              fontSize: '1.1rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <FontAwesomeIcon icon={faLanguage} />
            <span>Dịch thuật</span>
          </button>
          <button
            type="button"
            className={`btn ${purpose === 'academic' ? 'btn-primary' : 'btn-secondary btn-purpose'}`}
            onClick={() => setPurpose('academic')}
            style={{ 
              width: '100%', 
              padding: '1rem', 
              fontSize: '1.1rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <FontAwesomeIcon icon={faGraduationCap} />
            <span>Học thuật</span>
          </button>
        </div>
        <p style={{ fontSize: '0.9rem', color: '#666', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <FontAwesomeIcon icon={faInfoCircle} />
          Chọn mục đích để hiển thị các tùy chọn phù hợp
        </p>
      </div>

      {/* Translation-specific fields */}
      {purpose === 'translation' && (
        <div style={{ 
          marginBottom: '2rem', 
          padding: '1.5rem', 
          backgroundColor: '#f9f9f9', 
          borderRadius: '1rem',
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 'bold', color: '#504f5b' }}>
            <FontAwesomeIcon icon={faLanguage} style={{ marginRight: '8px', color: '#39a95d' }} />
            Cấu hình Dịch thuật
          </h3>
          
          <div className="input-block" style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="languagePair" style={{ fontWeight: 'bold', marginBottom: '1rem', display: 'block' }}>
              Cặp ngôn ngữ <span style={{ color: 'red' }}>*</span>
            </label>
            <div className="language-pairs-grid">
              {languagePairs.map(pair => (
                <button
                  key={pair.value}
                  type="button"
                  className={`language-pair-btn ${languagePair === pair.value ? 'active' : ''}`}
                  onClick={() => setLanguagePair(pair.value)}
                  style={{
                    padding: '0.75rem 1rem',
                    border: `2px solid ${languagePair === pair.value ? '#39a95d' : '#ddd'}`,
                    borderRadius: '0.5rem',
                    backgroundColor: languagePair === pair.value ? '#f0f9f4' : 'white',
                    color: languagePair === pair.value ? '#005611' : '#504f5b',
                    fontWeight: languagePair === pair.value ? '600' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '0.95rem',
                    textAlign: 'center'
                  }}
                >
                  {pair.label}
                </button>
              ))}
            </div>
            {languagePair && (
              <input
                type="hidden"
                name="languagePair"
                value={languagePair}
                required
              />
            )}
          </div>

          <div className="input-block">
            <label htmlFor="translationDescription" style={{ fontWeight: 'bold' }}>
              Mô tả bộ thẻ <span style={{ color: 'red' }}>*</span>
            </label>
            <textarea
              id="translationDescription"
              name="translationDescription"
              value={translationDescription}
              onChange={(e) => setTranslationDescription(e.target.value)}
              placeholder="Nhập mô tả về bộ thẻ dịch thuật (ví dụ: từ vựng động vật, từ vựng du lịch, từ vựng công nghệ...)"
              className="textarea-input"
              required
            />
          </div>
        </div>
      )}

      {/* Academic-specific fields */}
      {purpose === 'academic' && (
        <div style={{ 
          marginBottom: '2rem', 
          padding: '1.5rem', 
          backgroundColor: '#f9f9f9', 
          borderRadius: '1rem',
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 'bold', color: '#504f5b' }}>
            <FontAwesomeIcon icon={faGraduationCap} style={{ marginRight: '8px', color: '#39a95d' }} />
            Cấu hình Học thuật
          </h3>
          
          <div className="input-block">
            <label htmlFor="academicDescription" style={{ fontWeight: 'bold' }}>
              Mô tả bộ thẻ <span style={{ color: 'red' }}>*</span>
            </label>
            <textarea
              id="academicDescription"
              name="academicDescription"
              value={academicDescription}
              onChange={(e) => setAcademicDescription(e.target.value)}
              placeholder="Nhập mô tả về bộ thẻ học thuật (ví dụ: từ vựng toán học lớp 10, công thức hóa học cơ bản...)"
              className="textarea-input"
              required
            />
          </div>
        </div>
      )}


      {/* Public checkbox */}
      <div style={{ marginBottom: '3rem' }}>
        <label 
          htmlFor="public" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            padding: '1.25rem',
            border: `2px solid ${isPublic ? '#39a95d' : '#ddd'}`,
            borderRadius: '0.75rem',
            backgroundColor: isPublic ? '#f0f9f4' : '#fafafa',
            transition: 'all 0.3s ease',
            boxShadow: isPublic ? '0 2px 8px rgba(57, 169, 93, 0.15)' : 'none'
          }}
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            marginRight: '12px',
            borderRadius: '4px',
            backgroundColor: isPublic ? '#39a95d' : 'white',
            border: `2px solid ${isPublic ? '#39a95d' : '#ccc'}`,
            transition: 'all 0.3s ease'
          }}>
            {isPublic && (
              <FontAwesomeIcon 
                icon={faGlobe} 
                style={{ color: 'white', fontSize: '12px' }} 
              />
            )}
            {!isPublic && (
              <FontAwesomeIcon 
                icon={faLock} 
                style={{ color: '#999', fontSize: '12px' }} 
              />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontWeight: '600', 
              color: isPublic ? '#005611' : '#504f5b',
              marginBottom: '4px',
              fontSize: '1rem'
            }}>
              {isPublic ? 'Bộ thẻ công khai' : 'Bộ thẻ riêng tư'}
            </div>
            <div style={{ 
              fontSize: '0.9rem', 
              color: isPublic ? '#39a95d' : '#666',
              lineHeight: '1.4'
            }}>
              {isPublic 
                ? 'Bộ thẻ này có thể được chia sẻ và mọi người đều có thể xem' 
                : 'Chỉ bạn mới có thể xem bộ thẻ này'}
            </div>
          </div>
          <input
            id="public"
            name="public"
            type="checkbox"
            checked={isPublic ? true : false}
            onChange={() => setIsPublic(!isPublic)}
            style={{ 
              position: 'absolute',
              opacity: 0,
              width: 0,
              height: 0
            }}
          />
        </label>
      </div>

      <button
        className="btn btn-primary"
        type="submit"
        style={{ 
          width: '100%', 
          padding: '1rem', 
          fontSize: '1.1rem',
          fontWeight: 'bold'
        }}
      >
        Tạo bộ thẻ!
      </button>
    </form>
    </div>
  );
}

export default DeckCreator;
