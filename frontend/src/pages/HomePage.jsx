import React from 'react'
import { useAuthStore } from '../store/useAuthStore'

const HomePage = () => {

  const {logout} = useAuthStore()

  const handleClick = ()=>{
    logout()
  }
  return (
    <div>HomePage
      <button onClick={handleClick} >
        logout
      </button>
    </div>
  )
}

export default HomePage