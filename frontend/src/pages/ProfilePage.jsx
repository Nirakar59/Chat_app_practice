import React, { useState } from "react"
import { useAuthStore } from "../store/useAuthStore"
import { Camera, Mail, User, Calendar, Shield, Upload, Sparkles } from "lucide-react"

const ProfilePage = () => {
  const [selectedImage, setSelectedImage] = useState(null)
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore()

  const handleImage = (e) => {
    e.preventDefault()
    const img = e.target.files?.[0]
    if (!img) return

    const reader = new FileReader()
    reader.readAsDataURL(img)

    reader.onload = async () => {
      const base64imageUrl = reader.result
      setSelectedImage(base64imageUrl)
      await updateProfile({ profilePic: base64imageUrl })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-300 to-base-200 flex justify-center items-start py-12 px-4 overflow-y-auto relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-primary via-secondary to-accent p-1 rounded-3xl shadow-2xl mb-6">
          <div className="bg-base-100 rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-xl blur opacity-50" />
                <div className="relative bg-gradient-to-br from-primary to-secondary p-3 rounded-xl">
                  <Sparkles className="text-primary-content w-6 h-6" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  My Profile
                </h1>
                <p className="text-base-content/60 mt-1">
                  Manage your account settings
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Profile Picture */}
          <div className="md:col-span-1">
            <div className="bg-base-100 rounded-3xl p-6 shadow-xl border border-base-300">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                Profile Photo
              </h3>

              <div className="flex flex-col items-center space-y-4">
                {/* Avatar with Upload */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity" />
                  <div className="relative w-40 h-40 rounded-full ring-4 ring-base-100 overflow-hidden">
                    <img
                      src={selectedImage || authUser.profilePic || "/avatar.png"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                    {/* Upload Overlay */}
                    <label
                      htmlFor="picInput"
                      className={`
                        absolute inset-0 bg-black/50 backdrop-blur-sm 
                        flex flex-col items-center justify-center 
                        opacity-0 group-hover:opacity-100 
                        transition-all duration-300 cursor-pointer
                      `}
                    >
                      <Upload className="w-8 h-8 text-white mb-2" />
                      <span className="text-white text-sm font-semibold">
                        {isUpdatingProfile ? "Uploading..." : "Change Photo"}
                      </span>
                    </label>
                    <input
                      type="file"
                      id="picInput"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImage}
                      disabled={isUpdatingProfile}
                    />
                  </div>
                </div>

                {/* Upload Status */}
                {isUpdatingProfile ? (
                  <div className="flex items-center gap-2 text-primary">
                    <span className="loading loading-spinner loading-sm"></span>
                    <span className="text-sm font-medium">Uploading...</span>
                  </div>
                ) : (
                  <p className="text-xs text-center text-base-content/60 max-w-xs">
                    Click on the image to upload a new profile picture
                  </p>
                )}

                {/* Quick Stats */}
                <div className="w-full grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-primary/10 rounded-xl p-3 text-center">
                    <Shield className="w-5 h-5 text-primary mx-auto mb-1" />
                    <div className="text-xs font-semibold">Active</div>
                  </div>
                  <div className="bg-secondary/10 rounded-xl p-3 text-center">
                    <Calendar className="w-5 h-5 text-secondary mx-auto mb-1" />
                    <div className="text-xs font-semibold">Member</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-base-100 rounded-3xl p-6 shadow-xl border border-base-300">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-secondary" />
                Personal Information
              </h3>

              <div className="space-y-4">
                {/* Full Name */}
                <div className="bg-gradient-to-r from-primary/5 to-transparent rounded-2xl p-4 border border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-base-content/60 font-medium">Full Name</p>
                      <p className="text-lg font-semibold">{authUser.fullName}</p>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="bg-gradient-to-r from-secondary/5 to-transparent rounded-2xl p-4 border border-secondary/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                      <Mail className="w-5 h-5 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-base-content/60 font-medium">Email Address</p>
                      <p className="text-lg font-semibold truncate">{authUser.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="bg-base-100 rounded-3xl p-6 shadow-xl border border-base-300">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent" />
                Account Details
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Member Since */}
                <div className="bg-accent/5 rounded-2xl p-4 border border-accent/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-accent" />
                    <p className="text-xs font-semibold text-base-content/60">Member Since</p>
                  </div>
                  <p className="text-base font-bold">
                    {new Date(authUser.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                {/* Account Status */}
                <div className="bg-success/5 rounded-2xl p-4 border border-success/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-success" />
                    <p className="text-xs font-semibold text-base-content/60">Status</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                    <p className="text-base font-bold text-success">Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  )
}

export default ProfilePage