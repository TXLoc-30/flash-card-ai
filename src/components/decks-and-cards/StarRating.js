/**
 * Component for displaying and submitting star ratings
 */

import React, { useState, useContext, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { firebaseAuth } from '../../provider/AuthProvider';
import { dbMethods } from '../../firebase/dbMethods';

const StarRating = ({ deckId, averageRating = 0, totalRatings = 0, userRating = null, onRatingChange }) => {
  const { user } = useContext(firebaseAuth);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [currentUserRating, setCurrentUserRating] = useState(userRating);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setCurrentUserRating(userRating);
  }, [userRating]);

  const handleStarClick = async (rating) => {
    if (!user) {
      alert("Vui lòng đăng nhập để đánh giá bộ thẻ.");
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await dbMethods.submitRating(user, deckId, rating);
      setCurrentUserRating(rating);
      if (onRatingChange) {
        onRatingChange();
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Có lỗi xảy ra khi đánh giá. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarHover = (star) => {
    if (user && !isSubmitting) {
      setHoveredStar(star);
    }
  };

  const handleMouseLeave = () => {
    setHoveredStar(0);
  };

  const displayRating = hoveredStar || currentUserRating || averageRating;

  return (
    <div className="star-rating">
      <div 
        className="star-rating-stars"
        onMouseLeave={handleMouseLeave}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayRating;
          const isInteractive = user && !isSubmitting;
          
          return (
            <span
              key={star}
              className={`star ${isInteractive ? 'star-interactive' : ''}`}
              onClick={() => isInteractive && handleStarClick(star)}
              onMouseEnter={() => handleStarHover(star)}
              style={{ cursor: isInteractive ? 'pointer' : 'default' }}
            >
              <FontAwesomeIcon 
                icon={faStar} 
                style={{ 
                  color: isFilled ? '#ffc107' : '#ddd',
                  fontSize: '1rem'
                }} 
              />
            </span>
          );
        })}
      </div>
      <div className="star-rating-info">
        {averageRating > 0 ? (
          <>
            <span className="star-rating-average">{averageRating.toFixed(1)}</span>
            {totalRatings > 0 && (
              <span className="star-rating-count">
                ({totalRatings} {totalRatings === 1 ? 'đánh giá' : 'đánh giá'})
              </span>
            )}
          </>
        ) : (
          <span className="star-rating-no-rating">Chưa có đánh giá</span>
        )}
      </div>
    </div>
  );
};

export default StarRating;

