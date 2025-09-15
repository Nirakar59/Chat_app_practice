import toast from "react-hot-toast"
import { create } from "zustand"
import { axiosInstance } from "../lib/axios"
import { useAuthStore } from "./useAuthStore"

let guildMessageHandler

export const useGuildMessageStore = create((set, get) => ({
  messages: [],

  getChat: async (guildId) => {
    try {
      const res = await axiosInstance.get(`/guildchat/${guildId}`)
      set({ messages: res.data.chat })
    } catch (error) {
      toast.error(error.message || "Failed to fetch guild chat")
    }
  },

  sendMessageToGuild: async (guildId, data) => {
    try {
      const res = await axiosInstance.post(`/guildchat/send/${guildId}`, data)
      console.log("✅ Message sent:", res.data)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message")
    }
  },

  subscribeToMessages: (guildId) => {
    if (!guildId) return
    const socket = useAuthStore.getState().socket
    if (!socket) return

    // cleanup old handler
    if (guildMessageHandler) {
      try {
        socket.off("newMessageForGuild", guildMessageHandler)
      } catch { /* empty */ }
      guildMessageHandler = null
    }

    guildMessageHandler = (newMessage) => {
      if (String(newMessage.guildId) !== String(guildId)) return
      set({ messages: [...get().messages, newMessage] })
    }

    socket.on("newMessageForGuild", guildMessageHandler)
  },

  unsubscribeToMessages: () => {
    const socket = useAuthStore.getState().socket
    if (!socket || !guildMessageHandler) return
    try {
      socket.off("newMessageForGuild", guildMessageHandler)
    } catch { /* empty */ }
    guildMessageHandler = null
  },

  deleteChat: async (guildId) => {
    try {
      const res = await axiosInstance.delete(`/guildchat/${guildId}`)
      toast.success(res.data.response.message)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete chat")
    }
  },
}))
