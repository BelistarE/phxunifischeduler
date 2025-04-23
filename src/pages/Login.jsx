import React, { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/UserContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Add loading state
  const navigate = useNavigate();

  const { setUser, setProfile } = useAuth();
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true); // Set loading to true when login starts
    console.log("Logging in with email:", email); // Debugging log
    try {
      console.log("Attempting login...");
      const {
        data: { user },
        error,
      } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error.message);
        setError(error.message);
      } else if (user) {
        console.log("Login successful:", user);
        setUser(user);

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!profileError) {
          console.log("Profile fetched:", profileData);
          setProfile(profileData);
        } else {
          console.error("Profile fetch error:", profileError);
          setError("Failed to fetch profile.");
        }

        navigate("/"); // Redirect after successful login
      }
    } catch (err) {
      console.error("Unexpected error during login:", err);
      setError("An unexpected error occurred.");
    } finally {
      console.log("Setting loading to false...");
      setLoading(false);
    }
  };

  return (
    <div className="pt-10 p-5 flex flex-col items-center h-screen bg-gray-200">
      <img
        src="/images/logo.png"
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
            <label className="flex items-center text-lg">
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
            disabled={loading} // Disable the button while loading
          >
            {loading ? "Logging in..." : "Log In"}
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
