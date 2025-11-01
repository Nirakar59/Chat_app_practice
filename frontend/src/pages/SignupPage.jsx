import React, { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { Eye, EyeOff, Sparkles, Lock, Mail, UserPlus } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
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
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-300 to-base-200 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="bg-base-100 shadow-2xl rounded-3xl overflow-hidden max-w-5xl w-full grid md:grid-cols-2 relative z-10 border border-base-300">
        {/* Left Section - Auth Image */}
        <AuthImagePattern
          title="Join PlayVerse!"
          subtitle="Create your account and start connecting with friends around the world"
        />

        {/* Right Section - Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
          {/* Logo & Title */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-xl blur opacity-50" />
              <div className="relative bg-gradient-to-br from-primary to-secondary p-3 rounded-xl">
                <Sparkles className="text-primary-content w-6 h-6" />
              </div>
            </div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              PlayVerse
            </h1>
          </div>

          <h2 className="text-2xl font-bold text-center mb-2">
            Create Account
          </h2>
          <p className="text-center text-base-content/60 mb-8">
            Fill in your details to get started
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Full Name</span>
              </label>
              <div className="relative">
                <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                <input
                  type="text"
                  placeholder="John Doe"
                  className="input input-bordered w-full pl-12 focus:input-primary transition-all"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Email Address</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="input input-bordered w-full pl-12 focus:input-primary transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Password</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  className="input input-bordered w-full pl-12 pr-12 focus:input-primary transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/70 hover:text-base-content transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  Must be at least 6 characters
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSigningUp}
              className="btn btn-primary w-full gap-2 text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              {isSigningUp ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider my-6">OR</div>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-sm text-base-content/70">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-primary hover:text-primary/80 hover:underline transition-all"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .delay-1000 {
          animation-delay: 1s;
        }
        .delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  )
}

export default SignupPage