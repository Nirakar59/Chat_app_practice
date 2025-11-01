import { useState } from "react";
import HomeSidebar from "../components/HomeSidebar";
import MyGuilds from "../components/MyGuilds";
import OngoingStreams from "../components/OngoingStreams";
import Friends from "../components/Friends";

const HomePage = () => {
  const [activePage, setActivePage] = useState("streams");
  

  return (
    
    <div className="h-screen bg-base-200 flex">
      {/* Sidebar */}
      <HomeSidebar onNavigate={setActivePage} />

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-y-auto lg:ml-60">
        <div className="pt-14 lg:pt-4">
          {activePage === "streams" && <OngoingStreams />}
          {activePage === "guilds" && <MyGuilds />}
          {activePage === "friends" && <Friends />}
        </div>
      </div>
    </div>
  );
};

export default HomePage;