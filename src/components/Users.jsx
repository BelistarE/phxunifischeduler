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
            className="bg-white shadow-md rounded-lg p-4 border border-gray-200 flex"
          >
            {/* Profile Image */}
            {profile.img_url && (
              <img
                src={profile.img_url}
                alt={`${profile.full_name}'s profile`}
                className="w-16 h-16 rounded-full mb-4"
              />
            )}

            <div className="flex-1 ml-4">
              {/* Profile Details */}
              <div className="flex items-center gap-4 mb-2">
                <p className="text-lg font-semibold">{profile.full_name}</p>
                <p className="text-gray-600">{profile.role}</p>
              </div>

              <div>
                {" "}
                {/* Roles */}
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
                    <span className="bg-purple-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
                      Tow
                    </span>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Users;
