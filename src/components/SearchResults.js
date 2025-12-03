/**
 * Displays search results page for decks
 */

import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { firebaseAuth } from '../provider/AuthProvider';
import useOnDecksSnapshot from '../hooks/useOnDecksSnapshot';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';

const SearchResults = ({ searchQuery = '', publicDecks = [] }) => {
  const { user } = useContext(firebaseAuth);
  const { decks } = useOnDecksSnapshot(user);

  const filteredDecks = useMemo(() => {
    if (!decks || !searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return decks.filter(deck => 
      deck.title?.toLowerCase().includes(query) ||
      deck.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }, [decks, searchQuery]);

  const filteredPublicDecks = useMemo(() => {
    if (!publicDecks || !searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    // Exclude user's own decks from public search results
    const userDeckIds = decks?.map(d => d.id) || [];
    return publicDecks.filter(deck => 
      !userDeckIds.includes(deck.id) && (
        deck.title?.toLowerCase().includes(query) ||
        deck.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    );
  }, [publicDecks, searchQuery, decks]);

  const hasResults = filteredDecks.length > 0 || filteredPublicDecks.length > 0;

  return (
    <div className="search-results-page">
      <div className="search-results-header">
        <h1>Kết quả tìm kiếm</h1>
        <p className="search-query">Từ khóa: <strong>"{searchQuery}"</strong></p>
      </div>

      {!hasResults && (
        <div className="no-results-section">
          <p className="no-results">Không tìm thấy bộ thẻ nào phù hợp với từ khóa "{searchQuery}"</p>
          <Link to="/" className="btn btn-secondary">
            Quay lại trang chủ
          </Link>
        </div>
      )}

      {hasResults && (
        <>
          {user && filteredDecks.length > 0 && (
            <section className="search-results-section user-decks-results">
              <h2>Các bộ thẻ của bạn</h2>
              <p className="results-count">Tìm thấy {filteredDecks.length} {filteredDecks.length === 1 ? 'bộ thẻ' : 'bộ thẻ'}</p>
              <div className="deck-grid">
                {filteredDecks.map((deck) => (
                  <Link 
                    key={deck.id} 
                    to={`/app/d/${deck.id}`} 
                    className="btn btn-tertiary deck-card"
                  >
                    <span>{deck.title}</span>
                    <span className="deck-meta">
                      {deck.numCards || 0} {deck.numCards === 1 ? 'thẻ' : 'thẻ'}
                      {deck.private && <span className="private-badge">Riêng tư</span>}
                    </span>
                    <FontAwesomeIcon icon={faAngleRight} className="icon"/>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {filteredPublicDecks.length > 0 && (
            <section className="search-results-section public-decks-results">
              <h2>Bộ thẻ công khai</h2>
              <p className="results-count">Tìm thấy {filteredPublicDecks.length} {filteredPublicDecks.length === 1 ? 'bộ thẻ công khai' : 'bộ thẻ công khai'}</p>
              <div className="deck-grid">
                {filteredPublicDecks.map((deck) => (
                  <Link 
                    key={deck.id} 
                    to={`/app/d/${deck.id}`} 
                    className="btn btn-tertiary deck-card"
                  >
                    <span>{deck.title}</span>
                    <span className="deck-meta">
                      {deck.numCards || 0} {deck.numCards === 1 ? 'thẻ' : 'thẻ'}
                      <span className="public-badge">Công khai</span>
                    </span>
                    <FontAwesomeIcon icon={faAngleRight} className="icon"/>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default SearchResults;

