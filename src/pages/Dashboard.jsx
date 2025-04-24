import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const links = [
    { name: "Overview", path: "" },
    { name: "Students", path: "students" },
    { name: "Rooms", path: "rooms" },
    { name: "Complaints", path: "complaints" },
    { name: "Announcements", path: "announcements" },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Determine if a link is active
  const isActive = (path) => {
    const currentPath = location.pathname.split("/").pop();
    return path === currentPath || (path === "" && currentPath === "dashboard");
  };

  return (
    <div className="flex flex-col h-screen md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-gray-800 text-white p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Warden Panel</h2>
        <button
          onClick={toggleSidebar}
          className="text-white focus:outline-none"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar - responsive */}
      <aside
        className={`
          ${sidebarOpen ? "flex" : "hidden"} 
          md:flex flex-col w-full md:w-64 bg-gray-800 text-white p-4 
          fixed md:static inset-0 z-20 overflow-y-auto
        `}
      >
        {/* Only show this title on desktop, as we already have it in the mobile header */}
        <h2 className="text-2xl font-bold mb-6 hidden md:block">
          Warden Panel
        </h2>

        <ul className="space-y-3">
          {links.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`block p-2 rounded hover:bg-gray-700 ${
                  isActive(link.path) ? "bg-gray-700" : ""
                }`}
                onClick={closeSidebar}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Close button only on mobile */}
        <button
          className="mt-8 p-2 bg-gray-700 rounded text-white md:hidden"
          onClick={closeSidebar}
        >
          Close Menu
        </button>
      </aside>

      {/* Overlay to close sidebar when clicking outside (mobile only) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 bg-gray-100 overflow-y-auto pt-4">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
