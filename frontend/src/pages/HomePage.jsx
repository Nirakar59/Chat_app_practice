import { useState } from "react";
import HomeSidebar from "../components/HomeSidebar";
import Guilds from "../components/Guilds";

const HomePage = () => {
  const [activePage, setActivePage] = useState("streams");

  return (
    <div className="flex h-screen bg-base-200">
      <HomeSidebar onNavigate={setActivePage} />

      {/* Main Content */}
      <div className="flex-1 p-4 lg:ml-60 mt-12 lg:mt-0 overflow-y-auto">
        {activePage === "streams" && <h1>Ongoing Streams 🎮</h1>}
        {activePage === "guilds" && <div><Guilds/> </div>}
        {activePage === "friends" && <h1>Friends 👥</h1>}
      </div>
    </div>
  );
};

export default HomePage;
