import React, { useState, useEffect } from "react";
import { X, Save, User, Mail, Phone } from "lucide-react";

interface Patient {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: "male" | "female" | "other";
  address: string;
  emergency_contact: string;
  status: "active" | "inactive";
}

interface PatientFormProps {
  patient?: Patient;
  isOpen: boolean;
  onClose: () => void;
  onSave: (patient: Partial<Patient>) => void;
}

const PatientForm: React.FC<PatientFormProps> = ({
  patient,
  isOpen,
  onClose,
  onSave,
}) => {
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Patient>>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "male",
    address: "",
    emergency_contact: "",
    status: "active",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get today's date in YYYY-MM-DD format for max date attribute
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Sync form data when `patient` prop changes (for editing)
  useEffect(() => {
    if (patient) {
      setFormData({
        first_name: patient.first_name || "",
        last_name: patient.last_name || "",
        email: patient.email || "",
        phone: patient.phone || "",
        date_of_birth: patient.date_of_birth || "",
        gender: patient.gender || "male",
        address: patient.address || "",
        emergency_contact: patient.emergency_contact || "",
        status: patient.status || "active",
      });
    } else {
      // Reset form for new patient
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        date_of_birth: "",
        gender: "male",
        address: "",
        emergency_contact: "",
        status: "active",
      });
    }
    setErrors({});
    setGeneralError(null);
    setSuccessMessage(null);
  }, [patient]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const nameRegex = /^[A-Za-z\s]+$/;
    const ethiopianPhoneRegex = /^(\+2519\d{8}|09\d{8})$/;
    const today = new Date();
    const birthDate = formData.date_of_birth
      ? new Date(formData.date_of_birth)
      : null;

    // First name validation
    if (!formData.first_name?.trim()) {
      newErrors.first_name = "First name is required";
    } else if (!nameRegex.test(formData.first_name)) {
      newErrors.first_name = "First name can only contain letters";
    }

    // Last name validation
    if (!formData.last_name?.trim()) {
      newErrors.last_name = "Last name is required";
    } else if (!nameRegex.test(formData.last_name)) {
      newErrors.last_name = "Last name can only contain letters";
    }

    // Email validation
    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (!formData.phone?.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!ethiopianPhoneRegex.test(formData.phone.replace(/-/g, ""))) {
      newErrors.phone = "Phone must be in format +251XXXXXXXXX or 09XXXXXXXX";
    }

    // Date of birth validation
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = "Date of birth is required";
    } else if (birthDate && birthDate > today) {
      newErrors.date_of_birth = "Date of birth cannot be in the future";
    }

    // Address validation
    if (!formData.address?.trim()) {
      newErrors.address = "Address is required";
    }

    // Emergency contact validation
    if (!formData.emergency_contact?.trim()) {
      newErrors.emergency_contact = "Emergency contact is required";
    } else if (
      !ethiopianPhoneRegex.test(formData.emergency_contact.replace(/-/g, ""))
    ) {
      newErrors.emergency_contact =
        "Phone must be in format +251XXXXXXXXX or 09XXXXXXXX";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setSuccessMessage(null);

    if (!validateForm()) return;

    // Format phone numbers to remove dashes for consistency
    const formattedData = {
      ...formData,
      phone: formData.phone?.replace(/-/g, ""),
      emergency_contact: formData.emergency_contact?.replace(/-/g, ""),
      updated_at: new Date().toISOString(),
    };

    try {
      // In a real app, you would call your API here
      // For this example, we'll simulate a successful save
      setTimeout(() => {
        onSave({ ...formattedData });
        setSuccessMessage(
          patient
            ? "Patient updated successfully."
            : "Patient added successfully."
        );

        if (!patient) {
          // Reset form for new patient after successful save
          setFormData({
            first_name: "",
            last_name: "",
            email: "",
            phone: "",
            date_of_birth: "",
            gender: "male",
            address: "",
            emergency_contact: "",
            status: "active",
          });
        }
      }, 500);
    } catch (err) {
      setGeneralError("An unexpected error occurred. Please try again.");
      console.error(err);
    }
  };

  const handleInputChange = (field: keyof Patient, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Format phone number as user types (Ethiopian format)
  const formatPhoneNumber = (value: string, isEmergency = false) => {
    // Remove all non-digit characters except +
    const cleaned = value.replace(/[^\d+]/g, "");

    // Ethiopian phone number formatting
    if (cleaned.startsWith("+251") && cleaned.length > 4) {
      return `+251-${cleaned.slice(4, 6)}-${cleaned.slice(6, 10)}${
        cleaned.length > 10 ? "-" + cleaned.slice(10) : ""
      }`;
    } else if (cleaned.startsWith("09") && cleaned.length > 2) {
      return `09-${cleaned.slice(2, 6)}-${cleaned.slice(6, 10)}${
        cleaned.length > 10 ? "-" + cleaned.slice(10) : ""
      }`;
    }

    return cleaned;
  };

  const handlePhoneChange = (
    value: string,
    field: "phone" | "emergency_contact"
  ) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange(field, formatted);
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

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-2xl">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-6 pt-6 pb-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {patient ? "Edit Patient" : "Add New Patient"}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Personal Information
                  </h4>

                  <div className="form-field">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) =>
                        handleInputChange("first_name", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.first_name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter first name"
                    />
                    {errors.first_name && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.first_name}
                      </p>
                    )}
                  </div>

                  <div className="form-field">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) =>
                        handleInputChange("last_name", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.last_name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter last name"
                    />
                    {errors.last_name && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.last_name}
                      </p>
                    )}
                  </div>

                  <div className="form-field">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) =>
                        handleInputChange("date_of_birth", e.target.value)
                      }
                      max={getTodayDate()}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.date_of_birth
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.date_of_birth && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.date_of_birth}
                      </p>
                    )}
                  </div>

                  <div className="form-field">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) =>
                        handleInputChange(
                          "gender",
                          e.target.value as "male" | "female" | "other"
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-blue-600" />
                    Contact Information
                  </h4>

                  <div className="form-field">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter email address"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="form-field">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        handlePhoneChange(e.target.value, "phone")
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="+251-XX-XXXX-XXX or 09-XX-XXXX-XXX"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div className="form-field">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.address ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter full address"
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div className="form-field">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Contact <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.emergency_contact}
                      onChange={(e) =>
                        handlePhoneChange(e.target.value, "emergency_contact")
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.emergency_contact
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="+251-XX-XXXX-XXX or 09-XX-XXXX-XXX"
                    />
                    {errors.emergency_contact && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.emergency_contact}
                      </p>
                    )}
                  </div>

                  <div className="form-field">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        handleInputChange(
                          "status",
                          e.target.value as "active" | "inactive"
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {patient ? "Update Patient" : "Save Patient"}
              </button>
            </div>
          </form>

          {generalError && (
            <div className="mt-4 mx-6 mb-4 text-sm text-red-600 bg-red-100 p-3 rounded-lg">
              {generalError}
            </div>
          )}

          {successMessage && (
            <div className="mt-4 mx-6 mb-4 text-sm text-green-700 bg-green-100 p-3 rounded-lg">
              {successMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientForm;
