import {create} from "zustand"
import toast from "react-hot-toast"
import { axiosInstance } from "../lib/axios"
export const useMessageStore = create((set, get)=>(
    {
        users: [],
        messages: [],
        selectedUser: null,
        isLoadingMessages: false,
        isLoadingUsers: false,

        getUsers: async()=> {
            set({isLoadingUsers: true})
            try {
                const res = await axiosInstance.get("/message/users")
                set({users:res.data})
            } catch (error) {
                toast.error(error.response.data.message)
            }
            finally{
                set({isLoadingUsers: false})
            }
        },

        getmessage: async (userId) => {
            set({isLoadingMessages:true})
            try {
                const res = await axiosInstance.get(`/message/${userId}`)
                set({messages:res.data})
            } catch (error) {
                toast.error(error.response.data.message)
            }      
            finally{
                set({isLoadingMessages:false})
            }      
        },

        sendMessage: async(messageData) => {
            const {messages, selectedUser} = get()
            try {
                const res = await axiosInstance.post(`/message/send/${selectedUser._id}`, messageData)
                set({messages: [...messages, res.data]})
            } catch (error) {
                toast.error(error.response.data.message)
            }
        },

        setSelectedUser : (selectedUser)=> set({selectedUser})
    }
))