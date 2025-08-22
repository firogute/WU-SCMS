import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield,
  Clock,
  Eye,
  EyeOff,
  Key,
  RotateCw,
  Edit3,
  X,
  CheckCircle,
  AlertCircle,
  Download,
  Printer,
  MessageSquare,
  Send,
  History,
  Award,
  GraduationCap,
  Briefcase,
  Smartphone,
  Heart,
  Star,
  Shield as ShieldIcon,
  LogOut,
  BarChart3,
} from "lucide-react";
import { Staff } from "../../types";
import Button from "../UI/Button";
import FormField from "../UI/FormField";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";
import LoadingSpinner from "../UI/LoadingSpinner";
import ToastNotification from "../UI/ToastNotification";

const StaffDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<Staff>>({});
  const [originalData, setOriginalData] = useState<Partial<Staff>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newQualification, setNewQualification] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetPassword, setResetPassword] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [activityLog, setActivityLog] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchStaff();
      fetchActivityLog();
    }
  }, [id]);

  const fetchStaff = async () => {
    try {
      setError(null);
      setLoading(true);

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        const staffData: Partial<Staff> = {
          id: data.id,
          fullName: data.name,
          role: data.role,
          department: data.department || "",
          email: data.email,
          phone: data.phone || "",
          gender: data.gender || "other",
          employeeId: data.employee_id || `EMP-${data.id.slice(0, 8)}`,
          joinDate: data.created_at.split("T")[0],
          username: data.username || data.email.split("@")[0],
          shift: data.shift || "full-time",
          status: data.status || "active",
          accessRole: data.role,
          address: data.address || "",
          emergencyContact: data.emergency_contact || "",
          qualifications: data.qualifications || [],
          specialization: data.specialization || "",
        };

        setFormData(staffData);
        setOriginalData(staffData);
      }
    } catch (err: any) {
      console.error("Error fetching staff:", err);
      setError(err.message || "Failed to load staff details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLog = async () => {
    // Simulate activity log - in a real app, you'd fetch this from your database
    setTimeout(() => {
      setActivityLog([
        {
          id: 1,
          action: "Profile Updated",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          details: "Updated contact information",
        },
        {
          id: 2,
          action: "Password Reset",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          details: "User requested password reset",
        },
        {
          id: 3,
          action: "Login",
          timestamp: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
          details: "Successful login from new device",
        },
      ]);
    }, 1000);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName?.trim())
      newErrors.fullName = "Full name is required";
    if (!formData.email?.trim()) newErrors.email = "Email is required";
    if (!formData.role?.trim()) newErrors.role = "Role is required";
    if (!formData.department?.trim())
      newErrors.department = "Department is required";
    if (!formData.employeeId?.trim())
      newErrors.employeeId = "Employee ID is required";
    if (!formData.joinDate) newErrors.joinDate = "Join date is required";

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    setError(null);

    try {
      const updateData: any = {
        name: formData.fullName,
        email: formData.email,
        role: formData.role,
        department: formData.department,
        phone: formData.phone,
        gender: formData.gender,
        employee_id: formData.employeeId,
        shift: formData.shift,
        status: formData.status,
        address: formData.address,
        emergency_contact: formData.emergencyContact,
        qualifications: formData.qualifications,
        specialization: formData.specialization,
        updated_at: new Date().toISOString(),
      };

      if (resetPassword && tempPassword) {
        updateData.password = tempPassword;
      }

      const { error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", id);

      if (error) {
        throw error;
      }

      setSuccess("Staff member updated successfully");
      setIsEditing(false);
      setResetPassword(false);
      setTempPassword("");
      fetchStaff(); // Refresh data

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Error updating staff:", err);
      setError(err.message || "Error updating staff member");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof Staff, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const addQualification = () => {
    if (newQualification.trim()) {
      setFormData((prev) => ({
        ...prev,
        qualifications: [
          ...(prev.qualifications || []),
          newQualification.trim(),
        ],
      }));
      setNewQualification("");
    }
  };

  const removeQualification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      qualifications: prev.qualifications?.filter((_, i) => i !== index) || [],
    }));
  };

  const generateRandomPassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTempPassword(password);
  };

  const toggleEdit = () => {
    if (isEditing) {
      // Revert to original data if canceling edit
      setFormData(originalData);
      setResetPassword(false);
      setTempPassword("");
      setErrors({});
    }
    setIsEditing(!isEditing);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // In a real app, this would generate a PDF or CSV
    alert("Export functionality would be implemented here");
  };

  const departments = [
    "General Medicine",
    "Pediatrics",
    "Cardiology",
    "Orthopedics",
    "Dermatology",
    "Pharmacy",
    "Administration",
    "Emergency",
    "Laboratory",
    "Radiology",
  ];

  const specializations = {
    doctor: [
      "General Practice",
      "Internal Medicine",
      "Pediatrics",
      "Cardiology",
      "Orthopedics",
      "Dermatology",
    ],
    nurse: [
      "General Nursing",
      "Pediatric Nursing",
      "Critical Care",
      "Emergency Nursing",
      "Surgical Nursing",
    ],
    pharmacist: [
      "Clinical Pharmacy",
      "Hospital Pharmacy",
      "Community Pharmacy",
    ],
    receptionist: ["Front Desk", "Patient Services", "Administrative Support"],
    admin: ["Healthcare Administration", "IT Management", "Human Resources"],
    laboratory: [
      "Clinical Laboratory",
      "Pathology",
      "Microbiology",
      "Hematology",
      "Biochemistry",
    ],
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "on-leave":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "doctor":
        return "bg-blue-100 text-blue-800";
      case "nurse":
        return "bg-green-100 text-green-800";
      case "pharmacist":
        return "bg-orange-100 text-orange-800";
      case "receptionist":
        return "bg-pink-100 text-pink-800";
      case "laboratory":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !formData.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Staff
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => navigate("/staff")} icon={<ArrowLeft />}>
            Back to Staff List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/staff")}
                icon={<ArrowLeft />}
                className="text-gray-600 hover:text-gray-900"
              >
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Staff Details
                </h1>
                <p className="text-sm text-gray-600">
                  Manage staff member information and permissions
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleExport}
                icon={<Download />}
                className="hidden sm:flex"
              >
                Export
              </Button>
              <Button
                variant="outline"
                onClick={handlePrint}
                icon={<Printer />}
                className="hidden sm:flex"
              >
                Print
              </Button>
              <Button
                variant={isEditing ? "outline" : "primary"}
                onClick={toggleEdit}
                icon={isEditing ? <X /> : <Edit3 />}
              >
                {isEditing ? "Cancel" : "Edit"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notifications */}
        {error && (
          <ToastNotification
            type="error"
            message={error}
            onClose={() => setError(null)}
            className="mb-6"
          />
        )}

        {success && (
          <ToastNotification
            type="success"
            message={success}
            onClose={() => setSuccess(null)}
            className="mb-6"
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              {/* Profile Card */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {formData.fullName
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {formData.fullName}
                </h2>
                <div className="flex items-center justify-center mt-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
                      formData.role || ""
                    )}`}
                  >
                    {formData.role}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 ${getStatusColor(
                      formData.status || ""
                    )}`}
                  >
                    {formData.status}
                  </span>
                </div>
                <p className="text-gray-600 mt-1">{formData.department}</p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-sm text-gray-600">Joined</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formData.joinDate
                      ? new Date(formData.joinDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <Clock className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <p className="text-sm text-gray-600">Shift</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {formData.shift?.replace("-", " ") || "N/A"}
                  </p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="space-y-1">
                {[
                  { id: "profile", label: "Profile", icon: User },
                  { id: "security", label: "Security", icon: ShieldIcon },
                  { id: "activity", label: "Activity", icon: History },
                  { id: "documents", label: "Documents", icon: GraduationCap },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <User className="w-5 h-5 mr-2 text-blue-600" />
                      Personal Information
                    </h3>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        label="Full Name"
                        required
                        error={errors.fullName}
                      >
                        <input
                          type="text"
                          value={formData.fullName || ""}
                          onChange={(e) =>
                            handleInputChange("fullName", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                          placeholder="Enter full name"
                          disabled={!isEditing}
                        />
                      </FormField>

                      <FormField label="Email" required error={errors.email}>
                        <input
                          type="email"
                          value={formData.email || ""}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                          placeholder="Enter email address"
                          disabled={!isEditing}
                        />
                      </FormField>

                      <FormField label="Phone" error={errors.phone}>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            value={formData.phone || ""}
                            onChange={(e) =>
                              handleInputChange("phone", e.target.value)
                            }
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                            placeholder="+251-911-123456"
                            disabled={!isEditing}
                          />
                        </div>
                      </FormField>

                      <FormField label="Emergency Contact">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Heart className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            value={formData.emergencyContact || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "emergencyContact",
                                e.target.value
                              )
                            }
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                            placeholder="+251-911-654321"
                            disabled={!isEditing}
                          />
                        </div>
                      </FormField>

                      <FormField label="Gender" required>
                        <select
                          value={formData.gender || "male"}
                          onChange={(e) =>
                            handleInputChange("gender", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                          disabled={!isEditing}
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </FormField>

                      <FormField
                        label="Employee ID"
                        required
                        error={errors.employeeId}
                      >
                        <input
                          type="text"
                          value={formData.employeeId || ""}
                          onChange={(e) =>
                            handleInputChange("employeeId", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                          placeholder="EMP-0001"
                          disabled={!isEditing}
                        />
                      </FormField>

                      <FormField
                        label="Join Date"
                        required
                        error={errors.joinDate}
                      >
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="date"
                            value={formData.joinDate || ""}
                            onChange={(e) =>
                              handleInputChange("joinDate", e.target.value)
                            }
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                            disabled={!isEditing}
                          />
                        </div>
                      </FormField>

                      <FormField label="Status" required>
                        <select
                          value={formData.status || "active"}
                          onChange={(e) =>
                            handleInputChange("status", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                          disabled={!isEditing}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="on-leave">On Leave</option>
                        </select>
                      </FormField>
                    </div>

                    <FormField label="Address">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                          <MapPin className="h-5 w-5 text-gray-400" />
                        </div>
                        <textarea
                          value={formData.address || ""}
                          onChange={(e) =>
                            handleInputChange("address", e.target.value)
                          }
                          rows={3}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                          placeholder="Enter full address"
                          disabled={!isEditing}
                        />
                      </div>
                    </FormField>
                  </div>
                </div>
              )}

              {/* Professional Information */}
              {activeTab === "profile" && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <Briefcase className="w-5 h-5 mr-2 text-green-600" />
                      Professional Information
                    </h3>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField label="Role" required error={errors.role}>
                        <select
                          value={formData.role || "doctor"}
                          onChange={(e) =>
                            handleInputChange("role", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                          disabled={!isEditing}
                        >
                          <option value="doctor">Doctor</option>
                          <option value="nurse">Nurse</option>
                          <option value="pharmacist">Pharmacist</option>
                          <option value="receptionist">Receptionist</option>
                          <option value="admin">Admin</option>
                          <option value="laboratory">Laboratory</option>
                        </select>
                      </FormField>

                      <FormField
                        label="Department"
                        required
                        error={errors.department}
                      >
                        <select
                          value={formData.department || ""}
                          onChange={(e) =>
                            handleInputChange("department", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                          disabled={!isEditing}
                        >
                          <option value="">Select department</option>
                          {departments.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      </FormField>

                      <FormField label="Specialization">
                        <select
                          value={formData.specialization || ""}
                          onChange={(e) =>
                            handleInputChange("specialization", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                          disabled={!isEditing}
                        >
                          <option value="">Select specialization</option>
                          {specializations[
                            formData.role as keyof typeof specializations
                          ]?.map((spec) => (
                            <option key={spec} value={spec}>
                              {spec}
                            </option>
                          ))}
                        </select>
                      </FormField>

                      <FormField label="Shift" required>
                        <select
                          value={formData.shift || "morning"}
                          onChange={(e) =>
                            handleInputChange("shift", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                          disabled={!isEditing}
                        >
                          <option value="morning">Morning (8 AM - 4 PM)</option>
                          <option value="evening">
                            Evening (4 PM - 12 AM)
                          </option>
                          <option value="night">Night (12 AM - 8 AM)</option>
                          <option value="full-time">
                            Full Time (8 AM - 6 PM)
                          </option>
                        </select>
                      </FormField>
                    </div>

                    {/* Qualifications */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                        <Award className="w-5 h-5 mr-2 text-orange-600" />
                        Qualifications & Certifications
                      </h4>
                      <div className="space-y-3">
                        {isEditing && (
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={newQualification}
                              onChange={(e) =>
                                setNewQualification(e.target.value)
                              }
                              placeholder="Add qualification or certification"
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              onKeyPress={(e) =>
                                e.key === "Enter" &&
                                (e.preventDefault(), addQualification())
                              }
                            />
                            <Button
                              type="button"
                              onClick={addQualification}
                              size="sm"
                            >
                              Add
                            </Button>
                          </div>
                        )}
                        <div className="space-y-2">
                          {formData.qualifications?.map(
                            (qualification, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between bg-blue-50 px-4 py-2 rounded-lg"
                              >
                                <span className="text-sm text-blue-800">
                                  {qualification}
                                </span>
                                {isEditing && (
                                  <button
                                    type="button"
                                    onClick={() => removeQualification(index)}
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            )
                          )}
                          {(!formData.qualifications ||
                            formData.qualifications.length === 0) && (
                            <p className="text-sm text-gray-500 italic">
                              No qualifications added yet
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <ShieldIcon className="w-5 h-5 mr-2 text-purple-600" />
                      Security Settings
                    </h3>
                  </div>

                  <div className="p-6 space-y-6">
                    {resetPassword ? (
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h4 className="font-medium text-blue-900 mb-3">
                          Reset Password
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <div className="relative flex-1">
                              <input
                                type={showPassword ? "text" : "password"}
                                value={tempPassword}
                                readOnly
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                              >
                                {showPassword ? (
                                  <EyeOff className="w-5 h-5" />
                                ) : (
                                  <Eye className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                            <Button
                              type="button"
                              onClick={generateRandomPassword}
                              icon={<RotateCw />}
                              size="sm"
                            >
                              Generate
                            </Button>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setResetPassword(false)}
                              size="sm"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              onClick={() => {
                                setSuccess(
                                  "Password has been reset successfully"
                                );
                                setResetPassword(false);
                              }}
                              size="sm"
                            >
                              Confirm Reset
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                        <h4 className="font-medium text-yellow-900 mb-2">
                          Password Management
                        </h4>
                        <p className="text-sm text-yellow-700 mb-3">
                          Reset the user's password if they've forgotten it or
                          need a new one.
                        </p>
                        <Button
                          type="button"
                          onClick={() => {
                            setResetPassword(true);
                            generateRandomPassword();
                          }}
                          icon={<Key />}
                          variant="outline"
                          size="sm"
                        >
                          Reset Password
                        </Button>
                      </div>
                    )}

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Access Permissions
                      </h4>
                      <p className="text-sm text-gray-700 mb-3">
                        Current role:{" "}
                        <span className="font-medium">{formData.role}</span>
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                          <span className="text-sm">View patient records</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                          <span className="text-sm">Create appointments</span>
                        </div>
                        {formData.role === "admin" && (
                          <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                            <span className="text-sm">
                              Manage users and settings
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Activity Tab */}
              {activeTab === "activity" && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <History className="w-5 h-5 mr-2 text-indigo-600" />
                      Recent Activity
                    </h3>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4">
                      {activityLog.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg"
                        >
                          <div className="bg-blue-100 p-2 rounded-full">
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {log.action}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {log.details}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {activityLog.length === 0 && (
                        <div className="text-center py-8">
                          <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">
                            No activity recorded yet
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              {isEditing && activeTab === "profile" && (
                <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={toggleEdit}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" icon={<Save />} loading={saving}>
                      Update Staff Member
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDetail;
