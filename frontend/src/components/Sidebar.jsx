import React, { useEffect, useState } from 'react'
import { useMessageStore } from '../store/useMessageStore'
import SidebarSkeleton from './Skeletions/SidebarSkeletion'
import { Users, Menu, X } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'

const Sidebar = () => {
  const { users, isLoadinUsers, getUsers, selecteduser, setSelectedUser } = useMessageStore()
  const { onlineUsers } = useAuthStore()
  const [showOnlineOnly, setShowOnlineOnly] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    getUsers()
  }, [getUsers])

  const filteredUsers = showOnlineOnly ? users.filter(user => onlineUsers.includes(user._id)) : users

  if (isLoadinUsers) return <SidebarSkeleton />

  return (
    <>
      {/* Mobile menu toggle button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden fixed top-10 left-4 z-50 p-2 bg-base-100 rounded-lg shadow-md"
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar container */}
      <aside className={`
        bg-base-100 border-r border-base-300 h-full fixed md:relative z-40 transition-transform duration-300
        top-16 md:top-0
        ${menuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:flex md:flex-col w-72 md:w-72
      `}>
        <div className="border-b border-base-300 w-full p-5">
          <div className="flex items-center gap-2">
            <Users className='size-6' />
            <span className="font-medium hidden lg:block">Contacts</span>
          </div>
        </div>

        {/* Online filter toggle */}
        <div className="mt-3 hidden lg:flex items-center gap-2 px-5">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
        </div>

        {/* Users list */}
        <div className="overflow-y-auto w-full py-3 px-2 md:px-5 flex-1">
          {filteredUsers.map((user) => (
            <button
              key={user._id}
              onClick={() => { setSelectedUser(user); setMenuOpen(false) }}
              className={`
                w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors rounded-lg
                ${selecteduser?._id === user._id ? 'bg-base-300 ring-1 ring-base-300' : ''}
              `}
            >
              <div className="relative mx-auto lg:mx-0">
                <img
                  src={user.profilePic || '/avatar.png'}
                  alt={user.fullName}
                  className='size-12 object-cover rounded-full'
                />
                {onlineUsers.includes(user._id) && (
                  <span className='absolute bottom-0 right-1 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900' />
                )}
              </div>

              {/* User info for larger screens */}
              <div className="hidden lg:block text-left min-w-0">
                <div className="font-medium truncate">{user.fullName}</div>
                <div className="text-sm text-zinc-400">{onlineUsers.includes(user._id) ? 'Online' : 'Offline'}</div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {menuOpen && <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setMenuOpen(false)} />}
    </>
  )
}

export default Sidebar
