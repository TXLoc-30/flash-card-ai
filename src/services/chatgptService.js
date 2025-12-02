/**
 * Service for interacting with ChatGPT API via proxy server
 * Handles card generation, translation, and academic content generation
 * Uses proxy server to avoid CORS issues
 */

const PROXY_API_URL = process.env.REACT_APP_PROXY_URL || 'http://localhost:3001/api';

/**
 * Generate multiple flash cards automatically using ChatGPT
 * @param {Object} params - Generation parameters
 * @param {string} params.description - Description of what cards to generate
 * @param {number} params.count - Number of cards to generate
 * @param {string} params.purpose - Purpose: 'translation' or 'academic'
 * @param {Object} params.deckConfig - Deck configuration (language pair, field, level, etc.)
 * @param {string[]} params.tags - Tags/categories
 * @returns {Promise<Array<{front: string, back: string}>>} - Array of card objects
 */
export const generateCards = async ({ description, count, purpose, deckConfig = {}, tags = [] }) => {
  try {
    const response = await fetch(`${PROXY_API_URL}/chatgpt/generate-cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description,
        count,
        purpose,
        deckConfig,
        tags
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Card generation failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // ChatGPT returns array of cards: [{front: "...", back: "..."}, ...]
    if (Array.isArray(data.cards)) {
      return data.cards;
    }
    
    throw new Error('Unexpected response format from ChatGPT API');
  } catch (error) {
    console.error('ChatGPT Card Generation Error:', error);
    throw error;
  }
};

/**
 * Generate the back side of a card based on the front side
 * @param {string} front - Front side content
 * @param {string} purpose - Purpose: 'translation' or 'academic'
 * @param {Object} deckConfig - Deck configuration
 * @param {string[]} tags - Tags/categories
 * @returns {Promise<string>} - Generated back side content
 */
export const generateCardBack = async (front, purpose, deckConfig = {}, tags = []) => {
  try {
    const response = await fetch(`${PROXY_API_URL}/chatgpt/generate-back`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        front,
        purpose,
        deckConfig,
        tags
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Back generation failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (data.back) {
      return data.back;
    }
    
    throw new Error('Unexpected response format from ChatGPT API');
  } catch (error) {
    console.error('ChatGPT Back Generation Error:', error);
    throw error;
  }
};

/**
 * Translate text using ChatGPT (for translation purpose decks)
 * @param {string} text - Text to translate
 * @param {Object} deckConfig - Deck configuration (languagePair, translationStyle, etc.)
 * @param {string[]} tags - Tags/categories
 * @returns {Promise<string>} - Translated text
 */
export const translateCard = async (text, deckConfig = {}, tags = []) => {
  try {
    const response = await fetch(`${PROXY_API_URL}/chatgpt/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        deckConfig,
        tags
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Translation failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (data.translatedText) {
      return data.translatedText;
    }
    
    throw new Error('Unexpected response format from ChatGPT API');
  } catch (error) {
    console.error('ChatGPT Translation Error:', error);
    throw error;
  }
};

