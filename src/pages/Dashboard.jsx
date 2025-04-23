import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";

import CurrentShift from "../components/CurrentShift";
import { useLocation } from "react-router-dom";
import AdminPanel from "../components/AdminPanel";
import MainHeader from "../components/MainHeader";
import { useAuth } from "../contexts/UserContext";
export default function Dashboard() {
  const navigate = useNavigate();
  const [isPanelOpen, setIsPanelOpen] = useState(false); // State to manage panel visibility
  const [roles, setRoles] = useState({
    supervisor: false,
    driving: false,
    lm: false,
    push: false,
    tow: false,
  }); // State for roles
  const [userId, setUserId] = useState(null);
  const [admin, setAdmin] = useState(false); // State for admin status

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
  const { user, profile, shifts, currentShift, loading } = useAuth();

  const Divider = () => (
    <div className="border-b border-gray-400 my-1 ml-8 mr-4" />
  );
  if (loading) {
    // Render loading screen while fetching data
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div role="status">
          <svg
            aria-hidden="true"
            className="inline w-18 h-18 text-gray-200 animate-spin dark:text-gray-600 fill-green-500"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-4 text-gray-700">Loading...</p>
      </div>
    );
  }
  return (
    <div className="h-screen flex flex-col">
      {/* Overlay to block clicks outside the side panel */}
      {isPanelOpen && (
        <div
          className="fixed inset-0 bg-black opacity-0 z-40"
          onClick={() => setIsPanelOpen(false)} // Close the panel when clicking the overlay
        ></div>
      )}
      <MainHeader />
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setIsPanelOpen(false); // Close the panel if clicked outside
          }
        }}
        className={`flex flex-row items-center justify-center overflow-y-auto w-full
        }`}
      >
        <div className="max-w-400 w-full h-full p-4 grid grid-cols-1 justify-items-center gap-4 md:grid-cols-2 lg:grid-cols-3 items-start ">
          <h1 className="text-xl font-bold text-gray-800 w-full whitespace-nowrap self-center justify-self-center text-center col-span-full">
            {greeting}, {profile.full_name}!
          </h1>
          <div className="w-full max-w-md">
            {profile.role === "admin" && <AdminPanel />}
          </div>
          <div className="w-full max-w-md">
            <CurrentShift currentShift={currentShift} />
            <div className="bg-white shadow-md rounded-lg p-4 mt-4 w-full max-w-md">
              <h2 className="text-lg font-semibold mb-2">My upcoming shifts</h2>
              {shifts.length === 0 ? (
                <p>No upcoming shifts.</p>
              ) : (
                <ul className="space-y-4">
                  {shifts.map((shift) => {
                    const startDate = new Date(shift.start_time); // Convert start_time to Date object
                    const endDate = new Date(shift.end_time); // Convert end_time to Date object
                    const dayOfWeek = startDate.toLocaleDateString("en-US", {
                      weekday: "long",
                    }); // Get day of the week
                    const formattedDate = startDate.toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        day: "numeric",
                      }
                    ); // Format date without the year
                    const startTime = startDate.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    }); // Format start time
                    const endTime = endDate.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    }); // Format end time

                    return (
                      <li
                        key={shift.id}
                        className="bg-white p-4 rounded-lg shadow-md border border-gray-200"
                      >
                        <p className="text-lg font-semibold text-gray-800">
                          {dayOfWeek}, {formattedDate}
                        </p>
                        <p className="text-gray-600">{shift.position}</p>
                        <p className="text-gray-800">
                          {startTime} - {endTime}
                        </p>
                        <p className="text-gray-600">{shift.type}</p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
          <div className="w-full max-w-md">
            <div className="bg-white shadow-md rounded-lg mt-4 p-4 w-full max-w-md flex flex-col">
              <p className="text-gray-800 text-lg font-semibold mb-2 mt-2 p-2">
                Shifts available on the trade board
              </p>
              <button
                onClick={() => navigate("/available-shifts")}
                className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 :focusring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
              >
                see all available shifts
              </button>
            </div>
            <div className="bg-white shadow-md rounded-lg p-4 mt-4 w-full max-w-md flex flex-col">
              <button
                onClick={() => (window.location.href = "/on-now")}
                className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 "
              >
                see who is scheduled right now
              </button>
              <button
                onClick={() => navigate("/schedule")}
                className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 "
              >
                everyone's schedule
              </button>

              <button
                onClick={() => navigate("/request-time-off")}
                className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 "
              >
                request time off
              </button>
              <button
                onClick={() => navigate("/staff-list")}
                className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 "
              >
                view staff list
              </button>
              <button
                onClick={() => navigate("/settings")}
                className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 "
              >
                choose times I prefer to work
              </button>
              <button
                onClick={() => navigate("/contact-info")}
                className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 "
              >
                Supervisor contact information
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
