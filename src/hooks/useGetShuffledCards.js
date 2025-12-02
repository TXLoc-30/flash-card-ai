/**
 * Hook which subscribes to the collection of cards in the 
 * firestore database.
 */

import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase/firebaseIndex';

const useGetShuffledCards = (user, deckIds) => {
  const [cards, setCards] = useState([]);
  const cardsByBatchRef = useRef(new Map());

  useEffect(() => {
    if (!user) {
      setCards([]);
      cardsByBatchRef.current.clear();
      return;
    }

    if (deckIds.length === 0) {
      setCards([]);
      cardsByBatchRef.current.clear();
      return;
    }

    // Firebase Firestore has a limit of 10 items in "in" queries
    // Split into batches if needed
    const batchSize = 10;
    const batches = [];
    for (let i = 0; i < deckIds.length; i += batchSize) {
      batches.push(deckIds.slice(i, i + batchSize));
    }

    // Clear previous batch data
    cardsByBatchRef.current.clear();

    let ref = db.collection('cards');
    const unsubscribes = [];

    batches.forEach((batch, batchIndex) => {
      const unsubscribe = ref.where("deckId", "in", batch).onSnapshot((snapshot) => {
        let arr = [];
        snapshot.forEach(card => arr.push(card.data()));
        
        // Store cards from this batch
        cardsByBatchRef.current.set(batchIndex, arr);
        
        // Merge all batches into a single array
        const mergedCards = [];
        cardsByBatchRef.current.forEach((batchCards) => {
          mergedCards.push(...batchCards);
        });
        
        setCards(mergedCards);
      }, (error) => {
        console.log("Error fetching cards: ", error.message);
      });
      unsubscribes.push(unsubscribe);
    });

    const cardsByBatchRefValue = cardsByBatchRef.current;
    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
      cardsByBatchRefValue.clear();
    };
  }, [user, deckIds])

  return { cards };
}

export default useGetShuffledCards;