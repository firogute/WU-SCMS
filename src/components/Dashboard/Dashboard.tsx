import React from "react";
import {
  Users,
  Calendar,
  Clock,
  Pill,
  AlertTriangle,
  Activity,
  UserCheck,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import StatCard from "./StatCard";

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Example realistic stats for roles
  const getStatsForRole = () => {
    switch (user?.role) {
      case "admin":
        return [
          {
            title: "Total Registered Students",
            value: "912",
            change: "+2% this month",
            changeType: "increase" as "increase",
            icon: Users,
            color: "blue",
          },
          {
            title: "Appointments Today",
            value: "34",
            change: "21 completed",
            changeType: "neutral" as "neutral",
            icon: Calendar,
            color: "green",
          },
          {
            title: "On-Duty Staff",
            value: "7",
            change: "1 on break",
            changeType: "neutral",
            icon: UserCheck,
            color: "purple",
          },
          {
            title: "Service Fees Collected",
            value: "$2,940",
            change: "+5.4% from last month",
            changeType: "increase",
            icon: TrendingUp,
            color: "green",
          },
        ];
      case "doctor":
        return [
          {
            title: "My Patients Today",
            value: "12",
            change: "5 completed",
            changeType: "neutral",
            icon: Users,
            color: "blue",
          },
          {
            title: "Upcoming Consultations",
            value: "4",
            change: "2 urgent",
            changeType: "neutral",
            icon: Clock,
            color: "yellow",
          },
          {
            title: "Prescriptions Written",
            value: "8",
            change: "+2 since yesterday",
            changeType: "increase",
            icon: Pill,
            color: "purple",
          },
          {
            title: "Follow-Up Cases",
            value: "3",
            change: "Due today",
            changeType: "neutral",
            icon: Activity,
            color: "green",
          },
        ];
      case "pharmacist":
        return [
          {
            title: "Prescriptions Filled",
            value: "28",
            change: "Today",
            changeType: "neutral",
            icon: Pill,
            color: "blue",
          },
          {
            title: "Low Stock Alerts",
            value: "6",
            change: "3 critical",
            changeType: "decrease" as "decrease",
            icon: AlertTriangle,
            color: "red",
          },
          {
            title: "Medicines in Inventory",
            value: "198",
            change: "+12 new stock",
            changeType: "increase",
            icon: Pill,
            color: "green",
          },
          {
            title: "Pending Orders",
            value: "4",
            change: "Arriving this week",
            changeType: "neutral",
            icon: Clock,
            color: "yellow",
          },
        ];
      default:
        return [];
    }
  };

  const stats = getStatsForRole();

  // Example realistic activity feed
  const recentActivities = [
    {
      time: "5 min ago",
      activity: "New patient registered: Alex Rivera",
      type: "user",
    },
    {
      time: "14 min ago",
      activity: "Sports injury assessment completed for John Lee",
      type: "appointment",
    },
    {
      time: "37 min ago",
      activity: "Flu vaccine administered to Sarah Kim",
      type: "prescription",
    },
    {
      time: "1 hr ago",
      activity: "Low stock alert: Disposable gloves",
      type: "alert",
    },
    {
      time: "3 hrs ago",
      activity: "Lab report uploaded for Patient #1043",
      type: "report",
    },
  ];

  const typeColors: Record<string, string> = {
    user: "bg-blue-500",
    appointment: "bg-green-500",
    prescription: "bg-purple-500",
    alert: "bg-red-500",
    report: "bg-gray-500",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-gray-600">
            Here’s your clinic overview for {today}.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Clinic Status
        </h3>
        <div className="flex items-center justify-between text-sm text-gray-700">
          <p>
            Clinic Hours: <span className="font-medium">8:00 AM – 6:00 PM</span>
          </p>
          <p className="text-green-600 font-medium">Open Now</p>
        </div>
        <p className="text-sm text-gray-500 mt-1">Next break: 1:00 PM</p>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Activity
          </h3>
        </div>
        <div className="p-6 space-y-4">
          {recentActivities.map((item, index) => (
            <div
              key={index}
              className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-md"
            >
              <div
                className={`w-2 h-2 rounded-full ${typeColors[item.type]}`}
              />
              <div className="flex-1">
                <p className="text-sm text-gray-900">{item.activity}</p>
                <p className="text-xs text-gray-500">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
