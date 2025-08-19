import React, { useState, useEffect } from "react";
import { Calendar, Plus, User } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Appointment } from "../../types";
import AppointmentForm from "./AppointmentForm";
import Button from "../UI/Button";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom"; // ✅ import navigate

type Patient = {
  id: string;
  first_name: string;
  last_name: string;
};

export default function AppointmentCalendar() {
  const { user } = useAuth();
  const navigate = useNavigate(); // ✅ initialize navigate

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
    fetchAppointments();
  }, [user]);

  async function fetchPatients() {
    const { data, error } = await supabase
      .from("patients")
      .select("id, first_name, last_name");
    if (error) console.error(error);
    else setPatients(data || []);
  }

  async function fetchAppointments() {
    if (!user) return;
    setLoading(true);

    let query = supabase.from("appointments").select("*");

    if (user.role === "doctor" || user.role === "nurse") {
      query = query.eq("doctor_id", user.id);
    }

    if (user.role === "receptionist") {
      setAppointments([]);
      setLoading(false);
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    query = query.gte("date", today).order("date", { ascending: true });

    const { data, error } = await query;
    if (error) console.error("Error fetching appointments:", error);
    else setAppointments(data || []);

    setLoading(false);
  }

  async function handleAddAppointment(appointmentData: Partial<Appointment>) {
    const { data, error } = await supabase
      .from("appointments")
      .insert([appointmentData])
      .select("*");
    if (error) console.error(error);
    else if (data) setAppointments((prev) => [...prev, ...data]);
    setShowForm(false);
  }

  function renderAppointments() {
    if (loading) return <p className="text-gray-500">Loading...</p>;
    if (user.role === "receptionist")
      return (
        <p className="text-gray-500">
          You can add appointments but not view them.
        </p>
      );
    if (appointments.length === 0)
      return (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 mx-auto text-gray-300" />
          <p className="mt-4 text-gray-600">No upcoming appointments found.</p>
        </div>
      );

    return (
      <ul className="space-y-4">
        <AnimatePresence>
          {appointments.map((appt, index) => {
            const patient = patients.find((p) => p.id === appt.patient_id);
            const patientName = patient
              ? `${patient.first_name} ${patient.last_name}`
              : "Unknown Patient";

            return (
              <motion.li
                key={appt.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="p-4 bg-white rounded-2xl shadow hover:shadow-lg transition-all flex justify-between items-center cursor-pointer"
                onClick={
                  () =>
                    user?.role === "doctor" &&
                    navigate(`/appointment/${appt.id}`) // ✅ navigate to route
                }
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" /> {patientName}
                    </p>
                    <p className="text-sm text-gray-500">{appt.date}</p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 text-xs rounded-full font-medium ${
                    appt.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : appt.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {appt.status}
                </span>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    );
  }

  return (
    <div className="p-6 bg-gray-50 rounded-2xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Upcoming Appointments
        </h2>
        {(user.role === "admin" || user.role === "receptionist") && (
          <Button
            onClick={() => setShowForm(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            New Appointment
          </Button>
        )}
      </div>

      {renderAppointments()}

      {showForm && (
        <AppointmentForm
          patients={patients}
          onClose={() => setShowForm(false)}
          onSubmit={handleAddAppointment}
        />
      )}
    </div>
  );
}
