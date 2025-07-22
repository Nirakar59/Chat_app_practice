import { useEffect } from "react"
 import Layout from "./pages/Layout"
import { useAuthStore } from "./store/useAuthStore"
import { Loader } from 'lucide-react'
import {Toaster} from "react-hot-toast"
import { useThemeStore } from "./store/useThemeStore"

function App() {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers }  = useAuthStore()
  const {theme} = useThemeStore()

  console.log(onlineUsers);
  


  useEffect(()=>{
    checkAuth()
  },[checkAuth])

  if (!authUser && isCheckingAuth)
    return (
  <div className="flex items-center justify-center h-screen">
    <Loader className="size-10 animate-spin" />
  </div>
    )
    

  return (
    <>
    <div data-theme={theme} >
    <Layout/>
    </div>

    <Toaster/>
    </>
  )
}

export default App
