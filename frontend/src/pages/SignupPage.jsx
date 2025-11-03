import React, { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { Eye, EyeOff, Sparkles, Lock, Mail, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react'
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

  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: ''
  })

  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    password: false
  })

  const { signup, isSigningUp } = useAuthStore()

  // Validation functions
  const validateFullName = (name) => {
    if (!name.trim()) {
      return "Full name is required"
    }
    if (name.trim().length < 2) {
      return "Full name must be at least 2 characters"
    }
    if (name.trim().length > 50) {
      return "Full name must be less than 50 characters"
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      return "Full name can only contain letters and spaces"
    }
    return ""
  }

  const validateEmail = (email) => {
    if (!email) {
      return "Email is required"
    }

    // Check if email is in lowercase
    if (email !== email.toLowerCase()) {
      return "Email must be in lowercase"
    }

    // Email format: only letters/numbers before @, then domain
    const emailRegex = /^(?!\d+$)[a-z0-9]+@[a-z0-9]+\.[a-z]{2,}$/;
    if (!emailRegex.test(email)) {
      return "Email must contain only letters/numbers before @, be in lowercase, and have valid domain (e.g., user123@example.com)"
    }

    return ""
  }

  const validatePassword = (password) => {
    if (!password) {
      return "Password is required"
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters"
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter"
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter"
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number"
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return "Password must contain at least one special character"
    }
    return ""
  }

  // Handle input changes with validation
  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value })

    // Real-time validation
    let error = ""
    if (field === 'fullName') {
      error = validateFullName(value)
    } else if (field === 'email') {
      error = validateEmail(value)
    } else if (field === 'password') {
      error = validatePassword(value)
    }

    setErrors({ ...errors, [field]: error })
  }

  // Handle blur to mark field as touched
  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true })
  }

  // Final validation before submit
  const validateForm = () => {
    const fullNameError = validateFullName(formData.fullName)
    const emailError = validateEmail(formData.email)
    const passwordError = validatePassword(formData.password)

    setErrors({
      fullName: fullNameError,
      email: emailError,
      password: passwordError
    })

    setTouched({
      fullName: true,
      email: true,
      password: true
    })

    if (fullNameError) {
      toast.error(fullNameError)
      return false
    }
    if (emailError) {
      toast.error(emailError)
      return false
    }
    if (passwordError) {
      toast.error(passwordError)
      return false
    }

    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      signup(formData)
      navigate("/")
    }
  }

  // Helper to show error state
  const getInputClass = (field) => {
    if (touched[field] && errors[field]) {
      return "input input-bordered input-error w-full pl-12 focus:input-error"
    }
    if (touched[field] && !errors[field] && formData[field]) {
      return "input input-bordered input-success w-full pl-12 focus:input-success"
    }
    return "input input-bordered w-full pl-12 focus:input-primary transition-all"
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
                {touched.fullName && !errors.fullName && formData.fullName && (
                  <CheckCircle2 className="w-4 h-4 text-success" />
                )}
              </label>
              <div className="relative">
                <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                <input
                  type="text"
                  placeholder="John Doe"
                  className={getInputClass('fullName')}
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  onBlur={() => handleBlur('fullName')}
                />
                {touched.fullName && !errors.fullName && formData.fullName && (
                  <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-success" />
                )}
                {touched.fullName && errors.fullName && (
                  <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-error" />
                )}
              </div>
              {touched.fullName && errors.fullName && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.fullName}</span>
                </label>
              )}
            </div>

            {/* Email Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Email Address</span>
                {touched.email && !errors.email && formData.email && (
                  <CheckCircle2 className="w-4 h-4 text-success" />
                )}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                <input
                  type="email"
                  placeholder="user123@example.com"
                  className={getInputClass('email')}
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value.toLowerCase())}
                  onBlur={() => handleBlur('email')}
                />
                {touched.email && !errors.email && formData.email && (
                  <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-success" />
                )}
                {touched.email && errors.email && (
                  <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-error" />
                )}
              </div>
              {touched.email && errors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.email}</span>
                </label>
              )}
              {!errors.email && (
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Only letters/numbers before @, lowercase only
                  </span>
                </label>
              )}
            </div>

            {/* Password Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Password</span>
                {touched.password && !errors.password && formData.password && (
                  <CheckCircle2 className="w-4 h-4 text-success" />
                )}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  className={getInputClass('password')}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                />
                {formData.password && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/70 hover:text-base-content transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                )}
              </div>
              {touched.password && errors.password && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.password}</span>
                </label>
              )}
              {!errors.password && (
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
                  </span>
                </label>
              )}
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