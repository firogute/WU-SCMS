import React, { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  User,
  Filter,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  Download,
  Printer,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  Stethoscope,
  BarChart3,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Appointment } from "../../types";
import AppointmentForm from "./AppointmentForm";
import Button from "../UI/Button";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isTomorrow from "dayjs/plugin/isTomorrow";
import advancedFormat from "dayjs/plugin/advancedFormat";

dayjs.extend(isToday);
dayjs.extend(isTomorrow);
dayjs.extend(advancedFormat);

type Patient = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
};

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
};

type AppointmentStats = {
  total: number;
  completed: number;
  pending: number;
  cancelled: number;
  noShow: number;
};

export default function AppointmentCalendar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<UserProfile[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AppointmentStats>({
    total: 0,
    completed: 0,
    pending: 0,
    cancelled: 0,
    noShow: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<
    "today" | "upcoming" | "completed" | "all"
  >("today");
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  useEffect(() => {
    fetchPatients();
    fetchDoctors();
    fetchAppointments();
  }, [user]);

  useEffect(() => {
    filterAppointments();
    calculateStats();
  }, [appointments, statusFilter, typeFilter, searchQuery, viewMode]);

  async function fetchPatients() {
    const { data, error } = await supabase
      .from("patients")
      .select("id, first_name, last_name, email, phone");
    if (error) console.error(error);
    else setPatients(data || []);
  }

  async function fetchDoctors() {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, role, department")
      .eq("role", "doctor");
    if (error) console.error(error);
    else setDoctors(data || []);
  }

  async function fetchAppointments() {
    if (!user) return;
    setLoading(true);

    let query = supabase.from("appointments").select(`
      *,
      patients (first_name, last_name),
      users (name)
    `);

    // Different data access based on role
    if (user.role === "doctor") {
      query = query.eq("doctor_id", user.id);
    } else if (user.role === "nurse") {
      // Nurses can see all appointments but might have different permissions
      query = query;
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching appointments:", error);
    } else {
      setAppointments(data || []);
    }

    setLoading(false);
  }

  function filterAppointments() {
    let filtered = [...appointments];

    // Apply view mode filter first
    if (viewMode === "today") {
      filtered = filtered.filter((appt) => dayjs(appt.date).isToday());
    } else if (viewMode === "upcoming") {
      filtered = filtered.filter(
        (appt) =>
          dayjs(appt.date).isAfter(dayjs()) && appt.status === "scheduled"
      );
    } else if (viewMode === "completed") {
      filtered = filtered.filter(
        (appt) => appt.status === "completed" || appt.status === "cancelled"
      );
    }
    // "all" view mode shows everything

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((appt) => appt.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((appt) => appt.type === typeFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((appt) => {
        // Check patient name
        const patient = patients.find((p) => p.id === appt.patient_id);
        if (patient) {
          const fullName =
            `${patient.first_name} ${patient.last_name}`.toLowerCase();
          if (fullName.includes(query)) return true;
        }

        // Check doctor name
        const doctor = doctors.find((d) => d.id === appt.doctor_id);
        if (doctor && doctor.name.toLowerCase().includes(query)) return true;

        return false;
      });
    }

    setFilteredAppointments(filtered);
  }

  function calculateStats() {
    const todayAppointments = appointments.filter((a) =>
      dayjs(a.date).isToday()
    );
    const stats = {
      total: todayAppointments.length,
      completed: todayAppointments.filter((a) => a.status === "completed")
        .length,
      pending: todayAppointments.filter((a) => a.status === "scheduled").length,
      cancelled: todayAppointments.filter((a) => a.status === "cancelled")
        .length,
      noShow: todayAppointments.filter((a) => a.status === "no-show").length,
    };
    setStats(stats);
  }

  async function handleAddAppointment(appointmentData: Partial<Appointment>) {
    if (!appointmentData) {
      console.error("No appointment data provided");
      return;
    }

    const cleanAppointmentData = Object.fromEntries(
      Object.entries(appointmentData).filter(([_, value]) => value != null)
    );

    const { data, error } = await supabase
      .from("appointments")
      .insert([cleanAppointmentData])
      .select("*");

    if (error) {
      console.error("Error adding appointment:", error);
      return;
    }

    if (data && data.length > 0) {
      const newAppointment = data[0];

      // Create a medical record for the new appointment
      await supabase.from("medical_records").insert({
        patient_id: newAppointment.patient_id,
        doctor_id: newAppointment.doctor_id,
        appointment_id: newAppointment.id,
        date: newAppointment.date,
        symptoms: newAppointment.symptoms || "",
        diagnosis: "",
        treatment: "",
        notes: "New appointment created",
      });

      setAppointments((prev) => [...prev, ...data]);
    }

    setShowForm(false);
    fetchAppointments();
  }

  async function handleUpdateAppointment(
    appointmentData: Partial<Appointment>
  ) {
    if (!editingAppointment) return;

    try {
      const { error } = await supabase
        .from("appointments")
        .update(appointmentData)
        .eq("id", editingAppointment.id);

      if (error) throw error;

      alert("Appointment updated successfully");
      setEditingAppointment(null);
      fetchAppointments();
    } catch (error) {
      console.error("Error updating appointment:", error);
      alert("Failed to update appointment");
    }
  }

  async function handleDeleteAppointment(appointmentId: string) {
    if (
      !confirm(
        "Are you sure you want to delete this appointment? This action cannot be undone."
      )
    )
      return;

    try {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", appointmentId);

      if (error) throw error;

      alert("Appointment deleted successfully");
      fetchAppointments();
    } catch (error) {
      console.error("Error deleting appointment:", error);
      alert("Failed to delete appointment");
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={14} className="text-green-500" />;
      case "scheduled":
        return <Clock size={14} className="text-blue-500" />;
      case "cancelled":
        return <XCircle size={14} className="text-red-500" />;
      case "no-show":
        return <AlertCircle size={14} className="text-orange-500" />;
      default:
        return <Clock size={14} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "no-show":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAppointmentDayType = (date: string) => {
    const appointmentDate = dayjs(date);
    if (appointmentDate.isToday()) return "today";
    if (appointmentDate.isTomorrow()) return "tomorrow";
    if (appointmentDate.isBefore(dayjs())) return "past";
    return "upcoming";
  };

  const handleStatusChange = async (
    appointmentId: string,
    newStatus: string
  ) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: newStatus })
        .eq("id", appointmentId);

      if (error) throw error;

      // Update local state
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === appointmentId ? { ...appt, status: newStatus } : appt
        )
      );

      alert("Appointment status updated successfully");
      setDropdownOpen(null);
    } catch (error) {
      console.error("Error updating appointment status:", error);
      alert("Failed to update appointment status");
    }
  };

  const toggleDropdown = (appointmentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen(dropdownOpen === appointmentId ? null : appointmentId);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setDropdownOpen(null);
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <div className="text-center p-4 rounded-lg border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
        <div className="text-gray-600">Today's Appointments</div>
      </div>
      <div className="text-center p-4 rounded-lg border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
        <div className="text-2xl font-bold text-green-600">
          {stats.completed}
        </div>
        <div className="text-gray-600">Completed</div>
      </div>
      <div className="text-center p-4 rounded-lg border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
        <div className="text-gray-600">Scheduled</div>
      </div>
      <div className="text-center p-4 rounded-lg border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
        <div className="text-gray-600">Cancelled</div>
      </div>
      <div className="text-center p-4 rounded-lg border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="text-2xl font-bold text-orange-600">{stats.noShow}</div>
        <div className="text-gray-600">No-Show</div>
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className="p-4 mb-6 bg-white rounded-lg border-0 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1">
          <div className="flex items-center gap-2">
            <Filter size={16} />
            <span className="font-medium">Filters:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-40 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no-show">No-Show</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full md:w-40 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="consultation">Consultation</option>
            <option value="follow-up">Follow-up</option>
            <option value="emergency">Emergency</option>
            <option value="checkup">Checkup</option>
          </select>

          <div className="relative w-full md:w-64">
            <Search
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search patients or doctors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            icon={<RefreshCw size={16} />}
            onClick={fetchAppointments}
            variant="outline"
          >
            Refresh
          </Button>
          {(user?.role === "admin" || user?.role === "receptionist") && (
            <Button icon={<Plus size={16} />} onClick={() => setShowForm(true)}>
              New Appointment
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  const renderViewTabs = () => {
    const tabs = [
      {
        key: "today",
        label: "Today's Appointments",
        icon: <Calendar size={16} />,
      },
      { key: "upcoming", label: "Upcoming", icon: <Clock size={16} /> },
      { key: "completed", label: "Completed", icon: <CheckCircle size={16} /> },
      { key: "all", label: "All Appointments", icon: <BarChart3 size={16} /> },
    ];

    return (
      <div className="mb-6">
        <div className="flex border-b">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`flex items-center gap-2 px-4 py-2 font-medium ${
                viewMode === tab.key
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setViewMode(tab.key as any)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderAppointmentItem = (appt: Appointment, index: number) => {
    const patient = patients.find((p) => p.id === appt.patient_id);
    const doctor = doctors.find((d) => d.id === appt.doctor_id);
    const patientName = patient
      ? `${patient.first_name} ${patient.last_name}`
      : "Unknown Patient";
    const doctorName = doctor ? `Dr. ${doctor.name}` : "Unknown Doctor";

    const dayType = getAppointmentDayType(appt.date);
    const isPast = dayType === "past";

    return (
      <motion.div
        key={appt.id}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.2 }}
        className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all flex justify-between items-center border border-gray-100"
      >
        <div className="flex items-center gap-4 flex-1">
          <div
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg ${
              dayType === "today"
                ? "bg-blue-100 text-blue-600"
                : dayType === "tomorrow"
                ? "bg-green-100 text-green-600"
                : isPast
                ? "bg-gray-100 text-gray-400"
                : "bg-purple-100 text-purple-600"
            }`}
          >
            <span className="font-semibold text-sm">
              {dayType === "today"
                ? "TODAY"
                : dayType === "tomorrow"
                ? "TOM"
                : dayjs(appt.date).format("DD")}
            </span>
            <span className="text-xs mt-[-2px]">
              {dayType === "today" || dayType === "tomorrow"
                ? ""
                : dayjs(appt.date).format("MMM")}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-gray-500" />
              <p className="font-medium text-gray-800 truncate">
                {patientName}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-gray-600">
              <span>{dayjs(appt.date).format("MMM D, YYYY")}</span>
              <span className="hidden sm:inline">•</span>
              <span>{appt.time}</span>
              <span className="hidden sm:inline">•</span>
              <span className="capitalize">{appt.type}</span>
              {(user?.role === "admin" || user?.role === "receptionist") && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center gap-1">
                    <Stethoscope size={12} />
                    {doctorName}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(
              appt.status
            )}`}
          >
            {getStatusIcon(appt.status)}
            {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
          </span>

          <div className="relative">
            <Button
              type="button"
              icon={<MoreVertical size={16} />}
              onClick={(e) => toggleDropdown(appt.id, e)}
            />

            {dropdownOpen === appt.id && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                {/* View Details - available for doctors and nurses only */}
                {(user?.role === "doctor" || user?.role === "nurse") && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(
                        `/appointment/${appt.id}/patient/${appt.patient_id}`
                      );
                      setDropdownOpen(null);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Eye size={14} className="mr-2" />
                    View Details
                  </button>
                )}

                {/* Edit and Delete - available for admin and receptionist only */}
                {(user?.role === "admin" || user?.role === "receptionist") && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingAppointment(appt);
                        setDropdownOpen(null);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Edit size={14} className="mr-2" />
                      Edit Appointment
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAppointment(appt.id);
                        setDropdownOpen(null);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <Trash2 size={14} className="mr-2" />
                      Delete Appointment
                    </button>
                  </>
                )}

                {/* Status change options - available for all roles except maybe receptionist? */}
                {(user?.role === "admin" ||
                  user?.role === "doctor" ||
                  user?.role === "nurse") && (
                  <>
                    <div className="border-t my-1"></div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(appt.id, "completed");
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Mark as Completed
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(appt.id, "cancelled");
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Mark as Cancelled
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(appt.id, "no-show");
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Mark as No-Show
                    </button>
                  </>
                )}

                {/* If receptionist should also be able to change status,: */}
                {/* <div className="border-t my-1"></div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(appt.id, "completed");
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Mark as Completed
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(appt.id, "cancelled");
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Mark as Cancelled
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(appt.id, "no-show");
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Mark as No-Show
              </button> */}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };
  const renderAppointmentsList = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (filteredAppointments.length === 0) {
      return (
        <div className="text-center py-12 bg-white rounded-lg border-0 shadow-sm">
          <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600">
            No appointments found matching your filters.
          </p>
          {(statusFilter !== "all" || typeFilter !== "all" || searchQuery) && (
            <Button
              onClick={() => {
                setStatusFilter("all");
                setTypeFilter("all");
                setSearchQuery("");
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          )}
        </div>
      );
    }

    // Group appointments by date
    const groupedAppointments = filteredAppointments.reduce((groups, appt) => {
      const date = dayjs(appt.date).format("YYYY-MM-DD");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(appt);
      return groups;
    }, {} as Record<string, Appointment[]>);

    return (
      <div className="space-y-6">
        {Object.entries(groupedAppointments)
          .sort(([dateA], [dateB]) => dayjs(dateA).diff(dayjs(dateB)))
          .map(([date, dateAppointments]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {dayjs(date).format("dddd, MMMM D, YYYY")}
                </h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {dateAppointments.length}
                </span>
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {dateAppointments.map((appt, index) =>
                    renderAppointmentItem(appt, index)
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Appointment Calendar
            </h1>
            <p className="text-gray-600">
              Manage and track all patient appointments
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button icon={<Download size={16} />} variant="outline">
              Export
            </Button>
            <Button icon={<Printer size={16} />} variant="outline">
              Print
            </Button>
          </div>
        </div>

        {renderStatsCards()}
        {renderViewTabs()}
        {renderFilters()}
        {renderAppointmentsList()}

        {showForm && (
          <AppointmentForm
            isOpen={showForm}
            onClose={() => setShowForm(false)}
            onSaved={handleAddAppointment}
            patients={patients}
            doctors={doctors}
          />
        )}

        {editingAppointment && (
          <AppointmentForm
            isOpen={!!editingAppointment}
            onClose={() => setEditingAppointment(null)}
            onSaved={handleUpdateAppointment}
            appointment={editingAppointment}
            patients={patients}
            doctors={doctors}
          />
        )}
      </div>
    </div>
  );
}
