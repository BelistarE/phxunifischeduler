import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

export default function Dashboard() {
  const [profile, setProfile] = useState({ full_name: "", role: "" });
  const [isPanelOpen, setIsPanelOpen] = useState(false); // State to manage panel visibility
  const [loading, setLoading] = useState(true); // State to track loading status
  const [roles, setRoles] = useState({
    supervisor: false,
    driving: false,
    lm: false,
    push: false,
    tow: false,
  }); // State for roles
  const [shifts, setShifts] = useState([]);
  const [userId, setUserId] = useState(null);

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

    const fetchUserAndShifts = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error getting user:", userError);
        return;
      }

      setUserId(user.id);

      const { data: shiftsData, error: shiftsError } = await supabase
        .from("shifts")
        .select("id, start_time, end_time, type, position")
        .eq("user_id", user.id)
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true });

      if (shiftsError) {
        console.error("Error fetching shifts:", shiftsError);
      } else {
        setShifts(shiftsData);
      }
    };

    const loadData = async () => {
      await fetchProfile();
      await fetchUserAndShifts();
      setLoading(false);
    };

    loadData();
  }, []);

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
          <div className="bg-slate-800 flex p-4">
            <button
              onClick={() => setIsPanelOpen(false)} // Close panel
              className="close-button absolute pt-4 pr-4 top-2 right-2 text-white"
              // Close panel
            >
              <img src="/icons/close.png" alt="Menu" className="h-6 w-6" />
            </button>
            <div className="profile">
              <img
                src="/images/default-avatar.jpg"
                alt="Profile Picture"
                className="w-24 h-24 rounded-full object-cover"
              ></img>
              <p className="font-semibold">{profile.full_name}</p>
              <div>
                {roles.admin && (
                  <div className="role-box text-red-500">Admin</div>
                )}
              </div>
              <p>Unifi Aviation, Phoenix</p>
              <div className="roles">
                <div className="flex flex-wrap">
                  {roles.supervisor && (
                    <div className="role-box text-white bg-red-500 border border-white font-medium rounded-lg text-sm px-1 py-1 text-center me-1 mb-1">
                      Supervisor
                    </div>
                  )}
                  {roles.driving && (
                    <div className="role-box text-white bg-emerald-500  border border-white  font-medium rounded-lg text-sm px-1 py-1 text-center me-1 mb-1">
                      Driving
                    </div>
                  )}
                  {roles.lm && (
                    <div className="role-box text-white bg-orange-500 border border-white font-medium rounded-lg text-sm px-1 py-1 text-center me-1 mb-1">
                      LM
                    </div>
                  )}
                  {roles.push && (
                    <div className="role-box text-white bg-blue-500 border border-white   font-medium rounded-lg text-sm px-1 py-1 text-center me-1 mb-1">
                      Push
                    </div>
                  )}
                  {roles.tow && (
                    <div className="role-box bg-purple-500 border border-white text-white p-2 m-2 rounded">
                      Tow
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="sidepanel-content p-4 flex flex-col items-center">
            <div className="flex flex-col space-y-4 w-full max-w-sm p-6">
              {["Help", "Bug Report", "Dashboard", "Settings"].map(
                (text, index) => (
                  <button
                    key={index}
                    className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 "
                  >
                    {text}
                  </button>
                )
              )}
            </div>
            <button
              onClick={() => {
                supabase.auth.signOut().then(() => {
                  window.location.href = "/login"; // Redirect to login page
                });
              }}
              className="logout bg-red-600 text-white font-medium text-center rounded-sm me-1 mb-1 px-1 py-1"
            >
              <span>Logout</span>
              <div className="ml-1 transition group-hover:translate-x-1">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                >
                  <path
                    d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center m-4">
        <h1 className="text-xl font-bold text-gray-800 w-full whitespace-nowrap self-center justify-self-center text-center">
          {greeting}, {profile.full_name}!
        </h1>
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
                const formattedDate = startDate.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                }); // Format date without the year
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
        <div className="bg-white shadow-md rounded-lg m-4 p-4 w-full max-w-md flex flex-col">
          <p className="text-gray-800 text-lg font-semibold mb-2 mt-2 p-2">
            Shifts available on the trade board
          </p>
          <button className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 :focusring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2">
            see all available shifts
          </button>
        </div>
        <div className="bg-white shadow-md rounded-lg p-4 mt-4 w-full max-w-md flex flex-col">
          <button className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 ">
            everyone's schedule
          </button>
          <button
            onClick={() => (window.location.href = "/on-now")}
            className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 "
          >
            see who is scheduled right now
          </button>
          <button className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 ">
            request time off
          </button>
          <button className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 ">
            view staff list
          </button>
          <button className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 ">
            choose times I prefer to work
          </button>
          <button className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 ">
            Supervisor contact information
          </button>
        </div>
      </div>
    </div>
  );
}
