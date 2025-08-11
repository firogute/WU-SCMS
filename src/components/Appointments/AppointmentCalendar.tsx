import React, { useState, useEffect } from "react";
import { Calendar, Clock, Plus, Filter, Search } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Appointment } from "../../types";
import AppointmentForm from "./AppointmentForm";
import Button from "../UI/Button";
import { useAuth } from "../../contexts/AuthContext";

type Patient = {
  id: string;
  first_name: string;
  last_name: string;
};

type Doctor = {
  id: string;
  name: string;
};

const AppointmentCalendar: React.FC = () => {
  const { user, logout } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<
    Appointment | undefined
  >(undefined);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patientsMap, setPatientsMap] = useState<Record<string, Patient>>({});
  const [doctorsMap, setDoctorsMap] = useState<Record<string, Doctor>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data: appointments, patients, doctors
  useEffect(() => {
    fetchAllData();
  }, []);

  async function fetchAllData() {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch appointments
      const { data: appointmentsData, error: appointmentsError } =
        await supabase
          .from("appointments")
          .select("*")
          .eq("doctor_id", user?.id)
          .order("date", { ascending: true })
          .order("time", { ascending: true });

      if (appointmentsError) throw appointmentsError;

      // 2. Fetch patients
      const { data: patientsData, error: patientsError } = await supabase
        .from("patients")
        .select("id, first_name, last_name");

      if (patientsError) throw patientsError;

      // 3. Fetch doctors (users with role 'doctor')
      const { data: doctorsData, error: doctorsError } = await supabase
        .from("users")
        .select("id, name")
        .eq("role", "doctor");

      if (doctorsError) throw doctorsError;

      // Map patients by id for quick lookup
      const patientsMapTemp: Record<string, Patient> = {};
      patientsData?.forEach((p) => {
        if (p.id) patientsMapTemp[p.id] = p;
      });

      // Map doctors by id for quick lookup
      const doctorsMapTemp: Record<string, Doctor> = {};
      doctorsData?.forEach((d) => {
        if (d.id) doctorsMapTemp[d.id] = d;
      });

      setAppointments(appointmentsData || []);
      setPatientsMap(patientsMapTemp);
      setDoctorsMap(doctorsMapTemp);
    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }

  const timeSlots = Array.from({ length: 10 }, (_, i) => {
    const hour = 9 + i;
    return `${hour.toString().padStart(2, "0")}:00:00`;
  });

  const getAppointmentForSlot = (time: string) => {
    return appointments.find(
      (apt) =>
        apt.time === time &&
        apt.date === selectedDate.toISOString().split("T")[0]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "no-show":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "consultation":
        return "bg-purple-100 text-purple-800";
      case "follow-up":
        return "bg-yellow-100 text-yellow-800";
      case "emergency":
        return "bg-red-100 text-red-800";
      case "checkup":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleAddAppointment = () => {
    setEditingAppointment(undefined);
    setShowAppointmentForm(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setShowAppointmentForm(true);
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      try {
        const { error } = await supabase
          .from("appointments")
          .delete()
          .eq("id", appointmentId);

        if (error) throw error;
        await fetchAllData();
      } catch (err: any) {
        alert(
          "Failed to delete appointment: " + (err.message || "Unknown error")
        );
      }
    }
  };

  const handleSaveAppointment = async (
    appointmentData: Partial<Appointment>
  ) => {
    try {
      if (appointmentData.id) {
        // Update existing appointment
        const { error } = await supabase
          .from("appointments")
          .update({ ...appointmentData, updated_at: new Date().toISOString() })
          .eq("id", appointmentData.id);

        if (error) throw error;
      } else {
        // Insert new appointment
        const newAppointment = {
          ...appointmentData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from("appointments")
          .insert([newAppointment]);

        if (error) throw error;
      }
      await fetchAllData();
      setShowAppointmentForm(false);
    } catch (err: any) {
      alert("Failed to save appointment: " + (err.message || "Unknown error"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600">
            Manage patient appointments and scheduling
          </p>
        </div>
        <Button onClick={handleAddAppointment} icon={Plus}>
          New Appointment
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate.toISOString().split("T")[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                {(["day", "week", "month"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1 text-sm rounded-md capitalize transition-colors ${
                      viewMode === mode
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search appointments..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="p-6 text-center text-gray-600">
            Loading appointments...
          </div>
        )}

        {error && (
          <div className="p-6 text-center text-red-600 font-semibold">
            {error}
          </div>
        )}

        {viewMode === "day" && !loading && !error && (
          <div className="p-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h3>

              <div className="grid gap-2">
                {timeSlots.map((time) => {
                  const appointment = getAppointmentForSlot(time);
                  return (
                    <div
                      key={time}
                      className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="w-20 text-sm font-medium text-gray-600 flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {time.slice(0, 5)} {/* Show HH:mm */}
                      </div>

                      {appointment ? (
                        <div
                          className={`flex-1 p-4 rounded-lg border-2 ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-semibold">
                                  {patientsMap[appointment.patient_id]
                                    ? `${
                                        patientsMap[appointment.patient_id]
                                          .first_name
                                      } ${
                                        patientsMap[appointment.patient_id]
                                          .last_name
                                      }`
                                    : "Unknown Patient"}
                                </h4>
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${getTypeColor(
                                    appointment.type
                                  )}`}
                                >
                                  {appointment.type}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">
                                Dr.{" "}
                                {doctorsMap[appointment.doctor_id]
                                  ? doctorsMap[appointment.doctor_id].name
                                  : "Unknown Doctor"}
                              </p>
                              {appointment.symptoms && (
                                <p className="text-sm text-gray-500">
                                  Symptoms: {appointment.symptoms}
                                </p>
                              )}
                              {appointment.notes && (
                                <p className="text-sm text-gray-500">
                                  Notes: {appointment.notes}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                                  appointment.status
                                )}`}
                              >
                                {appointment.status}
                              </span>
                              <div className="flex space-x-1">
                                <button
                                  onClick={() =>
                                    handleEditAppointment(appointment)
                                  }
                                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                  title="Edit appointment"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteAppointment(appointment.id)
                                  }
                                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                                  title="Delete appointment"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="flex-1 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                          onClick={handleAddAppointment}
                        >
                          <span className="text-sm">
                            Available - Click to schedule
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {viewMode === "week" && (
          <div className="p-6 text-center text-gray-500 py-8">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Week view coming soon...</p>
          </div>
        )}

        {viewMode === "month" && (
          <div className="p-6 text-center text-gray-500 py-8">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Month view coming soon...</p>
          </div>
        )}
      </div>

      {/* Appointment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  appointments.filter(
                    (apt) => apt.date === new Date().toISOString().split("T")[0]
                  ).length
                }
              </p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {
                  appointments.filter((apt) => apt.status === "completed")
                    .length
                }
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-blue-600">
                {
                  appointments.filter((apt) => apt.status === "scheduled")
                    .length
                }
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">
                {
                  appointments.filter((apt) => apt.status === "cancelled")
                    .length
                }
              </p>
            </div>
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <AppointmentForm
        appointment={editingAppointment}
        isOpen={showAppointmentForm}
        onClose={() => setShowAppointmentForm(false)}
        onSave={handleSaveAppointment}
      />
    </div>
  );
};

export default AppointmentCalendar;
