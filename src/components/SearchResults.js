/**
 * Displays search results page for decks
 */

import React, { useContext, useMemo } from 'react';
import { firebaseAuth } from '../provider/AuthProvider';
import useOnDecksSnapshot from '../hooks/useOnDecksSnapshot';
import DeckCard from './decks-and-cards/DeckCard';

const SearchResults = ({ 
  searchQuery = '', 
  publicDecks = [],
  onDeckStart,
  onDeckShuffle,
  onDeckMatchGame
}) => {
  const { user } = useContext(firebaseAuth);
  const { decks } = useOnDecksSnapshot(user);

  // Combine all search results into one list
  const allResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    const results = [];

    // Add user decks
    if (decks && decks.length > 0) {
      const userDecks = decks.filter(deck => 
        deck.title?.toLowerCase().includes(query) ||
        deck.tags?.some(tag => tag.toLowerCase().includes(query))
      );
      results.push(...userDecks.map(deck => ({ ...deck, isPublic: false })));
    }

    // Add public decks (exclude user's own decks to avoid duplicates)
    if (publicDecks && publicDecks.length > 0) {
      const userDeckIds = decks?.map(d => d.id) || [];
      const publicDecksFiltered = publicDecks.filter(deck => 
        !userDeckIds.includes(deck.id) && (
          deck.title?.toLowerCase().includes(query) ||
          deck.tags?.some(tag => tag.toLowerCase().includes(query))
        )
      );
      results.push(...publicDecksFiltered.map(deck => ({ ...deck, isPublic: true })));
    }

    return results;
  }, [decks, publicDecks, searchQuery]);

  const hasResults = allResults.length > 0;

  return (
    <div className="search-results-page">
      <div className="search-results-header">
        <h1>Kết quả tìm kiếm</h1>
        <p className="search-query">Từ khóa: <strong>"{searchQuery}"</strong></p>
      </div>

      {!hasResults && (
        <div className="no-results-section">
          <p className="no-results">Không tìm thấy bộ thẻ nào phù hợp với từ khóa "{searchQuery}"</p>
        </div>
      )}

      {hasResults && (
        <section className="search-results-section">
          <p className="results-count">Tìm thấy {allResults.length} {allResults.length === 1 ? 'bộ thẻ' : 'bộ thẻ'}</p>
          <div className="deck-grid">
            {allResults.map((deck) => (
              <DeckCard
                key={deck.id}
                deck={deck}
                onStart={onDeckStart}
                onShuffle={onDeckShuffle}
                onMatchGame={onDeckMatchGame}
                isPublic={deck.isPublic}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default SearchResults;

