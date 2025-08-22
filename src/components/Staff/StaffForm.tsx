import React, { useState, useEffect } from "react";
import {
  X,
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
} from "lucide-react";
import { Staff } from "../../types";
import Button from "../UI/Button";
import FormField from "../UI/FormField";
import { supabase } from "../../lib/supabase";

interface StaffFormProps {
  staff?: Staff;
  isOpen: boolean;
  onClose: () => void;
  onSave: (staff: Partial<Staff>) => void;
  mode?: "create" | "edit";
}

const StaffForm: React.FC<StaffFormProps> = ({
  staff,
  isOpen,
  onClose,
  onSave,
  mode = "create",
}) => {
  const [formData, setFormData] = useState<Partial<Staff>>({
    fullName: "",
    role: "doctor",
    department: "",
    email: "",
    phone: "",
    gender: "male",
    employeeId: "",
    joinDate: new Date().toISOString().split("T")[0],
    shift: "morning",
    status: "active",
    accessRole: "doctor",
    address: "",
    emergencyContact: "",
    qualifications: [],
    specialization: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newQualification, setNewQualification] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [resetPassword, setResetPassword] = useState(false);
  const [tempPassword, setTempPassword] = useState("password123");

  // Initialize form with staff data when in edit mode
  useEffect(() => {
    if (staff && mode === "edit") {
      setFormData({
        fullName: staff.fullName || "",
        role: staff.role || "doctor",
        department: staff.department || "",
        email: staff.email || "",
        phone: staff.phone || "",
        gender: staff.gender || "male",
        employeeId: staff.employeeId || "",
        joinDate: staff.joinDate || new Date().toISOString().split("T")[0],
        shift: staff.shift || "morning",
        status: staff.status || "active",
        accessRole: staff.accessRole || "doctor",
        address: staff.address || "",
        emergencyContact: staff.emergencyContact || "",
        qualifications: staff.qualifications || [],
        specialization: staff.specialization || "",
      });
      setIsEditing(false); // Start in view mode for edits
    } else if (mode === "create") {
      // Reset form for new staff
      setFormData({
        fullName: "",
        role: "doctor",
        department: "",
        email: "",
        phone: "",
        gender: "male",
        employeeId: "",
        joinDate: new Date().toISOString().split("T")[0],
        shift: "morning",
        status: "active",
        accessRole: "doctor",
        address: "",
        emergencyContact: "",
        qualifications: [],
        specialization: "",
      });
      setIsEditing(true); // Start in edit mode for new staff
    }
  }, [staff, mode, isOpen]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName?.trim())
      newErrors.fullName = "Full name is required";
    if (!formData.email?.trim()) newErrors.email = "Email is required";
    if (!formData.phone?.trim()) newErrors.phone = "Phone is required";
    if (!formData.department?.trim())
      newErrors.department = "Department is required";
    if (!formData.employeeId?.trim())
      newErrors.employeeId = "Employee ID is required";
    if (!formData.joinDate) newErrors.joinDate = "Join date is required";

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const staffData: Partial<Staff> = {
        ...formData,
        id: staff?.id,
        employeeId:
          formData.employeeId || `EMP-${Date.now().toString().slice(-4)}`,
      };

      // Add password for new staff
      if (mode === "create") {
        staffData.password = tempPassword;
      }

      // Add reset password flag for edits
      if (mode === "edit" && resetPassword) {
        staffData.password = tempPassword;
        staffData.requirePasswordChange = true;
      }

      onSave(staffData);
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

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      // Reset form to original values when canceling edit
      setFormData({
        fullName: staff?.fullName || "",
        role: staff?.role || "doctor",
        department: staff?.department || "",
        email: staff?.email || "",
        phone: staff?.phone || "",
        gender: staff?.gender || "male",
        employeeId: staff?.employeeId || "",
        joinDate: staff?.joinDate || new Date().toISOString().split("T")[0],
        shift: staff?.shift || "morning",
        status: staff?.status || "active",
        accessRole: staff?.accessRole || "doctor",
        address: staff?.address || "",
        emergencyContact: staff?.emergencyContact || "",
        qualifications: staff?.qualifications || [],
        specialization: staff?.specialization || "",
      });
    }
  };

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

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-6 pt-6 pb-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {mode === "edit"
                        ? "Staff Details"
                        : "Add New Staff Member"}
                    </h3>
                    {mode === "edit" && (
                      <p className="text-sm text-gray-500">
                        ID: {staff?.employeeId}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {mode === "edit" && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={toggleEdit}
                      icon={isEditing ? <Eye /> : "Edit"}
                    >
                      {isEditing ? "View Mode" : "Edit Mode"}
                    </Button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Password Section */}
              {(mode === "create" || (mode === "edit" && resetPassword)) && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-lg font-medium text-blue-900 flex items-center mb-3">
                    <Key className="w-5 h-5 mr-2 text-blue-600" />
                    Password Settings
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Temporary Password" required>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={tempPassword}
                          onChange={(e) => setTempPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                          placeholder="Enter temporary password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </FormField>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generateRandomPassword}
                        icon={<RotateCw />}
                        size="sm"
                      >
                        Generate Strong Password
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-blue-700 mt-2">
                    {mode === "create"
                      ? "This will be the initial password. User will be prompted to change it on first login."
                      : "This will reset the user's password and require them to change it on next login."}
                  </p>
                </div>
              )}

              {mode === "edit" && !resetPassword && (
                <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-yellow-900 flex items-center">
                        <Key className="w-5 h-5 mr-2 text-yellow-600" />
                        Password Management
                      </h4>
                      <p className="text-sm text-yellow-700">
                        Reset the user's password if needed
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setResetPassword(true)}
                      icon={<RotateCw />}
                    >
                      Reset Password
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Full Name"
                      required
                      error={errors.fullName}
                    >
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) =>
                          handleInputChange("fullName", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                        placeholder="Enter full name"
                        disabled={mode === "edit" && !isEditing}
                      />
                    </FormField>

                    <FormField label="Gender" required>
                      <select
                        value={formData.gender}
                        onChange={(e) =>
                          handleInputChange(
                            "gender",
                            e.target.value as "male" | "female" | "other"
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                        disabled={mode === "edit" && !isEditing}
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </FormField>

                    <FormField label="Phone" required error={errors.phone}>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                        placeholder="+251-911-123456"
                        disabled={mode === "edit" && !isEditing}
                      />
                    </FormField>

                    <FormField label="Emergency Contact">
                      <input
                        type="tel"
                        value={formData.emergencyContact}
                        onChange={(e) =>
                          handleInputChange("emergencyContact", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                        placeholder="+251-911-654321"
                        disabled={mode === "edit" && !isEditing}
                      />
                    </FormField>
                  </div>

                  <div className="mt-4">
                    <FormField label="Address">
                      <textarea
                        value={formData.address}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                        placeholder="Enter full address"
                        disabled={mode === "edit" && !isEditing}
                      />
                    </FormField>
                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                    <Shield className="w-5 h-5 mr-2 text-green-600" />
                    Professional Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Employee ID"
                      required
                      error={errors.employeeId}
                    >
                      <input
                        type="text"
                        value={formData.employeeId}
                        onChange={(e) =>
                          handleInputChange("employeeId", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                        placeholder="EMP-0001"
                        disabled={mode === "edit" && !isEditing}
                      />
                    </FormField>

                    <FormField label="Role" required>
                      <select
                        value={formData.role}
                        onChange={(e) =>
                          handleInputChange("role", e.target.value as any)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                        disabled={mode === "edit" && !isEditing}
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
                        value={formData.department}
                        onChange={(e) =>
                          handleInputChange("department", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                        disabled={mode === "edit" && !isEditing}
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
                        value={formData.specialization}
                        onChange={(e) =>
                          handleInputChange("specialization", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                        disabled={mode === "edit" && !isEditing}
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

                    <FormField
                      label="Join Date"
                      required
                      error={errors.joinDate}
                    >
                      <input
                        type="date"
                        value={formData.joinDate}
                        onChange={(e) =>
                          handleInputChange("joinDate", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                        disabled={mode === "edit" && !isEditing}
                      />
                    </FormField>

                    <FormField label="Shift" required>
                      <select
                        value={formData.shift}
                        onChange={(e) =>
                          handleInputChange("shift", e.target.value as any)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                        disabled={mode === "edit" && !isEditing}
                      >
                        <option value="morning">Morning (8 AM - 4 PM)</option>
                        <option value="evening">Evening (4 PM - 12 AM)</option>
                        <option value="night">Night (12 AM - 8 AM)</option>
                        <option value="full-time">
                          Full Time (8 AM - 6 PM)
                        </option>
                      </select>
                    </FormField>
                  </div>
                </div>

                {/* System Access */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                    <Mail className="w-5 h-5 mr-2 text-purple-600" />
                    System Access
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Email" required error={errors.email}>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                        placeholder="Enter email address"
                        disabled={mode === "edit" && !isEditing}
                      />
                    </FormField>

                    <FormField label="Access Role" required>
                      <select
                        value={formData.accessRole}
                        onChange={(e) =>
                          handleInputChange("accessRole", e.target.value as any)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                        disabled={mode === "edit" && !isEditing}
                      >
                        <option value="doctor">Doctor Access</option>
                        <option value="nurse">Nurse Access</option>
                        <option value="pharmacist">Pharmacist Access</option>
                        <option value="receptionist">
                          Receptionist Access
                        </option>
                        <option value="admin">Admin Access</option>
                        <option value="laboratory">Laboratory Access</option>
                      </select>
                    </FormField>

                    <FormField label="Status" required>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          handleInputChange("status", e.target.value as any)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                        disabled={mode === "edit" && !isEditing}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="on-leave">On Leave</option>
                      </select>
                    </FormField>
                  </div>
                </div>

                {/* Qualifications */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                    <Calendar className="w-5 h-5 mr-2 text-orange-600" />
                    Qualifications & Certifications
                  </h4>
                  <div className="space-y-3">
                    {isEditing && (
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newQualification}
                          onChange={(e) => setNewQualification(e.target.value)}
                          placeholder="Add qualification or certification"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      {formData.qualifications?.map((qualification, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg"
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
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              {isEditing && (
                <Button type="submit" icon={<Save />}>
                  {mode === "edit"
                    ? "Update Staff Member"
                    : "Save Staff Member"}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StaffForm;
