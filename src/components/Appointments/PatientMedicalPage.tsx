import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useParams } from "react-router-dom";
import { Appointment } from "../../types";

type Visit = {
  date: string;
  doctor_id: string;
  symptoms: string;
  diagnosis?: string;
  lab_tests?: { test_name: string; status: string; assigned_to?: string }[];
  nurse_tasks?: { task: string; status: string; assigned_to?: string }[];
  notes?: string;
};

export default function PatientMedicalPage() {
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [history, setHistory] = useState<Visit[]>([]);
  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [labAssigned, setLabAssigned] = useState(false);
  const [nurseAssigned, setNurseAssigned] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!appointmentId) return;
    fetchAppointment();
  }, [appointmentId]);

  async function fetchAppointment() {
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", appointmentId)
      .single();
    if (error) console.error(error);
    else {
      setAppointment(data);
      fetchHistory(data.patient_id);
    }
  }

  async function fetchHistory(patientId: string) {
    const { data, error } = await supabase
      .from("medical_history")
      .select("history")
      .eq("patient_id", patientId)
      .single();
    if (error) console.error(error);
    else setHistory(data?.history || []);
    setLoading(false);
  }

  async function handleSave() {
    if (!appointment) return;

    const newVisit: Visit = {
      date: new Date().toISOString(),
      doctor_id: appointment.doctor_id,
      symptoms,
      diagnosis,
      lab_tests: labAssigned
        ? [{ test_name: "New Test", status: "pending" }]
        : [],
      nurse_tasks: nurseAssigned
        ? [{ task: "Check vitals", status: "pending" }]
        : [],
    };

    const { error } = await supabase.from("medical_history").upsert(
      [
        {
          patient_id: appointment.patient_id,
          history: supabase.raw("COALESCE(history, '[]'::jsonb) || ?", [
            JSON.stringify(newVisit),
          ]),
        },
      ],
      { onConflict: ["patient_id"] }
    );

    if (error) console.error(error);
    else {
      setHistory((prev) => [...prev, newVisit]);
      setSymptoms("");
      setDiagnosis("");
      setLabAssigned(false);
      setNurseAssigned(false);
    }
  }

  if (loading) return <p>Loading...</p>;
  if (!appointment) return <p>Appointment not found.</p>;

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Patient Medical Page</h2>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Previous Visits</h3>
        {history.length === 0 ? (
          <p>No previous records found.</p>
        ) : (
          <ul className="space-y-4 max-h-64 overflow-y-auto">
            {history.map((visit, idx) => (
              <li key={idx} className="p-3 border rounded">
                <p>
                  <strong>Date:</strong> {new Date(visit.date).toLocaleString()}
                </p>
                <p>
                  <strong>Symptoms:</strong> {visit.symptoms}
                </p>
                <p>
                  <strong>Diagnosis:</strong> {visit.diagnosis || "N/A"}
                </p>
                <p>
                  <strong>Lab Tests:</strong>{" "}
                  {visit.lab_tests?.length
                    ? visit.lab_tests.map((t) => t.test_name).join(", ")
                    : "None"}
                </p>
                <p>
                  <strong>Nurse Tasks:</strong>{" "}
                  {visit.nurse_tasks?.length
                    ? visit.nurse_tasks.map((t) => t.task).join(", ")
                    : "None"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Add New Visit</h3>
        <textarea
          className="w-full p-2 border rounded mb-2"
          placeholder="Symptoms"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
        />
        <textarea
          className="w-full p-2 border rounded mb-2"
          placeholder="Diagnosis"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
        />
        <div className="flex gap-4 mb-2">
          <label>
            <input
              type="checkbox"
              checked={labAssigned}
              onChange={(e) => setLabAssigned(e.target.checked)}
            />{" "}
            Assign Lab
          </label>
          <label>
            <input
              type="checkbox"
              checked={nurseAssigned}
              onChange={(e) => setNurseAssigned(e.target.checked)}
            />{" "}
            Assign Nurse
          </label>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save Visit
        </button>
      </div>
    </div>
  );
}
