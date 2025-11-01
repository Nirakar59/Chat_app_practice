import React, { useState, useEffect } from 'react'
import { useMessageStore } from '../store/useMessageStore'
import { useAuthStore } from '../store/useAuthStore'
import { MessageCircle, Search, ArrowLeft, Users, Mail } from 'lucide-react'
import ChatContainer from '../components/ChatContainer'
import MessageSkeleton from '../components/Skeletions/MessageSkeleton'
import { useNavigate } from 'react-router-dom'

const Messenger = () => {
  const navigate = useNavigate()
  const { selectedUser, users, getUsers, setSelectedUser, isLoadingUsers } = useMessageStore()
  const { onlineUsers } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [showSidebar, setShowSidebar] = useState(true)

  useEffect(() => {
    getUsers()
  }, [getUsers])

  // Auto-hide sidebar on mobile when chat is selected
  useEffect(() => {
    if (selectedUser && window.innerWidth < 768) {
      setShowSidebar(false)
    }
  }, [selectedUser])

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleBackToSidebar = () => {
    setShowSidebar(true)
    setSelectedUser(null)
  }

  return (
    <div className="h-full bg-base-200 flex overflow-hidden">
      {/* Sidebar - Hidden on mobile when chat is active */}
      <aside className={`
        ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 transition-transform duration-300 ease-in-out
        w-full md:w-80 lg:w-96 bg-base-100 border-r border-base-300
        flex flex-col absolute md:relative h-full z-20
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-base-300 bg-base-100 sticky top-0 z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Messages</h2>
                <p className="text-xs text-base-content/60">
                  {users.length} friend{users.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
            <input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-bordered w-full pl-10 input-sm"
            />
          </div>
        </div>

        {/* Friends List */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingUsers ? (
            <div className="flex justify-center items-center h-40">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              {searchQuery ? (
                <>
                  <Search className="w-16 h-16 text-base-content/20 mb-4" />
                  <p className="text-base-content/60">No friends found</p>
                </>
              ) : (
                <>
                  <Users className="w-16 h-16 text-base-content/20 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No Friends Yet</h3>
                  <p className="text-sm text-base-content/60 mb-4">
                    Add friends to start messaging
                  </p>
                  <button
                    onClick={() => navigate('/')}
                    className="btn btn-primary btn-sm"
                  >
                    Find Friends
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="divide-y divide-base-300">
              {filteredUsers.map((user) => {
                const isOnline = onlineUsers.includes(user._id)
                const isSelected = selectedUser?._id === user._id

                return (
                  <button
                    key={user._id}
                    onClick={() => {
                      setSelectedUser(user)
                      if (window.innerWidth < 768) setShowSidebar(false)
                    }}
                    className={`
                      w-full p-4 flex items-center gap-3 hover:bg-base-200 
                      transition-colors text-left
                      ${isSelected ? 'bg-primary/5 border-l-4 border-primary' : ''}
                    `}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="avatar">
                        <div className="w-12 h-12 rounded-full ring-2 ring-base-300">
                          <img
                            src={user.profilePic || '/avatar.png'}
                            alt={user.fullName}
                          />
                        </div>
                      </div>
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-success rounded-full border-2 border-base-100" />
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold truncate text-sm">
                          {user.fullName}
                        </h3>
                        {isOnline && (
                          <span className="text-xs text-success font-medium">
                            Online
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-base-content/60">
                        <Mail className="w-3 h-3" />
                        <p className="truncate">{user.email}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </aside>

      {/* Chat Area */}
      <main className={`
        flex-1 flex flex-col bg-base-200
        ${!selectedUser && !showSidebar ? 'hidden md:flex' : ''}
      `}>
        {selectedUser ? (
          <div className="flex flex-col h-full">
            {/* Mobile Back Button */}
            <div className="md:hidden bg-base-100 p-3 border-b border-base-300 flex items-center gap-3">
              <button
                onClick={handleBackToSidebar}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="font-semibold">Back to messages</span>
            </div>

            {/* Chat Container */}
            <div className="flex-1 overflow-hidden">
              <ChatContainer />
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="max-w-md">
              {/* Animated Icon */}
              <div className="relative mb-8">
                <div className="w-32 h-32 mx-auto bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                  <MessageCircle className="w-16 h-16 text-primary" />
                </div>
                <div className="absolute top-0 right-0 w-10 h-10 bg-secondary/20 rounded-full animate-bounce" />
                <div className="absolute bottom-0 left-0 w-8 h-8 bg-accent/20 rounded-full animate-bounce delay-150" />
              </div>

              {/* Welcome Text */}
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Welcome to Messenger
              </h2>
              <p className="text-base-content/60 mb-6">
                Select a friend from the sidebar to start chatting
              </p>

              {/* Stats */}
              <div className="flex justify-center gap-8 mt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{users.length}</div>
                  <div className="text-xs text-base-content/60">Friends</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">{onlineUsers.length-1}</div>
                  <div className="text-xs text-base-content/60">Online</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Overlay */}
      {!showSidebar && window.innerWidth < 768 && (
        <div
          onClick={handleBackToSidebar}
          className="md:hidden fixed inset-0 bg-black/30 z-10"
        />
      )}
    </div>
  )
}

export default Messenger