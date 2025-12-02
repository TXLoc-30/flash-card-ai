/**
 * Component for selecting tags/categories for decks
 */

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTag, faTimes } from '@fortawesome/free-solid-svg-icons';

const COMMON_TAGS = [
  'Ngôn ngữ',
  'Từ vựng',
  'Cấu trúc',
  'Ngữ pháp',
  'Lịch sử',
  'Địa lý',
  'Khoa học',
  'Toán học',
  'Văn học',
  'Nghệ thuật',
  'Thể thao',
  'Công nghệ',
  'Y học',
  'Kinh tế',
  'Triết học'
];

const TagSelector = ({ selectedTags = [], onChange, labelText = "Tags/Categories" }) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleAddTag = (tag) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      onChange([...selectedTags, trimmedTag]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    onChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        handleAddTag(inputValue);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const filteredSuggestions = COMMON_TAGS.filter(
    tag => tag.toLowerCase().includes(inputValue.toLowerCase()) && !selectedTags.includes(tag)
  );

  return (
    <div className="input-block">
      <label htmlFor="tags">{labelText}</label>
      <div className="input-row">
        <FontAwesomeIcon icon={faTag} />
        <div className="tag-selector-container">
          <div className="selected-tags">
            {selectedTags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
                <button
                  type="button"
                  className="tag-remove"
                  onClick={() => handleRemoveTag(tag)}
                  aria-label={`Remove ${tag}`}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            id="tags"
            name="tags"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              // Delay to allow click on suggestions
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Nhập tag hoặc chọn từ gợi ý..."
            autoComplete="off"
          />
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="tag-suggestions">
              {filteredSuggestions.slice(0, 5).map((tag, index) => (
                <button
                  key={index}
                  type="button"
                  className="tag-suggestion"
                  onClick={() => handleAddTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <p className="input-hint">Nhấn Enter để thêm tag, hoặc chọn từ danh sách gợi ý</p>
    </div>
  );
};

export default TagSelector;

