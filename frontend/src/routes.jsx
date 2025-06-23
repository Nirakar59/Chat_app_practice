import { createBrowserRouter, Outlet } from "react-router";
import App from "./App";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

const router = createBrowserRouter(
    [
        {
            path:"/",
            element: <App/>,
            children:[
                {
                    index: true,
                    element: <HomePage/>
                },
                {
                    path:"login",
                    element:<LoginPage/>
                },
                {
                    path:"signup",
                    element: <SignupPage/>
                },
                {
                    path:"settings",
                    element: <SettingsPage/>
                },
                {
                    path:"profile",
                    element:<ProfilePage/>
                }
            ]
        }
    ]
)

export default router