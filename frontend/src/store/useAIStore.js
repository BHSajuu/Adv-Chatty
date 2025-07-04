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
      const response = await axiosInstance.post("/ai/translate", {
        text,
        targetLanguage,
        sourceLanguage
      });
      return response.data.translatedText;
    } catch (error) {
      console.error("Translation failed:", error);
      return text; // Return original text if translation fails
    }
  },
  
  getSmartSuggestions: async (conversationHistory) => {
    try {
      const response = await axiosInstance.post("/ai/suggestions", {
        conversationHistory
      });
      set({ 
        smartSuggestions: response.data.suggestions,
        showSuggestions: true 
      });
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
      
      set({ 
        typingAssist: response.data.suggestions,
        showTypingAssist: response.data.suggestions.length > 0
      });
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
      
      return response.data;
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