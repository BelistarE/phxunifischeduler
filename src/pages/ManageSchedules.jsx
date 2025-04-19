import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminDashHeader from "../components/AdminDashHeader";
function ManageSchedules() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* App Bar */}

      <AdminDashHeader />
      {/* Main Content Area */}
      <main className="container mx-auto py-8 px-4">
        {/* Time Off Requests Section */}

        {/* Edit Schedules Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-frontier mb-2">
            Current Schedules
          </h2>
          <div className="bg-white shadow rounded-md p-4 overflow-x-auto">
            {/* Display of current schedules (e.g., a calendar view or a table) will go here */}
            <p className="text-gray-500 italic">
              Display current schedules here.
            </p>
            {/* You might have controls to filter by date, department, etc. */}
          </div>
        </section>

        {/* Import Excel Button */}
        <section>
          <button className="bg-frontier hover:bg-frontier-dark text-white font-bold py-3 px-6 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-frontier-light focus:ring-opacity-50 w-full md:w-auto">
            Import Excel Doc
          </button>
        </section>
      </main>
    </div>
  );
}

export default ManageSchedules;
