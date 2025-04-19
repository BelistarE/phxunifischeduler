import { Link, useLocation } from "react-router-dom";

const navItems = [
  { name: "Schedule Overview", path: "/admin" },
  { name: "Manage Schedules", path: "/admin/manage-schedules" },
  { name: "Time Off Requests", path: "/time-off-requests" },
  { name: "Manage Users", path: "/admin/users" },
];

const AdminDashHeader = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <header className="bg-frontier-light shadow-md py-4 px-6 flex items-center justify-between">
      <nav className="flex gap-4">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`px-4 py-2 rounded-full transition-all duration-200 font-medium ${
                isActive
                  ? "bg-frontier-dark text-white shadow-lg"
                  : "text-frontier-dark hover:bg-frontier-dark hover:text-white"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </header>
  );
};

export default AdminDashHeader;
