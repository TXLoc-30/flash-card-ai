/**
 * Trò chơi ghép thẻ - Ghép mặt trước với mặt sau tương ứng
 */

import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck, faRedo, faClock, faTrophy, faStar } from '@fortawesome/free-solid-svg-icons';

import Header from '../Header';
import Breadcrumb from '../Breadcrumb';
import './CardMatchingGame.css';


const CardMatchingGame = ({
  cards,
  onClick,
}) => {
  const [allCards, setAllCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState(new Set());
  const [gameComplete, setGameComplete] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [correctMatches, setCorrectMatches] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [wrongMatch, setWrongMatch] = useState(false);
  const timerIntervalRef = useRef(null);
  const elapsedTimeRef = useRef(0);

  // Format thời gian thành MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Tính điểm
  const calculateScore = (time, attempts, totalPairs) => {
    const baseScore = 1000 * totalPairs;
    const timePenalty = time * 10; // Trừ 10 điểm mỗi giây
    const wrongAttempts = attempts - totalPairs; // Số lần thử sai
    const attemptPenalty = wrongAttempts * 50; // Trừ 50 điểm mỗi lần thử sai
    const score = Math.max(0, baseScore - timePenalty - attemptPenalty);
    return Math.round(score);
  };

  // Bắt đầu đếm thời gian
  const startTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setElapsedTime(0);
    elapsedTimeRef.current = 0;
    timerIntervalRef.current = setInterval(() => {
      elapsedTimeRef.current += 1;
      setElapsedTime(elapsedTimeRef.current);
    }, 1000);
  };

  // Dừng đếm thời gian
  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  // Cleanup timer khi component unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Khởi tạo trò chơi khi cards thay đổi
  useEffect(() => {
    if (!cards || cards.length === 0) return;

    // Tạo mảng tất cả các thẻ (mặt trước và mặt sau)
    const allCardsArray = [];
    
    cards.forEach((card) => {
      // Thêm thẻ mặt trước
      allCardsArray.push({
        id: `front-${card.id}`,
        cardId: card.id,
        text: card.front,
        type: 'front',
        pairId: card.id,
      });
      // Thêm thẻ mặt sau
      allCardsArray.push({
        id: `back-${card.id}`,
        cardId: card.id,
        text: card.back,
        type: 'back',
        pairId: card.id,
      });
    });

    // Xáo trộn các thẻ
    const shuffleArray = (array) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    setAllCards(shuffleArray(allCardsArray));
    setMatchedPairs(new Set());
    setSelectedCards([]);
    setGameComplete(false);
    setAttempts(0);
    setCorrectMatches(0);
    setElapsedTime(0);
    setFinalScore(0);
    setWrongMatch(false);
    elapsedTimeRef.current = 0;
    stopTimer();
    // Bắt đầu đếm thời gian sau khi khởi tạo
    setTimeout(() => {
      startTimer();
    }, 500);
  }, [cards]);

  // Xử lý khi click vào thẻ
  const handleCardClick = (card) => {
    // Không cho click vào thẻ đã được ghép
    if (matchedPairs.has(card.pairId)) {
      return;
    }

    // Không cho click vào thẻ đã được chọn
    if (selectedCards.some(c => c.id === card.id)) {
      return;
    }

    // Nếu đã chọn 2 thẻ, không cho chọn thêm
    if (selectedCards.length >= 2) {
      return;
    }

    // Nếu đang hiển thị thông báo sai, không cho chọn
    if (wrongMatch) {
      return;
    }

    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);

    // Nếu đã chọn 2 thẻ, kiểm tra ghép
    if (newSelected.length === 2) {
      checkMatch(newSelected[0], newSelected[1]);
    }
  };

  // Kiểm tra xem hai thẻ có khớp không
  const checkMatch = (card1, card2) => {
    const currentAttempts = attempts + 1;
    setAttempts(currentAttempts);

    // Kiểm tra xem 2 thẻ có cùng pairId không (ghép đúng)
    // Và phải là một thẻ mặt trước và một thẻ mặt sau
    const isMatch = card1.pairId === card2.pairId && 
                    card1.type !== card2.type;

    if (isMatch) {
      // Ghép đúng
      const newMatchedPairs = new Set([...matchedPairs, card1.pairId]);
      setMatchedPairs(newMatchedPairs);
      setCorrectMatches(prev => prev + 1);
      
      // Xóa thẻ khỏi danh sách sau khi ghép đúng (hiệu ứng biến mất)
      setTimeout(() => {
        setAllCards(prev => prev.filter(c => 
          c.pairId !== card1.pairId
        ));
        setSelectedCards([]);
      }, 500);

      // Kiểm tra xem đã hoàn thành chưa
      if (newMatchedPairs.size === cards.length) {
        stopTimer();
        // Tính điểm với giá trị hiện tại từ ref
        const finalTime = elapsedTimeRef.current;
        const score = calculateScore(finalTime, currentAttempts, cards.length);
        setFinalScore(score);
        setTimeout(() => {
          setGameComplete(true);
        }, 800);
      }
    } else {
      // Ghép sai - hiển thị thông báo và reset sau 1 giây
      setWrongMatch(true);
      setTimeout(() => {
        setSelectedCards([]);
        setWrongMatch(false);
      }, 1000);
    }
  };

  // Reset trò chơi
  const resetGame = () => {
    if (!cards || cards.length === 0) return;

    const shuffleArray = (array) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    // Tạo lại mảng tất cả các thẻ
    const allCardsArray = [];
    cards.forEach((card) => {
      allCardsArray.push({
        id: `front-${card.id}`,
        cardId: card.id,
        text: card.front,
        type: 'front',
        pairId: card.id,
      });
      allCardsArray.push({
        id: `back-${card.id}`,
        cardId: card.id,
        text: card.back,
        type: 'back',
        pairId: card.id,
      });
    });

    stopTimer();
    elapsedTimeRef.current = 0;
    setAllCards(shuffleArray(allCardsArray));
    setMatchedPairs(new Set());
    setSelectedCards([]);
    setGameComplete(false);
    setAttempts(0);
    setCorrectMatches(0);
    setElapsedTime(0);
    setFinalScore(0);
    setWrongMatch(false);
    // Bắt đầu lại đếm thời gian
    setTimeout(() => {
      startTimer();
    }, 300);
  };

  if (!cards || cards.length === 0) {
    return (
      <>
        <Breadcrumb to="/app" name="Dashboard" />
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Không có thẻ để chơi</h2>
          <p>Vui lòng chọn ít nhất một bộ thẻ có thẻ từ Dashboard.</p>
          <button 
            className="btn btn-primary" 
            name="exit"
            onClick={onClick}
          >
            Quay lại Dashboard
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="card-matching-game-wrapper">
      <Header title="Trò chơi ghép thẻ">
        <button 
          className="btn btn-icon-small"
          name="exit"
          onClick={onClick}
        >
          <FontAwesomeIcon icon={faTimes} />&nbsp;Đóng
        </button>
      </Header>

      <div className="card-matching-game">
        {/* Thông tin trò chơi */}
        <div className="game-info">
          <div className="info-item">
            <FontAwesomeIcon icon={faCheck} className="info-icon" />
            <div className="info-content">
              <span className="info-label">Cặp đã ghép</span>
              <span className="info-value">{correctMatches} / {cards.length}</span>
            </div>
          </div>
          <div className="info-item">
            <FontAwesomeIcon icon={faClock} className="info-icon" />
            <div className="info-content">
              <span className="info-label">Thời gian</span>
              <span className="info-value time-value">{formatTime(elapsedTime)}</span>
            </div>
          </div>
          <div className="info-item">
            <FontAwesomeIcon icon={faRedo} className="info-icon" />
            <div className="info-content">
              <span className="info-label">Số lần thử</span>
              <span className="info-value">{attempts}</span>
            </div>
          </div>
          <button 
            className="btn btn-secondary reset-btn"
            onClick={resetGame}
          >
            <FontAwesomeIcon icon={faRedo} />&nbsp;Chơi lại
          </button>
        </div>

        {/* Thông báo hoàn thành */}
        {gameComplete && (
          <div className="game-complete">
            <div className="complete-message">
              <div className="complete-icon">
                <FontAwesomeIcon icon={faTrophy} />
              </div>
              <h2>Chúc mừng! Bạn đã hoàn thành!</h2>
              
              <div className="score-section">
                <div className="score-display">
                  <FontAwesomeIcon icon={faStar} className="score-star" />
                  <span className="score-value">{finalScore.toLocaleString()}</span>
                  <span className="score-label">điểm</span>
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Thời gian</span>
                  <span className="stat-value">{formatTime(elapsedTime)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Số lần thử</span>
                  <span className="stat-value">{attempts}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Cặp thẻ</span>
                  <span className="stat-value">{cards.length}</span>
                </div>
              </div>

              <div className="complete-actions">
                <button className="btn btn-primary" onClick={resetGame}>
                  <FontAwesomeIcon icon={faRedo} />&nbsp;Chơi lại
                </button>
                <button 
                  className="btn btn-secondary" 
                  name="exit"
                  onClick={onClick}
                >
                  <FontAwesomeIcon icon={faTimes} />&nbsp;Quay lại
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Khu vực chơi */}
        <div className="game-area-quizlet">
          {allCards.length > 0 ? (
            <div className="cards-grid-quizlet">
              {allCards.map((card) => {
                const isMatched = matchedPairs.has(card.pairId);
                const isSelected = selectedCards.some(c => c.id === card.id);
                const isWrong = wrongMatch && isSelected;

                return (
                  <div
                    key={card.id}
                    className={`game-card-quizlet ${
                      isMatched ? 'matched' : ''
                    } ${isSelected ? 'selected' : ''} ${isWrong ? 'wrong' : ''} ${
                      card.type === 'front' ? 'card-front' : 'card-back'
                    }`}
                    onClick={() => handleCardClick(card)}
                  >
                    <div className="card-content-quizlet">
                      {card.text}
                    </div>
                    {isMatched && (
                      <div className="card-matched-overlay">
                        <FontAwesomeIcon icon={faCheck} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="all-cards-matched">
              <FontAwesomeIcon icon={faCheck} size="3x" />
              <p>Đang tính điểm...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardMatchingGame;

