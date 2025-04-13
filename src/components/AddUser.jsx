import React from "react";
import { CircleUser } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../services/supabaseClient";

import { createClient } from "@supabase/supabase-js";

const AddUser = () => {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = uuidv4();

    try {
      const response = await fetch(
        "https://ikkdbqlqmnzlwcboopin.functions.supabase.co/send-invite",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`, // Add the Supabase key
          },
          body: JSON.stringify({ name, email, token }),
        }
      );

      if (!response.ok) throw new Error("Failed to send invite");

      alert("User invited!");
      setName("");
      setEmail("");
    } catch (err) {
      console.error("Error sending invite:", err);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white shadow-md rounded-xl p-6 pt-0">
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 pr-4 ">
          Add New Employee
        </h1>
        <CircleUser className="w-10 h-10 text-gray-800 " />
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-frontier focus:border-frontier transition"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-frontier focus:border-frontier transition"
          />
          <p className="text-s text-gray-600 mt-2">
            MAKE SURE THE EMAIL IS CORRECT
          </p>
          <p className="text-xs text-gray-500 mt-1">
            The employee will recieve an email with a code to create a password
          </p>
        </div>
        <button
          type="submit"
          className="w-full bg-frontier hover:bg-frontier-dark text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
        >
          Add User
        </button>
      </form>
    </div>
  );
};

export default AddUser;
