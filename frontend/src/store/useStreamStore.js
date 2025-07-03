import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useStreamStore = create((set, get) => ({
  streamToken: null,
  apiKey: null,
  userId: null,
  userName: null,
  userEmail: null,
  isLoadingToken: false,
  isStreamConfigured: null, // null = unknown, true = configured, false = not configured

  getStreamToken: async () => {
    set({ isLoadingToken: true });
    try {
      console.log('Requesting Stream token from backend...');
      const res = await axiosInstance.get("/stream/token");
      
      console.log('Stream token response:', {
        hasToken: !!res.data.token,
        hasApiKey: !!res.data.apiKey,
        userId: res.data.userId
      });
      
      set({
        streamToken: res.data.token,
        apiKey: res.data.apiKey,
        userId: res.data.userId,
        userName: res.data.userName,
        userEmail: res.data.userEmail,
        isStreamConfigured: true,
      });
      
      console.log('Stream token stored successfully');
      return res.data;
    } catch (error) {
      console.error("Stream token error:", error);
      
      // Handle different error types
      if (error.response?.status === 503) {
        const errorData = error.response.data;
        set({ isStreamConfigured: false });
        
        if (errorData.error === 'STREAM_NOT_CONFIGURED') {
          console.error('Stream not configured:', errorData.message);
          toast.error("Video calling is not set up yet. Please configure Stream API credentials.");
        } else if (errorData.error === 'STREAM_AUTH_ERROR') {
          console.error('Stream auth error:', errorData.message);
          toast.error("Invalid Stream API credentials. Please check your configuration.");
        } else {
          console.error('Stream service error:', errorData.message);
          toast.error("Video calling service is temporarily unavailable.");
        }
      } else if (error.response?.status === 500) {
        console.error('Server error:', error.response.data);
        toast.error("Server error. Please try again later.");
      } else {
        console.error('Unknown error:', error);
        toast.error("Failed to initialize video calling.");
      }
      return null;
    } finally {
      set({ isLoadingToken: false });
    }
  },

  createCall: async (callId, members = []) => {
    try {
      console.log('Creating call with ID:', callId, 'Members:', members);
      const res = await axiosInstance.post("/stream/create-call", {
        callId,
        members,
      });
      console.log('Call created successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error("Create call error:", error);
      
      if (error.response?.status === 503) {
        const errorData = error.response.data;
        if (errorData.error === 'STREAM_NOT_CONFIGURED') {
          toast.error("Video calling is not configured. Please contact administrator.");
        } else {
          toast.error("Video calling service is temporarily unavailable.");
        }
      } else {
        toast.error("Failed to create call");
      }
      throw error;
    }
  },

  getCallDetails: async (callId) => {
    try {
      console.log('Getting call details for:', callId);
      const res = await axiosInstance.get(`/stream/call/${callId}`);
      console.log('Call details retrieved:', res.data);
      return res.data;
    } catch (error) {
      console.error("Get call details error:", error);
      
      if (error.response?.status === 503) {
        toast.error("Video calling service is not available.");
      }
      throw error;
    }
  },

  clearStreamData: () => {
    console.log('Clearing Stream data');
    set({
      streamToken: null,
      apiKey: null,
      userId: null,
      userName: null,
      userEmail: null,
      isStreamConfigured: null,
    });
  },
}));