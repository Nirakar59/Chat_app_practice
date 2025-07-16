import { useAuthStore } from '../store/useAuthStore'
import { LogOut, Settings, User } from 'lucide-react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  const { logout, authUser } = useAuthStore()

  return (
    <header className="bg-base-100 shadow-md px-6 py-4 flex items-center justify-between">
      {/* Left: Logo */}
      <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
        <Link to="/">Chatty</Link>
      </div>

      {/* Right: Navigation */}
      <div className="flex items-center space-x-5">
        <Link
          to="/settings"
          className="text-base-content hover:text-primary transition duration-200"
          title="Settings"
        >
          <Settings size={22} />
        </Link>

        {authUser && (
          <>
            <Link
              to="/profile"
              className="text-base-content hover:text-primary transition duration-200"
              title="Profile"
            >
              <User size={22} />
            </Link>

            <button
              onClick={logout}
              className="text-base-content hover:text-error transition duration-200"
              title="Logout"
            >
              <LogOut size={22} />
            </button>
          </>
        )}
      </div>
    </header>
  )
}

export default Navbar
