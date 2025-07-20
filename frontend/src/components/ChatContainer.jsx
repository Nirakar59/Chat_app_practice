import React, { useEffect } from 'react'
import { useMessageStore } from '../store/useMessageStore'
import MessageInput from './MessageInput'
import ChatHeader from './ChatHeader'
import MessageSkeleton from './Skeletions/MessageSkeleton'

const ChatContainer = () => {

  const { isLoadingMessages, selectedUser, messages, getmessage, setSelectedUser } = useMessageStore()

  useEffect(()=>{
    getmessage(selectedUser._id)
  },[getmessage, selectedUser])

  if(isLoadingMessages) return(
    <div className="felx flex-1, flex-col, overflow-auto">
      <ChatHeader/>
      <MessageSkeleton/>
    </div>
  )

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <ChatHeader/>
      <p>messages...</p>
      <MessageInput/>
    </div>
  )
}

export default ChatContainer