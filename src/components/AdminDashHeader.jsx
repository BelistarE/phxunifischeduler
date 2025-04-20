import { Link, useLocation } from "react-router-dom";
import React, { useState } from "react";
const navItems = [
  { name: "Schedule Overview", path: "/admin" },
  { name: "Manage Schedules", path: "/admin/manage-schedules" },
  { name: "Time Off Requests", path: "/time-off-requests" },
  { name: "Manage Users", path: "/admin/users" },
  { name: "Back to Dashboard", path: "/" },
];

const AdminDashHeader = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      {/* Top bar */}
      <header className="bg-gray-400 w-full shadow-md flex flex-col">
        <div className="bg-frontier-dark h-2 w-full"></div>

        <nav className="flex items-center justify-between mb-2">
          {/* Logo */}
          <img
            src="/images/logo.png"
            alt="Company Logo"
            className="h-12 w-auto cursor-pointer"
            onClick={() => (window.location.href = "/")}
          />

          {/* Hamburger (mobile only) */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(true)}
            aria-label="Open menu"
          >
            <img src="/icons/menu.png" alt="Menu" className="h-8 w-8" />
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-4">
            {navItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-4 py-2 pt-4 font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-frontier-dark text-white shadow-lg rounded-bl-lg rounded-br-lg"
                      : "text-frontier-dark hover:bg-frontier-dark hover:text-white rounded-bl-lg rounded-br-lg"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden`}
      >
        {/* Close Button */}
        <button
          className="absolute top-4 right-4"
          onClick={() => setIsOpen(false)}
        >
          <img src="/icons/close.png" alt="Close" className="h-6 w-6" />
        </button>

        {/* Sidebar content */}
        <div className="mt-16 flex flex-col gap-4 px-4">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2 font-medium transition-all duration-200 rounded ${
                  isActive
                    ? "bg-frontier-dark text-white"
                    : "text-gray-200 hover:bg-frontier-dark"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default AdminDashHeader;
