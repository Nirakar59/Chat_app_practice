import { Outlet } from "react-router";
import Navbar from "../components/Navbar";

const Layout = () => {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Navbar stays always visible */}
      <Navbar />

      {/* Page content takes remaining space and is scrollable */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
