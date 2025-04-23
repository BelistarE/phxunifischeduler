import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import UnderConstruction from "./pages/UnderConstruction";
import BugReport from "./pages/BugReport";
import AdminUsers from "./pages/AdminUsers";
import ManageSchedules from "./pages/ManageSchedules";
import AdminDashboard from "./pages/AdminDashboard";
import TimeOffRequests from "./pages/TimeOffRequests";
import ScheduleEveryone from "./pages/ScheduleEveryone";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route for login */}
        <Route path="/login" element={<Login />} />
        <Route path="/under-contruction" element={<UnderConstruction />} />
        {/* Protected route for dashboard */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        {/* Protected routes for other pages */}
        <Route
          path="/bug-report"
          element={
            <ProtectedRoute>
              <BugReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-schedules"
          element={
            <ProtectedRoute>
              <ManageSchedules />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/time-off-requests"
          element={
            <ProtectedRoute>
              <TimeOffRequests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/schedule"
          element={
            <ProtectedRoute>
              <ScheduleEveryone />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/under-contruction" />} />
      </Routes>
    </BrowserRouter>
  );
}
