import { Navigate } from "react-router-dom"
import { useAuthStore } from "../store/useAuthStore"

export function ProtectedRoute({children}){
    const {authUser} = useAuthStore()

    return authUser? children : <Navigate to="/login" replace/>
}

export function ToHomePage({children}){
    const {authUser} = useAuthStore()

    return authUser? <Navigate to="/" replace/>: children
}