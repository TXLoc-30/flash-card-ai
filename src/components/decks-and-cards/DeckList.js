/**
 * Generates and displays a list of SelectableDecks.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SelectableDeck from './SelectableDeck';

const DeckList = ({
  decks,
  selectedDecks,
  setSelectedDecks,
  setDeckToEdit,
  searchQuery = '',
}) => {
  const [deckList, setDeckList] = useState([]);
  const [totalCards, setTotalCards] = useState(0);

  const filteredDecks = useMemo(() => {
    if (!decks || !searchQuery.trim()) return decks || [];
    const query = searchQuery.toLowerCase().trim();
    return decks.filter(deck => 
      deck.title?.toLowerCase().includes(query) ||
      deck.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }, [decks, searchQuery]);

  const toggleDeck = useCallback((deckId) => {
    setSelectedDecks(decks => {
      if (decks.includes(deckId)) {
        return decks.filter(ele => ele !== deckId)
      } else {
        return [...decks, deckId];
      }
    });
  }, [setSelectedDecks]);

  useEffect(() => {
    setDeckList(filteredDecks.map(deck => {
      return (
        <SelectableDeck 
          key={deck.id}
          title={deck.title}
          toggleDeck={toggleDeck}
          id={deck.id}
          isPrivate={deck.private}
          selectedDecks={selectedDecks}
          length={deck.numCards}
          setSelectedDecks={setSelectedDecks}
          setDeckToEdit={() => {
            setDeckToEdit({ 
              id: deck.id, 
              title: deck.title, 
              private: deck.private, 
              tags: deck.tags || [],
              purpose: deck.purpose,
              languagePair: deck.languagePair,
              translationDescription: deck.translationDescription,
              academicDescription: deck.academicDescription,
            });
          }}
        />
      );}
    ));
  }, [filteredDecks, selectedDecks, toggleDeck, setSelectedDecks, setDeckToEdit]);

  useEffect(() => {
    if (!filteredDecks) return;
    let _totalCards = filteredDecks.reduce((total, cur) => {
      return total + cur.numCards;
    }, 0)
    setTotalCards(_totalCards);
  }, [filteredDecks])

  return (
    <div className="deck-list">
      <p>You have <b>{deckList.length}</b> {deckList.length === 1 ? "deck" : "decks"} and <b>{totalCards}</b> {totalCards === 1 ? "card" : "cards"}:</p>
      {searchQuery && filteredDecks.length === 0 && (
        <p className="no-results">Không tìm thấy bộ thẻ nào phù hợp với từ khóa "{searchQuery}"</p>
      )}
      <ul>
        {deckList.length > 0 ? 
          deckList
        :
          !searchQuery && <p>You have no decks. Create one to start!</p>
        }
      </ul>
    </div>
  );
}

export default DeckList;