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
  Calendar,
  Clock,
  Copy,
  CheckCircle,
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
  status: "pending" | "completed" | string; // tolerate legacy data
  assigned_to?: string | null;
  notes?: string | null;
  results?: string | null;
  created_at: string;
  updated_at: string;

  // Joins
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

  // --- Fetch ---
  useEffect(() => {
    if (testId) fetchTestDetail(testId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId]);

  const fetchTestDetail = async (testId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("lab_tests")
        .select(
          `
          *,
          patients (
            first_name, last_name, email, phone, date_of_birth, gender, blood_type
          ),
          appointments:appointments (
            id,
            date,
            time,
            doctor:users ( id, name, email )
          ),
          technicians:users!lab_tests_assigned_to_fkey ( id, name, email )
        `
        )
        .eq("id", testId)
        .single();

      if (error) {
        console.error("Error fetching test detail:", error);
        setTest(null);
        return;
      }

      // Normalize relational fields (Supabase sometimes returns arrays)
      const normalized: LaboratoryTest = {
        ...data,
        patients: Array.isArray(data?.patients)
          ? data.patients[0]
          : data?.patients ?? null,
        appointments: data?.appointments
          ? {
              ...(Array.isArray(data.appointments)
                ? data.appointments[0]
                : data.appointments),
              doctor: data?.appointments?.doctor
                ? Array.isArray(data.appointments.doctor)
                  ? data.appointments.doctor[0]
                  : data.appointments.doctor
                : null,
            }
          : null,
        technicians: Array.isArray(data?.technicians)
          ? data.technicians[0]
          : data?.technicians ?? null,
      };

      setTest(normalized);
      setFormData({
        status: (["pending", "completed"] as const).includes(
          normalized.status as "pending" | "completed"
        )
          ? (normalized.status as "pending" | "completed")
          : "pending",
        results: normalized.results ?? "",
        notes: normalized.notes ?? "",
      });
    } catch (e) {
      console.error("Error fetching test detail:", e);
      setTest(null);
    } finally {
      setLoading(false);
    }
  };

  // --- Actions ---
  const handleSave = async () => {
    if (!id) return;
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
        .eq("id", id);

      if (error) {
        console.error("Error updating test:", error);
        return;
      }
      await fetchTestDetail(id);
    } catch (e) {
      console.error("Error updating test:", e);
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
      `Test Report: ${test.test_name}`,
      `Test ID: ${test.id}`,
      `Status: ${formData.status}`,
      ``,
      `Patient: ${p?.first_name ?? ""} ${p?.last_name ?? ""}`,
      `Email: ${p?.email ?? "-"}`,
      `Phone: ${p?.phone ?? "-"}`,
      `DOB: ${
        p?.date_of_birth ? new Date(p.date_of_birth).toLocaleDateString() : "-"
      }`,
      `Gender: ${p?.gender ?? "-"}`,
      `Blood Type: ${p?.blood_type ?? "-"}`,
      ``,
      `Requesting Doctor: ${doc?.name ?? "-"}`,
      `Technician: ${tech?.name ?? "-"}`,
      `Requested: ${new Date(test.created_at).toLocaleString()}`,
      `Last Updated: ${new Date(test.updated_at).toLocaleString()}`,
      ``,
      `Notes:`,
      `${formData.notes || "-"}`,
      ``,
      `Results:`,
      `${formData.results || "-"}`,
    ].join("\n");
  }, [formData.results, formData.status, formData.notes, test]);

  const handleDownload = () => {
    const content = buildReportText || formData.results || "";
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const p = test?.patients;
    a.href = url;
    a.download = `${test?.test_name ?? "Test"}_${p?.first_name ?? ""}_${
      p?.last_name ?? ""
    }.txt`;
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
    } catch (e) {
      console.error("Copy failed", e);
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

  return (
    <div className="space-y-6 print:space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center print:hidden">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate("/laboratory/tests")}
            icon={ArrowLeft}
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
          <Button variant="outline" onClick={handleDownload} icon={Download}>
            Download
          </Button>
          <Button variant="outline" onClick={handlePrint} icon={Printer}>
            Print
          </Button>
          <Button onClick={handleSave} disabled={saving} icon={Save}>
            {saving ? "Saving..." : "Save Results"}
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-3">
        {/* Patient Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 print:border-0 print:shadow-none">
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
                type="button"
                className="text-gray-500 hover:text-gray-700"
                title="Copy email"
                onClick={() => p?.email && copyToClipboard(p.email, "email")}
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
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 print:border-0 print:shadow-none">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-600" />
            Test Metadata
          </h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Test ID</p>
              <p className="font-mono text-gray-900 text-sm break-all">
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

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start space-x-2">
                <Stethoscope className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Requesting Doctor</p>
                  <p className="font-medium text-gray-900">
                    {doc?.name || "—"}
                  </p>
                  <p className="text-sm text-gray-500">{doc?.email || ""}</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <UserCheck className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Technician</p>
                  <p className="font-medium text-gray-900">
                    {tech?.name || "Unassigned"}
                  </p>
                  <p className="text-sm text-gray-500">{tech?.email || ""}</p>
                </div>
              </div>
            </div>

            <FormField label="Status">
              {/* Respect schema: only pending/completed */}
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status:
                      (e.target.value as "pending" | "completed") ?? "pending",
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </FormField>

            <FormField label="Notes">
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                placeholder="Additional notes..."
              />
            </FormField>
          </div>
        </div>

        {/* Results Editor */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:row-span-2 print:col-span-3 print:border-0 print:shadow-none">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TestTube className="w-5 h-5 mr-2 text-indigo-600" />
            Test Results
          </h2>

          <FormField label="Results (editable)">
            <textarea
              value={formData.results}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, results: e.target.value }))
              }
              rows={14}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 font-mono"
              placeholder="Enter test results here..."
            />
          </FormField>

          <div className="flex items-center justify-between mt-3">
            <div className="text-sm text-gray-500">
              Tip: This report is printable and downloadable. Keep PHI safe ✅
            </div>
            <button
              type="button"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
              onClick={() => copyToClipboard(formData.results || "", "results")}
              title="Copy results to clipboard"
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

          {/* Read-only Preview */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Preview
            </h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-900">
                {buildReportText}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Footer actions (visible on print too) */}
      <div className="flex items-center justify-end space-x-3 print:hidden">
        <Button variant="outline" onClick={handleDownload} icon={Download}>
          Download
        </Button>
        <Button variant="outline" onClick={handlePrint} icon={Printer}>
          Print
        </Button>
        <Button onClick={handleSave} disabled={saving} icon={Save}>
          {saving ? "Saving..." : "Save Results"}
        </Button>
      </div>
    </div>
  );
};

export default LaboratoryTestDetail;
