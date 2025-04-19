import React from "react";
import AdminDashHeader from "../components/AdminDashHeader";
const TimeOffRequests = () => {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <AdminDashHeader />
      <main className="container mx-auto py-8 px-4 ">
        {" "}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-frontier mb-2">
            Time Off Requests
          </h2>
          <div className="bg-white shadow rounded-md p-4 overflow-x-auto">
            {/* Table or list of time off requests will go here */}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Example Row - Replace with actual data */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">John Doe</td>
                  <td className="px-6 py-4 whitespace-nowrap">2025-04-25</td>
                  <td className="px-6 py-4 whitespace-nowrap">2025-04-27</td>
                  <td className="px-6 py-4 whitespace-nowrap">Pending</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-frontier-er hover:text-frontier-darker mr-2">
                      Approve
                    </button>
                    <button className="text-gray-500 hover:text-gray-700">
                      Reject
                    </button>
                  </td>
                </tr>
                {/* More rows will go here */}
              </tbody>
            </table>
            {/* Optional: Message if no requests */}
            {/* <p className="text-gray-500 italic">No time off requests at this time.</p> */}
          </div>
        </section>
      </main>
    </div>
  );
};

export default TimeOffRequests;
