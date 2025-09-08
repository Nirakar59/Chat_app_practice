import { createBrowserRouter } from "react-router";
import App from "./App";
import Messenger from "./pages/Messenger";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import {ProtectedRoute, ToHomePage} from "./components/protectedRoute";
import HomePage from "./pages/HomePage";
import AllGuilds from "./pages/AllGuilds";
import GuildPage from "./pages/GuildPage";


const router = createBrowserRouter(
    [
        {
            path:"/",
            element: <App/>,
            children:[
                {
                    index: true,
                    element: (
                        <ProtectedRoute>
                            <HomePage/>
                        </ProtectedRoute>
                    )
                },
                {
                    path: ":guildName",
                    element:(
                        <ProtectedRoute>
                            <GuildPage/>
                        </ProtectedRoute>
                    )
                },
                {
                    path: "messenger",
                    element: (
                        <ProtectedRoute>
                            <Messenger />
                        </ProtectedRoute>
                    )
                },
                {
                    path: "guilds",
                    element: (
                        <ProtectedRoute>
                            <AllGuilds />
                        </ProtectedRoute>
                    ),
                    children:[
                        {
                            path: ":id",
                            element: (
                                <ProtectedRoute>
                                    <GuildPage />
                                </ProtectedRoute>
                            )
                        }
                    ]
                },
                
                {
                    path:"login",
                    element:(
                        <ToHomePage>
                            <LoginPage/>
                        </ToHomePage>
                    )
                },
                {
                    path:"signup",
                    element: <SignupPage/>
                },
                {
                    path:"settings",
                    element:<SettingsPage/>
                },
                {
                    path:"profile",
                    element:(
                        <ProtectedRoute>
                            <ProfilePage/>
                        </ProtectedRoute>
                    )
                }
            ]
        }
    ]
)

export default router