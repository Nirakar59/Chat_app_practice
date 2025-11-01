import { Trash, X, MoreVertical, User, Mail } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useMessageStore } from "../store/useMessageStore";
import { useState } from "react";

const ChatHeader = () => {
    const { selectedUser, setSelectedUser, deleteChat } = useMessageStore();
    const { onlineUsers } = useAuthStore();
    const [showMenu, setShowMenu] = useState(false);

    const handleDeleteChat = async () => {
        if (window.confirm('Are you sure you want to delete this conversation?')) {
            await deleteChat(selectedUser._id);
            setShowMenu(false);
        }
    };

    return (
        <div className="bg-base-100 border-b border-base-300 sticky top-0 z-10">
            <div className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            <div className="avatar">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full ring-2 ring-base-300">
                                    <img
                                        src={selectedUser.profilePic || "/avatar.png"}
                                        alt={selectedUser.fullName}
                                    />
                                </div>
                            </div>
                            {onlineUsers.includes(selectedUser._id) && (
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-100" />
                            )}
                        </div>

                        {/* User info */}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm md:text-base truncate">
                                {selectedUser.fullName}
                            </h3>
                            <div className="flex items-center gap-2 text-xs md:text-sm text-base-content/70">
                                {onlineUsers.includes(selectedUser._id) ? (
                                    <>
                                        <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                                        <span className="text-success font-medium">Active now</span>
                                    </>
                                ) : (
                                    <span>Offline</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center gap-2">
                            <button
                                onClick={handleDeleteChat}
                                className="btn btn-ghost btn-sm gap-2 text-error hover:bg-error/10"
                                title="Delete conversation"
                            >
                                <Trash className="w-4 h-4" />
                                <span>Delete</span>
                            </button>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="btn btn-ghost btn-sm gap-2"
                                title="Close chat"
                            >
                                <X className="w-4 h-4" />
                                <span>Close</span>
                            </button>
                        </div>

                        {/* Mobile Menu */}
                        <div className="md:hidden relative">
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="btn btn-ghost btn-sm btn-circle"
                            >
                                <MoreVertical className="w-5 h-5" />
                            </button>

                            {showMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowMenu(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-48 bg-base-100 rounded-lg shadow-xl border border-base-300 overflow-hidden z-50">
                                        <button
                                            onClick={handleDeleteChat}
                                            className="w-full px-4 py-3 text-left hover:bg-error/10 text-error flex items-center gap-3"
                                        >
                                            <Trash className="w-4 h-4" />
                                            Delete Conversation
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedUser(null);
                                                setShowMenu(false);
                                            }}
                                            className="w-full px-4 py-3 text-left hover:bg-base-200 flex items-center gap-3"
                                        >
                                            <X className="w-4 h-4" />
                                            Close Chat
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatHeader;