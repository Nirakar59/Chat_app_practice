import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { axiosInstance } from "../lib/axios"
import { io } from "socket.io-client"
import toast from "react-hot-toast"

const BASE_URL = "http://localhost:5001"

export const useAuthStore = create(
  persist(
    (set, get) => ({
      authUser: null,
      socket: null,
      onlineUsers: [],
      isLoading: false,
      isLogginIn: false,
      isSigningUp: false,
      isUpdatingProfile: false,
      isCheckingAuth: false,

      checkAuth: async () => {
        try {
          const res = await axiosInstance.get("/auth/checkauth")
          set({ authUser: res.data })
          if (!get().socket) {
            get().connectSocket()
          }
        } catch (error) {
          console.log("error in checkauth: ", error)
          set({ authUser: null })
        } finally {
          set({ isCheckingAuth: false })
        }
      },

      login: async (data) => {
        set({ isLogginIn: true })
        try {
          const res = await axiosInstance.post("/auth/login", data)
          set({ authUser: res.data })
          get().disconnectSocket()
          get().connectSocket()
          toast.success("Logged In Successfully")
        } catch (error) {
          toast.error(error.response.data.message)
        } finally {
          set({ isLogginIn: false })
        }
      },

      signup: async (data) => {
        set({ isSigningUp: true })
        try {
          const res = await axiosInstance.post("/auth/signup", data)
          set({ authUser: res.data })
          get().disconnectSocket()
          get().connectSocket()
          toast.success("Account Created Successfully")
        } catch (error) {
          toast.error(error.response.data.message)
        } finally {
          set({ isSigningUp: false })
        }
      },

      logout: async () => {
        try {
          await axiosInstance.post("/auth/logout")
          get().disconnectSocket()
          set({ authUser: null, socket: null })
          get().persist.clearStorage()
          toast.success("Logged out Successfully")
        } catch (error) {
          toast.error(error.response.data.message)
        }
      },

      updateProfile: async(img) => {
        set({isUpdatingProfile: true})
        try {
          const res = await axiosInstance.put("/auth/updateprofile", img)
          console.log(res.data);
          
        } catch (error) {
          toast.error(error?.message || "Profile picture updation failed")
        }
        finally{
          set({isUpdatingProfile:false})
        }
      },

      connectSocket: () => {
        const { authUser, socket } = get()
        if (!authUser || socket) return

        const newSocket = io(BASE_URL, {
          auth: { userId: authUser._id }, // use auth instead of query
          transports: ["websocket"],
          withCredentials: true,
        })

        newSocket.on("connect", () => {
          console.log("✅ Socket connected:", newSocket.id)
        })
        newSocket.on("connect_error", (err) => {
          console.error("❌ Socket connect error:", err.message)
          toast.error("Socket connection failed: " + err.message)
        })

        newSocket.on("getOnlineUsers", (userIds) => {
          set({ onlineUsers: userIds })
        })

        set({ socket: newSocket })
      },

      disconnectSocket: () => {
        const s = get().socket
        if (!s) {
          set({ socket: null, onlineUsers: [] })
          return
        }
        try {
          s.off("getOnlineUsers")
          s.off("connect")
          s.off("connect_error")
          s.disconnect()
        } catch (e) {
          console.warn("Error while disconnecting socket", e)
        } finally {
          set({ socket: null, onlineUsers: [] })
        }
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ authUser: state.authUser }),
    }
  )
)
