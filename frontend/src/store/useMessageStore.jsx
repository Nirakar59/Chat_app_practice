import {create} from "zustand"
import toast from "react-hot-toast"
import { axiosInstance } from "../lib/axios"
import {useAuthStore} from "./useAuthStore"

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

        subscribeToMessages : ()=>{
            const{selectedUser} = get()
            if(!selectedUser) return
 
            const socket = useAuthStore.getState().socket
            socket.on("newMessage", (newMessage)=>{
                if(newMessage.senderId !== selectedUser._id) return
                set({
                    messages: [...get().messages, newMessage]
                })
            })
        },

        unsubscribeToMessages: ()=>{
            const socket = useAuthStore.getState().socket
            socket.off("newMessage")
        },

        setSelectedUser : (selectedUser)=> set({selectedUser}
        )
    }   
))