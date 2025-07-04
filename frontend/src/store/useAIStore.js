import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useAIStore = create((set, get) => ({
  // Translation settings
  userLanguage: localStorage.getItem("user-language") || "English",
  autoTranslate: localStorage.getItem("auto-translate") === "true",
  
  // Smart suggestions
  smartSuggestions: [],
  showSuggestions: false,
  
  // Typing assist
  typingAssist: [],
  showTypingAssist: false,
  
  // Voice assistant
  isListening: false,
  isProcessingVoice: false,
  
  // Loading states
  isTranslating: false,
  
  // Actions
  setUserLanguage: (language) => {
    localStorage.setItem("user-language", language);
    set({ userLanguage: language });
  },
  
  setAutoTranslate: (enabled) => {
    localStorage.setItem("auto-translate", enabled.toString());
    set({ autoTranslate: enabled });
  },
  
  translateMessage: async (text, targetLanguage, sourceLanguage = "auto-detect") => {
    try {
      set({ isTranslating: true });
      
      // Don't translate if text is empty
      if (!text || !text.trim()) {
        return text;
      }

      const response = await axiosInstance.post("/ai/translate", {
        text: text.trim(),
        targetLanguage,
        sourceLanguage
      });

      if (response.data.success) {
        return response.data.translatedText;
      } else {
        console.error("Translation API returned error:", response.data.message);
        return text; // Return original text if translation fails
      }
    } catch (error) {
      console.error("Translation failed:", error);
      
      // Show user-friendly error messages
      if (error.response?.status === 500) {
        toast.error("Translation service temporarily unavailable");
      } else if (error.response?.status === 429) {
        toast.error("Translation quota exceeded. Please try again later.");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Translation failed. Using original text.");
      }
      
      return text; // Return original text if translation fails
    } finally {
      set({ isTranslating: false });
    }
  },
  
  getSmartSuggestions: async (conversationHistory) => {
    try {
      if (!conversationHistory || conversationHistory.length === 0) {
        set({ smartSuggestions: [], showSuggestions: false });
        return;
      }

      const response = await axiosInstance.post("/ai/suggestions", {
        conversationHistory
      });
      
      if (response.data.success) {
        set({ 
          smartSuggestions: response.data.suggestions,
          showSuggestions: response.data.suggestions.length > 0
        });
      } else {
        set({ smartSuggestions: [], showSuggestions: false });
      }
    } catch (error) {
      console.error("Failed to get smart suggestions:", error);
      set({ smartSuggestions: [], showSuggestions: false });
    }
  },
  
  getTypingAssist: async (partialText, conversationHistory) => {
    try {
      if (partialText.length < 2) {
        set({ typingAssist: [], showTypingAssist: false });
        return;
      }
      
      const response = await axiosInstance.post("/ai/typing-assist", {
        partialText,
        conversationHistory
      });
      
      if (response.data.success) {
        set({ 
          typingAssist: response.data.suggestions,
          showTypingAssist: response.data.suggestions.length > 0
        });
      } else {
        set({ typingAssist: [], showTypingAssist: false });
      }
    } catch (error) {
      console.error("Failed to get typing assist:", error);
      set({ typingAssist: [], showTypingAssist: false });
    }
  },
  
  processVoiceCommand: async (command, conversationHistory, lastMessage) => {
    set({ isProcessingVoice: true });
    try {
      const response = await axiosInstance.post("/ai/voice-command", {
        command,
        conversationHistory,
        lastMessage
      });
      
      if (response.data.success) {
        return response.data;
      } else {
        toast.error(response.data.message || "Voice command failed");
        return null;
      }
    } catch (error) {
      console.error("Failed to process voice command:", error);
      toast.error("Voice command failed");
      return null;
    } finally {
      set({ isProcessingVoice: false });
    }
  },
  
  hideSuggestions: () => set({ showSuggestions: false }),
  hideTypingAssist: () => set({ showTypingAssist: false }),
  setListening: (listening) => set({ isListening: listening }),
}));