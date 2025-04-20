import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Loading from "../components/Loading";
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
import MainHeader from "../components/MainHeader";
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ScheduleEveryone = () => {
  const [shiftsWithProfiles, setShiftsWithProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShiftsWithProfiles = async () => {
      try {
        const { data: shifts, error: shiftsError } = await supabase
          .from("shifts")
          .select("*");

        if (shiftsError) {
          setError(`Error fetching shifts: ${shiftsError.message}`);
          setLoading(false);
          return;
        }

        if (shifts && shifts.length > 0) {
          // Extract unique user IDs from shifts
          const userIds = [...new Set(shifts.map((shift) => shift.user_id))];

          // Fetch profiles for these user IDs
          const { data: profiles, error: profilesError } = await supabase
            .from("profiles")
            .select("*")
            .in("id", userIds);

          if (profilesError) {
            setError(`Error fetching profiles: ${profilesError.message}`);
            setLoading(false);
            return;
          }

          // Merge shifts with their corresponding profiles
          const mergedData = shifts.map((shift) => {
            const profile = profiles.find(
              (profile) => profile.id === shift.user_id
            );
            return { ...shift, profile };
          });

          setShiftsWithProfiles(mergedData);
        } else {
          setShiftsWithProfiles([]); // No shifts found
        }
      } catch (err) {
        setError(`An unexpected error occurred: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchShiftsWithProfiles();
  }, []);

  if (loading) {
    return (
      <div>
        <MainHeader /> <Loading />
      </div>
    );
  }

  if (error) {
    return <div>Error loading schedules: {error}</div>;
  }

  return (
    <div>
      <MainHeader />

      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Everyone's Schedule
        </h1>
        {shiftsWithProfiles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sun
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mon
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tue
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wed
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thu
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fri
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sat
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shiftsWithProfiles
                  .reduce((acc, item) => {
                    const name = item.profile?.full_name || item.user_id;
                    const shiftDate = new Date(item.start_time);
                    const dayOfWeek = shiftDate.getDay(); // 0 for Sunday, 1 for Monday, etc.

                    const existingEntryIndex = acc.findIndex(
                      (entry) => entry.name === name
                    );

                    if (existingEntryIndex !== -1) {
                      acc[existingEntryIndex].shifts[dayOfWeek] = {
                        start: new Date(item.start_time).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        ),
                        end: new Date(item.end_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        }),
                        details: item.details,
                      };
                    } else {
                      const newEntry = {
                        name: name,
                        shifts: Array(7).fill(null),
                      };
                      newEntry.shifts[dayOfWeek] = {
                        start: new Date(item.start_time).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        ),
                        end: new Date(item.end_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        }),
                        details: item.details,
                      };
                      acc.push(newEntry);
                    }
                    return acc;
                  }, [])
                  .map((entry) => (
                    <tr key={entry.name}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {entry.name}
                        </div>
                      </td>
                      {entry.shifts.map((shift, index) => (
                        <td
                          key={index}
                          className="px-4 py-3 whitespace-nowrap text-center"
                        >
                          {shift ? (
                            <div className="text-xs text-gray-700">
                              {shift.start} - {shift.end}
                              {shift.details && (
                                <div className="text-xs text-gray-500 italic">
                                  {shift.details}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">-</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">No shifts scheduled yet.</p>
        )}
      </div>
    </div>
  );
};

export default ScheduleEveryone;
