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

    const newDeck = {
      id: document.id,
      numCards: 0,
      title,
      owner: user.uid,
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
}