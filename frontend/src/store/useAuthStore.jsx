import { create } from "zustand"
import { axiosInstance } from "../lib/axios"
import toast from 'react-hot-toast'
import {io} from 'socket.io-client'

const BASE_URL = "http://localhost:5001"

export const useAuthStore = create((set,get)=>({
    authUser: null,
    isLoading: false,
    isSigningUp: false,
    isUpdatingProfile: false,
    isLogginIn: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    checkAuth: async()=>{
        try {
            const res = await axiosInstance.get("/auth/checkauth");
            set({authUser: res.data})
            get().connectSocket()
        } catch (error) {
            console.log("error in checkauth: ", error);
            
            set({authUser: null})
        }
        finally{
            set({isCheckingAuth:false})
        }
    },

    signup: async(data)=>{
        set({isSigningUp: true})
        try {
            const res = await axiosInstance.post("/auth/signup", data)
            set({authUser:res.data})
            get().connectSocket()
            toast.success("Account Created Succesfully")
        } catch (error) {
            toast.error(error.response.data.message)
        }
        finally{
            set({isSigningUp:false})
        }
    },

    login: async(data)=>{
        set({isLogginIn:true})
        try {
            const res = await axiosInstance.post("/auth/login", data)
            set({authUser:res.data})
            get().connectSocket()            
            toast.success("Logged In Succesfully")
        } catch (error) {
            toast.error(error.response.data.message) 
        }
        finally{
            set({isLogginIn:false})
        }
    },
    
    logout:async()=>{
        try {
            await axiosInstance.post("/auth/logout")
            set({authUser:null})
            get().disconnectSocket()
            toast.success("Logged out Succesfully")
        } catch (error) {
            toast.error(error.response.data.message)
        }
    },

    updateProfile:async(Image)=>{
        set({isUpdatingProfile: true})
        try {
            await axiosInstance.put("/auth/updateprofile", Image)
            toast.success("Profile Picture Updated Succesfully")
            
        } catch (error) {
            toast.error(error.response.data.message)
        }
        finally{
            set({isUpdatingProfile: false})
        }
    } ,

    connectSocket: ()=>{
        
        const{authUser} = get()

        if(!authUser || get().socket?.connected) return;

        const socket = io(BASE_URL,{
            query: {
                userId: authUser._id
            }
        })
        socket.connect()
        set({socket:socket})

        socket.on("getOnlineUsers", (userIds)=>{
            set({onlineUsers:userIds})
        })
    },

    disconnectSocket: ()=>{
        if(get().socket?.connected) get().socket.disconnect()
    }
}))