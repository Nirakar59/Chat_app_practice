import React, { useEffect, useRef } from 'react'
import { useMessageStore } from '../store/useMessageStore'
import MessageInput from './MessageInput'
import ChatHeader from './ChatHeader'
import MessageSkeleton from './Skeletions/MessageSkeleton'
import { useAuthStore } from '../store/useAuthStore'
import { formatMessageTime } from '../lib/timeFormatter'

const ChatContainer = () => {
  const { authUser } = useAuthStore()
  const {
    isLoadingMessages,
    selectedUser,
    messages,
    getmessage,
    subscribeToMessages,
    unsubscribeToMessages,
  } = useMessageStore()
  const messagesEndRef = useRef(null)

  useEffect(() => {
    console.log("Chat container ko useEffect chaliraxa");
    
    getmessage(selectedUser._id)
    subscribeToMessages()
    return () => unsubscribeToMessages()
  }, [getmessage, selectedUser, subscribeToMessages, unsubscribeToMessages])

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  if (isLoadingMessages)
    return (
      <div className="flex flex-1 flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
      </div>
    )

  return (
    <div className="flex flex-col h-full">
      <ChatHeader />

      {/* Messages Area */}
      <div className="flex-1 overflow-auto px-4 py-3 space-y-4 bg-base-100">
        {messages.map((message) => (
          <div key={message._id} className="flex flex-col">
            <div
              className={`chat ${message.senderId === authUser._id ? 'chat-end' : 'chat-start'
                }`}
            >
              {/* Avatar */}
              {message.senderId !== authUser._id && (
                <div className="chat-image avatar">
                  <div className="size-10 rounded-full border shadow-md">
                    <img src={selectedUser.profilePic} alt="profilePic" />
                  </div>
                </div>
              )}

              {/* Message Body */}
              <div className="flex flex-col max-w-[75%]">
                {/* Timestamp */}
                <span
                  className={`text-xs mb-1 opacity-70 ${message.senderId === authUser._id
                      ? 'self-end text-primary-content/70'
                      : 'self-start text-base-content/70'
                    }`}
                >
                  {formatMessageTime(message.createdAt)}
                </span>

                {/* Bubble */}
                <div
                  className={`chat-bubble rounded-2xl px-4 py-2 shadow-md transition-transform duration-200 hover:scale-[1.02]
                    ${message.senderId === authUser._id
                      ? 'bg-primary text-primary-content'
                      : 'bg-base-200 text-base-content'
                    }
                  `}
                >
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="sm:max-w-[220px] rounded-lg mb-2 shadow"
                    />
                  )}
                  {message.text && <p className="leading-relaxed">{message.text}</p>}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-base-100 px-3 py-2 shadow-inner">
        <MessageInput />
      </div>
    </div>
  )
}

export default ChatContainer