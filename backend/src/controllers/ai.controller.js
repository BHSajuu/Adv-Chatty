import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const translateMessage = async (req, res) => {
  try {
    const { text, targetLanguage, sourceLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({ message: "Text and target language are required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Translate the following text from ${sourceLanguage || 'auto-detect'} to ${targetLanguage}. 
    Only return the translated text, nothing else:
    
    "${text}"`;

    const result = await model.generateContent(prompt);
    const translatedText = result.response.text().trim();

    res.status(200).json({ 
      originalText: text,
      translatedText,
      sourceLanguage,
      targetLanguage
    });
  } catch (error) {
    console.error("Translation error:", error);
    res.status(500).json({ message: "Translation failed" });
  }
};

export const getSmartSuggestions = async (req, res) => {
  try {
    const { conversationHistory, currentMessage } = req.body;

    if (!conversationHistory || conversationHistory.length === 0) {
      return res.status(400).json({ message: "Conversation history is required" });
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

Make them conversational and appropriate to the context.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Parse suggestions
    const suggestions = response
      .split('\n')
      .filter(line => line.match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .slice(0, 3);

    res.status(200).json({ suggestions });
  } catch (error) {
    console.error("Smart suggestions error:", error);
    res.status(500).json({ message: "Failed to generate suggestions" });
  }
};

export const getTypingAssist = async (req, res) => {
  try {
    const { partialText, conversationHistory } = req.body;

    if (!partialText || partialText.length < 2) {
      return res.status(200).json({ suggestions: [] });
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

    res.status(200).json({ suggestions });
  } catch (error) {
    console.error("Typing assist error:", error);
    res.status(500).json({ message: "Failed to generate typing assistance" });
  }
};

export const processVoiceCommand = async (req, res) => {
  try {
    const { command, conversationHistory, lastMessage } = req.body;

    if (!command) {
      return res.status(400).json({ message: "Voice command is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Check if it's a read command
    if (command.toLowerCase().includes('read') || command.toLowerCase().includes('message')) {
      const messageToRead = lastMessage || conversationHistory?.[conversationHistory.length - 1];
      
      if (!messageToRead) {
        return res.status(200).json({ 
          action: 'speak',
          text: "No messages to read."
        });
      }

      return res.status(200).json({
        action: 'speak',
        text: `Message from ${messageToRead.isSent ? 'you' : 'your friend'}: ${messageToRead.text}`
      });
    }

    // Check if it's a reply command
    if (command.toLowerCase().includes('reply')) {
      const replyText = command.replace(/reply/i, '').trim();
      
      if (replyText) {
        return res.status(200).json({
          action: 'send',
          text: replyText
        });
      } else {
        return res.status(200).json({
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
      action: 'speak',
      text: response
    });

  } catch (error) {
    console.error("Voice command error:", error);
    res.status(500).json({ message: "Failed to process voice command" });
  }
};