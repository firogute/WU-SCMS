import React, { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Filter,
  Download,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Patient } from "../../types";
import PatientForm from "./PatientForm";
import Button from "../UI/Button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext"; // add auth context

const PatientList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // get logged-in user
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | undefined>(
    undefined
  );

  // Fetch patients from Supabase
  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setError("Failed to fetch patients");
      } else {
        setPatients(data as Patient[]);
      }

      setLoading(false);
    };

    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(
    (patient) =>
      `${patient.first_name} ${patient.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm)
  );

  const canAddPatient = user?.role === "admin" || user?.role === "receptionist"; // only admin/receptionist can add
  const canViewDetails = user?.role === "doctor" || user?.role === "nurse"; // doctor/nurse can view details if you want, adjust logic

  const handleAddPatient = () => {
    setEditingPatient(undefined);
    setShowPatientForm(true);
  };

  const handleEditPatient = (patient: Patient) => {
    if (canAddPatient) {
      setEditingPatient(patient);
      setShowPatientForm(true);
      setSelectedPatient(null);
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    if (!canAddPatient) return;
    if (window.confirm("Are you sure you want to delete this patient?")) {
      const { error } = await supabase
        .from("patients")
        .delete()
        .eq("id", patientId);
      if (error) {
        console.error("Delete failed:", error.message);
      } else {
        setPatients((prev) => prev.filter((p) => p.id !== patientId));
      }
    }
  };

  const handleSavePatient = async (patientData: Partial<Patient>) => {
    if (!canAddPatient) return;

    if (editingPatient) {
      const { data, error } = await supabase
        .from("patients")
        .update(patientData)
        .eq("id", editingPatient.id)
        .select();

      if (error) console.error("Update failed:", error.message);
      else if (data && data.length > 0) {
        setPatients((prev) =>
          prev.map((p) =>
            p.id === editingPatient.id ? { ...p, ...data[0] } : p
          )
        );
      }
    } else {
      const { data, error } = await supabase
        .from("patients")
        .insert([patientData])
        .select();

      if (error) console.error("Insert failed:", error.message);
      else if (data && data.length > 0)
        setPatients((prev) => [...prev, data[0]]);
    }

    setShowPatientForm(false);
  };

  const getAge = (dob: string) => {
    const birthDate = new Date(dob);
    const diff = Date.now() - birthDate.getTime();
    return new Date(diff).getUTCFullYear() - 1970;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600">
            Manage patient records and information
          </p>
        </div>
        {canAddPatient && (
          <Button onClick={handleAddPatient} icon={Plus}>
            Add Patient
          </Button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-gray-500">Loading patients...</div>
        ) : error ? (
          <div className="p-6 text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age/Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blood Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {canAddPatient && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className={`hover:bg-gray-50 cursor-pointer ${
                      !canViewDetails ? "cursor-default" : ""
                    }`}
                    onClick={() => {
                      if (canViewDetails) navigate(`/patients/${patient.id}`);
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="font-medium text-blue-600">
                            {patient.first_name[0]}
                            {patient.last_name[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {patient.first_name} {patient.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {patient.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {patient.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {patient.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getAge(patient.date_of_birth)} years
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {patient.gender}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {patient.blood_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(patient.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          patient.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {patient.status}
                      </span>
                    </td>
                    {canAddPatient && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative">
                          <button
                            onClick={() =>
                              setSelectedPatient(
                                selectedPatient === patient.id
                                  ? null
                                  : patient.id
                              )
                            }
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {selectedPatient === patient.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                              <div className="py-1">
                                {canViewDetails && (
                                  <button
                                    onClick={() => {
                                      setSelectedPatient(null);
                                      navigate(`/patients/${patient.id}`);
                                    }}
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  >
                                    <Eye className="w-4 h-4 mr-3" /> View
                                    Details
                                  </button>
                                )}
                                <button
                                  onClick={() => handleEditPatient(patient)}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                  <Edit className="w-4 h-4 mr-3" /> Edit Patient
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeletePatient(patient.id)
                                  }
                                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                >
                                  <Trash2 className="w-4 h-4 mr-3" /> Delete
                                  Patient
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to{" "}
              <span className="font-medium">{filteredPatients.length}</span> of{" "}
              <span className="font-medium">{patients.length}</span> results
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
                disabled
              >
                Previous
              </button>
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">
                1
              </button>
              <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">
                2
              </button>
              <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {canAddPatient && (
        <PatientForm
          patient={editingPatient}
          isOpen={showPatientForm}
          onClose={() => setShowPatientForm(false)}
          onSave={handleSavePatient}
        />
      )}
    </div>
  );
};

export default PatientList;
