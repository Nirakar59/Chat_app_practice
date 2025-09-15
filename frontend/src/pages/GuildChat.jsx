import React, { useEffect, useRef } from "react"
import { useAuthStore } from "../store/useAuthStore"
import { useGuildStore } from "../store/useGuildStore"
import { useGuildMessageStore } from "../store/useGuildMessageStore"
import MessageInput from "../components/MessageInput"

const GuildChat = () => {
  const { authUser, socket } = useAuthStore()
  const { selectedGuild } = useGuildStore()
  const {
    messages,
    getChat,
    subscribeToMessages,
    unsubscribeToMessages,
  } = useGuildMessageStore()

  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (!selectedGuild?._id || !socket) return

    getChat(selectedGuild._id)
    subscribeToMessages(selectedGuild._id)
    socket.emit("join-chat", selectedGuild._id)

    return () => {
      if (socket && selectedGuild?._id) {
        socket.emit("leave-guild-chat", selectedGuild._id)
      }
      unsubscribeToMessages()
    }
  }, [selectedGuild?._id, socket])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (!selectedGuild) return <div>Loading guild chat...</div>

  return (
    <div className="flex flex-col h-full min-h-0 bg-base-200 rounded-lg shadow">
      <div className="flex items-center justify-between px-4 py-3 bg-base-300 border-b">
        <div className="font-semibold">
          Guild Chat of <strong>{selectedGuild.guildName}</strong>
        </div>
        <div className="text-sm text-gray-500">Live</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col min-h-0" aria-live="polite">
        {messages.length === 0 && (
          <div className="text-center text-gray-500">
            No messages yet. Start the conversation! 🎉
          </div>
        )}

        {messages.map((message) => {
          const sender = message.senderId || {}
          const isMe = authUser._id === sender._id

          return (
            <div key={message._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              {!isMe && (
                <div className="chat-image avatar mr-2">
                  <div className="size-10 rounded-full border shadow-md">
                    <img src={sender.profilePic || "/default-avatar.png"} alt={sender.username} />
                  </div>
                </div>
              )}

              <div className={`flex flex-col max-w-[75%]`}>
                {!isMe && (
                  <div className="text-xs font-semibold text-gray-700 mb-1">
                    {sender.fullName || "Member"}
                  </div>
                )}

                <div
                  className={`chat-bubble px-4 py-2 shadow-md break-words rounded-2xl transition-transform duration-200 hover:scale-[1.02] ${
                    isMe
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-base-100 text-base-content rounded-bl-none"
                  }`}
                >
                  {message.text && <p className="leading-relaxed">{message.text}</p>}
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="mt-2 sm:max-w-[220px] rounded-lg shadow"
                    />
                  )}
                  <div className="flex items-center justify-between mt-1 text-[11px] text-gray-400">
                    <span>
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t bg-base-100 px-3 py-2 shadow-inner">
        <MessageInput page={"Guild"} />
      </div>
    </div>
  )
}

export default GuildChat
