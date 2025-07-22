import React, { useEffect, useRef } from 'react'
import { useMessageStore } from '../store/useMessageStore'
import MessageInput from './MessageInput'
import ChatHeader from './ChatHeader'
import MessageSkeleton from './Skeletions/MessageSkeleton'
import { useAuthStore } from '../store/useAuthStore'
import { formatMessageTime } from '../lib/timeFormatter'

const ChatContainer = () => {
  const { authUser } = useAuthStore()
  const { isLoadingMessages, selectedUser, messages, getmessage, subscribeToMessages, unsubscribeToMessages} = useMessageStore()
  const messagesEndRef = useRef(null)

  useEffect(() => {
    getmessage(selectedUser._id)

    subscribeToMessages()

    return ()=> unsubscribeToMessages()

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

      {/* Scrollable messages container */}
      <div className="flex-1 overflow-auto px-4 py-2 space-y-3">
        {messages.map((message) => (
          <div key={message._id}>
            <div className={`chat ${message.senderId === authUser._id ? 'chat-end' : 'chat-start'}`}>
              {/* Avatar */}
              <div className={`${message.senderId === authUser._id ? 'hidden' : 'chat-image'}`}>
                <div className="avatar">
                <div className="size-10 rounded-full border">
                  <img src={selectedUser.profilePic} alt="profilePic" />
                </div>
                </div>
              </div>

              {/* Timestamp */}
              <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>

              {/* Message bubble */}
              <div className="chat-bubble flex flex-col">
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}
                {message.text && <p>{message.text}</p>}
              </div>
            </div>
          </div>
        ))}

        {/* This empty div will be scrolled into view to push the container to bottom */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input fixed at bottom */}
      <MessageInput />
    </div>
  )
}

export default ChatContainer
