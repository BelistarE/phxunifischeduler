import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

export default function Dashboard() {
  const [profile, setProfile] = useState({ full_name: "", role: "" });
  const [isPanelOpen, setIsPanelOpen] = useState(false); // State to manage panel visibility
  const [roles, setRoles] = useState({
    supervisor: false,
    driving: false,
    lm: false,
    push: false,
    tow: false,
  }); // State for roles

  // Function to determine the greeting based on the time of day
  const getGreeting = () => {
    const currentHour = new Date().getHours();

    if (currentHour < 12) {
      return "Good Morning";
    } else if (currentHour < 18) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
  };

  const greeting = getGreeting();
  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, role, title, driving, lm, push, tow")
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
      } else {
        setProfile(data);

        // Update roles state based on the fetched profile
        setRoles({
          admin: data.role === "admin",
          user: data.role === "user",
          supervisor: data.title === 1,
          driving: data.driving === 1,
          lm: data.lm === 1,
          push: data.push === 1,
          tow: data.tow === 1,
        });

        // Logging to verify if roles are correctly set
        console.log("Roles set:", {
          supervisor: data.title === 1,
          driving: data.driving === 1,
          lm: data.lm === 1,
          push: data.push === 1,
          tow: data.tow === 1,
        });
      }
    };

    fetchProfile();
  }, []);

  return (
    <div>
      <div className="top bg-slate-800 text-white p-4 shadow-lg flex justify-between items-center">
        <img
          src="/images/phx_unifi.png"
          alt="Logo"
          className="logo h-12 w-auto"
        />

        <button
          className="menu-button"
          onClick={() => setIsPanelOpen(!isPanelOpen)} // Toggle panel visibility
        >
          <img src="/icons/menu.png" alt="Menu" className="h-8 w-8" />
        </button>

        <div
          className={`side-panel fixed top-0 right-0 h-full w-64 bg-gray-100 text-white shadow-lg transition-transform duration-300 ${isPanelOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="bg-slate-800 flex">
            <button
              className="close-button absolute top-2 right-2 text-white"
              onClick={() => setIsPanelOpen(false)} // Close panel
            >
              <img src="/icons/close.png" alt="Menu" className="h-6 w-6" />
            </button>
            <div className="profile">
              <img
                src="/images/default-avatar.jpg"
                alt="Profile Picture"
                className="w-24 h-24 rounded-full object-cover"
              ></img>
              <div className="roles">
                {roles.admin && (
                  <div className="role-box bg-red-500 text-white p-2 m-2 rounded">
                    Admin
                  </div>
                )}
                <div className="flex flex-wrap">
                  {roles.supervisor && (
                    <div className="role-box bg-blue-500 text-white p-2 m-2 rounded">
                      Supervisor
                    </div>
                  )}
                  {roles.driving && (
                    <div className="role-box bg-green-500 text-white p-2 m-2 rounded">
                      Driving
                    </div>
                  )}
                  {roles.lm && (
                    <div className="role-box bg-yellow-500 text-white p-2 m-2 rounded">
                      LM
                    </div>
                  )}
                  {roles.push && (
                    <div className="role-box bg-red-500 text-white p-2 m-2 rounded">
                      Push
                    </div>
                  )}
                  {roles.tow && (
                    <div className="role-box bg-purple-500 text-white p-2 m-2 rounded">
                      Tow
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <p className="p-4">This is the content of the side panel.</p>
        </div>
      </div>
      <div className="flex flex-col items-center mt-4">
        <h1 className="text-2xl font-bold text-gray-800">
          {greeting}, {profile.full_name}
        </h1>
        <p>You are a {profile.role}</p>
      </div>
    </div>
  );
}
