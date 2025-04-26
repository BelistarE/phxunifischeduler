import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";
const token = import.meta.env.VITE_GITHUB_TOKEN;
import Loading from "../components/Loading";
import ReactMarkdown from "react-markdown";
import { FaGithub } from "react-icons/fa";

const Users = () => {
  const [loading, setLoading] = useState(true); // State to track loading status
  const [profiles, setProfiles] = useState([]); // State to store profiles
  const [editingProfileId, setEditingProfileId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedRoles, setEditedRoles] = useState({
    title: null, // Still can be 1 or 2
    driving: null, // Still can be 0 or 1
    lm: 0,
    push: 0,
    tow: 0,
  });
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { data, error } = await supabase.from("profiles").select("*");
        if (error) {
          console.error("Error fetching profiles:", error);
        } else {
          // Sort profiles based on priority
          const sortedProfiles = data.sort((a, b) => {
            const getPriority = (user) => {
              let priority = 0;

              // Assign priority based on title
              if (user.title === 3) priority += 1000;
              else if (user.title === 2) priority += 900;
              else if (user.title === 1) priority += 800;
              else if (user.title === 0) priority += 700;

              // Assign priority based on roles
              if (user.push === 1) priority += 100;
              if (user.lm === 1) priority += 50;
              if (user.driving === 1) priority += 25;

              return priority;
            };

            // Compare users based on their priority
            return getPriority(b) - getPriority(a);
          });

          setProfiles(sortedProfiles); // Store sorted profiles in state
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchProfiles();
  }, []);
  //edit logic
  const handleEditClick = (profile) => {
    setEditingProfileId(profile.id);
    setEditedName(profile.full_name);
    setEditedRoles({
      title: profile.title,
      driving: profile.driving,
      lm: profile.lm,
      push: profile.push,
      tow: profile.tow,
    });
  };

  const handleNameChange = (event) => {
    setEditedName(event.target.value);
  };

  const handleRoleChange = (roleName, value) => {
    setEditedRoles((prevRoles) => ({
      ...prevRoles,
      [roleName]: typeof value === "boolean" ? (value ? 1 : 0) : value,
    }));
  };

  const handleSaveClick = (profileId) => {
    // 1. Update the profiles state with the edited data (adjusting boolean roles to ints)
    const updatedProfiles = profiles.map((profile) =>
      profile.id === profileId
        ? {
            ...profile,
            full_name: editedName,
            title: editedRoles.title,
            driving: editedRoles.driving,
            lm: editedRoles.lm,
            push: editedRoles.push,
            tow: editedRoles.tow,
          }
        : profile
    );
    // In a real scenario, you'd have a function to update the parent state
    console.log("Updated Profiles (ints):", updatedProfiles);

    // 2. Prepare data for Supabase update
    const supabaseUpdateData = {
      full_name: editedName,
      title: editedRoles.title,
      driving: editedRoles.driving,
      lm: editedRoles.lm,
      push: editedRoles.push,
      tow: editedRoles.tow,
    };
    console.log("Data for Supabase:", supabaseUpdateData);

    // 3. Call your Supabase update function here using supabaseUpdateData and profileId
    // Example (you'll need to adapt this with your Supabase client):
    // supabase
    //   .from('profiles')
    //   .update(supabaseUpdateData)
    //   .eq('id', profileId)
    //   .then(({ data, error }) => {
    //     if (error) {
    //       console.error('Error updating profile:', error);
    //       // Handle error (e.g., display a message to the user)
    //     } else {
    //       console.log('Profile updated successfully:', data);
    //       // Optionally, update local state or refetch data
    //     }
    //   });

    // 4. Exit edit mode
    setEditingProfileId(null);
  };

  const handleCancelClick = () => {
    setEditingProfileId(null);
  };
  if (loading) {
    // Render loading screen while fetching data
    return (
      <div>
        <Loading />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Everyone</h1>
      <ul className="space-y-4">
        {profiles.map((profile) => (
          <li
            key={profile.id}
            className="bg-white shadow-md rounded-lg p-4 border border-gray-200 flex flex-row items-center justify-between"
          >
            {editingProfileId === profile.id ? (
              <div className="flex-1 flex flex-col gap-4 w-full">
                {/* Edit Form */}
                <div className="mb-2 flex flex-row items-center gap-2">
                  {profile.img_url && (
                    <img
                      src={profile.img_url}
                      alt={`${profile.full_name}'s profile`}
                      className="w-16 h-16 object-cover rounded-full"
                    />
                  )}
                  <div className="flex flex-col">
                    <label
                      htmlFor={`name-${profile.id}`}
                      className="block text-gray-700 text-sm font-bold mb-2"
                    >
                      Name:
                    </label>
                    <input
                      type="text"
                      id={`name-${profile.id}`}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      value={editedName}
                      onChange={handleNameChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Roles:
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <div className="flex flex-col gap-2 mb-2">
                      <label>
                        <input
                          type="radio"
                          name={`title-${profile.id}`}
                          value={1}
                          checked={editedRoles.title === 1}
                          onChange={(e) =>
                            handleRoleChange("title", parseInt(e.target.value))
                          }
                        />
                        <span className="ml-1 bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
                          Supervisor
                        </span>
                      </label>
                      <label>
                        <input
                          type="radio"
                          name={`title-${profile.id}`}
                          value={2}
                          checked={editedRoles.title === 2}
                          onChange={(e) =>
                            handleRoleChange("title", parseInt(e.target.value))
                          }
                        />
                        <span className="ml-1 bg-pink-100 text-pink-800 text-sm font-medium px-2 py-1 rounded">
                          Ops
                        </span>
                      </label>
                      <label>
                        <input
                          type="radio"
                          name={`title-${profile.id}`}
                          value={3}
                          checked={editedRoles.title === 2}
                          onChange={(e) =>
                            handleRoleChange("title", parseInt(e.target.value))
                          }
                        />
                        <span className="ml-1 bg-orange-100 text-orange-800 text-sm font-medium px-2 py-1 rounded">
                          Ramp
                        </span>
                      </label>
                    </div>
                    <div className="flex flex-col gap-2 mb-2">
                      <label>
                        <input
                          type="radio"
                          name={`driving-${profile.id}`}
                          value={0}
                          checked={editedRoles.driving === 0}
                          onChange={(e) =>
                            handleRoleChange(
                              "driving",
                              parseInt(e.target.value)
                            )
                          }
                        />
                        <span className="ml-1 bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded">
                          No Driving
                        </span>
                      </label>
                      <label>
                        <input
                          type="radio"
                          name={`driving-${profile.id}`}
                          value={1}
                          checked={editedRoles.driving === 1}
                          onChange={(e) =>
                            handleRoleChange(
                              "driving",
                              parseInt(e.target.value)
                            )
                          }
                        />
                        <span className="ml-1 bg-lime-100 text-lime-800 text-sm font-medium px-2 py-1 rounded">
                          Driving
                        </span>
                      </label>
                    </div>

                    <label>
                      <input
                        type="checkbox"
                        name={`lm-${profile.id}`}
                        checked={editedRoles.lm === 1}
                        onChange={(e) =>
                          handleRoleChange("lm", e.target.checked)
                        }
                      />
                      <span className="ml-1 bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded">
                        LM
                      </span>
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        name={`push-${profile.id}`}
                        checked={editedRoles.push === 1}
                        onChange={(e) =>
                          handleRoleChange("push", e.target.checked)
                        }
                      />
                      <span className="ml-1 bg-yellow-100 text-yellow-800 text-sm font-medium px-2 py-1 rounded">
                        Push
                      </span>
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        name={`tow-${profile.id}`}
                        checked={editedRoles.tow === 1}
                        onChange={(e) =>
                          handleRoleChange("tow", e.target.checked)
                        }
                      />
                      <span className="ml-1 bg-purple-100 text-orange-800 text-sm font-medium px-2 py-1 rounded">
                        Tow
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    className="bg-green-500 hover:bg-green-600 text-white font-small py-1 px-3 rounded focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
                    onClick={() => handleSaveClick(profile.id)}
                  >
                    Save
                  </button>
                  <button
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-small py-1 px-3 rounded focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
                    onClick={handleCancelClick}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col w-full">
                  {/* Static Profile Display (No changes needed here based on the int role clarification) */}
                  <div className="flex flex-row items-center gap-2">
                    {profile.img_url && (
                      <img
                        src={profile.img_url}
                        alt={`${profile.full_name}'s profile`}
                        className="w-16 h-16 rounded-full"
                      />
                    )}

                    <div className="flex-1 ml-4">
                      <div className="flex items-center gap-4 mb-2">
                        <p className="text-lg font-semibold">
                          {profile.full_name}
                        </p>
                        {profile.role === "admin" && (
                          <p className="text-gray-600">Admin</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row items-center justify-between gap-2 mt-2">
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile.title === 1 && (
                        <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
                          Supervisor
                        </span>
                      )}
                      {profile.title === 2 && (
                        <span className="bg-pink-100 text-pink-800 text-sm font-medium px-2 py-1 rounded">
                          Ops
                        </span>
                      )}
                      {profile.title === 3 && (
                        <span className="bg-orange-100 text-orange-800 text-sm font-medium px-2 py-1 rounded">
                          Ramp
                        </span>
                      )}
                      {profile.driving === 0 && (
                        <span className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded">
                          No Driving
                        </span>
                      )}
                      {profile.lm === 1 && (
                        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded">
                          LM
                        </span>
                      )}
                      {profile.push === 1 && (
                        <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-2 py-1 rounded">
                          Push
                        </span>
                      )}
                      {profile.tow === 1 && (
                        <span className="bg-purple-100 text-purple-800 text-sm font-medium px-2 py-1 rounded">
                          Tow
                        </span>
                      )}
                    </div>
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white font-small py-1 px-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                      onClick={() => handleEditClick(profile)}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Users;
