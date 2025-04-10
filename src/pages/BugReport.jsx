import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";
const GITHUB_REPO = "BelistarE/phxunifischeduler";
const GITHUB_API_URL = `https://api.github.com/repos/BelistarE/phxunifischeduler/issues`;
const token = import.meta.env.VITE_GITHUB_TOKEN;

const BugReport = () => {
  const [issues, setIssues] = useState([]);
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await fetch(GITHUB_API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error("Failed to fetch issues");
        }
        const data = await res.json();
        const filtered = data.filter((item) => !item.pull_request); // Exclude pull requests
        setIssues(filtered);
      } catch (err) {
        console.error("Error fetching issues:", err);
      }
    };

    fetchIssues();
  }, []);

  //issue form submit
  const [formData, setFormData] = useState({
    whatHappened: "",
    steps: "",
    expected: "",
    environment: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;
    const title = form.querySelector('textarea[placeholder*="Describe"]').value;
    const steps = form.querySelector(
      'textarea[placeholder*="List the steps"]'
    ).value;
    const expected = form.querySelector('input[placeholder*="expect"]').value;
    const environment = form.querySelector(
      'textarea[placeholder*="Browser"]'
    ).value;

    const body = `**Steps to reproduce:**\n${steps}\n\n**Expected behavior:**\n${expected}\n\n**Environment:**\n${environment}`;

    const res = await fetch("/api/submit-bug", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, body }),
    });

    if (res.ok) {
      alert("Bug submitted!");
      form.reset();
    } else {
      alert("Error submitting bug");
    }
  };
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="top w-full bg-slate-800 text-white p-4 shadow-lg flex items-center justify-between mb-6">
        {" "}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 512 512"
          onClick={() => window.history.back()}
          className="cursor-pointer"
        >
          <path
            fill="none"
            stroke="#ffffff"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="48"
            d="M244 400 100 256l144-144M120 256h292"
          ></path>
        </svg>
        <h1 className="text-2xl md:text-3xl font-bold pl-6 pr-6 text-center text-gray-100">
          Report a Problem
        </h1>
        <svg
          fill="#ffffff"
          height="40px"
          width="40px"
          version="1.1"
          id="Layer_1"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 512 512"
          xmlSpace="preserve"
        >
          <g>
            <g>
              <path
                d="M498.667,290.667H404V240c0-1.016,0.313-2.036,0.291-3.055C452.4,231.927,480,200.272,480,148.333v-12
      c0-7.364-5.971-13.333-13.333-13.333s-13.333,5.969-13.333,13.333v12c0,38.399-17.005,58.821-51.885,62.167
      c-6.069-27.025-20.875-50.381-45.537-55.7c-3.745-28.54-21.413-52.689-46.115-65.227c10.321-10.501,16.871-24.887,16.871-40.74V37
      c0-7.364-5.971-13.333-13.333-13.333S300,29.636,300,37v11.833C300,66.203,285.536,80,268.167,80h-23
      c-17.369,0-31.833-13.797-31.833-31.167V37c0-7.364-5.971-13.333-13.333-13.333S186.667,29.636,186.667,37v11.833
      c0,15.853,6.549,30.239,16.871,40.741c-24.701,12.537-42.453,36.687-46.199,65.227c-24.695,5.324-39.465,28.736-45.519,55.808
      c-35.759-2.96-53.153-23.403-53.153-62.276v-12c0-7.364-5.971-13.333-13.333-13.333S32,128.969,32,136.333v12
      c0,52.415,27.439,84.168,76.375,88.739C108.353,238.048,108,239.025,108,240v50.667H13.333C5.971,290.667,0,296.636,0,304
      s5.971,13.333,13.333,13.333H108v23c0,10.628,1.469,20.993,3.608,30.992C60.659,374.777,32,406.773,32,460.333v12
      c0,7.364,5.971,13.333,13.333,13.333s13.333-5.969,13.333-13.333v-12c0-41.795,20.151-62.291,61.565-62.649
      c22.451,53.208,75.151,90.649,136.435,90.649c61.276,0,113.971-37.432,136.425-90.629c40.519,0.784,60.241,21.283,60.241,62.629
      v12c0,7.364,5.971,13.333,13.333,13.333S480,479.697,480,472.333v-12c0-53.1-28.823-85.013-78.96-88.921
      c2.151-10.025,2.96-20.421,2.96-31.079v-23h94.667c7.363,0,13.333-5.969,13.333-13.333S506.029,290.667,498.667,290.667z
       M242.667,460.855c-60.333-6.964-108-58.353-108-120.521V240c0-20.793,6.948-50.531,24.483-58.035
      c6.627,18.368,24.56,31.368,45.184,31.368h38.333V460.855z M204.333,186.667c-11.58,0-21-9.42-21-21c0-32.532,26.468-59,59-59
      h2.833h23H271c32.532,0,59,26.468,59,59c0,11.58-9.42,21-21,21H204.333z M377.333,340.333c0,62.627-47.027,114.32-108,120.673
      V213.333H309c20.624,0,37.891-13,44.517-31.368c17.535,7.504,23.816,37.241,23.816,58.035V340.333z"
              />
            </g>
          </g>
        </svg>
      </div>

      <div className="flex flex-col md:flex-row gap-8 m-3 items-stretch">
        {/* Bug Report Form */}
        <div className="w-full md:w-1/2 flex flex-col">
          <form
            onSubmit={handleSubmit}
            className="flex-grow space-y-6 bg-white p-6 shadow-lg rounded-xl border border-gray-200"
          >
            {/* What happened */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What happened?
              </label>
              <textarea
                name="whatHappened"
                required
                rows="4"
                className="w-full rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2"
                placeholder="Describe the bug clearly and concisely."
                value={formData.whatHappened}
                onChange={handleChange}
              />
            </div>

            {/* Steps to reproduce */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Steps to reproduce
              </label>
              <textarea
                name="steps"
                rows="3"
                className="w-full rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2"
                placeholder="List the steps to reproduce the behavior..."
                value={formData.steps}
                onChange={handleChange}
              />
            </div>

            {/* Expected behavior */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected behavior
              </label>
              <input
                name="expected"
                type="text"
                className="w-full rounded-md border border-gray-300 shadow-sm focus:ring-frontier focus:border-frontier p-2"
                placeholder="What did you expect to happen?"
                value={formData.expected}
                onChange={handleChange}
              />
            </div>

            {/* Environment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Environment
              </label>
              <textarea
                name="environment"
                rows="2"
                className="w-full rounded-md border border-gray-300 shadow-sm focus:ring-frontier focus:border-frontier p-2"
                placeholder="Browser, OS, device..."
                value={formData.environment}
                onChange={handleChange}
              />
            </div>

            {/* Submit button */}
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                className="inline-flex items-center px-6 py-2 bg-frontier text-white font-semibold rounded-md hover:bg-frontier-dark transition-all"
              >
                Submit Bug
              </button>
            </div>
          </form>
          <div>
            <div className="mt-8"></div>
          </div>
        </div>
        <div className="w-full md:w-1/2 flex flex-col">
          <div className="flex-grow space-y-6 bg-white p-6 shadow-lg rounded-xl border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              🐛 Known Bugs
            </h2>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">
              {issues.length > 0 ? (
                issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="border-l-4 border-red-500 pl-4"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">
                      {issue.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {issue.body
                        ? issue.body.slice(0, 150) + "..."
                        : "No description"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Last updated:{" "}
                      {new Date(issue.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400">
                  No known bugs at the moment 🎉
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BugReport;
