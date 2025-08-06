import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Patient } from "../../types";
import Button from "../UI/Button";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Heart,
  AlertTriangle,
  Calendar,
} from "lucide-react";

const PatientDetail: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) {
      setError("No patient ID provided");
      setLoading(false);
      return;
    }

    const fetchPatient = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", patientId)
        .single();

      if (error) {
        setError("Failed to load patient");
        console.error(error);
      } else {
        setPatient(data);
      }
      setLoading(false);
    };

    fetchPatient();
  }, [patientId]);

  if (loading)
    return (
      <div className="p-6 text-center text-gray-600">
        Loading patient details...
      </div>
    );

  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  if (!patient)
    return (
      <div className="p-6 text-center text-gray-600">Patient not found</div>
    );

  const getAge = (dob: string) => {
    const birthDate = new Date(dob);
    const diff = Date.now() - birthDate.getTime();
    return new Date(diff).getUTCFullYear() - 1970;
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 to-indigo-100 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="mb-6 flex items-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Patients</span>
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
            {patient.first_name} {patient.last_name}
          </h1>
          <p className="text-gray-500">
            Detailed medical profile and contact info
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Info */}
          <Card
            title="Personal Information"
            icon={<User className="text-blue-600" />}
          >
            <Info
              label="Full Name"
              value={`${patient.first_name} ${patient.last_name}`}
            />
            <Info
              label="Age"
              value={`${getAge(patient.date_of_birth)} years`}
            />
            <Info label="Gender" value={patient.gender} />
            <Info
              label="Date of Birth"
              value={new Date(patient.date_of_birth).toLocaleDateString()}
            />
            <Info label="Blood Type" value={patient.blood_type || "N/A"} />
            <Info label="Status" value={patient.status} />
          </Card>

          {/* Contact Info */}
          <Card
            title="Contact Information"
            icon={<Mail className="text-green-600" />}
          >
            <Info label="Email" value={patient.email} />
            <Info label="Phone" value={patient.phone} />
            <Info label="Address" value={patient.address} />
            <Info label="Emergency Contact" value={patient.emergency_contact} />
          </Card>

          {/* Allergies */}
          <Card
            title="Allergies"
            icon={<AlertTriangle className="text-red-600" />}
          >
            {patient.allergies?.length ? (
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                {patient.allergies.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No allergies recorded.</p>
            )}
          </Card>

          {/* Medical History */}
          <Card
            title="Medical History"
            icon={<Heart className="text-pink-600" />}
          >
            {patient.medical_history?.length ? (
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                {patient.medical_history.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">
                No medical history recorded.
              </p>
            )}
          </Card>

          {/* Appointment Placeholder */}
          <Card
            title="Appointments & Consultations"
            icon={<Calendar className="text-indigo-600" />}
          >
            <p className="text-sm text-gray-500 italic">
              Coming soon: Patient appointment and consultation history.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Reusable card component for each section
const Card: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div className="bg-white border rounded-lg shadow-sm p-5 hover:shadow-md transition-all duration-300">
    <div className="flex items-center space-x-2 mb-3">
      {icon}
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
    </div>
    <div>{children}</div>
  </div>
);

// Reusable info line
const Info: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="mb-2 text-sm text-gray-700">
    <strong>{label}:</strong> {value}
  </div>
);

export default PatientDetail;
