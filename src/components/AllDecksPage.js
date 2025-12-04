/**
 * Page displaying all decks with pagination (25 decks per page, 5x5 grid)
 */

import React, { useState, useContext, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { firebaseAuth } from '../provider/AuthProvider';
import useOnDecksSnapshot from '../hooks/useOnDecksSnapshot';
import DeckCard from './decks-and-cards/DeckCard';

const AllDecksPage = ({
  publicDecks = [],
  onDeckStart,
  onDeckShuffle,
  onDeckMatchGame
}) => {
  const location = useLocation();
  const { user } = useContext(firebaseAuth);
  const { decks } = useOnDecksSnapshot(user);
  const [currentPage, setCurrentPage] = useState(1);
  const decksPerPage = 25; // 5x5 grid

  // Xác định loại decks cần hiển thị từ query params
  const deckType = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('type') || 'user'; // 'user' hoặc 'public'
  }, [location.search]);

  // Reset page khi deckType thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [deckType]);

  // Lấy danh sách decks tương ứng
  const allDecks = useMemo(() => {
    if (deckType === 'public') {
      // Sắp xếp public decks theo totalRatings
      return [...publicDecks]
        .sort((a, b) => {
          const aRatings = a.totalRatings || 0;
          const bRatings = b.totalRatings || 0;
          if (bRatings !== aRatings) {
            return bRatings - aRatings;
          }
          const aAvg = a.averageRating || 0;
          const bAvg = b.averageRating || 0;
          return bAvg - aAvg;
        });
    } else {
      return decks || [];
    }
  }, [deckType, decks, publicDecks]);

  // Tính toán phân trang
  const totalPages = Math.ceil(allDecks.length / decksPerPage);
  const startIndex = (currentPage - 1) * decksPerPage;
  const endIndex = startIndex + decksPerPage;
  const currentDecks = allDecks.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageTitle = deckType === 'public' 
    ? 'Tất cả bộ thẻ công khai' 
    : 'Tất cả bộ thẻ của bạn';

  return (
    <div className="all-decks-page">
      <div className="all-decks-header">
        <h1>{pageTitle}</h1>
        <p>Tổng cộng: {allDecks.length} {allDecks.length === 1 ? 'bộ thẻ' : 'bộ thẻ'}</p>
      </div>

      {allDecks.length === 0 ? (
        <div className="no-decks-message">
          <p>Không có bộ thẻ nào để hiển thị.</p>
        </div>
      ) : (
        <>
          <div className="deck-grid deck-grid-5x5">
            {currentDecks.map((deck) => (
              <DeckCard
                key={deck.id}
                deck={deck}
                onStart={onDeckStart}
                onShuffle={onDeckShuffle}
                onMatchGame={onDeckMatchGame}
                isPublic={deckType === 'public'}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Trước
              </button>
              <div className="pagination-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Hiển thị tối đa 5 số trang
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return <span key={page} className="pagination-ellipsis">...</span>;
                  }
                  return null;
                })}
              </div>
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AllDecksPage;

