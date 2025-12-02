/**
 * Service for translation and definition requests
 * Translation: LibreTranslate API
 * Definition: Gemma model from Hugging Face
 * Uses proxy server to avoid CORS issues
 */

const PROXY_API_URL = process.env.REACT_APP_PROXY_URL || 'http://localhost:3001/api';

// Gemma models for text generation (definitions) - try in order
// Using Gemma models (Instruction Tuned) for better instruction following
const GEMMA_MODELS = [
  'google/gemma-2b', // Base Gemma 2B model
  'google/gemma-7b', // Base Gemma 7B model (if 2B not available)
  'google/flan-t5-large', // Fallback: T5 large model
  'google/flan-t5-base' // Final fallback: T5 base model
];

/**
 * Detect language of text (simple detection)
 * @param {string} text - Text to detect
 * @returns {string} - Language code ('en' or 'vi')
 */
const detectLanguage = (text) => {
  // Simple detection: check for Vietnamese characters
  const vietnameseChars = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
  return vietnameseChars.test(text) ? 'vi' : 'en';
};

/**
 * Call LibreTranslate API for translation via proxy
 * @param {string} text - Text to translate
 * @param {string} targetLanguage - Target language ('Vietnamese' or 'English')
 * @returns {Promise<string>} - Translated text
 */
const callTranslationAPI = async (text, targetLanguage = 'Vietnamese') => {
  const detectedLang = detectLanguage(text);
  const isTargetVietnamese = targetLanguage.toLowerCase().includes('vietnamese') || targetLanguage.toLowerCase() === 'vi';
  
  // Determine source and target language codes for LibreTranslate
  const sourceLang = detectedLang === 'vi' ? 'vi' : 'en';
  const targetLang = isTargetVietnamese ? 'vi' : 'en';
  
  // If already in target language, return as is
  if (sourceLang === targetLang) {
    return text;
  }

  // Use proxy server to avoid CORS issues
  const response = await fetch(`${PROXY_API_URL}/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: text,
      source: sourceLang,
      target: targetLang
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Translation failed with status ${response.status}`);
  }

  const data = await response.json();
  
  // LibreTranslate returns: { "translatedText": "..." }
  if (data.translatedText) {
    return data.translatedText;
  }

  // If no recognized format, return original text
  console.warn('Unexpected translation response format:', data);
  return text;
};

/**
 * Call Hugging Face Inference API for text generation using Gemma model (definition)
 * Tries multiple models in order until one works
 * @param {string} text - Text to define
 * @param {string[]} deckTags - Tags/categories of the deck
 * @param {string} language - Language for definition
 * @param {number} modelIndex - Index of model to try (for recursive fallback)
 * @returns {Promise<string>} - Definition/explanation
 */
const callTextGenerationAPI = async (text, deckTags = [], language = 'Vietnamese', modelIndex = 0) => {
  // If we've tried all models, return original text
  if (modelIndex >= GEMMA_MODELS.length) {
    throw new Error('Không thể tìm thấy model phù hợp. Vui lòng thử lại sau hoặc nhập định nghĩa thủ công.');
  }

  const model = GEMMA_MODELS[modelIndex];
  const context = deckTags.length > 0 ? ` (liên quan đến: ${deckTags.join(', ')})` : '';
  const isVietnamese = language.toLowerCase().includes('vietnamese') || language.toLowerCase() === 'vi';
  
  // Create prompt - use simpler format for T5 models, instruction format for Gemma
  const isGemmaModel = model.includes('gemma');
  let prompt;
  
  if (isGemmaModel) {
    // Gemma models work better with instruction-style prompts
    prompt = isVietnamese
      ? `<start_of_turn>user\nĐịnh nghĩa hoặc giải thích từ "${text}"${context}. Hãy đưa ra định nghĩa ngắn gọn và dễ hiểu.<end_of_turn>\n<start_of_turn>model\n`
      : `<start_of_turn>user\nDefine or explain "${text}"${context}. Provide a concise and clear definition.<end_of_turn>\n<start_of_turn>model\n`;
  } else {
    // T5 models use simpler prompts
    prompt = isVietnamese
      ? `Định nghĩa hoặc giải thích từ "${text}"${context}:`
      : `Define or explain "${text}"${context}:`;
  }

  // Use proxy server to avoid CORS issues
  const response = await fetch(`${PROXY_API_URL}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
      prompt: prompt,
      parameters: {
        max_new_tokens: 150,
        temperature: 0.7,
        top_p: 0.9,
        do_sample: true
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // Handle model loading
    if (errorData.error && (errorData.error.includes('loading') || errorData.error.includes('đang được tải'))) {
      throw new Error('Model đang được tải, vui lòng thử lại sau vài giây.');
    }
    
    // If 404 or model not found, try next model
    if (response.status === 404 || errorData.error?.includes('not found') || errorData.error?.includes('Model không tìm thấy')) {
      console.log(`Model ${model} not found, trying next model...`);
      return callTextGenerationAPI(text, deckTags, language, modelIndex + 1);
    }
    
    throw new Error(errorData.error || `Text generation failed with status ${response.status}`);
  }

  const data = await response.json();
  
  // Extract generated text from response
  let generatedText = null;
  
  if (Array.isArray(data) && data.length > 0) {
    generatedText = data[0].generated_text || data[0].text || null;
  } else if (data.generated_text) {
    generatedText = data.generated_text;
  } else if (data.text) {
    generatedText = data.text;
  }
  
  // Clean up the response - remove the prompt part if present
  if (generatedText) {
    // Remove the prompt from the beginning if it's included in the response
    if (generatedText.includes(prompt.trim())) {
      generatedText = generatedText.replace(prompt.trim(), '').trim();
    }
    // Remove any remaining instruction tokens (for Gemma)
    if (isGemmaModel) {
      generatedText = generatedText.replace(/<start_of_turn>.*?<end_of_turn>\s*/g, '').trim();
    }
    return generatedText || text;
  }

  // If no text extracted, try next model
  if (modelIndex < GEMMA_MODELS.length - 1) {
    console.log(`No text extracted from ${model}, trying next model...`);
    return callTextGenerationAPI(text, deckTags, language, modelIndex + 1);
  }

  return text;
};

/**
 * Translate text using LibreTranslate API
 * @param {string} text - Text to translate
 * @param {string[]} deckTags - Tags/categories of the deck (not used, kept for compatibility)
 * @param {string} targetLanguage - Target language (default: Vietnamese)
 * @returns {Promise<string>} - Translated text
 */
export const translateText = async (text, deckTags = [], targetLanguage = 'Vietnamese') => {
  try {
    return await callTranslationAPI(text, targetLanguage);
  } catch (error) {
    console.error('LibreTranslate Translation Error:', error);
    throw error;
  }
};

/**
 * Get definition/explanation using Gemma model from Hugging Face
 * @param {string} text - Text to define
 * @param {string[]} deckTags - Tags/categories of the deck
 * @param {string} language - Language for definition (default: Vietnamese)
 * @returns {Promise<string>} - Definition/explanation
 */
export const defineText = async (text, deckTags = [], language = 'Vietnamese') => {
  try {
    return await callTextGenerationAPI(text, deckTags, language);
  } catch (error) {
    console.error('Gemma Text Generation Error:', error);
    throw error;
  }
};

