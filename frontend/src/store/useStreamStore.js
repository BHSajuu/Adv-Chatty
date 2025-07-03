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
      });
      return res.data;
    } catch (error) {
      console.error("Stream token error:", error);
      
      // Check if it's a configuration error
      if (error.response?.status === 500) {
        toast.error("Video calling not configured. Please check Stream API settings.");
      } else {
        toast.error("Failed to get stream token");
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
      toast.error("Failed to create call");
      console.error("Create call error:", error);
      throw error;
    }
  },

  getCallDetails: async (callId) => {
    try {
      const res = await axiosInstance.get(`/stream/call/${callId}`);
      return res.data;
    } catch (error) {
      console.error("Get call details error:", error);
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
    });
  },
}));