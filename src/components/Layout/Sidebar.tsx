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
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const Sidebar: React.FC = () => {
  const { user } = useAuth();
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
    <aside className="bg-blue-100 shadow-lg w-64 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            <img src="logo.png" alt="" className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg">SCMS</h1>
            <p className="text-xs text-gray-500">Wollega University</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-6">
        <ul className="space-y-1 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 px-4 py-2">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">
              {user?.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
