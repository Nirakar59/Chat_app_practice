import { createBrowserRouter } from "react-router";
import App from "./App";
import Messenger from "./pages/Messenger";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import { ProtectedRoute, ToHomePage } from "./components/protectedRoute";
import HomePage from "./pages/HomePage";
import AllGuilds from "./pages/AllGuilds";
import GuildPage from "./pages/GuildPage";
import GuildChat from "./pages/GuildChat";
import StreamerPage from "./pages/StreamerPage";
import StreamViewerPage from "./pages/StreamViewerPage";


const router = createBrowserRouter(
    [
        {
            path: "/",
            element: <App />,
            children: [
                {
                    index: true,
                    element: (
                        <ProtectedRoute>
                            <HomePage />
                        </ProtectedRoute>
                    )
                },
                {
                    path: "stream/start",
                    element: (
                        <ProtectedRoute>
                            <StreamerPage />
                        </ProtectedRoute>
                    )
                },
                {
                    path: "stream/:streamId",
                    element: (
                        <ProtectedRoute>
                            <StreamViewerPage />
                        </ProtectedRoute>
                    )
                },
                {
                    path: ":guildName",
                    element: (
                        <ProtectedRoute>
                            <GuildPage />
                        </ProtectedRoute>
                    )
                },
                {
                    path: ":guildName/guildchat",
                    element: (
                        <ProtectedRoute>
                            <GuildChat />
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
                    )
                },

                {
                    path: "login",
                    element: (
                        <ToHomePage>
                            <LoginPage />
                        </ToHomePage>
                    )
                },
                {
                    path: "signup",
                    element: <SignupPage />
                },
                {
                    path: "settings",
                    element: <SettingsPage />
                },
                {
                    path: "profile",
                    element: (
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    )
                }
            ]
        }
    ]
)

export default router