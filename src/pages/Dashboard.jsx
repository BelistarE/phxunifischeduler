import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

export default function Dashboard() {
  const [profile, setProfile] = useState({ full_name: "", role: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, role")
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
      } else {
        setProfile(data);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div>
      <h1>Welcome to your Dashboard</h1>
      <p>Welcome, {profile.full_name}</p>
      <p>You are a {profile.role}</p>
    </div>
  );
}
