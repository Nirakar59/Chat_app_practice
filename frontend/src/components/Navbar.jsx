import { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { LogOut, Settings, User, Menu, X, Gamepad2 } from 'lucide-react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  const { logout, authUser } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-gradient-to-r from-base-100 via-base-100 to-base-200 shadow-lg border-b border-base-300 px-4 sm:px-6 py-3 flex items-center justify-between h-16 min-h-[64px] box-border relative z-50 backdrop-blur-sm">
      {/* Left: Logo with Animation */}
      <Link to="/" className="flex items-center gap-2 group">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity" />
          <div className="relative bg-gradient-to-br from-primary to-secondary p-2 rounded-lg transform group-hover:scale-110 transition-transform duration-200">
            <Gamepad2 size={24} className="text-primary-content" />
          </div>
        </div>
        <span className="text-2xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent hidden sm:block group-hover:scale-105 transition-transform">
          PlayVerse
        </span>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-3">
        <Link
          to="/settings"
          className="btn btn-ghost btn-sm gap-2 hover:bg-base-200 hover:scale-105 transition-all duration-200 group"
          title="Settings"
        >
          <Settings size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          <span className="hidden lg:inline">Settings</span>
        </Link>

        {authUser && (
          <>
            <Link
              to="/profile"
              className="btn btn-ghost btn-sm gap-2 hover:bg-base-200 hover:scale-105 transition-all duration-200"
              title="Profile"
            >
              <User size={18} />
              <span className="hidden lg:inline">Profile</span>
            </Link>

            <button
              onClick={logout}
              className="btn btn-error btn-sm gap-2 hover:scale-105 transition-all duration-200 hover:shadow-lg"
              title="Logout"
            >
              <LogOut size={18} />
              <span className="hidden lg:inline">Logout</span>
            </button>
          </>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden btn btn-ghost btn-sm btn-circle hover:bg-base-200 hover:rotate-180 transition-all duration-300"
        aria-label="Toggle menu"
      >
        {menuOpen ? <X size={26} /> : <Menu size={26} />}
      </button>

      {/* Mobile Dropdown with Animation */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden animate-fade-in"
            onClick={() => setMenuOpen(false)}
          />

          {/* Menu */}
          <div className="absolute top-full right-4 mt-2 bg-base-100 shadow-2xl rounded-2xl p-3 flex flex-col gap-2 w-56 z-50 border border-base-300 animate-slide-down md:hidden">
            <Link
              to="/settings"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-base-200 transition-colors group"
            >
              <Settings size={20} className="text-primary group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-medium">Settings</span>
            </Link>

            {authUser && (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-base-200 transition-colors"
                >
                  <User size={20} className="text-secondary" />
                  <span className="font-medium">Profile</span>
                </Link>

                <div className="divider my-0" />

                <button
                  onClick={() => {
                    logout()
                    setMenuOpen(false)
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-error/10 text-error transition-colors font-medium"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </>
      )}

      {/* Custom Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </header>
  )
}

export default Navbar