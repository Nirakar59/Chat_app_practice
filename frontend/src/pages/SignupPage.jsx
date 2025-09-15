import React, { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { Eye, EyeOff } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import AuthImagePattern from '../components/AuthImage'
import toast from 'react-hot-toast'

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  })

  const { signup, isSigningUp } = useAuthStore()

  const validateInput = () => {
    if (!formData.fullName.trim()) return toast.error("Full Name required!")
    if (!formData.email.trim()) return toast.error("Email required!")
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format")
    if (!formData.password) return toast.error("Password is required")
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters")
    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const success = validateInput()
    if (success) {
      signup(formData)
      navigate("/")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-base-200">
      <div className="rounded-box shadow-xl overflow-hidden max-w-5xl w-full grid md:grid-cols-2 bg-base-100">

        {/* Left Section - Auth Image */}
        <AuthImagePattern
          title="Join our community"
          subtitle="Connect with friends, share moments, and stay in touch with your loved ones"
        />

        {/* Right Section - Form */}
        <div className="p-8 sm:p-10">
          <h2 className="text-3xl font-extrabold text-base-content text-center mb-6">
            Create Your Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-base-content">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                placeholder="Will Smith"
                className="input input-bordered w-full mt-1"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>

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
                  className="input input-bordered w-full pr-12 mt-1"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-base-content"
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
            >
              {isSigningUp ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-base-content/70">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary font-semibold hover:underline transition"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
