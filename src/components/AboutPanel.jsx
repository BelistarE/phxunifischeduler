// components/AboutPanel.jsx
import React from "react";
import { FaGithub } from "react-icons/fa";
import ReactDOM from "react-dom";
import "../index.css";

const GitHubButton = () => {
  return (
    <a
      href="https://github.com/BelistarE/phxunifischeduler" // Replace with your actual GitHub URL
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center px-4 py-2 bg-frontier text-white rounded-full hover:bg-frontier-dark transition-all duration-300"
    >
      <FaGithub className="mr-2 text-xl" />
      Click here to view the source code on GitHub
    </a>
  );
};

const AboutPanel = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const closeAboutPanel = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return ReactDOM.createPortal(
    <div
      className="back-panel fixed inset-0 flex justify-center items-center z-50"
      onClick={closeAboutPanel}
    >
      <div className="relative bg-white w-11/12 max-w-md p-6 rounded-lg shadow-lg pt-10 pb-10">
        {/* Close Button */}
        <button
          className="absolute text-3xl top-2 right-2  text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          &times;
        </button>

        {/* About Section */}
        <h2 className="text-2xl font-bold mb-4">About This App</h2>
        <p className="pb-4 text-lg text-gray-700">
          This app is designed and maintained entirely by Isabeli Estefano. It
          is a personal project that aims to provide a user-friendly interface
          for managing schedules at Unifi PHX.
        </p>

        <GitHubButton />
      </div>
    </div>,
    document.body // Render the modal into the <body> element
  );
};

export default AboutPanel;
