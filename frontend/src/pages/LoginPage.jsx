import React, { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { Eye, EyeOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import AuthImagePattern from '../components/AuthImage'
import toast from 'react-hot-toast'

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const { login, isLoggingIn } = useAuthStore()

  const validateInput = () => {
    if (!formData.email.trim()) return toast.error("Email required !!")
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");

    return true;
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const success = validateInput()
    if (success) login(formData)
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="bg-base-100 shadow-2xl rounded-box overflow-hidden max-w-5xl w-full grid md:grid-cols-2">

        {/* Left Section - Welcome or Image */}
        <AuthImagePattern
          title="Join our community"
          subtitle="Connect with friends, share moments, and stay in touch with your loved ones"
        />

        {/* Right Section - Login Form */}
        <div className="p-8 sm:p-10">
          <h2 className="text-3xl font-extrabold text-base-content text-center mb-6">
            Welcome Back
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-base-content">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                placeholder="willsmithy@gmail.com"
                className="input input-bordered w-full mt-1"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-base-content">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="********"
                  className="input input-bordered w-full mt-1 pr-12"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-base-content/70 hover:text-base-content"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
            >
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-base-content/70">
            Don't Have an Account?{' '}
            <Link
              to="/signup"
              className="text-primary font-semibold hover:underline transition"
            >
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
