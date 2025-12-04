/**
 * Component for displaying top rated public decks (4 per row with See more link)
 */

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import DeckCard from './decks-and-cards/DeckCard';

const TopRatedDecks = ({ 
  publicDecks = [], 
  onDeckStart, 
  onDeckShuffle, 
  onDeckMatchGame,
  seeMoreLink = "/all-decks?type=public",
  limit = 4
}) => {
  // Sắp xếp decks theo totalRatings (số lượt đánh giá) giảm dần
  const topRatedDecks = useMemo(() => {
    if (!publicDecks || publicDecks.length === 0) return [];
    
    return [...publicDecks]
      .filter(deck => deck.totalRatings && deck.totalRatings > 0)
      .sort((a, b) => {
        // Sắp xếp theo totalRatings giảm dần
        const aRatings = a.totalRatings || 0;
        const bRatings = b.totalRatings || 0;
        if (bRatings !== aRatings) {
          return bRatings - aRatings;
        }
        // Nếu bằng nhau, sắp xếp theo averageRating
        const aAvg = a.averageRating || 0;
        const bAvg = b.averageRating || 0;
        return bAvg - aAvg;
      })
      .slice(0, limit);
  }, [publicDecks, limit]);

  if (topRatedDecks.length === 0) {
    return null;
  }

  return (
    <div className="top-rated-decks-container">
      <div className="top-rated-decks-header">
        <h2>Bộ thẻ được đánh giá cao</h2>
        {publicDecks.length > limit && (
          <Link to={seeMoreLink} className="see-more-link">
            Xem thêm
          </Link>
        )}
      </div>
      <div className="deck-grid deck-grid-4">
        {topRatedDecks.map((deck) => (
          <DeckCard
            key={deck.id}
            deck={deck}
            onStart={onDeckStart}
            onShuffle={onDeckShuffle}
            onMatchGame={onDeckMatchGame}
            isPublic={true}
          />
        ))}
      </div>
    </div>
  );
};

export default TopRatedDecks;

