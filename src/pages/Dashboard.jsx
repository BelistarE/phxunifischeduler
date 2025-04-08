import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

export default function Dashboard() {
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      console.log("User data:", data); // Debugging
      console.log("Error:", error); // Debugging

      if (data?.user) {
        setUserEmail(data.user.email);
      } else {
        console.warn("No user found or session is invalid.");
      }
    };
    fetchUser();
  }, []);

  return (
    <div>
      <h1>Welcome to your Dashboard</h1>
      <p>Welcome, {userEmail}</p>
    </div>
  );
}
