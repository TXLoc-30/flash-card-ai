/**
 * Hook to get deck rating and user's rating for a deck
 */

import { useState, useEffect, useContext } from 'react';
import { db } from '../firebase/firebaseIndex';
import { firebaseAuth } from '../provider/AuthProvider';
import { dbMethods } from '../firebase/dbMethods';

const useDeckRating = (deckId) => {
  const { user } = useContext(firebaseAuth);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [userRating, setUserRating] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deckId) {
      setLoading(false);
      return;
    }

    // Get deck rating info with onSnapshot for real-time updates
    let unsubscribeDeck = null;
    
    try {
      unsubscribeDeck = db.collection('decks').doc(deckId).onSnapshot(
        (doc) => {
          if (doc.exists) {
            const data = doc.data();
            setAverageRating(data.averageRating || 0);
            setTotalRatings(data.totalRatings || 0);
          } else {
            // Deck doesn't exist or can't be read
            setAverageRating(0);
            setTotalRatings(0);
          }
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching deck rating: ", error);
          // Set defaults on error
          setAverageRating(0);
          setTotalRatings(0);
          setLoading(false);
        }
      );
    } catch (error) {
      console.error("Error setting up deck rating listener: ", error);
      setLoading(false);
    }

    // Get user's rating
    if (user) {
      dbMethods.getUserRating(user, deckId)
        .then((rating) => {
          setUserRating(rating);
        })
        .catch((error) => {
          console.error("Error fetching user rating: ", error);
        });
    } else {
      setUserRating(null);
    }

    return () => {
      if (unsubscribeDeck) {
        unsubscribeDeck();
      }
    };
  }, [deckId, user]);

  const refreshRating = () => {
    if (user) {
      dbMethods.getUserRating(user, deckId)
        .then((rating) => {
          setUserRating(rating);
        });
    }
  };

  return {
    averageRating,
    totalRatings,
    userRating,
    loading,
    refreshRating
  };
};

export default useDeckRating;

