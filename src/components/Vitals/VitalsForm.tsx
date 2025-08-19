import React, { useState } from "react";
import { X, Save, Activity, Thermometer, Heart, Droplets } from "lucide-react";
import { Patient, VitalsFormData } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../UI/Button";
import FormField from "../UI/FormField";

interface VitalsFormProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  onSave: (vitals: VitalsFormData) => void;
}

const VitalsForm: React.FC<VitalsFormProps> = ({
  patient,
  isOpen,
  onClose,
  onSave,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<VitalsFormData>({
    patient_id: patient.id,
    temperature: undefined,
    blood_pressure_systolic: undefined,
    blood_pressure_diastolic: undefined,
    heart_rate: undefined,
    respiratory_rate: undefined,
    oxygen_saturation: undefined,
    weight: undefined,
    height: undefined,
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Basic validation for vital signs ranges
    if (
      formData.temperature &&
      (formData.temperature < 30 || formData.temperature > 45)
    ) {
      newErrors.temperature = "Temperature should be between 30-45°C";
    }
    if (
      formData.blood_pressure_systolic &&
      (formData.blood_pressure_systolic < 60 ||
        formData.blood_pressure_systolic > 250)
    ) {
      newErrors.blood_pressure_systolic =
        "Systolic BP should be between 60-250 mmHg";
    }
    if (
      formData.blood_pressure_diastolic &&
      (formData.blood_pressure_diastolic < 30 ||
        formData.blood_pressure_diastolic > 150)
    ) {
      newErrors.blood_pressure_diastolic =
        "Diastolic BP should be between 30-150 mmHg";
    }
    if (
      formData.heart_rate &&
      (formData.heart_rate < 30 || formData.heart_rate > 200)
    ) {
      newErrors.heart_rate = "Heart rate should be between 30-200 bpm";
    }
    if (
      formData.respiratory_rate &&
      (formData.respiratory_rate < 5 || formData.respiratory_rate > 50)
    ) {
      newErrors.respiratory_rate =
        "Respiratory rate should be between 5-50 breaths/min";
    }
    if (
      formData.oxygen_saturation &&
      (formData.oxygen_saturation < 70 || formData.oxygen_saturation > 100)
    ) {
      newErrors.oxygen_saturation =
        "Oxygen saturation should be between 70-100%";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleInputChange = (field: keyof VitalsFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const getVitalStatus = (vital: string, value: number | undefined) => {
    if (!value) return "";

    switch (vital) {
      case "temperature":
        if (value >= 36.1 && value <= 37.2)
          return "text-green-600 dark:text-green-400";
        if (value >= 37.3 && value <= 38.0)
          return "text-yellow-600 dark:text-yellow-400";
        return "text-red-600 dark:text-red-400";
      case "heart_rate":
        if (value >= 60 && value <= 100)
          return "text-green-600 dark:text-green-400";
        if ((value >= 50 && value < 60) || (value > 100 && value <= 120))
          return "text-yellow-600 dark:text-yellow-400";
        return "text-red-600 dark:text-red-400";
      case "oxygen_saturation":
        if (value >= 95) return "text-green-600 dark:text-green-400";
        if (value >= 90) return "text-yellow-600 dark:text-yellow-400";
        return "text-red-600 dark:text-red-400";
      default:
        return "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-80 transition-opacity"
          onClick={onClose}
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-3xl">
          <form onSubmit={handleSubmit}>
            <div className="bg-white dark:bg-gray-800 px-6 pt-6 pb-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Record Vital Signs
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {patient.first_name} {patient.last_name} •{" "}
                      {patient.student_id}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Primary Vitals */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center mb-4">
                    <Thermometer className="w-5 h-5 mr-2 text-red-600 dark:text-red-400" />
                    Primary Vital Signs
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField
                      label="Temperature (°C)"
                      error={errors.temperature}
                    >
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          min="30"
                          max="45"
                          value={formData.temperature || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "temperature",
                              parseFloat(e.target.value) || undefined
                            )
                          }
                          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${getVitalStatus(
                            "temperature",
                            formData.temperature
                          )}`}
                          placeholder="36.5"
                        />
                        <span className="absolute right-3 top-2 text-gray-400 dark:text-gray-500 text-sm">
                          °C
                        </span>
                      </div>
                    </FormField>

                    <FormField
                      label="Heart Rate (bpm)"
                      error={errors.heart_rate}
                    >
                      <div className="relative">
                        <input
                          type="number"
                          min="30"
                          max="200"
                          value={formData.heart_rate || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "heart_rate",
                              parseInt(e.target.value) || undefined
                            )
                          }
                          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${getVitalStatus(
                            "heart_rate",
                            formData.heart_rate
                          )}`}
                          placeholder="72"
                        />
                        <Heart className="absolute right-3 top-2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                      </div>
                    </FormField>

                    <FormField
                      label="Respiratory Rate (/min)"
                      error={errors.respiratory_rate}
                    >
                      <input
                        type="number"
                        min="5"
                        max="50"
                        value={formData.respiratory_rate || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "respiratory_rate",
                            parseInt(e.target.value) || undefined
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="16"
                      />
                    </FormField>

                    <FormField
                      label="Oxygen Saturation (%)"
                      error={errors.oxygen_saturation}
                    >
                      <div className="relative">
                        <input
                          type="number"
                          min="70"
                          max="100"
                          value={formData.oxygen_saturation || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "oxygen_saturation",
                              parseInt(e.target.value) || undefined
                            )
                          }
                          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${getVitalStatus(
                            "oxygen_saturation",
                            formData.oxygen_saturation
                          )}`}
                          placeholder="98"
                        />
                        <span className="absolute right-3 top-2 text-gray-400 dark:text-gray-500 text-sm">
                          %
                        </span>
                      </div>
                    </FormField>
                  </div>
                </div>

                {/* Blood Pressure */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center mb-4">
                    <Droplets className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                    Blood Pressure
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Systolic (mmHg)"
                      error={errors.blood_pressure_systolic}
                    >
                      <input
                        type="number"
                        min="60"
                        max="250"
                        value={formData.blood_pressure_systolic || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "blood_pressure_systolic",
                            parseInt(e.target.value) || undefined
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="120"
                      />
                    </FormField>

                    <FormField
                      label="Diastolic (mmHg)"
                      error={errors.blood_pressure_diastolic}
                    >
                      <input
                        type="number"
                        min="30"
                        max="150"
                        value={formData.blood_pressure_diastolic || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "blood_pressure_diastolic",
                            parseInt(e.target.value) || undefined
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="80"
                      />
                    </FormField>
                  </div>
                </div>

                {/* Physical Measurements */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Physical Measurements
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Weight (kg)">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="300"
                        value={formData.weight || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "weight",
                            parseFloat(e.target.value) || undefined
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="70.0"
                      />
                    </FormField>

                    <FormField label="Height (cm)">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="250"
                        value={formData.height || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "height",
                            parseFloat(e.target.value) || undefined
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="170.0"
                      />
                    </FormField>
                  </div>
                </div>

                {/* Notes */}
                <FormField label="Notes">
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Additional observations or notes..."
                  />
                </FormField>

                {/* Vital Signs Reference */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                    Normal Ranges (Adults)
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700 dark:text-blue-300">
                    <div>• Temperature: 36.1-37.2°C</div>
                    <div>• Heart Rate: 60-100 bpm</div>
                    <div>• Respiratory Rate: 12-20 /min</div>
                    <div>• Oxygen Saturation: ≥95%</div>
                    <div>• Blood Pressure: 90-120/60-80 mmHg</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" icon={Save}>
                Save Vital Signs
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VitalsForm;
