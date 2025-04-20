import React from "react";
import { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { supabaseSession } from "../services/supabaseClientSession";

import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("Login response:", data); // Debugging
    if (data?.session) {
      console.log("Session created:", data.session);
    } else {
      console.warn("No session created.");
    }

    if (!error) {
      navigate("/"); // Redirect to dashboard
    } else {
      console.error("Login error:", error);
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="pt-10 p-5 flex flex-col items-center h-screen bg-gray-200">
      <img
        src="
      /images/logo.png"
        alt="Logo"
        className="login-logo h-24 w-auto mx-auto mb-4"
      />
      <h2 className="text-center text-2xl font-bold">Sign into your account</h2>
      <div className="login-container m-10 shadow-md px-5 py-5 w-full max-w-md bg-gray-100 rounded-lg">
        <form onSubmit={handleLogin}>
          {error && <p className="text-red-500 text-lg">{error}</p>}

          <label htmlFor="email" className="block mb-2 font-medium text-lg">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="block w-full p-2 mb-4 border rounded text-lg"
          />

          <label htmlFor="password" className="block mb-2 font-medium text-lg">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="block w-full p-2 mb-4 border rounded text-lg"
          />
          <div className="flex justify-between items-center mb-4">
            <label className="flex items-center  text-lg">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="mr-2"
              />
              Remember Me
            </label>
            <div className="text-right">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-frontier hover:underline text-lg hover:text-frontier-dark"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full p-2 text-white bg-frontier rounded hover:bg-frontier-dark text-lg"
          >
            Log In
          </button>
        </form>
      </div>
      <div className="flex-grow"></div>
      <img
        src="/images/phx_unifi_dark.png"
        alt="Logo"
        className="login-logo w-54 h-auto mx-auto mb-4 self-end"
      />
    </div>
  );
}
