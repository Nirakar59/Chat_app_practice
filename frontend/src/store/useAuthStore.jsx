import { create } from "zustand"
import { axiosInstance } from "../lib/axios"

export const useAuthStore = create((set)=>({
    authUser: null,
    isLoading: false,
    isSigningUp: false,
    isUpdatingProfile: false,

    isCheckingAuth: true,

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
    }

    
}))