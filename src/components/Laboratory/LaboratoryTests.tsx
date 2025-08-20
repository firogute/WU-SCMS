import React, { useState, useEffect } from "react";
import {
  TestTube,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import Button from "../UI/Button";
import Modal from "../UI/Modal";
import FormField from "../UI/FormField";

interface LaboratoryTest {
  id: string;
  patient_id: string;
  doctor_id: string;
  test_name: string;
  status: string;
  assigned_to?: string;
  notes?: string;
  results?: string;
  created_at: string;
  updated_at: string;
  patient?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  doctor?: {
    name: string;
  };
  technician?: {
    name: string;
  };
}

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  student_id?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const LaboratoryTests: React.FC = () => {
  const [tests, setTests] = useState<LaboratoryTest[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showTestForm, setShowTestForm] = useState(false);
  const [editingTest, setEditingTest] = useState<LaboratoryTest | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<LaboratoryTest | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_id: "",
    test_name: "",
    status: "pending",
    assigned_to: "",
    notes: "",
    results: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [testsData, patientsData, doctorsData, techniciansData] =
        await Promise.all([
          fetchLaboratoryTests(),
          fetchPatients(),
          fetchUsersByRole("doctor"),
          fetchUsersByRole("lab_technician"),
        ]);

      setTests(testsData);
      setPatients(patientsData);
      setDoctors(doctorsData);
      setTechnicians(techniciansData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLaboratoryTests = async (): Promise<LaboratoryTest[]> => {
    const { data, error } = await supabase
      .from("lab_tests")
      .select(
        `
        *,
        patient:patients(first_name, last_name, email),
        doctor:users(name),
        technician:users(name)
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching lab tests:", error);
      return [];
    }
    return data || [];
  };

  const fetchPatients = async (): Promise<Patient[]> => {
    const { data, error } = await supabase
      .from("patients")
      .select("id, first_name, last_name, email, student_id")
      .order("first_name");

    if (error) {
      console.error("Error fetching patients:", error);
      return [];
    }
    return data || [];
  };

  const fetchUsersByRole = async (role: string): Promise<User[]> => {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, role")
      .eq("role", role)
      .order("name");

    if (error) {
      console.error(`Error fetching ${role}s:`, error);
      return [];
    }
    return data || [];
  };

  const createLaboratoryTest = async (testData: Partial<LaboratoryTest>) => {
    const { data, error } = await supabase
      .from("lab_tests")
      .insert([testData])
      .select();

    if (error) {
      console.error("Error creating lab test:", error);
      return null;
    }
    return data?.[0] || null;
  };

  const updateLaboratoryTest = async (
    id: string,
    testData: Partial<LaboratoryTest>
  ) => {
    const { data, error } = await supabase
      .from("lab_tests")
      .update(testData)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error updating lab test:", error);
      return null;
    }
    return data?.[0] || null;
  };

  const deleteLaboratoryTest = async (id: string) => {
    const { error } = await supabase.from("lab_tests").delete().eq("id", id);

    if (error) {
      console.error("Error deleting lab test:", error);
      return false;
    }
    return true;
  };

  const filteredTests = tests.filter((test) => {
    const matchesSearch =
      test.test_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.patient?.first_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      test.patient?.last_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      test.patient?.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || test.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const testData = {
        patient_id: formData.patient_id,
        doctor_id: formData.doctor_id,
        test_name: formData.test_name,
        status: formData.status,
        assigned_to: formData.assigned_to || null,
        notes: formData.notes || null,
        results: formData.results || null,
      };

      let success = false;
      if (editingTest) {
        const result = await updateLaboratoryTest(editingTest.id, testData);
        success = !!result;
      } else {
        const result = await createLaboratoryTest(testData);
        success = !!result;
      }

      if (success) {
        setShowTestForm(false);
        setEditingTest(null);
        resetForm();
        loadData(); // Reload data to get updates
      }
    } catch (error) {
      console.error("Error saving test:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      patient_id: "",
      doctor_id: "",
      test_name: "",
      status: "pending",
      assigned_to: "",
      notes: "",
      results: "",
    });
  };

  const handleEdit = (test: LaboratoryTest) => {
    setEditingTest(test);
    setFormData({
      patient_id: test.patient_id,
      doctor_id: test.doctor_id,
      test_name: test.test_name,
      status: test.status,
      assigned_to: test.assigned_to || "",
      notes: test.notes || "",
      results: test.results || "",
    });
    setShowTestForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this test?")) {
      setLoading(true);
      try {
        const success = await deleteLaboratoryTest(id);
        if (success) {
          loadData();
        }
      } catch (error) {
        console.error("Error deleting test:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewResult = (test: LaboratoryTest) => {
    setSelectedTest(test);
    setShowResultModal(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get current user role from localStorage or context
  const currentUserRole = localStorage.getItem("userRole") || "doctor"; // Replace with actual auth context

  const canCreateTest =
    currentUserRole === "admin" || currentUserRole === "doctor";
  const canUpdateTest =
    currentUserRole === "admin" || currentUserRole === "lab_technician";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laboratory Tests</h1>
          <p className="text-gray-600">Manage laboratory tests and results</p>
        </div>
        {canCreateTest && (
          <Button onClick={() => setShowTestForm(true)} icon={Plus}>
            Order Test
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tests</p>
              <p className="text-2xl font-bold text-gray-900">{tests.length}</p>
            </div>
            <TestTube className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {tests.filter((t) => t.status === "pending").length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">
                {tests.filter((t) => t.status === "in_progress").length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {tests.filter((t) => t.status === "completed").length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search tests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full bg-white text-gray-900"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTests.map((test) => (
                <tr key={test.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <TestTube className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {test.test_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {test.notes}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {test.patient?.first_name} {test.patient?.last_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {test.patient?.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {test.doctor?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(test.status)}
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          test.status
                        )}`}
                      >
                        {test.status.replace("_", " ")}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(test.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewResult(test)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Result"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {canUpdateTest && (
                        <button
                          onClick={() => handleEdit(test)}
                          className="text-green-600 hover:text-green-800"
                          title="Edit Test"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Test Form Modal */}
      <Modal
        isOpen={showTestForm}
        onClose={() => {
          setShowTestForm(false);
          setEditingTest(null);
          resetForm();
        }}
        title={editingTest ? "Edit Laboratory Test" : "Order Laboratory Test"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Patient" required>
              <select
                value={formData.patient_id}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    patient_id: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                required
              >
                <option value="">Select patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.first_name} {patient.last_name} ({patient.email})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Doctor" required>
              <select
                value={formData.doctor_id}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    doctor_id: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                required
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
            <FormField label="Test Name" required>
              <input
                type="text"
                value={formData.test_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    test_name: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                placeholder="e.g., Blood Test, X-Ray, MRI"
                required
              />
            </FormField>

            <FormField label="Status">
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </FormField>
          </div>

          <FormField label="Assign to Technician">
            <select
              value={formData.assigned_to}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  assigned_to: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            >
              <option value="">Select technician</option>
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Notes">
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  notes: e.target.value,
                }))
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              placeholder="Additional notes..."
            />
          </FormField>

          {canUpdateTest && (
            <FormField label="Test Results">
              <textarea
                value={formData.results}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    results: e.target.value,
                  }))
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                placeholder="Enter test results..."
              />
            </FormField>
          )}

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowTestForm(false);
                setEditingTest(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {editingTest ? "Update Test" : "Order Test"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Test Result Modal */}
      <Modal
        isOpen={showResultModal}
        onClose={() => {
          setShowResultModal(false);
          setSelectedTest(null);
        }}
        title="Test Result"
        size="lg"
      >
        {selectedTest && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700">Patient</h4>
                <p className="text-gray-900">
                  {selectedTest.patient?.first_name}{" "}
                  {selectedTest.patient?.last_name}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedTest.patient?.email}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Test Name</h4>
                <p className="text-gray-900">{selectedTest.test_name}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">Status</h4>
              <div className="flex items-center space-x-2">
                {getStatusIcon(selectedTest.status)}
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    selectedTest.status
                  )}`}
                >
                  {selectedTest.status.replace("_", " ")}
                </span>
              </div>
            </div>

            {selectedTest.results && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Test Results</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {selectedTest.results}
                  </p>
                </div>
              </div>
            )}

            {selectedTest.notes && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Notes</h4>
                <p className="text-gray-900">{selectedTest.notes}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                <span className="font-medium">Requested:</span>{" "}
                {new Date(selectedTest.created_at).toLocaleString()}
              </div>
              {selectedTest.updated_at && (
                <div>
                  <span className="font-medium">Last Updated:</span>{" "}
                  {new Date(selectedTest.updated_at).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LaboratoryTests;
