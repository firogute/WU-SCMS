import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  Pill,
  FileText,
  Settings,
  UserCheck,
  Activity,
  TestTube,
  ClipboardList,
  LogOut,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getNavItems = () => {
    const baseItems = [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    ];

    switch (user?.role) {
      case "admin":
        return [
          ...baseItems,
          { icon: Users, label: "Patients", path: "/patients" },
          { icon: Calendar, label: "Appointments", path: "/appointments" },
          { icon: Pill, label: "Pharmacy", path: "/pharmacy" },
          { icon: TestTube, label: "Laboratory", path: "/laboratory" },
          { icon: FileText, label: "Reports", path: "/reports" },
          { icon: UserCheck, label: "Staff", path: "/staff" },
          { icon: Settings, label: "Settings", path: "/settings" },
        ];
      case "doctor":
        return [
          ...baseItems,
          { icon: Users, label: "Patients", path: "/patients" },
          { icon: Calendar, label: "Appointments", path: "/appointments" },
          { icon: TestTube, label: "Lab Results", path: "/doctor/lab-results" },
        ];
      case "nurse":
        return [
          ...baseItems,
          { icon: Users, label: "Patients", path: "/patients" },
          { icon: Calendar, label: "Appointments", path: "/appointments" },
          { icon: Activity, label: "Vitals", path: "/vitals" },
        ];
      case "pharmacist":
        return [
          ...baseItems,
          {
            icon: ClipboardList,
            label: "Prescriptions",
            path: "/prescriptions",
          },
          { icon: Pill, label: "Pharmacy", path: "/pharmacy" },
          { icon: Users, label: "Patients", path: "/patients" },
          { icon: FileText, label: "Reports", path: "/reports" },
        ];
      case "receptionist":
        return [
          ...baseItems,
          { icon: Users, label: "Patients", path: "/patients" },
          { icon: Calendar, label: "Appointments", path: "/appointments" },
        ];
      case "laboratory":
        return [
          ...baseItems,
          { icon: TestTube, label: "Laboratory", path: "/laboratory" },
          { icon: Users, label: "Patients", path: "/patients" },
        ];
      default:
        return baseItems;
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="bg-gradient-to-b from-blue-900 to-indigo-900 text-white w-64 min-h-screen flex flex-col shadow-xl">
      {/* Logo Section */}
      <div className="p-6 border-b border-indigo-700">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-lg flex items-center justify-center shadow-md">
            <img src="logo.png" alt="" className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg">Clinic</h1>
            <p className="text-xs text-indigo-200">Wollega University</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "bg-white/10 text-white shadow-lg"
                      : "text-indigo-200 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive
                        ? "text-white"
                        : "text-indigo-300 group-hover:text-white"
                    }`}
                  />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile & Actions */}
      <div className="p-4 border-t border-indigo-700">
        <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-white/5 mb-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white text-sm font-medium">
                {user?.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-indigo-900"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.name}
            </p>
            <p className="text-xs text-indigo-300 capitalize">{user?.role}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={logout}
            className="flex items-center justify-center space-x-1 px-3 py-2 text-indigo-200 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
          <button className="flex items-center justify-center space-x-1 px-3 py-2 text-indigo-200 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-xs">
            <HelpCircle className="w-4 h-4" />
            <span>Help</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
