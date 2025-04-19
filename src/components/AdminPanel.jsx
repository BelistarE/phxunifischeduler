import { Home, Calendar, Users, Shield, ScrollText } from "lucide-react";
import { Link } from "react-router-dom";

const AdminPanel = () => {
  return (
    <aside className="bg-white shadow-md rounded-lg p-4 mt-4 w-full max-w-md text-red-900  flex flex-col">
      <div className="p-6 border-b border-red-200">
        <h2 className="text-xl font-bold text-red-800">Admin Panel</h2>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <Link
          to="/admin"
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-red-100 transition"
        >
          <Home size={18} />
          <span>Dashboard</span>
        </Link>

        <Link
          to="/admin/manage-schedules"
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-red-100 transition"
        >
          <Calendar size={18} />
          <span>Manage Schedules</span>
        </Link>

        <Link
          to="/admin/users"
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-red-100 transition"
        >
          <Users size={18} />
          <span>Users</span>
        </Link>

        <Link
          to="/admin/roles"
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-red-100 transition"
        >
          <Shield size={18} />
          <span>Roles & Permissions</span>
        </Link>

        <Link
          to="/admin/logs"
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-red-100 transition"
        >
          <ScrollText size={18} />
          <span>System Logs</span>
        </Link>
      </nav>
    </aside>
  );
};

export default AdminPanel;
