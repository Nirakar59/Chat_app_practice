import React from 'react'
import { useMessageStore } from '../store/useMessageStore'
import Sidebar from '../components/Sidebar'
import ChatContainer from '../components/ChatContainer'
import NoChatSelected from '../components/Skeletions/NoChatSelected'

const Messenger = () => {
  const { selectedUser } = useMessageStore()

  return (
    <div className="h-full w-full grid grid-cols-1 md:grid-cols-[280px_1fr] overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Chat Area */}
      <div className="flex flex-col h-full overflow-hidden">
        {selectedUser ? <ChatContainer /> : <NoChatSelected />}
      </div>
    </div>
  )
}

export default Messenger
