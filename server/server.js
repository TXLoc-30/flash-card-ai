/**
 * Proxy server for ChatGPT API and other services
 * Solves CORS issue by proxying requests from React app
 * Main service: ChatGPT API for card generation and translation
 */

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for React app - allow all localhost ports
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all localhost ports for development
    if (origin.match(/^http:\/\/localhost:\d+$/)) {
      return callback(null, true);
    }
    
    // Allow specific production domains if needed
    callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Proxy endpoint for translation using LibreTranslate
app.post('/api/translate', async (req, res) => {
  try {
    console.log('Translation request received:', { text: req.body.text, source: req.body.source, target: req.body.target, textLength: req.body.text?.length });
    const { text, source, target } = req.body;
    
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!source || !target) {
      return res.status(400).json({ error: 'Source and target languages are required' });
    }

    // LibreTranslate API endpoint
    // Can use public API or self-hosted instance
    const libreTranslateUrl = process.env.LIBRETRANSLATE_URL || 'https://libretranslate.com/translate';
    const libreTranslateApiKey = process.env.LIBRETRANSLATE_API_KEY; // Optional API key
    
    console.log('Calling LibreTranslate API:', libreTranslateUrl);
    
    const requestBody = {
      q: text,
      source: source,
      target: target,
      format: 'text'
    };
    
    // Add API key if provided
    if (libreTranslateApiKey) {
      requestBody.api_key = libreTranslateApiKey;
    }
    
    const response = await fetch(libreTranslateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('LibreTranslate response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('LibreTranslate error:', errorData);
      let errorMessage = errorData.error || errorData.message || `Translation failed with status ${response.status}`;
      
      // Handle rate limiting
      if (response.status === 429) {
        errorMessage = 'Đã vượt quá giới hạn yêu cầu. Vui lòng thử lại sau.';
      }
      
      return res.status(response.status).json({ error: errorMessage });
    }

    const data = await response.json();
    console.log('LibreTranslate response:', JSON.stringify(data));
    
    // LibreTranslate returns: { "translatedText": "..." }
    res.json(data);
  } catch (error) {
    console.error('Translation proxy error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Proxy endpoint for text generation (definitions) using Gemma model
app.post('/api/generate', async (req, res) => {
  try {
    console.log('Text generation request received:', { model: req.body.model, promptLength: req.body.prompt?.length });
    const { model, prompt, parameters } = req.body;
    const apiToken = process.env.REACT_APP_HUGGINGFACE_API_TOKEN;
    
    if (!model) {
      return res.status(400).json({ error: 'Model is required' });
    }
    
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Try different endpoint formats
    // Format 1: router.huggingface.co/hf-inference/models/{model}
    let hfUrl = `https://router.huggingface.co/hf-inference/models/${model}`;
    console.log('Calling Hugging Face API (format 1):', hfUrl);
    
    let response = await fetch(hfUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiToken && { 'Authorization': `Bearer ${apiToken}` })
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: parameters || {}
      })
    });

    console.log('Hugging Face response status:', response.status);

    // If 404, try alternative format
    if (response.status === 404) {
      console.log('Trying alternative format (without /models)...');
      hfUrl = `https://router.huggingface.co/hf-inference/${model}`;
      console.log('Calling Hugging Face API (format 2):', hfUrl);
      response = await fetch(hfUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiToken && { 'Authorization': `Bearer ${apiToken}` })
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: parameters || {}
        })
      });
      console.log('Alternative format response status:', response.status);
    }

    // If still 404, try old endpoint as fallback
    if (response.status === 404) {
      console.log('Trying old endpoint format as fallback...');
      hfUrl = `https://api-inference.huggingface.co/models/${model}`;
      console.log('Calling Hugging Face API (old endpoint):', hfUrl);
      response = await fetch(hfUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiToken && { 'Authorization': `Bearer ${apiToken}` })
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: parameters || {},
          options: {
            wait_for_model: true
          }
        })
      });
      console.log('Old endpoint response status:', response.status);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('Hugging Face error:', errorData);
      let errorMessage = errorData.error || errorData.message || `Text generation failed with status ${response.status}`;
      
      // Handle specific permission errors
      if (errorMessage.includes('sufficient permissions') || errorMessage.includes('authentication method')) {
        errorMessage = 'Token không có đủ quyền. Vui lòng tạo token mới với quyền "write" tại https://huggingface.co/settings/tokens';
      }
      
      // Handle 404 - endpoint not found
      if (response.status === 404) {
        errorMessage = 'Model không tìm thấy hoặc endpoint không đúng. Có thể endpoint mới chưa hỗ trợ model này.';
      }
      
      return res.status(response.status).json({ error: errorMessage });
    }

    const data = await response.json();
    console.log('Text generation response sample:', JSON.stringify(data).substring(0, 300));
    res.json(data);
  } catch (error) {
    console.error('Text generation proxy error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// ChatGPT API endpoints
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Helper function to build prompt based on purpose and config
const buildPrompt = (purpose, deckConfig, tags, additionalContext = '') => {
  let prompt = '';
  
  if (purpose === 'translation') {
    const [sourceLang, targetLang] = (deckConfig.languagePair || 'en-vi').split('-');
    const langNames = {
      'en': 'tiếng Anh',
      'vi': 'tiếng Việt',
      'zh': 'tiếng Trung',
      'ja': 'tiếng Nhật',
      'ko': 'tiếng Hàn'
    };
    
    prompt = `Bạn là một chuyên gia dịch thuật. Tạo thẻ flashcard dịch thuật từ ${langNames[sourceLang] || sourceLang} sang ${langNames[targetLang] || targetLang}.`;
    prompt += ` Mặt trước (front) của thẻ phải là từ/cụm từ bằng ${langNames[sourceLang] || sourceLang}.`;
    prompt += ` Mặt sau (back) của thẻ phải là bản dịch bằng ${langNames[targetLang] || targetLang}.`;
    
    if (tags.length > 0) {
      prompt += ` Tags: ${tags.join(', ')}.`;
    }
    
    if (deckConfig.translationDescription) {
      prompt += ` Mô tả bộ thẻ: ${deckConfig.translationDescription}.`;
    }
  } else if (purpose === 'academic') {
    prompt = `Bạn là một giáo viên chuyên về học thuật.`;
    
    if (deckConfig.academicDescription) {
      prompt += ` Mô tả bộ thẻ: ${deckConfig.academicDescription}.`;
    }
  }
  
  if (additionalContext) {
    prompt += ` ${additionalContext}`;
  }
  
  return prompt;
};

// Helper function to calculate similarity between two strings (simple approach)
const calculateSimilarity = (str1, str2) => {
  const normalize = (str) => str.toLowerCase().trim().replace(/\s+/g, ' ');
  const s1 = normalize(str1);
  const s2 = normalize(str2);
  
  // If strings are identical
  if (s1 === s2) return 1.0;
  
  // Calculate word overlap
  const words1 = new Set(s1.split(/\s+/));
  const words2 = new Set(s2.split(/\s+/));
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
};

// Remove duplicate or very similar cards
const removeDuplicateCards = (cards) => {
  const uniqueCards = [];
  const SIMILARITY_THRESHOLD = 0.7; // Cards with >70% similarity are considered duplicates
  
  for (const card of cards) {
    if (!card.front || !card.back) continue;
    
    // Check if this card is too similar to any existing card
    let isDuplicate = false;
    for (const existingCard of uniqueCards) {
      const frontSimilarity = calculateSimilarity(card.front, existingCard.front);
      const backSimilarity = calculateSimilarity(card.back, existingCard.back);
      
      // If front or back is very similar, consider it a duplicate
      if (frontSimilarity >= SIMILARITY_THRESHOLD || backSimilarity >= SIMILARITY_THRESHOLD) {
        isDuplicate = true;
        break;
      }
      
      // Also check if front of new card is similar to back of existing card (and vice versa)
      const crossSimilarity1 = calculateSimilarity(card.front, existingCard.back);
      const crossSimilarity2 = calculateSimilarity(card.back, existingCard.front);
      if (crossSimilarity1 >= SIMILARITY_THRESHOLD || crossSimilarity2 >= SIMILARITY_THRESHOLD) {
        isDuplicate = true;
        break;
      }
    }
    
    if (!isDuplicate) {
      uniqueCards.push(card);
    }
  }
  
  return uniqueCards;
};

// Generate multiple cards automatically
app.post('/api/chatgpt/generate-cards', async (req, res) => {
  try {
    const { description, count, purpose, deckConfig = {}, tags = [] } = req.body;
    
    if (!count || count < 1 || count > 50) {
      return res.status(400).json({ error: 'Count must be between 1 and 50' });
    }
    
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured. Please set REACT_APP_OPENAI_API_KEY in .env file' });
    }
    
    // Nếu description trống, sử dụng mô tả từ deckConfig
    let finalDescription = description && description.trim() ? description.trim() : '';
    if (!finalDescription) {
      if (purpose === 'translation' && deckConfig.translationDescription) {
        finalDescription = deckConfig.translationDescription;
      } else if (purpose === 'academic' && deckConfig.academicDescription) {
        finalDescription = deckConfig.academicDescription;
      }
    }
    
    let systemPromptContext = '';
    if (finalDescription) {
      systemPromptContext = `Tạo ${count} thẻ flashcard dựa trên mô tả: "${finalDescription}".`;
    } else {
      systemPromptContext = `Tạo ${count} thẻ flashcard.`;
    }
    
    // Thêm yêu cầu về tính đa dạng
    systemPromptContext += ` QUAN TRỌNG: Mỗi thẻ phải có nội dung HOÀN TOÀN KHÁC NHAU, không được trùng lặp hoặc gần giống nhau.`;
    systemPromptContext += ` Các thẻ phải về các khía cạnh, chủ đề, hoặc từ vựng khác nhau.`;
    systemPromptContext += ` Ví dụ: nếu tạo từ vựng về thể thao, mỗi thẻ phải về một môn thể thao hoặc khái niệm khác nhau (bóng đá, bơi lội, chạy bộ, v.v.), không được tạo nhiều thẻ về cùng một môn thể thao.`;
    
    if (purpose === 'translation') {
      const [sourceLang, targetLang] = (deckConfig.languagePair || 'en-vi').split('-');
      const langNames = {
        'en': 'tiếng Anh',
        'vi': 'tiếng Việt',
        'zh': 'tiếng Trung',
        'ja': 'tiếng Nhật',
        'ko': 'tiếng Hàn'
      };
      systemPromptContext += ` Mỗi thẻ phải có mặt trước (front) là từ/cụm từ bằng ${langNames[sourceLang] || sourceLang} và mặt sau (back) là bản dịch bằng ${langNames[targetLang] || targetLang}.`;
      systemPromptContext += ` Mỗi từ/cụm từ phải khác nhau, không được tạo các biến thể hoặc từ đồng nghĩa của cùng một từ.`;
      if (deckConfig.translationDescription) {
        systemPromptContext += ` Các thẻ phải liên quan đến: ${deckConfig.translationDescription}.`;
      }
    } else {
      systemPromptContext += ` Mỗi thẻ phải có 2 phần: front (mặt trước) và back (mặt sau).`;
      systemPromptContext += ` Mỗi thẻ phải về một khái niệm, công thức, hoặc nội dung học thuật khác nhau.`;
    }
    
    systemPromptContext += ` Trả về kết quả dưới dạng JSON array với format: [{"front": "...", "back": "..."}, ...]. Chỉ trả về JSON, không có text khác.`;
    
    const systemPrompt = buildPrompt(purpose, deckConfig, tags, systemPromptContext);
    
    const userPrompt = description;
    
    console.log('ChatGPT generate-cards request:', { count, purpose, descriptionLength: description.length });
    
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.9,
        max_tokens: 2000
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('ChatGPT API error:', errorData);
      let errorMessage = errorData.error?.message || `ChatGPT API failed with status ${response.status}`;
      
      // Handle specific error types
      if (errorData.error?.code === 'insufficient_quota' || errorData.error?.type === 'insufficient_quota') {
        errorMessage = 'Đã hết quota hoặc chưa cấu hình billing. Vui lòng:\n1. Kiểm tra tài khoản OpenAI tại https://platform.openai.com/account/billing\n2. Thêm payment method và nạp tiền\n3. Kiểm tra usage limits tại https://platform.openai.com/usage';
      } else if (errorMessage.includes('quota') || errorMessage.includes('billing') || errorMessage.includes('insufficient_quota')) {
        errorMessage = 'Đã hết quota hoặc chưa cấu hình billing. Vui lòng kiểm tra tài khoản OpenAI tại https://platform.openai.com/account/billing';
      } else if (errorData.error?.code === 'invalid_api_key' || errorMessage.includes('Invalid API key')) {
        errorMessage = 'API key không hợp lệ. Vui lòng kiểm tra REACT_APP_OPENAI_API_KEY trong file .env';
      } else if (errorData.error?.code === 'rate_limit_exceeded') {
        errorMessage = 'Đã vượt quá giới hạn rate limit. Vui lòng thử lại sau vài giây.';
      }
      
      return res.status(response.status).json({ error: errorMessage });
    }
    
    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    
    // Try to parse JSON from response
    let cards = [];
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*\])\s*```/);
      if (jsonMatch) {
        cards = JSON.parse(jsonMatch[1]);
      } else {
        cards = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Failed to parse ChatGPT response:', content);
      // Fallback: try to extract cards from text
      const lines = content.split('\n').filter(line => line.trim());
      cards = lines.slice(0, count).map((line, index) => ({
        front: `Thẻ ${index + 1}`,
        back: line.trim()
      }));
    }
    
    // Ensure we have the right number of cards
    if (cards.length > count) {
      cards = cards.slice(0, count);
    }
    
    // Loại bỏ thẻ trùng lặp hoặc quá giống nhau
    const originalCount = cards.length;
    cards = removeDuplicateCards(cards);
    const duplicatesRemoved = originalCount - cards.length;
    
    if (duplicatesRemoved > 0) {
      console.log(`Removed ${duplicatesRemoved} duplicate/similar card(s) from generated set.`);
    }
    
    // Note: If cards.length < count after removing duplicates, we return what we have
    // The prompt improvements should minimize this issue
    
    res.json({ cards });
  } catch (error) {
    console.error('ChatGPT generate-cards error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Generate back side of a card
app.post('/api/chatgpt/generate-back', async (req, res) => {
  try {
    const { front, purpose, deckConfig = {}, tags = [] } = req.body;
    
    if (!front || !front.trim()) {
      return res.status(400).json({ error: 'Front text is required' });
    }
    
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }
    
    const systemPrompt = buildPrompt(purpose, deckConfig, tags,
      `Dựa vào nội dung mặt trước của thẻ flashcard, tạo nội dung mặt sau phù hợp.
      Trả về chỉ nội dung mặt sau, không có text khác.`);
    
    const userPrompt = `Mặt trước: "${front}"\n\nTạo mặt sau:`;
    
    console.log('ChatGPT generate-back request:', { purpose, frontLength: front.length });
    
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = errorData.error?.message || `ChatGPT API failed with status ${response.status}`;
      
      if (errorMessage.includes('quota') || errorMessage.includes('billing')) {
        errorMessage = 'Đã hết quota hoặc chưa cấu hình billing. Vui lòng kiểm tra tài khoản OpenAI.';
      }
      
      return res.status(response.status).json({ error: errorMessage });
    }
    
    const data = await response.json();
    const back = data.choices[0]?.message?.content?.trim() || '';
    
    res.json({ back });
  } catch (error) {
    console.error('ChatGPT generate-back error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Translate text (for translation decks)
app.post('/api/chatgpt/translate', async (req, res) => {
  try {
    const { text, deckConfig = {}, tags = [] } = req.body;
    
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }
    
    // Xác định ngôn ngữ nguồn và đích từ languagePair
    const languagePair = deckConfig.languagePair || 'en-vi';
    const [sourceLang, targetLang] = languagePair.split('-');
    
    const langNames = {
      'en': 'tiếng Anh',
      'vi': 'tiếng Việt',
      'zh': 'tiếng Trung',
      'ja': 'tiếng Nhật',
      'ko': 'tiếng Hàn'
    };
    
    // Tạo prompt rõ ràng chỉ yêu cầu dịch, không tạo flashcard
    const systemPrompt = `Bạn là một chuyên gia dịch thuật. Nhiệm vụ của bạn là dịch text từ ${langNames[sourceLang] || sourceLang} sang ${langNames[targetLang] || targetLang}. 
CHỈ trả về bản dịch, KHÔNG có bất kỳ từ khóa nào như "Front:", "Back:", hay giải thích gì khác. 
Chỉ trả về bản dịch thuần túy.`;
    
    const userPrompt = `Dịch sang ${langNames[targetLang] || targetLang}: "${text.trim()}"`;
    
    console.log('ChatGPT translate request:', { 
      textLength: text.length, 
      languagePair: languagePair,
      from: langNames[sourceLang] || sourceLang,
      to: langNames[targetLang] || targetLang
    });
    
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = errorData.error?.message || `ChatGPT API failed with status ${response.status}`;
      
      if (errorMessage.includes('quota') || errorMessage.includes('billing')) {
        errorMessage = 'Đã hết quota hoặc chưa cấu hình billing. Vui lòng kiểm tra tài khoản OpenAI.';
      }
      
      return res.status(response.status).json({ error: errorMessage });
    }
    
    const data = await response.json();
    let translatedText = data.choices[0]?.message?.content?.trim() || '';
    
    // Xử lý trường hợp AI trả về format "Front: ... Back: ..."
    // Tìm và lấy phần Back (bản dịch)
    const frontBackMatch = translatedText.match(/(?:Front|Mặt trước)[:\s]*\*{0,2}([^\n]*)\n\s*(?:Back|Mặt sau)[:\s]*\*{0,2}([^\n]*)/i);
    if (frontBackMatch) {
      // Nếu có format Front: ... Back: ..., lấy phần Back
      translatedText = frontBackMatch[2].trim();
    } else {
      // Nếu không có format đó, xử lý bình thường
      // Loại bỏ các từ khóa không mong muốn
      translatedText = translatedText
        // Loại bỏ Front: và Back: ở đầu dòng
        .replace(/^(?:Front|Mặt trước):\s*/i, '')
        .replace(/^(?:Back|Mặt sau):\s*/i, '')
        .replace(/^\*\*(?:Front|Mặt trước):\*\*\s*/i, '')
        .replace(/^\*\*(?:Back|Mặt sau):\*\*\s*/i, '')
        // Loại bỏ markdown bold
        .replace(/\*\*/g, '')
        .trim();
      
      // Nếu có nhiều dòng, chỉ lấy dòng cuối cùng (thường là Back)
      const lines = translatedText.split('\n').map(line => line.trim()).filter(line => line);
      if (lines.length > 1) {
        // Tìm dòng có chứa nội dung dịch (không phải label)
        const translationLine = lines.find(line => 
          !/^(Front|Back|Mặt trước|Mặt sau):?\s*$/i.test(line) && line.length > 0
        );
        if (translationLine) {
          translatedText = translationLine;
        } else {
          // Nếu không tìm thấy, lấy dòng cuối cùng
          translatedText = lines[lines.length - 1];
        }
      }
    }
    
    // Loại bỏ dấu ngoặc kép thừa nếu có
    if ((translatedText.startsWith('"') && translatedText.endsWith('"')) ||
        (translatedText.startsWith("'") && translatedText.endsWith("'"))) {
      translatedText = translatedText.slice(1, -1).trim();
    }
    
    // Loại bỏ khoảng trắng thừa
    translatedText = translatedText.trim();
    
    res.json({ translatedText });
  } catch (error) {
    console.error('ChatGPT translate error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Proxy server is running' });
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log(`ChatGPT API: ${OPENAI_API_KEY ? 'Configured' : 'Not configured (set REACT_APP_OPENAI_API_KEY)'}`);
  console.log(`Make sure to set REACT_APP_OPENAI_API_KEY in .env file`);
});

