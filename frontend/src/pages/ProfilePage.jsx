import React, { useState } from "react"
import { useAuthStore } from "../store/useAuthStore"
import { Camera, Mail, User } from "lucide-react"

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
    <div className="min-h-screen bg-base-200 flex justify-center items-start py-12 px-4 overflow-y-auto">
      <div className="bg-base-100 shadow-xl rounded-box p-6 sm:p-10 max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-base-content">
            My Profile
          </h2>
          <p className="text-base-content/70 mt-2 text-sm sm:text-base">
            Info about your profile can be found here
          </p>
        </div>

        {/* Profile Picture Upload */}
        <div className="flex flex-col items-center space-y-3">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32">
            <img
              src={selectedImage || authUser.profilePic || "/avatar.png"}
              alt="Profile Pic"
              className="w-full h-full object-cover rounded-full border-4 border-primary shadow-md"
            />
            <label htmlFor="picInput">
              <div className="absolute bottom-0 right-0 bg-primary hover:bg-primary-focus p-2 rounded-full cursor-pointer transition">
                <Camera className="text-white" size={18} />
              </div>
              <input
                type="file"
                name="picInput"
                id="picInput"
                accept="image/*"
                className="hidden"
                onChange={handleImage}
                disabled={isUpdatingProfile}
              />
            </label>
          </div>
          <p className="text-xs sm:text-sm text-base-content/70 text-center">
            {isUpdatingProfile
              ? "Uploading..."
              : "Click the camera icon to update your profile picture"}
          </p>
        </div>

        {/* Profile Info */}
        <div className="space-y-4 text-base-content">
          <div className="flex items-center gap-3 bg-base-300 px-4 py-3 rounded-xl shadow-sm">
            <User className="text-primary" />
            <p className="text-base sm:text-lg font-medium">{authUser.fullName}</p>
          </div>
          <div className="flex items-center gap-3 bg-base-300 px-4 py-3 rounded-xl shadow-sm">
            <Mail className="text-primary" />
            <p className="text-base sm:text-lg font-medium">{authUser.email}</p>
          </div>
        </div>

        {/* Account Info Card */}
        <div className="mt-8 bg-base-300 rounded-2xl p-4 sm:p-6 shadow-md">
          <h2 className="text-base sm:text-lg font-semibold text-base-content mb-3 sm:mb-4">
            Account Information
          </h2>
          <div className="space-y-3 text-xs sm:text-sm text-base-content">
            <div className="flex items-center justify-between py-2 border-b border-base-200">
              <span className="font-medium">Member Since</span>
              <span>{authUser.createdAt?.split("T")[0]}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="font-medium">Account Status</span>
              <span className="text-success font-semibold">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
