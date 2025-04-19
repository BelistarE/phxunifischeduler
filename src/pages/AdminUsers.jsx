import UsersPage from "../components/Users";
import AdminPanel from "../components/AdminPanel";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import Loading from "../components/Loading";
import AddUser from "../components/AddUser";
import AdminDashHeader from "../components/AdminDashHeader";
//import RemoveUser from "../components/RemoveUser";
// Importing icons from lucide-react
import {
  Menu,
  Users,
  UserPlus,
  UserMinus,
  Settings,
  CalendarClock,
  Search,
  ArrowLeft,
} from "lucide-react";

const AdminUsers = () => {
  const [loading, setLoading] = useState(false); // State to track loading status
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const navigate = useNavigate(); // Hook to programmatically navigate
  if (loading) {
    // Render loading screen while fetching data
    return (
      <div>
        <Loading />
      </div>
    );
  }
  const SidebarItem = ({ icon, label, onClick }) => {
    return (
      <div
        onClick={onClick}
        className="flex items-center px-5 py-4  rounded-md cursor-pointer hover:bg-frontier-lighter  transition-colors text-gray-800 hover:frontier-dark font-large"
      >
        <span className="mr-2">{icon}</span>
        {label}
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Dark Overlay and AddUser Modal */}
      {isAddUserOpen && (
        <>
          {/* Dark Background Overlay */}
          <div
            className="fixed inset-0 bg-black opacity-60 z-40"
            onClick={() => setIsAddUserOpen(false)} // Close modal on overlay click
          ></div>

          {/* AddUser Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-6 w-96">
              <AddUser />
              <button
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => setIsAddUserOpen(false)} // Close modal on button click
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-gray-300  p-4 transition-transform duration-300 ease-in-out 
            md:static md:translate-x-0 md:flex-shrink-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} rounded-tr-lg rounded-br-lg`}
      >
        <div className="mb-8 flex items-center space-x-2 px-2">
          <Users className="text-gray-800" />
          <h1 className="text-xl font-semibold text-gray-800">Manage Users</h1>
        </div>
        <nav className="space-y-2 text-sm">
          <SidebarItem
            icon={<CalendarClock size={18} />}
            label="Manage Schedules"
          />
          <SidebarItem icon={<Search size={18} />} label="Sort By" />
          <div className="rounded-md bg-gray-700 flex flex-col justify-center ">
            <div
              className="flex items-center px-5 py-4 cursor-pointer text-bold text-gray-300 hover:bg-frontier-lighter transition-colors rounded-t-md hover:text-gray-700"
              onClick={() => setIsAddUserOpen(true)}
            >
              <span className="mr-2">{<UserPlus size={18} />}</span>
              Add a User
            </div>

            <div className="flex items-center px-5 py-4  cursor-pointer  text-red-300  hover:bg-red-400 rounded-b-md  transition-colors hover:text-gray-600">
              <span className="mr-2">{<UserMinus size={18} />}</span>
              Remove a User
            </div>
          </div>
          <SidebarItem icon={<Settings size={18} />} label="Settings" />
          <SidebarItem
            onClick={() => navigate(-1)}
            icon={<ArrowLeft size={18} />}
            label="Back"
          />
        </nav>
      </div>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black opacity-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Mobile header */}
        <div className="p-4 border-b flex items-center justify-between md:hidden bg-white">
          <button
            className="text-frontier focus:outline-none"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={26} />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">Admin Tools</h2>
          <button
            onClick={() => navigate(-1)}
            className="text-frontier focus:outline-none"
          >
            <ArrowLeft size={26} className="text-frontier" />
          </button>
        </div>

        {/* Main area */}
        <main className="flex-1 p-6">
          <UsersPage />
        </main>
      </div>
    </div>
  );
};

export default AdminUsers;
