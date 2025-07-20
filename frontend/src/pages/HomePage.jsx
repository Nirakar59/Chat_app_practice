import React from 'react'
import { useMessageStore } from '../store/useMessageStore'
import Sidebar from '../components/Sidebar'
import ChatContainer from '../components/ChatContainer'
import NoChatSelected from '../components/Skeletions/NoChatSelected'

const HomePage = () => {
  const { selectedUser } = useMessageStore()

  return (
    <div className="h-screen overflow-hidden grid grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="h-full overflow-hidden">
        {selectedUser ? <ChatContainer /> : <NoChatSelected />}
      </div>
    </div>
  )
}

export default HomePage
