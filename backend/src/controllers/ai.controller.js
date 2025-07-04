import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI with error checking
const initializeGemini = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is not set in environment variables");
    return null;
  }
  
  try {
    return new GoogleGenerativeAI(apiKey);
  } catch (error) {
    console.error("❌ Failed to initialize Google Generative AI:", error);
    return null;
  }
};

const genAI = initializeGemini();

export const translateMessage = async (req, res) => {
  try {
    const { text, targetLanguage, sourceLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({ 
        success: false,
        message: "Text and target language are required" 
      });
    }

    // Check if Gemini AI is properly initialized
    if (!genAI) {
      console.error("❌ Gemini AI not initialized - check GEMINI_API_KEY");
      return res.status(500).json({ 
        success: false,
        message: "Translation service not available. Please check server configuration." 
      });
    }

    // If target language is the same as detected source, return original text
    if (sourceLanguage && sourceLanguage.toLowerCase() === targetLanguage.toLowerCase()) {
      return res.status(200).json({ 
        success: true,
        originalText: text,
        translatedText: text,
        sourceLanguage,
        targetLanguage,
        skipped: true
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `You are a professional translator. Translate the following text from ${sourceLanguage || 'auto-detect the language'} to ${targetLanguage}. 

IMPORTANT RULES:
1. Only return the translated text, nothing else
2. Preserve the original meaning and tone
3. If the text is already in ${targetLanguage}, return it unchanged
4. For informal messages, keep the casual tone
5. For emojis and special characters, keep them as they are

Text to translate: "${text}"

Translation:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text().trim();

    // Remove any quotes that might be added by the AI
    const cleanTranslatedText = translatedText.replace(/^["']|["']$/g, '');

    res.status(200).json({ 
      success: true,
      originalText: text,
      translatedText: cleanTranslatedText,
      sourceLanguage: sourceLanguage || 'auto-detected',
      targetLanguage
    });

  } catch (error) {
    console.error("❌ Translation error:", error);
    
    // Handle specific API errors
    if (error.message?.includes('API_KEY')) {
      return res.status(500).json({ 
        success: false,
        message: "Invalid API key configuration" 
      });
    }
    
    if (error.message?.includes('quota')) {
      return res.status(429).json({ 
        success: false,
        message: "Translation quota exceeded. Please try again later." 
      });
    }

    res.status(500).json({ 
      success: false,
      message: "Translation failed. Please try again.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getSmartSuggestions = async (req, res) => {
  try {
    const { conversationHistory, currentMessage } = req.body;

    if (!conversationHistory || conversationHistory.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Conversation history is required" 
      });
    }

    if (!genAI) {
      return res.status(500).json({ 
        success: false,
        message: "AI service not available" 
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Get last few messages for context
    const recentMessages = conversationHistory.slice(-5);
    const context = recentMessages.map(msg => 
      `${msg.isSent ? 'You' : 'Friend'}: ${msg.text}`
    ).join('\n');

    const prompt = `Based on this conversation context, suggest 3 short, natural reply options (max 10 words each):

${context}

Provide exactly 3 suggestions in this format:
1. [suggestion]
2. [suggestion] 
3. [suggestion]

Make them conversational and appropriate to the context. Include emojis where appropriate.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Parse suggestions
    const suggestions = response
      .split('\n')
      .filter(line => line.match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .slice(0, 3);

    res.status(200).json({ 
      success: true,
      suggestions 
    });

  } catch (error) {
    console.error("❌ Smart suggestions error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to generate suggestions",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getTypingAssist = async (req, res) => {
  try {
    const { partialText, conversationHistory } = req.body;

    if (!partialText || partialText.length < 2) {
      return res.status(200).json({ 
        success: true,
        suggestions: [] 
      });
    }

    if (!genAI) {
      return res.status(500).json({ 
        success: false,
        message: "AI service not available" 
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const context = conversationHistory?.slice(-3).map(msg => 
      `${msg.isSent ? 'You' : 'Friend'}: ${msg.text}`
    ).join('\n') || '';

    const prompt = `Given this conversation context:
${context}

The user is typing: "${partialText}"

Suggest 2-3 ways to complete this message naturally. Keep completions short and conversational.
Format as:
1. [completion]
2. [completion]
3. [completion]`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    const suggestions = response
      .split('\n')
      .filter(line => line.match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .slice(0, 3);

    res.status(200).json({ 
      success: true,
      suggestions 
    });

  } catch (error) {
    console.error("❌ Typing assist error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to generate typing assistance",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const processVoiceCommand = async (req, res) => {
  try {
    const { command, conversationHistory, lastMessage } = req.body;

    if (!command) {
      return res.status(400).json({ 
        success: false,
        message: "Voice command is required" 
      });
    }

    if (!genAI) {
      return res.status(500).json({ 
        success: false,
        message: "AI service not available" 
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Check if it's a read command
    if (command.toLowerCase().includes('read') || command.toLowerCase().includes('message')) {
      const messageToRead = lastMessage || conversationHistory?.[conversationHistory.length - 1];
      
      if (!messageToRead) {
        return res.status(200).json({ 
          success: true,
          action: 'speak',
          text: "No messages to read."
        });
      }

      return res.status(200).json({
        success: true,
        action: 'speak',
        text: `Message from ${messageToRead.isSent ? 'you' : 'your friend'}: ${messageToRead.text}`
      });
    }

    // Check if it's a reply command
    if (command.toLowerCase().includes('reply')) {
      const replyText = command.replace(/reply/i, '').trim();
      
      if (replyText) {
        return res.status(200).json({
          success: true,
          action: 'send',
          text: replyText
        });
      } else {
        return res.status(200).json({
          success: true,
          action: 'speak',
          text: "What would you like to reply?"
        });
      }
    }

    // General AI assistant response
    const prompt = `You are a voice assistant for a chat app. The user said: "${command}"
    
    Respond naturally and helpfully. Keep responses short and conversational.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text().trim();

    res.status(200).json({
      success: true,
      action: 'speak',
      text: response
    });

  } catch (error) {
    console.error("❌ Voice command error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to process voice command",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};