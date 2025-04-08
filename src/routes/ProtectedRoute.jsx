import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      console.log("Session data:", data); // Debugging
      setIsAuthenticated(!!data.session);
    });
  }, []);

  if (isAuthenticated === null) return <div>Loading...</div>;

  // Redirect to login if not authenticated
  if (!isAuthenticated && location.pathname !== "/") return <Navigate to="/" />;

  // Redirect to dashboard if authenticated and on the login page
  if (isAuthenticated && location.pathname === "/")
    return <Navigate to="/dashboard" />;

  return children;
}
