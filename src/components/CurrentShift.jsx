import React from "react";
import { FaGithub } from "react-icons/fa";
import ReactDOM from "react-dom";
import "../index.css";

import { supabase } from "../services/supabaseClient";
import { useEffect, useState } from "react";

const CurrentShift = ({ currentShift }) => {
  if (!currentShift) return null; // Don't render if no current shift

  // Convert UTC start and end times to local time
  const startTime = new Date(currentShift.start_time);
  const endTime = new Date(currentShift.end_time);

  // Get the local current time
  const currentTime = new Date();
  // Convert the local current time to UTC time
  const currentTimeUTC = new Date(
    currentTime.getUTCFullYear(),
    currentTime.getUTCMonth(),
    currentTime.getUTCDate(),
    currentTime.getUTCHours(),
    currentTime.getUTCMinutes(),
    currentTime.getUTCSeconds()
  );

  // Adjust the progress calculation by ensuring time is in local zone
  const currentProgress = Math.min(
    100,
    ((currentTimeUTC - startTime) / (endTime - startTime)) * 100
  );

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mt-4 w-full max-w-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">
        Current Shift
      </h2>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-start">
          <p className="text-gray-800 font-semibold">{currentShift.position}</p>
          <p className="text-gray-600 ml-4">{currentShift.type}</p>
        </div>
        {/* Format start and end time in local time */}
        {/* Progress bar */}
        <div className="flex items-center justify-between">
          <p className="text-gray-800">
            {startTime.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>

          <p className="text-gray-800">
            {endTime.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="relative w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-frontier-light h-2.5 rounded-full "
            style={{ width: `${currentProgress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
export default CurrentShift;
