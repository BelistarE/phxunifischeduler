import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";

const Activate = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  //password pretty
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };
  // Fetch user info from token
  useEffect(() => {
    const getUserFromToken = async () => {
      if (!token) {
        setError("Missing activation token.");
        return;
      }

      const { data, error } = await supabase
        .from("pending")
        .select("*")
        .eq("token", token)
        .eq("used", false)
        .single();

      if (error || !data) {
        console.error("Error fetching user from token:", error);
        setError("Invalid or expired token.");
        return;
      }

      setEmail(data.email);
      setName(data.name);
    };

    getUserFromToken();
  }, [token]);

  const handleActivate = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!token) {
      setError("Missing activation token.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])/;
    if (!passwordRegex.test(password)) {
      setError(
        "Password must contain at least one uppercase letter and one special character."
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call the API to activate the user
      console.log("Sending to backend:", {
        email,
        full_name: name,
        password,
        token,
      });

      const res = await fetch("/api/activate-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          full_name: name,
          password,
          token,
        }),
      });
      let data;
      try {
        data = await res.json(); // only read once
      } catch (err) {
        const text = await res.text(); // fallback if JSON parsing fails
        console.error("Error parsing JSON response:", err);
        console.log("Raw response:", text);
        return;
      }

      if (!res.ok) {
        console.error("Server error:", data);
        return;
      }

      alert("Account activated!");
      navigate("/login");
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex items-center flex-col justify-between min-h-screen bg-gray-100 px-4">
      <img
        src="/images/logo.png"
        alt="Logo"
        className="w-auto h-24 mx-auto mb-4"
      />
      <div className="bg-white shadow-xl rounded-2xl flex flex-col p-8 w-full max-w-md text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Activate Your Account
        </h2>

        {/* Form elements */}
        <p className="text-gray-600 text-lg mb-6">
          Welcome,{" "}
          <span className="font-bold text-frontier">{name || "..."}</span>!
        </p>
        {/* Error message */}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {/* Password input */}
        <div className="relative mb-2">
          <input
            type={passwordVisible ? "text" : "password"}
            placeholder="Create a password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-frontier "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div
            className="absolute inset-y-0 right-0 flex items-center cursor-pointer"
            onClick={togglePasswordVisibility}
          ></div>
        </div>

        {/* Confirm password input */}
        <div className="relative mb-4">
          <input
            type={confirmPasswordVisible ? "text" : "password"}
            placeholder="Confirm password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-frontier "
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <div
            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
            onClick={toggleConfirmPasswordVisibility}
          ></div>
        </div>

        {/* Activate button */}
        <button
          onClick={handleActivate}
          disabled={loading}
          className={`w-full bg-frontier text-white py-2 rounded-lg hover:bg-frontier-dark transition duration-200 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Activating..." : "Activate"}
        </button>
      </div>

      {/* Bottom logo */}
      <img
        src="/images/phx_unifi_dark.png"
        alt="PHX Unifi"
        className="w-40 h-auto mx-auto mt-8 opacity-80"
      />
    </div>
  );
};
export default Activate;
