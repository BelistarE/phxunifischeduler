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
    <div className="login-container">
      <form onSubmit={handleLogin}>
        <h2>Login</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
          />
          Remember Me
        </label>

        <button type="submit">Log In</button>
      </form>
    </div>
  );
}
