import { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { LogOut, Settings, User, Menu, X } from 'lucide-react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  const { logout, authUser } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-base-100 shadow-md px-6 py-4 flex items-center justify-between h-16 min-h-[64px] box-border relative z-50">
      {/* Left: Logo */}
      <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
        <Link to="/">PlayVerse</Link>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-5">
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

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden text-base-content hover:text-primary transition duration-200"
        aria-label="Toggle menu"
      >
        {menuOpen ? <X size={26} /> : <Menu size={26} />}
      </button>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="absolute top-16 right-4 bg-base-100 shadow-lg rounded-2xl p-4 flex flex-col space-y-4 w-48 animate-fadeIn">
          <Link
            to="/settings"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 text-base-content hover:text-primary transition duration-200"
          >
            <Settings size={20} /> Settings
          </Link>

          {authUser && (
            <>
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-base-content hover:text-primary transition duration-200"
              >
                <User size={20} /> Profile
              </Link>

              <button
                onClick={() => {
                  logout()
                  setMenuOpen(false)
                }}
                className="flex items-center gap-2 text-base-content hover:text-error transition duration-200"
              >
                <LogOut size={20} /> Logout
              </button>
            </>
          )}
        </div>
      )}
    </header>
  )
}

export default Navbar