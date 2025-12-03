/**
 * Hook grabbing all public decks from firestore.
 */

import { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseIndex';

const usePublicDecksSnapshot = () => {
  const [publicDecks, setPublicDecks] = useState([]);

  // Get all public decks from collection where private is false.
  useEffect(() => {
    let ref = db.collection('decks');
    let unsubscribe = ref.where("private", "==", false).onSnapshot((snapshot) => {
      let arr = [];
      snapshot.forEach(deck => {
        const deckData = deck.data();
        arr.push({ ...deckData, id: deck.id });
      });
      setPublicDecks(arr);
    }, error => console.log("Error fetching public decks: ", error.message))

    return () => unsubscribe();
  }, []);

  return { publicDecks };
}

export default usePublicDecksSnapshot;

