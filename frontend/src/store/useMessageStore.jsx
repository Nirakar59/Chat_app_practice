import {create} from "zustand"
import toast from "react-hot-toast"
export const useMessageStore = create((set)=>(
    {
        users: [],
        messages: [],
        selectedUser: null,
        isLoadingMessages: false,
        isLoadingUsers: false
    }
))