/**
 * Displays a deck card with action buttons (Start, Shuffle, Match Game)
 */

import React from 'react';
import { useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faRandom, faPuzzlePiece } from '@fortawesome/free-solid-svg-icons';
import StarRating from './StarRating';
import useDeckRating from '../../hooks/useDeckRating';

const DeckCard = ({ 
  deck, 
  onStart, 
  onShuffle, 
  onMatchGame,
  isPublic = false 
}) => {
  const history = useHistory();
  const { averageRating, totalRatings, userRating, refreshRating } = useDeckRating(deck.id);

  const handleStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onStart) {
      onStart(deck.id);
    } else {
      history.push(`/app/d/${deck.id}`);
    }
  };

  const handleShuffle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onShuffle) {
      onShuffle(deck.id);
    } else {
      alert("Vui lòng đăng nhập để sử dụng tính năng này.");
    }
  };

  const handleMatchGame = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onMatchGame) {
      onMatchGame(deck.id);
    } else {
      alert("Vui lòng đăng nhập để sử dụng tính năng này.");
    }
  };

  return (
    <div className="deck-card-new">
      <div className="deck-card-header">
        <h3 className="deck-card-title">{deck.title}</h3>
        {deck.private && !isPublic && (
          <span className="private-badge">Riêng tư</span>
        )}
        {isPublic && (
          <span className="public-badge">Công khai</span>
        )}
      </div>
      <div className="deck-card-info">
        <p className="deck-card-count">
          {deck.numCards || 0} {deck.numCards === 1 ? 'thẻ' : 'thẻ'}
        </p>
        <p className="deck-card-creator">
          Tạo bởi: {deck.creatorName || 'Người dùng'}
        </p>
        <div className="deck-card-rating">
          <StarRating 
            deckId={deck.id}
            averageRating={averageRating}
            totalRatings={totalRatings}
            userRating={userRating}
            onRatingChange={refreshRating}
          />
        </div>
      </div>
      <div className="deck-card-actions">
        <button
          className="btn btn-card-action btn-start"
          onClick={handleStart}
          title="Bắt đầu xem thẻ"
        >
          <FontAwesomeIcon icon={faPlay} />
          <span>Start</span>
        </button>
        <button
          className="btn btn-card-action btn-shuffle"
          onClick={handleShuffle}
          title="Xem thẻ đã xáo trộn"
        >
          <FontAwesomeIcon icon={faRandom} />
          <span>Shuffle</span>
        </button>
        <button
          className="btn btn-card-action btn-match"
          onClick={handleMatchGame}
          title="Chơi game ghép thẻ"
        >
          <FontAwesomeIcon icon={faPuzzlePiece} />
          <span>Match</span>
        </button>
      </div>
    </div>
  );
};

export default DeckCard;

