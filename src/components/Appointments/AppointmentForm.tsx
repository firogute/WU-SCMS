import React, { useState, useEffect } from "react";
import { X, Save, Calendar } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Appointment } from "../../types";
import Button from "../UI/Button";
import FormField from "../UI/FormField";

interface AppointmentFormProps {
  appointment?: Appointment;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (appointmentData: Partial<Appointment>) => void;
}

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
}

interface Doctor {
  id: string;
  name: string;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  appointment,
  isOpen,
  onClose,
  onSaved,
}) => {
  const [formData, setFormData] = useState({
    patient_id: appointment?.patient_id || "",
    doctor_id: appointment?.doctor_id || "",
    date: appointment?.date || new Date().toISOString().split("T")[0],
    time: appointment?.time || "09:00",
    type: appointment?.type || "consultation",
    status: appointment?.status || "scheduled",
    symptoms: appointment?.symptoms || "",
    notes: appointment?.notes || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchPatients = async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("id, first_name, last_name")
        .order("first_name", { ascending: true });
      if (!error && data) setPatients(data);
    };

    const fetchDoctors = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, name")
        .eq("role", "doctor")
        .order("name", { ascending: true });
      if (!error && data) setDoctors(data);
    };

    fetchPatients();
    fetchDoctors();
  }, [isOpen]);

  useEffect(() => {
    if (appointment) {
      setFormData({
        patient_id: appointment.patient_id || "",
        doctor_id: appointment.doctor_id || "",
        date: appointment.date || new Date().toISOString().split("T")[0],
        time: appointment.time || "09:00",
        type: appointment.type || "consultation",
        status: appointment.status || "scheduled",
        symptoms: appointment.symptoms || "",
        notes: appointment.notes || "",
      });
    } else {
      setFormData({
        patient_id: "",
        doctor_id: "",
        date: new Date().toISOString().split("T")[0],
        time: "09:00",
        type: "consultation",
        status: "scheduled",
        symptoms: "",
        notes: "",
      });
    }
    setErrors({});
    setSubmitError("");
  }, [appointment, isOpen]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.patient_id) newErrors.patient_id = "Patient is required";
    if (!formData.doctor_id) newErrors.doctor_id = "Doctor is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.time) newErrors.time = "Time is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    if (!validateForm()) return;

    setLoading(true);

    try {
      const appointmentData = {
        patient_id: formData.patient_id,
        doctor_id: formData.doctor_id,
        date: formData.date,
        time: formData.time + ":00",
        type: formData.type,
        status: formData.status,
        symptoms: formData.symptoms,
        notes: formData.notes,
        updated_at: new Date().toISOString(),
      };

      if (appointment?.id) {
        const { error } = await supabase
          .from("appointments")
          .update(appointmentData)
          .eq("id", appointment.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("appointments")
          .insert([
            { ...appointmentData, created_at: new Date().toISOString() },
          ]);
        if (error) throw error;
      }

      setLoading(false);
      onClose();
      if (onSaved) onSaved(appointmentData);
    } catch (error: any) {
      setLoading(false);
      setSubmitError(error.message);
      console.error("Error saving appointment:", error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (submitError) {
      setSubmitError("");
    }
  };

  const timeSlots = Array.from({ length: 10 }, (_, i) => {
    const hour = 9 + i;
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-2xl">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-6 pt-6 pb-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {appointment
                      ? "Edit Appointment"
                      : "Schedule New Appointment"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {submitError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                  <strong>Error:</strong> {submitError}
                </div>
              )}

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Patient" required error={errors.patient_id}>
                    <select
                      value={formData.patient_id}
                      onChange={(e) =>
                        handleInputChange("patient_id", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select patient</option>
                      {patients.map((patient) => (
                        <option key={patient.id} value={patient.id}>
                          {patient.first_name} {patient.last_name}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Doctor" required error={errors.doctor_id}>
                    <select
                      value={formData.doctor_id}
                      onChange={(e) =>
                        handleInputChange("doctor_id", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select doctor</option>
                      {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.name}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Date" required error={errors.date}>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        handleInputChange("date", e.target.value)
                      }
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </FormField>

                  <FormField label="Time" required error={errors.time}>
                    <select
                      value={formData.time}
                      onChange={(e) =>
                        handleInputChange("time", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Appointment Type">
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        handleInputChange("type", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="consultation">Consultation</option>
                      <option value="follow-up">Follow-up</option>
                      <option value="emergery">Emergency</option>
                      <option value="checkup">Checkup</option>
                    </select>
                  </FormField>

                  <FormField label="Status">
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        handleInputChange("status", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="no-show">No Show</option>
                    </select>
                  </FormField>
                </div>

                <FormField label="Symptoms/Reason">
                  <textarea
                    value={formData.symptoms}
                    onChange={(e) =>
                      handleInputChange("symptoms", e.target.value)
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe symptoms or reason for visit..."
                  />
                </FormField>

                <FormField label="Notes">
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Additional notes..."
                  />
                </FormField>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {appointment
                      ? "Update Appointment"
                      : "Schedule Appointment"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AppointmentForm;
