// pages/EveryonesSchedule.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const UnderConstruction = () => {
  const navigate = useNavigate();
  const handleNotify = () => {
    // Logic to handle notification (e.g., email subscription)
    alert("You will be emailed when the page is ready!");
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200 p-5">
      <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-4xl font-semibold text-gray-800 mb-4">
          Under Construction
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Beli is working hard to bring this page to life. Stay tuned!
        </p>

        {/* Image placeholder */}
        <div className="mb-6">
          <img
            src="images/under-construction.png"
            alt="Under Construction"
            className="w-full h-auto rounded-lg shadow-md"
          />
        </div>
        <div className="flex flex-col space-y-4">
          <button
            onClick={handleNotify}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 m-2"
          >
            Notify Me When Ready
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-frontier text-white rounded-md hover:bg-frontier-dark transition duration-300 m-2 flex items-center justify-center"
          >
            Back to Dashboard
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 place-self-center ml-2"
            >
              <path
                d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnderConstruction;
