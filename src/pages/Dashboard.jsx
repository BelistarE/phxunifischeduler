import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";
import AboutPanel from "../components/AboutPanel";
import CurrentShift from "../components/CurrentShift";
import { useLocation } from "react-router-dom";
import AdminPanel from "../components/AdminPanel";

export default function Dashboard() {
  const navigate = useNavigate();
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
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [currentShift, setCurrentShift] = useState(null);
  const location = useLocation(); // Get the current location

  const isActive = (path) => location.pathname === path; // Check if the current path matches

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
        .gte("end_time", new Date().toISOString())

        .order("end_time", { ascending: true });

      if (shiftsError) {
        console.error("Error fetching shifts:", shiftsError);
      } else {
        const nowUTC = new Date();

        // Find the current shift
        const current = shiftsData.find((shift) => {
          const startTimeUTC = new Date(shift.start_time);
          const endTimeUTC = new Date(shift.end_time);

          const startTime = new Date(
            startTimeUTC.toLocaleString("en-US", {
              timeZone: "America/Phoenix",
            })
          );
          const endTime = new Date(
            endTimeUTC.toLocaleString("en-US", { timeZone: "America/Phoenix" })
          );
          const now = new Date(
            nowUTC.toLocaleString("en-US", { timeZone: "America/Phoenix" })
          );

          return startTime <= now && endTime >= now;
        });

        setCurrentShift(current);

        // Filter out the current shift from upcoming shifts
        const upcomingShifts = current
          ? shiftsData.filter((shift) => shift.id !== current.id)
          : shiftsData;

        setShifts(upcomingShifts);
      }
    };

    const loadData = async () => {
      await fetchProfile();
      await fetchUserAndShifts();
      setLoading(false);
    };

    loadData();
  }, []);
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
      <div
        className={`top bg-slate-800 text-white p-4 shadow-lg flex justify-between items-center w-100${
          isPanelOpen ? "block" : "hidden"
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setIsPanelOpen(false); // Close the panel if clicked outside
          }
        }}
      >
        <img
          src="/images/phx_unifi.png"
          alt="Logo"
          className="logo h-15 w-auto "
        />

        <button
          className="menu-button"
          onClick={() => setIsPanelOpen(!isPanelOpen)} // Toggle panel visibility
        >
          <img src="/icons/menu.png" alt="Menu" className="h-8 w-8" />
        </button>

        <div
          className={`side-panel fixed top-0 right-0 h-full w-64 bg-button-main-light text-white shadow-lg transition-transform duration-300 z-50 ${
            isPanelOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="bg-theme-bg flex p-4">
            <button
              onClick={() => setIsPanelOpen(false)} // Close panel
              className="close-button absolute pt-4 pr-4 top-2 right-2 text-white"
            >
              <img src="/icons/close.png" alt="Close" className="h-6 w-6" />
            </button>
            <div className="profile">
              <img
                src="/images/default-avatar.jpg"
                alt="Profile Picture"
                className="w-24 h-24 rounded-full object-cover"
              ></img>
              <p className="font-semibold pt-4 text-lg truncate">
                {profile.full_name}
              </p>
              <div>
                {roles.admin && <div className="role-box text-impo">Admin</div>}
              </div>
              <p className="pb-4">Unifi Aviation, Phoenix</p>
              <div className="roles">
                <div className="flex flex-wrap">
                  {roles.supervisor && (
                    <div className="role-box text-gray-200 bg-impo font-medium rounded-lg text-sm p-1.5 text-center me-1 mb-1 ">
                      Supervisor
                    </div>
                  )}
                  {roles.driving && (
                    <div className="role-box text-gray-200 bg-button1   font-medium rounded-lg text-sm p-1.5 text-center me-1 mb-1">
                      Driving
                    </div>
                  )}
                  {roles.lm && (
                    <div className="role-box text-gray-200 bg-button2 font-medium rounded-lg text-sm p-1.5 text-center me-1 mb-1">
                      LM
                    </div>
                  )}
                  {roles.push && (
                    <div className="role-box text-gray-200 bg-button4  font-medium rounded-lg text-sm p-1.5 text-center me-1 mb-1">
                      Push
                    </div>
                  )}
                  {roles.tow && (
                    <div className="role-box bg-button3  text-gray-200 font-medium rounded-lg text-sm p-1.5 text-center me-1 mb-1">
                      Tow
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="sidepanel-content pt-4 flex flex-col items-left px-4 pl-0">
            <div className="mb-4">
              <p className="text-sm text-gray-400 uppercase mb-2 pl-4">Pages</p>
              <button
                className={`divider w-full flex justify-start items-center text-left px-3.5 py-2 text-button-text hover:bg-button-main-lighter ${
                  isActive("/")
                    ? "border-l-6 border-logout rounded-tr-md rounded-br-md"
                    : "rounded-md ml-8"
                }`}
                onClick={() => (window.location.href = "/")}
              >
                <svg
                  width="25px"
                  height="25px"
                  viewBox="0 -0.5 25 25"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12.5 11.75C12.9142 11.75 13.25 11.4142 13.25 11C13.25 10.5858 12.9142 10.25 12.5 10.25V11.75ZM5.5 10.25C5.08579 10.25 4.75 10.5858 4.75 11C4.75 11.4142 5.08579 11.75 5.5 11.75V10.25ZM12.5 10.25C12.0858 10.25 11.75 10.5858 11.75 11C11.75 11.4142 12.0858 11.75 12.5 11.75V10.25ZM19.5 11.75C19.9142 11.75 20.25 11.4142 20.25 11C20.25 10.5858 19.9142 10.25 19.5 10.25V11.75ZM11.75 11C11.75 11.4142 12.0858 11.75 12.5 11.75C12.9142 11.75 13.25 11.4142 13.25 11H11.75ZM13.25 5C13.25 4.58579 12.9142 4.25 12.5 4.25C12.0858 4.25 11.75 4.58579 11.75 5H13.25ZM6.25 11C6.25 10.5858 5.91421 10.25 5.5 10.25C5.08579 10.25 4.75 10.5858 4.75 11H6.25ZM20.25 11C20.25 10.5858 19.9142 10.25 19.5 10.25C19.0858 10.25 18.75 10.5858 18.75 11H20.25ZM4.75 11C4.75 11.4142 5.08579 11.75 5.5 11.75C5.91421 11.75 6.25 11.4142 6.25 11H4.75ZM12.5 5.75C12.9142 5.75 13.25 5.41421 13.25 5C13.25 4.58579 12.9142 4.25 12.5 4.25V5.75ZM18.75 11C18.75 11.4142 19.0858 11.75 19.5 11.75C19.9142 11.75 20.25 11.4142 20.25 11H18.75ZM12.5 4.25C12.0858 4.25 11.75 4.58579 11.75 5C11.75 5.41421 12.0858 5.75 12.5 5.75V4.25ZM12.5 10.25H5.5V11.75H12.5V10.25ZM12.5 11.75H19.5V10.25H12.5V11.75ZM13.25 11V5H11.75V11H13.25ZM4.75 11V15H6.25V11H4.75ZM4.75 15C4.75 17.6234 6.87665 19.75 9.5 19.75V18.25C7.70507 18.25 6.25 16.7949 6.25 15H4.75ZM9.5 19.75H15.5V18.25H9.5V19.75ZM15.5 19.75C18.1234 19.75 20.25 17.6234 20.25 15H18.75C18.75 16.7949 17.2949 18.25 15.5 18.25V19.75ZM20.25 15V11H18.75V15H20.25ZM6.25 11V9H4.75V11H6.25ZM6.25 9C6.25 7.20507 7.70507 5.75 9.5 5.75V4.25C6.87665 4.25 4.75 6.37665 4.75 9H6.25ZM9.5 5.75H12.5V4.25H9.5V5.75ZM20.25 11V9H18.75V11H20.25ZM20.25 9C20.25 6.37665 18.1234 4.25 15.5 4.25V5.75C17.2949 5.75 18.75 7.20507 18.75 9H20.25ZM15.5 4.25H12.5V5.75H15.5V4.25Z"
                    fill="#curentColor"
                  />
                </svg>
                <p className="pl-2">Dashboard</p>
              </button>
              <Divider />
              <button
                className={`divider w-full flex justify-start items-center text-left px-3.5 py-2 text-button-text hover:bg-button-main-lighter ${
                  isActive("/settings")
                    ? "border-l-6 border-logout rounded-tr-md rounded-br-md "
                    : "rounded-md ml-2"
                }`}
                onClick={() => (window.location.href = "/settings")}
              >
                <svg
                  width="20px"
                  height="20px"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 8.25C9.92894 8.25 8.25 9.92893 8.25 12C8.25 14.0711 9.92894 15.75 12 15.75C14.0711 15.75 15.75 14.0711 15.75 12C15.75 9.92893 14.0711 8.25 12 8.25ZM9.75 12C9.75 10.7574 10.7574 9.75 12 9.75C13.2426 9.75 14.25 10.7574 14.25 12C14.25 13.2426 13.2426 14.25 12 14.25C10.7574 14.25 9.75 13.2426 9.75 12Z"
                    fill="currentColor"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M11.9747 1.25C11.5303 1.24999 11.1592 1.24999 10.8546 1.27077C10.5375 1.29241 10.238 1.33905 9.94761 1.45933C9.27379 1.73844 8.73843 2.27379 8.45932 2.94762C8.31402 3.29842 8.27467 3.66812 8.25964 4.06996C8.24756 4.39299 8.08454 4.66251 7.84395 4.80141C7.60337 4.94031 7.28845 4.94673 7.00266 4.79568C6.64714 4.60777 6.30729 4.45699 5.93083 4.40743C5.20773 4.31223 4.47642 4.50819 3.89779 4.95219C3.64843 5.14353 3.45827 5.3796 3.28099 5.6434C3.11068 5.89681 2.92517 6.21815 2.70294 6.60307L2.67769 6.64681C2.45545 7.03172 2.26993 7.35304 2.13562 7.62723C1.99581 7.91267 1.88644 8.19539 1.84541 8.50701C1.75021 9.23012 1.94617 9.96142 2.39016 10.5401C2.62128 10.8412 2.92173 11.0602 3.26217 11.2741C3.53595 11.4461 3.68788 11.7221 3.68786 12C3.68785 12.2778 3.53592 12.5538 3.26217 12.7258C2.92169 12.9397 2.62121 13.1587 2.39007 13.4599C1.94607 14.0385 1.75012 14.7698 1.84531 15.4929C1.88634 15.8045 1.99571 16.0873 2.13552 16.3727C2.26983 16.6469 2.45535 16.9682 2.67758 17.3531L2.70284 17.3969C2.92507 17.7818 3.11058 18.1031 3.28089 18.3565C3.45817 18.6203 3.64833 18.8564 3.89769 19.0477C4.47632 19.4917 5.20763 19.6877 5.93073 19.5925C6.30717 19.5429 6.647 19.3922 7.0025 19.2043C7.28833 19.0532 7.60329 19.0596 7.8439 19.1986C8.08452 19.3375 8.24756 19.607 8.25964 19.9301C8.27467 20.3319 8.31403 20.7016 8.45932 21.0524C8.73843 21.7262 9.27379 22.2616 9.94761 22.5407C10.238 22.661 10.5375 22.7076 10.8546 22.7292C11.1592 22.75 11.5303 22.75 11.9747 22.75H12.0252C12.4697 22.75 12.8407 22.75 13.1454 22.7292C13.4625 22.7076 13.762 22.661 14.0524 22.5407C14.7262 22.2616 15.2616 21.7262 15.5407 21.0524C15.686 20.7016 15.7253 20.3319 15.7403 19.93C15.7524 19.607 15.9154 19.3375 16.156 19.1985C16.3966 19.0596 16.7116 19.0532 16.9974 19.2042C17.3529 19.3921 17.6927 19.5429 18.0692 19.5924C18.7923 19.6876 19.5236 19.4917 20.1022 19.0477C20.3516 18.8563 20.5417 18.6203 20.719 18.3565C20.8893 18.1031 21.0748 17.7818 21.297 17.3969L21.3223 17.3531C21.5445 16.9682 21.7301 16.6468 21.8644 16.3726C22.0042 16.0872 22.1135 15.8045 22.1546 15.4929C22.2498 14.7697 22.0538 14.0384 21.6098 13.4598C21.3787 13.1586 21.0782 12.9397 20.7378 12.7258C20.464 12.5538 20.3121 12.2778 20.3121 11.9999C20.3121 11.7221 20.464 11.4462 20.7377 11.2742C21.0783 11.0603 21.3788 10.8414 21.6099 10.5401C22.0539 9.96149 22.2499 9.23019 22.1547 8.50708C22.1136 8.19546 22.0043 7.91274 21.8645 7.6273C21.7302 7.35313 21.5447 7.03183 21.3224 6.64695L21.2972 6.60318C21.0749 6.21825 20.8894 5.89688 20.7191 5.64347C20.5418 5.37967 20.3517 5.1436 20.1023 4.95225C19.5237 4.50826 18.7924 4.3123 18.0692 4.4075C17.6928 4.45706 17.353 4.60782 16.9975 4.79572C16.7117 4.94679 16.3967 4.94036 16.1561 4.80144C15.9155 4.66253 15.7524 4.39297 15.7403 4.06991C15.7253 3.66808 15.686 3.2984 15.5407 2.94762C15.2616 2.27379 14.7262 1.73844 14.0524 1.45933C13.762 1.33905 13.4625 1.29241 13.1454 1.27077C12.8407 1.24999 12.4697 1.24999 12.0252 1.25H11.9747ZM10.5216 2.84515C10.5988 2.81319 10.716 2.78372 10.9567 2.76729C11.2042 2.75041 11.5238 2.75 12 2.75C12.4762 2.75 12.7958 2.75041 13.0432 2.76729C13.284 2.78372 13.4012 2.81319 13.4783 2.84515C13.7846 2.97202 14.028 3.21536 14.1548 3.52165C14.1949 3.61826 14.228 3.76887 14.2414 4.12597C14.271 4.91835 14.68 5.68129 15.4061 6.10048C16.1321 6.51968 16.9974 6.4924 17.6984 6.12188C18.0143 5.9549 18.1614 5.90832 18.265 5.89467C18.5937 5.8514 18.9261 5.94047 19.1891 6.14228C19.2554 6.19312 19.3395 6.27989 19.4741 6.48016C19.6125 6.68603 19.7726 6.9626 20.0107 7.375C20.2488 7.78741 20.4083 8.06438 20.5174 8.28713C20.6235 8.50382 20.6566 8.62007 20.6675 8.70287C20.7108 9.03155 20.6217 9.36397 20.4199 9.62698C20.3562 9.70995 20.2424 9.81399 19.9397 10.0041C19.2684 10.426 18.8122 11.1616 18.8121 11.9999C18.8121 12.8383 19.2683 13.574 19.9397 13.9959C20.2423 14.186 20.3561 14.29 20.4198 14.373C20.6216 14.636 20.7107 14.9684 20.6674 15.2971C20.6565 15.3799 20.6234 15.4961 20.5173 15.7128C20.4082 15.9355 20.2487 16.2125 20.0106 16.6249C19.7725 17.0373 19.6124 17.3139 19.474 17.5198C19.3394 17.72 19.2553 17.8068 19.189 17.8576C18.926 18.0595 18.5936 18.1485 18.2649 18.1053C18.1613 18.0916 18.0142 18.045 17.6983 17.8781C16.9973 17.5075 16.132 17.4803 15.4059 17.8995C14.68 18.3187 14.271 19.0816 14.2414 19.874C14.228 20.2311 14.1949 20.3817 14.1548 20.4784C14.028 20.7846 13.7846 21.028 13.4783 21.1549C13.4012 21.1868 13.284 21.2163 13.0432 21.2327C12.7958 21.2496 12.4762 21.25 12 21.25C11.5238 21.25 11.2042 21.2496 10.9567 21.2327C10.716 21.2163 10.5988 21.1868 10.5216 21.1549C10.2154 21.028 9.97201 20.7846 9.84514 20.4784C9.80512 20.3817 9.77195 20.2311 9.75859 19.874C9.72896 19.0817 9.31997 18.3187 8.5939 17.8995C7.86784 17.4803 7.00262 17.5076 6.30158 17.8781C5.98565 18.0451 5.83863 18.0917 5.73495 18.1053C5.40626 18.1486 5.07385 18.0595 4.81084 17.8577C4.74458 17.8069 4.66045 17.7201 4.52586 17.5198C4.38751 17.314 4.22736 17.0374 3.98926 16.625C3.75115 16.2126 3.59171 15.9356 3.4826 15.7129C3.37646 15.4962 3.34338 15.3799 3.33248 15.2971C3.28921 14.9684 3.37828 14.636 3.5801 14.373C3.64376 14.2901 3.75761 14.186 4.0602 13.9959C4.73158 13.5741 5.18782 12.8384 5.18786 12.0001C5.18791 11.1616 4.73165 10.4259 4.06021 10.004C3.75769 9.81389 3.64385 9.70987 3.58019 9.62691C3.37838 9.3639 3.28931 9.03149 3.33258 8.7028C3.34348 8.62001 3.37656 8.50375 3.4827 8.28707C3.59181 8.06431 3.75125 7.78734 3.98935 7.37493C4.22746 6.96253 4.3876 6.68596 4.52596 6.48009C4.66055 6.27983 4.74468 6.19305 4.81093 6.14222C5.07395 5.9404 5.40636 5.85133 5.73504 5.8946C5.83873 5.90825 5.98576 5.95483 6.30173 6.12184C7.00273 6.49235 7.86791 6.51962 8.59394 6.10045C9.31998 5.68128 9.72896 4.91837 9.75859 4.12602C9.77195 3.76889 9.80512 3.61827 9.84514 3.52165C9.97201 3.21536 10.2154 2.97202 10.5216 2.84515Z"
                    fill="currentColor"
                  />
                </svg>
                <p className="pl-2">Settings</p>
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-400 uppercase mb-2 pl-4">
                Utilities
              </p>
              <button
                className="divider w-full flex  justify-start items-center text-left px-4 py-2 ml-2 pl-6 text-button-text hover:bg-button-main-lighter rounded-md"
                onClick={() => navigate("/help")}
              >
                <svg
                  width="20px"
                  height="20px"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  className="text-button-text  stroke-current"
                >
                  <path
                    d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="#currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M10.5 8.67709C10.8665 8.26188 11.4027 8 12 8C13.1046 8 14 8.89543 14 10C14 10.9337 13.3601 11.718 12.4949 11.9383C12.2273 12.0064 12 12.2239 12 12.5V12.5V13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 16H12.01"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="pl-2">Help</p>
              </button>
              <Divider />
              <button
                className="divider w-full flex  justify-start items-center text-left px-4 py-2 ml-2 pl-6 text-button-text hover:bg-button-main-lighter rounded-md"
                onClick={() => navigate("/bug-report")}
              >
                <svg
                  width="20px"
                  height="20px"
                  viewBox="0 0 16 16"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-button-text fill-current stroke-current"
                  fill="none"
                >
                  <path
                    d="M7 0V1.60002C7.32311 1.53443 7.65753 1.5 8 1.5C8.34247 1.5 8.67689 1.53443 9 1.60002V0H11V2.49963C11.8265 3.12041 12.4543 3.99134 12.7711 5H3.2289C3.5457 3.99134 4.17354 3.12041 5 2.49963V0H7Z"
                    fill="#currentColor"
                  />
                  <path
                    d="M0 7V9H3V10.4957L0.225279 11.2885L0.774721 13.2115L3.23189 12.5095C3.87194 14.5331 5.76467 16 8 16C10.2353 16 12.1281 14.5331 12.7681 12.5095L15.2253 13.2115L15.7747 11.2885L13 10.4957V9H16V7H9V12H7V7H0Z"
                    fill="#currentColor"
                  />
                </svg>
                <p className="pl-2">Report a bug</p>
              </button>
              <Divider />
              <button
                className="w-full flex  justify-start items-center text-left px-4 py-2 ml-2 pl-6 text-button-text hover:bg-button-main-lighter rounded-md"
                onClick={() => {
                  setIsPanelOpen(false);
                  setIsAboutOpen(true);
                }} // Close panel and display about
              >
                <svg
                  width="20px"
                  height="20px"
                  viewBox="0 0 512 512"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                >
                  <title>about</title>
                  <g
                    id="Page-1"
                    stroke="none"
                    strokeWidth="1"
                    fill="none"
                    fillRule="evenodd"
                  >
                    <g
                      id="about-white"
                      fill="currentColor"
                      transform="translate(42.666667, 42.666667)"
                    >
                      <path
                        d="M213.333333,3.55271368e-14 C95.51296,3.55271368e-14 3.55271368e-14,95.51168 3.55271368e-14,213.333333 C3.55271368e-14,331.153707 95.51296,426.666667 213.333333,426.666667 C331.154987,426.666667 426.666667,331.153707 426.666667,213.333333 C426.666667,95.51168 331.154987,3.55271368e-14 213.333333,3.55271368e-14 Z M213.333333,384 C119.227947,384 42.6666667,307.43872 42.6666667,213.333333 C42.6666667,119.227947 119.227947,42.6666667 213.333333,42.6666667 C307.44,42.6666667 384,119.227947 384,213.333333 C384,307.43872 307.44,384 213.333333,384 Z M240.04672,128 C240.04672,143.46752 228.785067,154.666667 213.55008,154.666667 C197.698773,154.666667 186.713387,143.46752 186.713387,127.704107 C186.713387,112.5536 197.99616,101.333333 213.55008,101.333333 C228.785067,101.333333 240.04672,112.5536 240.04672,128 Z M192.04672,192 L234.713387,192 L234.713387,320 L192.04672,320 L192.04672,192 Z"
                        id="Shape"
                      ></path>
                    </g>
                  </g>
                </svg>
                <p className="pl-2">About</p>
              </button>
              <Divider />
              <button
                className="w-full flex  justify-start items-center text-left px-4 py-2 ml-2 pl-6 text-button-text hover:bg-button-main-lighter rounded-md"
                onClick={() => navigate("/votes")}
              >
                <svg
                  width="20px"
                  height="20px"
                  viewBox="0 0 512 512"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                >
                  <title>about</title>
                  <g
                    id="Page-1"
                    stroke="none"
                    strokeWidth="1"
                    fill="none"
                    fillRule="evenodd"
                  >
                    <g
                      id="about-white"
                      fill="currentColor"
                      transform="translate(42.666667, 42.666667)"
                    >
                      <path
                        d="M213.333333,3.55271368e-14 C95.51296,3.55271368e-14 3.55271368e-14,95.51168 3.55271368e-14,213.333333 C3.55271368e-14,331.153707 95.51296,426.666667 213.333333,426.666667 C331.154987,426.666667 426.666667,331.153707 426.666667,213.333333 C426.666667,95.51168 331.154987,3.55271368e-14 213.333333,3.55271368e-14 Z M213.333333,384 C119.227947,384 42.6666667,307.43872 42.6666667,213.333333 C42.6666667,119.227947 119.227947,42.6666667 213.333333,42.6666667 C307.44,42.6666667 384,119.227947 384,213.333333 C384,307.43872 307.44,384 213.333333,384 Z M240.04672,128 C240.04672,143.46752 228.785067,154.666667 213.55008,154.666667 C197.698773,154.666667 186.713387,143.46752 186.713387,127.704107 C186.713387,112.5536 197.99616,101.333333 213.55008,101.333333 C228.785067,101.333333 240.04672,112.5536 240.04672,128 Z M192.04672,192 L234.713387,192 L234.713387,320 L192.04672,320 L192.04672,192 Z"
                        id="Shape"
                      ></path>
                    </g>
                  </g>
                </svg>
                <p className="pl-2">Name Vote</p>
              </button>
            </div>

            <button
              onClick={() => {
                supabase.auth.signOut().then(() => {
                  window.location.href = "/login"; // Redirect to login page
                });
              }}
              className="logout bg-logout text-white font-medium text-center rounded-sm me-1 mt-6 mb-1 px-1 py-1 ml-4 flex items-center justify-center hover:bg-logout-light"
            >
              <span>Logout</span>
              <div className="ml-1 transition group-hover:translate-x-1">
                {" "}
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
      <AboutPanel isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
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
          <div className="w-full max-w-md">{roles.admin && <AdminPanel />}</div>
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
            <div
              onClick={() => navigate("/everyones-schedule")}
              className="bg-white shadow-md rounded-lg p-4 mt-4 w-full max-w-md flex flex-col"
            >
              <button className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 ">
                everyone's schedule
              </button>
              <button
                onClick={() => (window.location.href = "/on-now")}
                className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 "
              >
                see who is scheduled right now
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
