/**
 * Component for displaying user decks (4 per row with See more link)
 */

import React from 'react';
import { Link } from 'react-router-dom';
import DeckCard from './decks-and-cards/DeckCard';

const DeckSlider = ({ 
  decks = [], 
  onDeckStart, 
  onDeckShuffle, 
  onDeckMatchGame,
  seeMoreLink = "/all-decks?type=user"
}) => {
  const displayLimit = 4; // Hiển thị 4 bộ thẻ

  if (!decks || decks.length === 0) {
    return null;
  }

  const displayedDecks = decks.slice(0, displayLimit);

  return (
    <div className="user-decks-container">
      <div className="user-decks-header">
        <h2>Các bộ thẻ của bạn</h2>
        {decks.length > displayLimit && (
          <Link to={seeMoreLink} className="see-more-link">
            Xem thêm
          </Link>
        )}
      </div>
      <div className="deck-grid deck-grid-4">
        {displayedDecks.map((deck) => (
          <DeckCard
            key={deck.id}
            deck={deck}
            onStart={onDeckStart}
            onShuffle={onDeckShuffle}
            onMatchGame={onDeckMatchGame}
            isPublic={false}
          />
        ))}
      </div>
    </div>
  );
};

export default DeckSlider;

