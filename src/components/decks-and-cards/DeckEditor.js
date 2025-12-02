 /**
 * Displays the deck editor with full configuration options.
 * Allows editing all deck properties including purpose and specific fields.
 */

import React, { useState, useContext } from 'react';
import { firebaseAuth } from '../../provider/AuthProvider';
import { dbMethods } from '../../firebase/dbMethods';
import { useHistory } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeading, faLanguage, faGraduationCap } from '@fortawesome/free-solid-svg-icons';

import Accordion from '../Accordion';
import Breadcrumb from '../Breadcrumb';
import CardCreator from './CardCreator';
import PageHeading from '../PageHeading';
import TextInput from '../TextInput';

const DeckEditor = ({
  selectedDecks,
  deckToEdit,
  setDeckToEdit,
  cards
}) => {
  const { user } = useContext(firebaseAuth);
  const history = useHistory();
  
  // Basic fields - use safe defaults if deckToEdit is null
  const [title, setTitle] = useState(deckToEdit?.title || '');
  const [isPublic, setIsPublic] = useState(!deckToEdit?.private);
  // eslint-disable-next-line no-unused-vars
  const [tags, setTags] = useState(deckToEdit?.tags || []);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  
  // Purpose and config
  const [purpose, setPurpose] = useState(deckToEdit?.purpose || '');
  const [languagePair, setLanguagePair] = useState(deckToEdit?.languagePair || '');
  const [translationDescription, setTranslationDescription] = useState(deckToEdit?.translationDescription || '');
  const [academicDescription, setAcademicDescription] = useState(deckToEdit?.academicDescription || '');
  
  // Safety check: if deckToEdit is null, show message
  if (!deckToEdit) {
    return (
      <>
        <Breadcrumb 
          to="/app"
          name="Dashboard"
        />
        <PageHeading
          title="Không tìm thấy bộ thẻ"
          subtitle="Vui lòng chọn một bộ thẻ từ dashboard để chỉnh sửa"
        />
        <button
          className="btn btn-primary"
          onClick={() => history.push('/app')}
        >
          Quay lại Dashboard
        </button>
      </>
    );
  }

  const updateDeck = (event) => {
    event.preventDefault();
    
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

    dbMethods.updateDeck(user, deckToEdit.id, title, !isPublic, tags, deckConfig);
    setDeckToEdit({
      ...deckToEdit, 
      title, 
      private: !isPublic, 
      tags,
      ...deckConfig
    });
    setUpdateSuccess(true);
    setTimeout(() => setUpdateSuccess(false), 3000);
  }

  const deleteDeck = (event) => {
    event.preventDefault();
    if (window.confirm('Bạn có chắc chắn muốn xóa bộ thẻ này? Hành động này không thể hoàn tác.')) {
    dbMethods.deleteDeck(user, deckToEdit.id);
    history.push('/app');
    setDeckToEdit(null);
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
    <>
      <Breadcrumb 
        to="/app"
        name="Dashboard"
      />
      <PageHeading
        title="Chỉnh sửa bộ thẻ"
        subtitle="Cập nhật thông tin và cấu hình của bộ thẻ"
      />
      
      <form onSubmit={updateDeck} className="deck-form">
        {/* Basic Information */}
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
              className={`btn ${purpose === 'translation' ? 'btn-primary' : 'btn-secondary'}`}
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
              className={`btn ${purpose === 'academic' ? 'btn-primary' : 'btn-secondary'}`}
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
              <label htmlFor="languagePair" style={{ fontWeight: 'bold' }}>
                Cặp ngôn ngữ <span style={{ color: 'red' }}>*</span>
              </label>
              <select
                id="languagePair"
                name="languagePair"
                value={languagePair}
                onChange={(e) => setLanguagePair(e.target.value)}
                required
                className="select-input"
              >
                <option value="">-- Chọn cặp ngôn ngữ --</option>
                {languagePairs.map(pair => (
                  <option key={pair.value} value={pair.value}>{pair.label}</option>
                ))}
              </select>
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
        <div style={{ marginBottom: '2rem' }}>
          <label 
            htmlFor="public" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              padding: '1rem',
              border: '1px solid #ddd',
              borderRadius: '0.5rem',
              backgroundColor: isPublic ? '#f0f9f4' : 'white',
              transition: 'all 0.3s'
            }}
          >
        <input
          id="public"
          name="public"
          type="checkbox"
          checked={isPublic ? true : false}
          onChange={() => setIsPublic(!isPublic)}
              style={{ marginRight: '10px', cursor: 'pointer' }}
        />
            <span>Bộ thẻ này có công khai và có thể chia sẻ?</span>
        </label>
        </div>

        <button
          className="btn btn-primary"
          type="submit"
          style={{ 
            width: '100%', 
            padding: '1rem', 
            fontSize: '1.1rem',
            fontWeight: 'bold',
            backgroundColor: updateSuccess ? '#4caf50' : undefined
          }}
        >
          {updateSuccess ? "✓ Đã cập nhật!" : "Cập nhật" }
        </button>
      </form>

      {/* Cards Section */}
      <div style={{ marginTop: '3rem' }}>
        <PageHeading 
          title="Quản lý thẻ"
          subtitle="Thêm, chỉnh sửa và xóa thẻ trong bộ thẻ này"
          heading="h2"
        />
        <Accordion
          deckId={selectedDecks[0]}
          cards={cards}
        />
        <CardCreator 
          deckId={selectedDecks[0]}
          deckTags={tags}
          deckConfig={{
            purpose,
            languagePair,
            translationDescription,
            academicDescription,
          }}
        />
      </div>

      {/* Delete Section */}
      <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '2px solid #e0e0e0' }}>
        <PageHeading 
          title="Xóa bộ thẻ"
          subtitle="Xóa vĩnh viễn bộ thẻ này và tất cả các thẻ trong đó"
          heading="h2"
        />
        <form onSubmit={deleteDeck}>
          <button
            className="btn btn-warning"
            type="submit"
            style={{ 
              width: '100%', 
              padding: '1rem', 
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}
          >
            Xóa bộ thẻ
          </button>
        </form>
      </div>
    </>
  );
}

export default DeckEditor;
