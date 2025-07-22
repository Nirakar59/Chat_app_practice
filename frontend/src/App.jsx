import { useEffect } from "react"
import Layout from "./pages/Layout"
import { useAuthStore } from "./store/useAuthStore"
import { Loader } from 'lucide-react'
import { Toaster } from "react-hot-toast"
import { useThemeStore } from "./store/useThemeStore"

function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore()
  const { theme } = useThemeStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Apply theme to <html> tag
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  if (!authUser && isCheckingAuth)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    )

  return (
    <>
      <Layout />
      <Toaster />
    </>
  )
}

export default App
