/**
 * Search bar component for filtering decks
 */

import React from 'react';
import { useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';

const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = "Tìm kiếm bộ thẻ...",
  className = ""
}) => {
  const history = useHistory();

  const handleClear = (e) => {
    e.preventDefault();
    onChange({ target: { value: '' } });
    history.push('/');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && value.trim()) {
      history.push('/search');
    }
  };

  return (
    <div className={`search-bar ${className}`}>
      <div className="search-input-wrapper">
        <FontAwesomeIcon icon={faSearch} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onKeyPress={handleKeyPress}
        />
        {value && (
          <button
            type="button"
            className="search-clear"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;

