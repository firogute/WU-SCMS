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
import { LaboratoryTest, Patient, User } from "../../types";
import { useDatabase } from "../../hooks/useDatabase";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../UI/Button";
import Modal from "../UI/Modal";
import FormField from "../UI/FormField";

const LaboratoryTests: React.FC = () => {
  const { user } = useAuth();
  const {
    getLaboratoryTests,
    getPatients,
    getUsers,
    createLaboratoryTest,
    updateLaboratoryTest,
    deleteLaboratoryTest,
    loading,
  } = useDatabase();
  const [tests, setTests] = useState<LaboratoryTest[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showTestForm, setShowTestForm] = useState(false);
  const [editingTest, setEditingTest] = useState<LaboratoryTest | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<LaboratoryTest | null>(null);

  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_id: "",
    test_type: "",
    test_description: "",
    result_text: "",
    status: "pending" as const,
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [testsData, patientsData, doctorsData] = await Promise.all([
      getLaboratoryTests(),
      getPatients(),
      getUsers({ role: "doctor" }),
    ]);

    setTests(testsData);
    setPatients(patientsData);
    setDoctors(doctorsData);
  };

  const filteredTests = tests.filter((test) => {
    const matchesSearch =
      test.test_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.test_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${test.patient?.first_name} ${test.patient?.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || test.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const testData = {
      ...formData,
      technician_id: user?.role === "lab_technician" ? user.id : undefined,
      requested_at: new Date().toISOString(),
      completed_at:
        formData.status === "completed" ? new Date().toISOString() : undefined,
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
      loadData();
    }
  };

  const resetForm = () => {
    setFormData({
      patient_id: "",
      doctor_id: "",
      test_type: "",
      test_description: "",
      result_text: "",
      status: "pending",
      notes: "",
    });
  };

  const handleEdit = (test: LaboratoryTest) => {
    setEditingTest(test);
    setFormData({
      patient_id: test.patient_id,
      doctor_id: test.doctor_id,
      test_type: test.test_type,
      test_description: test.test_description || "",
      result_text: test.result_text || "",
      status: test.status,
      notes: test.notes || "",
    });
    setShowTestForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this test?")) {
      const success = await deleteLaboratoryTest(id);
      if (success) {
        loadData();
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
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const canCreateTest = user?.role === "admin" || user?.role === "doctor";
  const canUpdateTest =
    user?.role === "admin" || user?.role === "lab_technician";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Laboratory Tests
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage laboratory tests and results
          </p>
        </div>
        {canCreateTest && (
          <Button onClick={() => setShowTestForm(true)} icon={Plus}>
            Order Test
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Tests
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {tests.length}
              </p>
            </div>
            <TestTube className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pending
              </p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {tests.filter((t) => t.status === "pending").length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                In Progress
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {tests.filter((t) => t.status === "in_progress").length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Completed
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {tests.filter((t) => t.status === "completed").length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search tests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Test Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Requested Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTests.map((test) => (
                <tr
                  key={test.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <TestTube className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {test.test_type}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {test.test_description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {test.patient?.first_name} {test.patient?.last_name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {test.patient?.student_id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(test.requested_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewResult(test)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        title="View Result"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {canUpdateTest && (
                        <button
                          onClick={() => handleEdit(test)}
                          className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">Select patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.first_name} {patient.last_name} (
                    {patient.student_id})
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
            <FormField label="Test Type" required>
              <input
                type="text"
                value={formData.test_type}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    test_type: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                    status: e.target.value as any,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </FormField>
          </div>

          <FormField label="Test Description">
            <textarea
              value={formData.test_description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  test_description: e.target.value,
                }))
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Detailed description of the test..."
            />
          </FormField>

          {canUpdateTest && (
            <FormField label="Test Result">
              <textarea
                value={formData.result_text}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    result_text: e.target.value,
                  }))
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter test results..."
              />
            </FormField>
          )}

          <FormField label="Notes">
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Additional notes..."
            />
          </FormField>

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
                <h4 className="font-medium text-gray-700 dark:text-gray-300">
                  Patient
                </h4>
                <p className="text-gray-900 dark:text-white">
                  {selectedTest.patient?.first_name}{" "}
                  {selectedTest.patient?.last_name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedTest.patient?.student_id}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300">
                  Test Type
                </h4>
                <p className="text-gray-900 dark:text-white">
                  {selectedTest.test_type}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                Test Description
              </h4>
              <p className="text-gray-900 dark:text-white">
                {selectedTest.test_description}
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </h4>
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

            {selectedTest.result_text && (
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Test Result
                </h4>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {selectedTest.result_text}
                  </p>
                </div>
              </div>
            )}

            {selectedTest.notes && (
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </h4>
                <p className="text-gray-900 dark:text-white">
                  {selectedTest.notes}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div>
                <span className="font-medium">Requested:</span>{" "}
                {new Date(selectedTest.requested_at).toLocaleString()}
              </div>
              {selectedTest.completed_at && (
                <div>
                  <span className="font-medium">Completed:</span>{" "}
                  {new Date(selectedTest.completed_at).toLocaleString()}
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
