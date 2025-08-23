import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Pill,
  User,
  Stethoscope,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Printer,
  ArrowLeft,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { format } from "date-fns";

interface Prescription {
  id: string;
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  status: string;
  created_at: string;
  medicines: {
    name: string;
    generic_name: string;
    manufacturer: string;
    description: string;
  };
  medical_records: {
    id: string;
    diagnosis: string;
    treatment: string;
    vital_signs: any;
    lab_results: any;
    patients: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
      medical_history: string[];
      allergies: string[];
      date_of_birth: string;
      gender: string;
      blood_type: string;
    };
    users: {
      id: string;
      name: string;
      email: string;
      specialization: string;
    };
  };
}

const PrescriptionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [showMedicalHistory, setShowMedicalHistory] = useState(false);
  const [showAllergies, setShowAllergies] = useState(false);
  const [showVitalSigns, setShowVitalSigns] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Prescription_${id}`,
  });

  useEffect(() => {
    const fetchPrescription = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("prescriptions")
          .select(
            `
            id,
            medicine_name,
            dosage,
            frequency,
            duration,
            instructions,
            status,
            created_at,
            medicines (
              name,
              generic_name,
              manufacturer,
              description
            ),
            medical_records (
              id,
              diagnosis,
              treatment,
              vital_signs,
              lab_results,
              patients (
                id,
                first_name,
                last_name,
                email,
                phone,
                medical_history,
                allergies,
                date_of_birth,
                gender,
                blood_type
              ),
              users (
                id,
                name,
                email,
                specialization
              )
            )
          `
          )
          .eq("id", id)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Prescription not found");

        setPrescription(data);
        setNewStatus(data.status);
      } catch (err) {
        console.error("Error fetching prescription:", err);
        setError("Failed to load prescription details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "pharmacist") {
      fetchPrescription();
    }
  }, [id, user]);

  const updateStatus = async () => {
    if (!prescription || newStatus === prescription.status) return;

    try {
      const { error } = await supabase
        .from("prescriptions")
        .update({ status: newStatus })
        .eq("id", prescription.id);

      if (error) throw error;

      setPrescription((prev) => (prev ? { ...prev, status: newStatus } : null));
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update status.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !prescription) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-100 text-red-800 p-4 rounded-lg">
          {error || "Prescription not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Prescription Details
            </h1>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handlePrint}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </button>
            <button className="p-2 hover:bg-gray-100 rounded">
              <MoreHorizontal className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div ref={printRef} className="space-y-6">
          {/* Prescription Info Card */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Pill className="h-5 w-5 mr-2 text-blue-600" />
              Prescription Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Medicine</label>
                <p className="text-gray-900">{prescription.medicine_name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Generic Name</label>
                <p className="text-gray-900">
                  {prescription.medicines?.generic_name}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Dosage</label>
                <p className="text-gray-900">{prescription.dosage}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Frequency</label>
                <p className="text-gray-900">{prescription.frequency}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Duration</label>
                <p className="text-gray-900">{prescription.duration}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Manufacturer</label>
                <p className="text-gray-900">
                  {prescription.medicines?.manufacturer}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-500">Description</label>
                <p className="text-gray-900">
                  {prescription.medicines?.description}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-500">Instructions</label>
                <p className="text-gray-900">{prescription.instructions}</p>
              </div>
            </div>
          </div>

          {/* Patient Info Card */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-green-600" />
              Patient Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Name</label>
                <p className="text-gray-900">
                  {prescription.medical_records.patients.first_name}{" "}
                  {prescription.medical_records.patients.last_name}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="text-gray-900">
                  {prescription.medical_records.patients.email}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Phone</label>
                <p className="text-gray-900">
                  {prescription.medical_records.patients.phone}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Date of Birth</label>
                <p className="text-gray-900">
                  {format(
                    new Date(
                      prescription.medical_records.patients.date_of_birth
                    ),
                    "PPP"
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Gender</label>
                <p className="text-gray-900">
                  {prescription.medical_records.patients.gender}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Blood Type</label>
                <p className="text-gray-900">
                  {prescription.medical_records.patients.blood_type}
                </p>
              </div>
              <div className="md:col-span-2">
                <button
                  onClick={() => setShowMedicalHistory(!showMedicalHistory)}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800 mb-2"
                >
                  {showMedicalHistory ? (
                    <ChevronUp className="h-4 w-4 mr-1" />
                  ) : (
                    <ChevronDown className="h-4 w-4 mr-1" />
                  )}
                  Medical History
                </button>
                {showMedicalHistory && (
                  <ul className="list-disc pl-5 text-gray-900">
                    {prescription.medical_records.patients.medical_history
                      ?.length > 0 ? (
                      prescription.medical_records.patients.medical_history.map(
                        (item, index) => <li key={index}>{item}</li>
                      )
                    ) : (
                      <li>No medical history recorded</li>
                    )}
                  </ul>
                )}
              </div>
              <div className="md:col-span-2">
                <button
                  onClick={() => setShowAllergies(!showAllergies)}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800 mb-2"
                >
                  {showAllergies ? (
                    <ChevronUp className="h-4 w-4 mr-1" />
                  ) : (
                    <ChevronDown className="h-4 w-4 mr-1" />
                  )}
                  Allergies
                </button>
                {showAllergies && (
                  <ul className="list-disc pl-5 text-gray-900">
                    {prescription.medical_records.patients.allergies?.length >
                    0 ? (
                      prescription.medical_records.patients.allergies.map(
                        (item, index) => <li key={index}>{item}</li>
                      )
                    ) : (
                      <li>No allergies recorded</li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Doctor Info Card */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Stethoscope className="h-5 w-5 mr-2 text-purple-600" />
              Doctor Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Name</label>
                <p className="text-gray-900">
                  {prescription.medical_records.users.name}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Specialization</label>
                <p className="text-gray-900">
                  {prescription.medical_records.users.specialization}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="text-gray-900">
                  {prescription.medical_records.users.email}
                </p>
              </div>
            </div>
          </div>

          {/* Medical Record Card */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-orange-600" />
              Medical Record
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm text-gray-500">Diagnosis</label>
                <p className="text-gray-900">
                  {prescription.medical_records.diagnosis}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Treatment</label>
                <p className="text-gray-900">
                  {prescription.medical_records.treatment}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Created At</label>
                <p className="text-gray-900">
                  {format(new Date(prescription.created_at), "PPP p")}
                </p>
              </div>
              <div>
                <button
                  onClick={() => setShowVitalSigns(!showVitalSigns)}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800 mb-2"
                >
                  {showVitalSigns ? (
                    <ChevronUp className="h-4 w-4 mr-1" />
                  ) : (
                    <ChevronDown className="h-4 w-4 mr-1" />
                  )}
                  Vital Signs
                </button>
                {showVitalSigns && (
                  <div className="text-gray-900">
                    {prescription.medical_records.vital_signs ? (
                      <pre className="text-sm">
                        {JSON.stringify(
                          prescription.medical_records.vital_signs,
                          null,
                          2
                        )}
                      </pre>
                    ) : (
                      <p>No vital signs recorded</p>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-500">Lab Results</label>
                {prescription.medical_records.lab_results ? (
                  <pre className="text-sm text-gray-900">
                    {JSON.stringify(
                      prescription.medical_records.lab_results,
                      null,
                      2
                    )}
                  </pre>
                ) : (
                  <p className="text-gray-900">No lab results recorded</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status Update Section (outside print) */}
        <div className="mt-6 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Update Status</h2>
          <div className="flex items-center space-x-4">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="ready">Ready</option>
              <option value="dispensed">Dispensed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              onClick={updateStatus}
              disabled={newStatus === prescription.status}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionDetail;
