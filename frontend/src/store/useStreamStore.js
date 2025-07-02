import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useStreamStore = create((set, get) => ({
  streamToken: null,
  apiKey: null,
  userId: null,
  isLoadingToken: false,

  getStreamToken: async () => {
    set({ isLoadingToken: true });
    try {
      const res = await axiosInstance.get("/stream/token");
      set({
        streamToken: res.data.token,
        apiKey: res.data.apiKey,
        userId: res.data.userId,
      });
      return res.data;
    } catch (error) {
      toast.error("Failed to get stream token");
      console.error("Stream token error:", error);
    } finally {
      set({ isLoadingToken: false });
    }
  },

  createCall: async (callId, members) => {
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

  clearStreamData: () => {
    set({
      streamToken: null,
      apiKey: null,
      userId: null,
    });
  },
}));