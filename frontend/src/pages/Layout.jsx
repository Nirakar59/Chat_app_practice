import { Outlet } from "react-router";
import Navbar from "../components/Navbar";

const Layout = () => {
  return (
    <div className="h-screen flex flex-col">
      {/* Navbar stays always visible */}
      <Navbar />

      {/* Page content takes remaining space and is scrollable */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
