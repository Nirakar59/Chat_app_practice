import { Trash, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useMessageStore } from "../store/useMessageStore";

const ChatHeader = () => {
    const { selectedUser, setSelectedUser, deleteChat } = useMessageStore();
    const { onlineUsers } = useAuthStore();

    return (
        <div className="p-2.5 border-b border-base-300">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="avatar">
                        <div className="size-10 rounded-full relative">
                            <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
                        </div>
                    </div>

                    {/* User info */}
                    <div>
                        <h3 className="font-medium">{selectedUser.fullName}</h3>
                        <p className="text-sm text-base-content/70">
                            {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
                        </p>
                    </div>
                </div>

                {/* Close button */}
                <div className=" flex gap-5">


                    <button onClick={()=>deleteChat(selectedUser._id)} className="cursor-pointer hover:bg-gray-200">
                        <Trash />
                    </button>


                    <button onClick={() => setSelectedUser(null)} className="cursor-pointer hover:bg-gray-200">
                        <X />
                    </button>

                </div>
            </div>
        </div>
    );
};
export default ChatHeader;