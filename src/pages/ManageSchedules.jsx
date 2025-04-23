import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminDashHeader from "../components/AdminDashHeader";
import { supabase } from "../services/supabaseClient";
import Loading from "../components/Loading";

function ManageSchedules() {
  const [profilesWithWeeklyShifts, setProfilesWithWeeklyShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editedShifts, setEditedShifts] = useState({}); // { userId: { date: { start_time, end_time, details, id } } }
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const getCurrentWeekDates = () => {
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday, etc.
    const weekDates = Array(7)
      .fill(null)
      .map((_, index) => {
        const diff = index - currentDayOfWeek;
        const date = new Date(today);
        date.setDate(today.getDate() + diff);
        return `${date.getMonth() + 1}-${date.getDate()}`; // Format as MM-DD
      });
    return weekDates;
  };

  const currentWeekDates = getCurrentWeekDates();
  const daysWithDates = daysOfWeek.map((day, index) => ({
    day,
    date: currentWeekDates[index],
  }));

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .order("role");

        if (profilesError) {
          setError(profilesError.message);
          return;
        }

        const { data: shifts, error: shiftsError } = await supabase
          .from("shifts")
          .select("*");

        if (shiftsError) {
          setError(shiftsError.message);
          return;
        }

        const processedProfiles = profiles.map((profile) => {
          const userShifts = shifts.filter(
            (shift) => shift.user_id === profile.id
          );
          const weeklySchedule = Array(7)
            .fill(null)
            .reduce((acc, _, index) => {
              const day = new Date();
              const dayOfWeek = day.getDay(); // 0 for Sunday
              const diff = index - dayOfWeek;
              const currentDate = new Date(day);
              currentDate.setDate(day.getDate() + diff);
              const formattedDate = currentDate.toISOString().slice(0, 10);

              const shiftOnDay = userShifts.find(
                (shift) =>
                  new Date(shift.start_time).toISOString().slice(0, 10) ===
                  formattedDate
              );
              acc[formattedDate] = shiftOnDay
                ? {
                    start_time: new Date(shiftOnDay.start_time)
                      .toTimeString()
                      .slice(0, 5),
                    end_time: new Date(shiftOnDay.end_time)
                      .toTimeString()
                      .slice(0, 5),

                    id: shiftOnDay.id,
                  }
                : null;
              return acc;
            }, {});
          return { ...profile, weeklySchedule };
        });

        setProfilesWithWeeklyShifts(processedProfiles);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  const handleEditClick = (userId) => {
    setEditingUserId(userId);
    const userProfile = profilesWithWeeklyShifts.find(
      (profile) => profile.id === userId
    );

    if (userProfile) {
      const initialEditedShifts = {};
      const initialCommonSelections = {};

      Object.entries(userProfile.weeklySchedule).forEach(([date, shift]) => {
        const start_time = shift?.start_time || "";
        const end_time = shift?.end_time || "";

        initialEditedShifts[date] = {
          start_time,
          end_time,
          id: shift?.id || null,
        };

        // Auto-check matching common shifts
        const matchedKeys = Object.entries(COMMON_SHIFT_TIMES)
          .filter(
            ([key, range]) =>
              range.start === start_time && range.end === end_time
          )
          .map(([key]) => key);

        if (matchedKeys.length) {
          initialCommonSelections[date] = matchedKeys;
        }
      });

      setEditedShifts((prev) => ({
        ...prev,
        [userId]: initialEditedShifts,
      }));

      setCommonShiftSelections((prev) => ({
        ...prev,
        [userId]: initialCommonSelections,
      }));
    }
  };

  const handleInputChange = (userId, date, field, value) => {
    setEditedShifts((prevEditedShifts) => ({
      ...prevEditedShifts,
      [userId]: {
        ...prevEditedShifts?.[userId],
        [date]: {
          ...prevEditedShifts?.[userId]?.[date],
          [field]: value,
        },
      },
    }));
  };
  //save shifts to supabase
  const COMMON_SHIFT_TIMES = {
    morning: { start: "04:00", end: "12:00" },
    mid: { start: "11:00", end: "19:00" },
    night: { start: "18:00", end: "02:00" }, // crosses midnight
  };
  const handleSaveShifts = async (userId) => {
    const shiftsToUpdate = editedShifts[userId];

    const updates = Object.entries(shiftsToUpdate).map(
      ([date, { start_time, end_time, id }]) => {
        const startDateTime = new Date(date);
        const [startHour, startMinute] = start_time.split(":");
        startDateTime.setHours(startHour, startMinute);

        const endDateTime = new Date(date);
        const [endHour, endMinute] = end_time.split(":");
        endDateTime.setHours(endHour, endMinute);

        return {
          id, // required for Supabase upsert
          user_id: userId,
          start_time: startDateTime,
          end_time: endDateTime,
        };
      }
    );

    // Send updates to Supabase
    const { error } = await supabase.from("shifts").upsert(updates, {
      onConflict: "id", // makes sure existing shifts are updated, not duplicated
    });

    if (error) {
      console.error("Failed to save shifts:", error.message);
      alert("There was an error saving shifts.");
    } else {
      alert("Shifts updated successfully!");
      setEditingUserId(null); // Close editor after save
    }
  };

  //auto populate logic

  const timeToMinutes = (time) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };
  const [commonShiftSelections, setCommonShiftSelections] = useState({});

  const handleCommonShiftToggle = (userId, date, shiftKey) => {
    setCommonShiftSelections((prev) => {
      const prevUserDay = prev?.[userId]?.[date] || [];
      const alreadyChecked = prevUserDay.includes(shiftKey);
      const newSelection = alreadyChecked
        ? prevUserDay.filter((k) => k !== shiftKey)
        : [...prevUserDay, shiftKey];

      const newState = {
        ...prev,
        [userId]: {
          ...prev?.[userId],
          [date]: newSelection,
        },
      };

      // Calculate merged start and end
      if (newSelection.length) {
        const minutesRanges = newSelection.map((key) => {
          const shift = COMMON_SHIFT_TIMES[key];
          const startMin = timeToMinutes(shift.start);
          let endMin = timeToMinutes(shift.end);
          if (endMin <= startMin) endMin += 24 * 60; // overnight shift
          return [startMin, endMin];
        });

        const minStart = Math.min(...minutesRanges.map((r) => r[0]));
        const maxEnd = Math.max(...minutesRanges.map((r) => r[1]));

        const startTime = `${String(Math.floor(minStart / 60)).padStart(2, "0")}:${String(minStart % 60).padStart(2, "0")}`;
        const endTimeRaw = maxEnd % (24 * 60);
        const endTime = `${String(Math.floor(endTimeRaw / 60)).padStart(2, "0")}:${String(endTimeRaw % 60).padStart(2, "0")}`;

        setEditedShifts((prevEditedShifts) => ({
          ...prevEditedShifts,
          [userId]: {
            ...prevEditedShifts[userId],
            [date]: {
              ...prevEditedShifts[userId][date],
              start_time: startTime,
              end_time: endTime,
            },
          },
        }));
      }

      return newState;
    });
  };
  const shiftsOverlap = (a, b) => {
    const toRange = ({ start, end }) => {
      let startMin = timeToMinutes(start);
      let endMin = timeToMinutes(end);
      if (endMin <= startMin) endMin += 1440;
      return [startMin, endMin];
    };

    const [startA, endA] = toRange(COMMON_SHIFT_TIMES[a]);
    const [startB, endB] = toRange(COMMON_SHIFT_TIMES[b]);
    return startA < endB && startB < endA;
  };

  const wouldConflict = (currentKeys, keyToTest) => {
    return currentKeys.some(
      (existingKey) => !shiftsOverlap(existingKey, keyToTest)
    );
  };
  const handleClearShift = (userId, date) => {
    setEditedShifts((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [date]: {
          ...prev[userId][date],
          start_time: "",
          end_time: "",
        },
      },
    }));

    setCommonShiftSelections((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [date]: [],
      },
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gray-100 text-gray-800 flex flex-col items-center justify-center">
        <AdminDashHeader /> <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 text-red-500">
        Error loading schedules: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <AdminDashHeader />
      <main className="container mx-auto py-8 px-4">
        <section>
          <button className="bg-frontier hover:bg-frontier-dark text-white font-bold py-3 px-6 mb-10 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-frontier-light focus:ring-opacity-50 w-full md:w-auto">
            Import Excel Doc
          </button>
        </section>
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-frontier mb-2">
            Current Schedules
          </h2>
          <div className="bg-white shadow rounded-md overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  {daysWithDates.map(({ day, date }) => (
                    <th
                      key={day}
                      className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {day} <div>{date}</div>
                    </th>
                  ))}
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {profilesWithWeeklyShifts.map((profile) => (
                  <React.Fragment key={profile.id}>
                    <tr>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {profile.full_name || profile.id}
                      </td>
                      {Object.entries(profile.weeklySchedule)
                        .sort((a, b) => new Date(a[0]) - new Date(b[0])) // Sort by date
                        .map(([date, shift]) => (
                          <td
                            key={date}
                            className="px-4 py-2 whitespace-nowrap text-center text-sm text-gray-700"
                          >
                            {shift
                              ? `${shift.start_time} - ${shift.end_time}`
                              : "-"}
                          </td>
                        ))}
                      <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditClick(profile.id)}
                          className="text-indigo-600 hover:text-indigo-900 focus:outline-none"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                    {editingUserId === profile.id && (
                      <tr>
                        <td colSpan="9" className="bg-gray-50 p-4">
                          <h4 className="font-semibold text-gray-700 mb-2">
                            Edit Shifts for {profile.full_name || profile.id}
                          </h4>
                          <table className="min-w-full table-auto">
                            <thead>
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Date
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Commonly Used Shifts
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Clear Shift
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Start Time
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  End Time
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(profile.weeklySchedule)
                                .sort((a, b) => new Date(a[0]) - new Date(b[0])) // Sort by date
                                .map(([date, shift]) => (
                                  <tr key={date}>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                      {new Date(date).toLocaleDateString(
                                        "en-US",
                                        {
                                          weekday: "long",
                                          month: "numeric",
                                          day: "numeric",
                                        }
                                      )}
                                    </td>
                                    <td className="flex space-x-2 text-xs mb-2">
                                      {["morning", "mid", "night"].map(
                                        (key) => {
                                          const isChecked =
                                            commonShiftSelections?.[
                                              profile.id
                                            ]?.[date]?.includes(key) || false;
                                          const currentSelection =
                                            commonShiftSelections?.[
                                              profile.id
                                            ]?.[date] || [];
                                          const isDisabled =
                                            !isChecked &&
                                            wouldConflict(
                                              currentSelection,
                                              key
                                            );

                                          return (
                                            <label
                                              key={key}
                                              className="flex items-center space-x-1 opacity-100"
                                            >
                                              <input
                                                type="checkbox"
                                                disabled={isDisabled}
                                                checked={isChecked}
                                                onChange={() =>
                                                  handleCommonShiftToggle(
                                                    profile.id,
                                                    date,
                                                    key
                                                  )
                                                }
                                              />
                                              <span
                                                className={`capitalize ${
                                                  isDisabled
                                                    ? "text-gray-400"
                                                    : "text-gray-700"
                                                }`}
                                              >
                                                {key}
                                              </span>
                                            </label>
                                          );
                                        }
                                      )}
                                    </td>
                                    <td>
                                      <button
                                        onClick={() =>
                                          handleClearShift(profile.id, date)
                                        }
                                        className="text-red-500 hover:text-red-700 bg-red-100 hover:bg-red-200 text-sm p-1 rounded-md transition duration-200 ease-in-out"
                                      >
                                        Clear
                                      </button>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                      <input
                                        type="time"
                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                        value={
                                          editedShifts?.[profile.id]?.[date]
                                            ?.start_time || ""
                                        }
                                        onChange={(e) =>
                                          handleInputChange(
                                            profile.id,
                                            date,
                                            "start_time",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                      <input
                                        type="time"
                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                        value={
                                          editedShifts?.[profile.id]?.[date]
                                            ?.end_time || ""
                                        }
                                        onChange={(e) =>
                                          handleInputChange(
                                            profile.id,
                                            date,
                                            "end_time",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                          <div className="mt-4 flex justify-end">
                            <button
                              onClick={() => setEditingUserId(null)}
                              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveShifts(profile.id)}
                              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                              Save
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {profilesWithWeeklyShifts.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-4 py-2 text-center text-gray-500 italic"
                    >
                      No schedules available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default ManageSchedules;
