// LaboratoryTestDetail.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  TestTube,
  ArrowLeft,
  Save,
  Download,
  Printer,
  User,
  Stethoscope,
  UserCheck,
  Copy,
  CheckCircle,
  AlertCircle,
  Shield,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import Button from "../../UI/Button";
import FormField from "../../UI/FormField";
import { useAuth } from "../../../contexts/AuthContext";

type Nullable<T> = T | null;

interface PatientLite {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  blood_type?: string | null;
}

interface PersonLite {
  id?: string;
  name: string;
  email?: string;
}

interface LaboratoryTest {
  id: string;
  appointment_id: string;
  patient_id: string;
  test_name: string;
  status: "pending" | "completed" | string;
  assigned_to?: string | null;
  notes?: string | null;
  results?: string | null;
  created_at: string;
  updated_at: string;

  patients?: PatientLite | null;
  appointments?: {
    doctor?: PersonLite | null;
    date?: string | null;
    time?: string | null;
    id?: string;
  } | null;
  technicians?: PersonLite | null;
}

const LaboratoryTestDetail: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [test, setTest] = useState<Nullable<LaboratoryTest>>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<"email" | "results" | null>(null);
  const [formData, setFormData] = useState({
    status: "pending" as "pending" | "completed",
    results: "",
    notes: "",
  });

  // Role-based permissions
  const isAdmin = user?.role === "admin";
  const isLabTechnician = user?.role === "laboratory";
  const isCompleted = test?.status === "completed";

  // Permissions logic
  const canEditResults =
    (isLabTechnician && !isCompleted) || (isAdmin && !isCompleted);
  const canChangeStatus = (isLabTechnician && !isCompleted) || isAdmin;
  const canRevertStatus = isAdmin && isCompleted;
  const canSaveResults = canEditResults;

  // --- Fetch ---
  useEffect(() => {
    if (testId) fetchTestDetail(testId);
  }, [testId]);

  const fetchTestDetail = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("lab_tests")
        .select(
          `
          *,
          patients (first_name, last_name, email, phone, date_of_birth, gender, blood_type),
          appointments:appointments (id, date, time, doctor:users (id, name, email)),
          technicians:users!lab_tests_assigned_to_fkey (id, name, email)
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching test detail:", error);
        setTest(null);
        return;
      }

      // Normalize relational fields
      const normalized: LaboratoryTest = {
        ...data,
        patients: Array.isArray(data?.patients)
          ? data.patients[0]
          : data?.patients,
        appointments: data?.appointments
          ? {
              ...(Array.isArray(data.appointments)
                ? data.appointments[0]
                : data.appointments),
              doctor: data.appointments.doctor
                ? Array.isArray(data.appointments.doctor)
                  ? data.appointments.doctor[0]
                  : data.appointments.doctor
                : null,
            }
          : null,
        technicians: Array.isArray(data?.technicians)
          ? data.technicians[0]
          : data?.technicians,
      };

      setTest(normalized);
      setFormData({
        status: normalized.status === "completed" ? "completed" : "pending",
        results: normalized.results || "",
        notes: normalized.notes || "",
      });
    } catch (error) {
      console.error("Error fetching test detail:", error);
      setTest(null);
    } finally {
      setLoading(false);
    }
  };

  // --- Actions ---
  const handleSave = async () => {
    if (!testId || !canSaveResults) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("lab_tests")
        .update({
          status: formData.status,
          results: formData.results || null,
          notes: formData.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", testId);

      if (error) {
        console.error("Error updating test:", error);
        return;
      }
      await fetchTestDetail(testId);
    } catch (error) {
      console.error("Error updating test:", error);
    } finally {
      setSaving(false);
    }
  };

  const markAsCompleted = async () => {
    if (!canChangeStatus || isCompleted) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("lab_tests")
        .update({
          status: "completed",
          results: formData.results || null,
          notes: formData.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", testId);

      if (error) {
        console.error("Error marking test as completed:", error);
        return;
      }
      await fetchTestDetail(testId!);
    } catch (error) {
      console.error("Error marking test as completed:", error);
    } finally {
      setSaving(false);
    }
  };

  const revertToPending = async () => {
    if (!canRevertStatus) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("lab_tests")
        .update({
          status: "pending",
          updated_at: new Date().toISOString(),
        })
        .eq("id", testId);

      if (error) {
        console.error("Error reverting test to pending:", error);
        return;
      }
      await fetchTestDetail(testId!);
    } catch (error) {
      console.error("Error reverting test to pending:", error);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => window.print();

  const buildReportText = useMemo(() => {
    if (!test) return "";
    const p = test.patients;
    const doc = test.appointments?.doctor;
    const tech = test.technicians;

    return [
      `LABORATORY TEST REPORT`,
      `================================`,
      `Test Name: ${test.test_name}`,
      `Test ID: ${test.id}`,
      `Status: ${test.status.toUpperCase()}`,
      ``,
      `PATIENT INFORMATION:`,
      `--------------------------------`,
      `Name: ${p?.first_name || ""} ${p?.last_name || ""}`,
      `Email: ${p?.email || "-"}`,
      `Phone: ${p?.phone || "-"}`,
      `Date of Birth: ${
        p?.date_of_birth ? new Date(p.date_of_birth).toLocaleDateString() : "-"
      }`,
      `Gender: ${p?.gender || "-"}`,
      `Blood Type: ${p?.blood_type || "-"}`,
      ``,
      `TEST DETAILS:`,
      `--------------------------------`,
      `Requesting Doctor: ${doc?.name || "-"}`,
      `Assigned Technician: ${tech?.name || "Unassigned"}`,
      `Request Date: ${new Date(test.created_at).toLocaleString()}`,
      `Last Updated: ${new Date(test.updated_at).toLocaleString()}`,
      ``,
      `NOTES:`,
      `--------------------------------`,
      `${formData.notes || "No notes provided"}`,
      ``,
      `RESULTS:`,
      `--------------------------------`,
      `${formData.results || "No results available"}`,
      ``,
      `END OF REPORT`,
      `Generated: ${new Date().toLocaleString()}`,
      `Generated by: ${user?.name || "System"}`,
    ].join("\n");
  }, [test, formData, user]);

  const handleDownload = () => {
    const content = buildReportText;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const p = test?.patients;
    a.href = url;
    a.download = `Lab_Report_${test?.test_name}_${p?.first_name}_${
      p?.last_name
    }_${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async (text: string, key: "email" | "results") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch (error) {
      console.error("Copy failed", error);
    }
  };

  // --- UI ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading test details...</div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Test not found</div>
      </div>
    );
  }

  const p = test.patients;
  const doc = test.appointments?.doctor;
  const tech = test.technicians;
  const isTestCompleted = test.status === "completed";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate("/laboratory")}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Tests
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <TestTube className="w-6 h-6 mr-2 text-blue-600" />
              {test.test_name}
            </h1>
            <p className="text-gray-600">Manage laboratory test results</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handleDownload}
            icon={<Download className="w-4 h-4" />}
          >
            Download
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            icon={<Printer className="w-4 h-4" />}
          >
            Print
          </Button>
          {canSaveResults && (
            <Button
              onClick={handleSave}
              disabled={saving}
              icon={<Save className="w-4 h-4" />}
            >
              {saving ? "Saving..." : "Save Results"}
            </Button>
          )}
          {canChangeStatus && !isTestCompleted && (
            <Button
              onClick={markAsCompleted}
              disabled={saving}
              icon={<CheckCircle className="w-4 h-4" />}
            >
              Mark Completed
            </Button>
          )}
          {canRevertStatus && isTestCompleted && (
            <Button
              variant="outline"
              onClick={revertToPending}
              disabled={saving}
              icon={<AlertCircle className="w-4 h-4" />}
            >
              Revert to Pending
            </Button>
          )}
        </div>
      </div>

      {/* Status Banner */}
      {isTestCompleted && (
        <div className="p-4 rounded-lg border bg-green-50 border-green-200 text-green-800">
          <div className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            <span className="font-semibold">TEST COMPLETED</span>
            {!isAdmin && (
              <span className="ml-2 text-sm">
                • Only administrators can modify completed tests
              </span>
            )}
            {isAdmin && (
              <span className="ml-2 text-sm">
                • You can revert this test to pending status
              </span>
            )}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-purple-600" />
            Patient Information
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium text-gray-900">
                {p?.first_name} {p?.last_name}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{p?.email}</p>
              </div>
              <button
                onClick={() => p?.email && copyToClipboard(p.email, "email")}
                className="text-gray-500 hover:text-gray-700"
                title="Copy email"
              >
                {copied === "email" ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium text-gray-900">{p?.phone || "-"}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-gray-600">Date of Birth</p>
                <p className="font-medium text-gray-900">
                  {p?.date_of_birth
                    ? new Date(p.date_of_birth).toLocaleDateString()
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Gender</p>
                <p className="font-medium text-gray-900">{p?.gender || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Blood Type</p>
                <p className="font-medium text-gray-900">
                  {p?.blood_type || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Test Meta */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <UserCheck className="w-5 h-5 mr-2 text-blue-600" />
            Test Information
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Test ID</p>
              <p className="font-mono text-sm text-gray-900 break-all">
                {test.id}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-gray-600">Requested</p>
                <p className="font-medium text-gray-900">
                  {new Date(test.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-medium text-gray-900">
                  {new Date(test.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Requesting Doctor</p>
              <p className="font-medium text-gray-900">{doc?.name || "-"}</p>
              <p className="text-sm text-gray-500">{doc?.email || ""}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Technician</p>
              <p className="font-medium text-gray-900">
                {tech?.name || "Unassigned"}
              </p>
              <p className="text-sm text-gray-500">{tech?.email || ""}</p>
            </div>

            {/* Status Field with permissions */}
            <FormField label="Status">
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value as "pending" | "completed",
                  }))
                }
                disabled={!canChangeStatus || isTestCompleted}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
              {isTestCompleted && (
                <p className="text-xs text-gray-500 mt-1">
                  Completed tests cannot be modified
                </p>
              )}
            </FormField>

            <FormField label="Notes">
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
                disabled={!canEditResults || isTestCompleted}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Additional notes..."
              />
            </FormField>
          </div>
        </div>

        {/* Results Editor */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:row-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TestTube className="w-5 h-5 mr-2 text-indigo-600" />
            Test Results
          </h2>
          <FormField label="Results">
            <textarea
              value={formData.results}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, results: e.target.value }))
              }
              rows={14}
              disabled={!canEditResults || isTestCompleted}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter test results here..."
            />
          </FormField>
          <div className="flex items-center justify-between mt-3">
            <div className="text-sm text-gray-500">
              Keep PHI secure when sharing results
            </div>
            <button
              onClick={() => copyToClipboard(formData.results, "results")}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
              disabled={!formData.results}
            >
              {copied === "results" ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaboratoryTestDetail;
