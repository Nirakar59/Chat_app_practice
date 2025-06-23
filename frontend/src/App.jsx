import { useEffect } from "react"
 import Layout from "./pages/Layout"
import { useAuthStore } from "./store/useAuthStore"
import { Loader } from 'lucide-react'


function App() {
  const { authUser, checkAuth, isCheckingAuth }  = useAuthStore()


  useEffect(()=>{
    checkAuth()
  },[checkAuth])

  if(!authUser && isCheckingAuth)
    return (
  <div className="flex items-center justify-center h-screen">
    <Loader className="size-10 animate-spin" />
  </div>
    )
  return (
    <>
    <Layout/>
    </>
  )
}

export default App
