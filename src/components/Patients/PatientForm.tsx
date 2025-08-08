import React, { useState, useEffect } from "react";
import { X, Save, User, Mail, Phone, Heart, AlertTriangle } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Patient } from "../../types";
import Button from "../UI/Button";
import FormField from "../UI/FormField";

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
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "male",
    address: "",
    emergencyContact: "",
    bloodType: "",
    allergies: [],
    medicalHistory: [],
    status: "active",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newAllergy, setNewAllergy] = useState("");
  const [newMedicalHistory, setNewMedicalHistory] = useState("");

  // Sync form data when `patient` prop changes (for editing)
  useEffect(() => {
    setFormData({
      firstName: patient?.first_name || "",
      lastName: patient?.last_name || "",
      email: patient?.email || "",
      phone: patient?.phone || "",
      dateOfBirth: patient?.date_of_birth || "",
      gender: patient?.gender || "male",
      address: patient?.address || "",
      emergencyContact: patient?.emergency_contact || "",
      bloodType: patient?.blood_type || "",
      allergies: patient?.allergies || [],
      medicalHistory: patient?.medical_history || [],
      status: patient?.status || "active",
    });
    setErrors({});
    setGeneralError(null);
    setSuccessMessage(null);
    setNewAllergy("");
    setNewMedicalHistory("");
  }, [patient]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName?.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName?.trim())
      newErrors.lastName = "Last name is required";
    if (!formData.email?.trim()) newErrors.email = "Email is required";
    if (!formData.phone?.trim()) newErrors.phone = "Phone is required";
    if (!formData.dateOfBirth)
      newErrors.dateOfBirth = "Date of birth is required";
    if (!formData.address?.trim()) newErrors.address = "Address is required";
    if (!formData.emergencyContact?.trim())
      newErrors.emergencyContact = "Emergency contact is required";

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setSuccessMessage(null);

    if (!validateForm()) return;

    const mappedData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      date_of_birth: formData.dateOfBirth,
      gender: formData.gender,
      address: formData.address,
      emergency_contact: formData.emergencyContact,
      blood_type: formData.bloodType,
      medical_history: formData.medicalHistory,
      allergies: formData.allergies,
      status: formData.status,
      updated_at: new Date().toISOString(),
    };

    try {
      if (patient?.id) {
        // UPDATE existing
        const { data, error } = await supabase
          .from("patients")
          .update(mappedData)
          .eq("id", patient.id)
          .select()
          .single();

        if (error) {
          handleSupabaseError(error);
          return;
        }

        onSave({ ...data });
        setSuccessMessage("Patient updated successfully.");
      } else {
        // INSERT new
        const { data, error } = await supabase
          .from("patients")
          .insert([{ ...mappedData, created_at: new Date().toISOString() }])
          .select()
          .single();

        if (error) {
          handleSupabaseError(error);
          return;
        }

        onSave({ ...data });
        setSuccessMessage("Patient added successfully.");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          dateOfBirth: "",
          gender: "male",
          address: "",
          emergencyContact: "",
          bloodType: "",
          allergies: [],
          medicalHistory: [],
          status: "active",
        });
      }
    } catch (err) {
      setGeneralError("An unexpected error occurred. Please try again.");
      console.error(err);
    }
  };

  const handleSupabaseError = (error: any) => {
    console.error("Supabase Error:", error);

    if (error.code === "23505") {
      // Unique constraint violation
      if (error.message.includes("patients_email_key")) {
        setErrors((prev) => ({ ...prev, email: "Email already exists" }));
      } else {
        setGeneralError(
          "Duplicate field value violates uniqueness constraint."
        );
      }
    } else {
      setGeneralError(error.message || "An error occurred.");
    }
  };

  const handleInputChange = (field: keyof Patient, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setFormData((prev) => ({
        ...prev,
        allergies: [...(prev.allergies || []), newAllergy.trim()],
      }));
      setNewAllergy("");
    }
  };

  const removeAllergy = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      allergies: prev.allergies?.filter((_, i) => i !== index) || [],
    }));
  };

  const addMedicalHistory = () => {
    if (newMedicalHistory.trim()) {
      setFormData((prev) => ({
        ...prev,
        medicalHistory: [
          ...(prev.medicalHistory || []),
          newMedicalHistory.trim(),
        ],
      }));
      setNewMedicalHistory("");
    }
  };

  const removeMedicalHistory = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      medicalHistory: prev.medicalHistory?.filter((_, i) => i !== index) || [],
    }));
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

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-4xl">
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

                  <FormField
                    label="First Name"
                    required
                    error={errors.firstName}
                  >
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter first name"
                    />
                  </FormField>

                  <FormField label="Last Name" required error={errors.lastName}>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter last name"
                    />
                  </FormField>

                  <FormField
                    label="Date of Birth"
                    required
                    error={errors.dateOfBirth}
                  >
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        handleInputChange("dateOfBirth", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </FormField>

                  <FormField label="Blood Type">
                    <select
                      value={formData.bloodType}
                      onChange={(e) =>
                        handleInputChange("bloodType", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select blood type</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </FormField>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-blue-600" />
                    Contact Information
                  </h4>

                  <FormField label="Email" required error={errors.email}>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email address"
                    />
                  </FormField>

                  <FormField label="Phone" required error={errors.phone}>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+251-911-123456"
                    />
                  </FormField>

                  <FormField label="Address" required error={errors.address}>
                    <textarea
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter full address"
                    />
                  </FormField>

                  <FormField
                    label="Emergency Contact"
                    required
                    error={errors.emergencyContact}
                  >
                    <input
                      type="tel"
                      value={formData.emergencyContact}
                      onChange={(e) =>
                        handleInputChange("emergencyContact", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+251-911-654321"
                    />
                  </FormField>

                  <FormField label="Status">
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
                  </FormField>
                </div>
              </div>

              {/* Medical Information */}
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Allergies */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                      <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                      Allergies
                    </h4>
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newAllergy}
                          onChange={(e) => setNewAllergy(e.target.value)}
                          placeholder="Add allergy"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          onKeyPress={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), addAllergy())
                          }
                        />
                        <Button type="button" onClick={addAllergy} size="sm">
                          Add
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {formData.allergies?.map((allergy, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-red-50 px-3 py-2 rounded-lg"
                          >
                            <span className="text-sm text-red-800">
                              {allergy}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeAllergy(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Medical History */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                      <Heart className="w-5 h-5 mr-2 text-green-600" />
                      Medical History
                    </h4>
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newMedicalHistory}
                          onChange={(e) => setNewMedicalHistory(e.target.value)}
                          placeholder="Add medical condition"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          onKeyPress={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), addMedicalHistory())
                          }
                        />
                        <Button
                          type="button"
                          onClick={addMedicalHistory}
                          size="sm"
                        >
                          Add
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {formData.medicalHistory?.map((condition, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-green-50 px-3 py-2 rounded-lg"
                          >
                            <span className="text-sm text-green-800">
                              {condition}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeMedicalHistory(index)}
                              className="text-green-600 hover:text-green-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" icon={Save}>
                {patient ? "Update Patient" : "Save Patient"}
              </Button>
            </div>
          </form>

          {generalError && (
            <div className="mt-4 text-sm text-red-600 bg-red-100 p-2 rounded">
              {generalError}
            </div>
          )}

          {successMessage && (
            <div className="mt-4 text-sm text-green-700 bg-green-100 p-2 rounded">
              {successMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientForm;
