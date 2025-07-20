import { create } from "zustand"
import { axiosInstance } from "../lib/axios"
import toast from 'react-hot-toast'
export const useAuthStore = create((set)=>({
    authUser: null,
    isLoading: false,
    isSigningUp: false,
    isUpdatingProfile: false,
    isLogginIn: false,
    isCheckingAuth: true,
    onlineUsers: [],

    checkAuth: async()=>{
        try {
            const res = await axiosInstance.get("/auth/checkauth");
            set({authUser: res.data})
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
            // console.log(get().authUser);
            
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
    } 

}))