/**
 * Methods for accessing the firestore database:
 * 
 * createDeck
 * deleteDeck
 * updateDeck
 * createCard
 * updateCard
 * deleteCard
 */

import { db, FieldValue } from './firebaseIndex';

export const dbMethods = {

  createDeck: (user, title, isPublic, tags = [], deckConfig = {}) => {
    if (!user) {
      console.log("No user selected.");
      return Promise.reject("No user selected.");
    }

    const document = db.collection('decks').doc();

    // Get user's displayName from Firestore
    return db.collection('users').doc(user.uid).get()
      .then((userDoc) => {
        const userData = userDoc.data();
        const creatorName = userData?.displayName || user.email || "Người dùng";

        const newDeck = {
          id: document.id,
          numCards: 0,
          title,
          owner: user.uid,
          creatorName: creatorName,
          private: !isPublic,
          tags: tags || [],
          purpose: deckConfig.purpose || null, // 'translation' or 'academic'
          // Translation-specific fields
          languagePair: deckConfig.languagePair || null, // e.g., 'en-vi', 'vi-zh'
          translationDescription: deckConfig.translationDescription || null,
          // Academic-specific fields
          academicDescription: deckConfig.academicDescription || null,
        }

        return document.set(newDeck)
          .then(() => {
            console.log("Created new deck.");
            return newDeck;
          })
          .catch(err => {
            console.error("Error creating deck: ", err.message);
            throw err;
          });
      })
      .catch(err => {
        console.error("Error fetching user data: ", err.message);
        // Fallback: create deck without creatorName
        const newDeck = {
          id: document.id,
          numCards: 0,
          title,
          owner: user.uid,
          creatorName: user.email || "Người dùng",
          private: !isPublic,
          tags: tags || [],
          purpose: deckConfig.purpose || null,
          languagePair: deckConfig.languagePair || null,
          translationDescription: deckConfig.translationDescription || null,
          academicDescription: deckConfig.academicDescription || null,
        }

        return document.set(newDeck)
          .then(() => {
            console.log("Created new deck.");
            return newDeck;
          })
          .catch(err => {
            console.error("Error creating deck: ", err.message);
            throw err;
          });
      });
  },

  deleteDeck: (user, deckId) => {
    if (!user) {
      console.log("No user selected.");
      return;
    }

    db.collection('decks').doc(deckId).delete()
    .then(console.log("Deck successfully deleted."))
    .catch(err => {
      console.error("Error deleting deck: ", err.message);
    });
  },

  updateDeck: (user, deckId, title, isPrivate, tags = [], deckConfig = {}) => {
    if (!user) {
      console.log("No user selected.");
      return;
    }

    const updatedDeck = {
      title,
      private: isPrivate,
      tags: tags || [],
      purpose: deckConfig.purpose || null,
      languagePair: deckConfig.languagePair || null,
      translationDescription: deckConfig.translationDescription || null,
      academicDescription: deckConfig.academicDescription || null,
    }

    return db.collection('decks').doc(deckId).update(updatedDeck)
    .then(() => {
      console.log("Updated deck with id: ", deckId);
      
    })
    .catch(err => {
      console.error("Error updating document: ", err.message);
      
    });
  },

  createCard: (user, deckId, front, back) => {
    if (!user) {
      console.log("No user selected.");
      return;
    }

    const document = db.collection('cards').doc();

    const newCard = {
      id: document.id,
      deckId,
      owner: user.uid,
      front,
      back,
    }

    document.set(newCard)
    .then(res => {
      console.log("New card created.")
      db.collection('decks').doc(deckId).update({
        numCards: FieldValue.increment(1)
      })
      .catch(err => {
        console.error("Error increasing card count.");
      })
    })
    .catch(err => {
      console.error("Error creating card: ", err.message);
    });
  },

  updateCard: (user, cardId, front, back) => {
    if (!user) {
      console.log("No user selected.");
      return;
    }

    const updatedCard = {
      front,
      back
    }
    console.log("CardId: ", cardId);

    db.collection('cards').doc(cardId).update(updatedCard)
    .then(res => {
      console.log("Updated card with id: ", cardId);
    })
    .catch(err => {
      console.error("Error updating card: ", err.message);
    })
  },

  deleteCard: (user, deckId, cardId) => {
    if (!user) {
      console.log("No user selected.");
      return;
    }

    db.collection('cards').doc(cardId).delete()
    .then(res => {
      console.log("Card successfully deleted.")
      db.collection('decks').doc(deckId).update({
        numCards: FieldValue.increment(-1)
      })
      .catch(err => {
        console.error("Error decreasing card count.");
      })
    })
    
    .catch(err => {
      console.error("Error deleting card: ", err.message);
    });
  },

  // Rating methods
  submitRating: (user, deckId, rating) => {
    if (!user) {
      return Promise.reject("User not authenticated");
    }

    if (rating < 1 || rating > 5) {
      return Promise.reject("Rating must be between 1 and 5");
    }

    const ratingRef = db.collection('ratings').doc(`${deckId}_${user.uid}`);
    
    return ratingRef.get()
      .then((doc) => {
        const isNewRating = !doc.exists;
        const oldRating = doc.exists ? doc.data().rating : null;

        // Save or update rating
        return ratingRef.set({
          deckId,
          userId: user.uid,
          rating,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        })
        .then(() => {
          // Update deck's average rating and total ratings
          return db.collection('decks').doc(deckId).get()
            .then((deckDoc) => {
              if (!deckDoc.exists) {
                throw new Error("Deck not found");
              }

              const deckData = deckDoc.data();
              const currentTotalRatings = deckData.totalRatings || 0;
              const currentAverageRating = deckData.averageRating || 0;
              const currentSum = currentAverageRating * currentTotalRatings;

              let newTotalRatings, newAverageRating;

              if (isNewRating) {
                // New rating
                newTotalRatings = currentTotalRatings + 1;
                newAverageRating = (currentSum + rating) / newTotalRatings;
              } else {
                // Update existing rating
                newTotalRatings = currentTotalRatings;
                newAverageRating = (currentSum - oldRating + rating) / newTotalRatings;
              }

              return db.collection('decks').doc(deckId).update({
                averageRating: newAverageRating,
                totalRatings: newTotalRatings
              });
            });
        });
      })
      .catch(err => {
        console.error("Error submitting rating: ", err.message);
        throw err;
      });
  },

  getUserRating: (user, deckId) => {
    if (!user) {
      return Promise.resolve(null);
    }

    return db.collection('ratings').doc(`${deckId}_${user.uid}`).get()
      .then((doc) => {
        if (doc.exists) {
          return doc.data().rating;
        }
        return null;
      })
      .catch(err => {
        console.error("Error getting user rating: ", err.message);
        return null;
      });
  },
}