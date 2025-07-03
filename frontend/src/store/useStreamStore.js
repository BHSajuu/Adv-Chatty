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
      const res = await axiosInstance.get("/stream/token");
      set({
        streamToken: res.data.token,
        apiKey: res.data.apiKey,
        userId: res.data.userId,
        userName: res.data.userName,
        userEmail: res.data.userEmail,
        isStreamConfigured: true,
      });
      return res.data;
    } catch (error) {
      console.error("Stream token error:", error);
      
      // Handle different error types
      if (error.response?.status === 503) {
        const errorData = error.response.data;
        set({ isStreamConfigured: false });
        
        if (errorData.error === 'STREAM_NOT_CONFIGURED') {
          toast.error("Video calling is not set up yet. Please configure Stream API credentials.");
        } else {
          toast.error("Video calling service is temporarily unavailable.");
        }
      } else if (error.response?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error("Failed to initialize video calling.");
      }
      return null;
    } finally {
      set({ isLoadingToken: false });
    }
  },

  createCall: async (callId, members = []) => {
    try {
      const res = await axiosInstance.post("/stream/create-call", {
        callId,
        members,
      });
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
      const res = await axiosInstance.get(`/stream/call/${callId}`);
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