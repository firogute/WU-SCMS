export interface User {
  id: string;
  name: string;
  email: string;
  role:
    | "admin"
    | "doctor"
    | "nurse"
    | "pharmacist"
    | "receptionist"
    | "laboratory";
  avatar?: string;
  department?: string;
}

// types.ts
export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  blood_type: string;
  email: string;
  phone: string;
  address: string;
  emergency_contact: string;
  allergies: string[];
  conditions: string[];
  status: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  time: string;
  type: string;
  status: string;
  symptoms: string;
  diagnosis: string;
  notes: string;
  vital_signs?: {
    temperature: number;
    blood_pressure: string;
    heart_rate: number;
    respiratory_rate: number;
    oxygen_saturation: number;
  };
}

export interface LabTest {
  id: string;
  appointment_id: string;
  test_name: string;
  status: string;
  assigned_to: string;
  notes: string;
  results?: string;
  created_at: string;
}

export interface NurseTask {
  id: string;
  appointment_id: string;
  task: string;
  status: string;
  assigned_to: string;
  notes: string;
  completed_at?: string;
  created_at: string;
}

export interface Prescription {
  id: string;
  consultation_id: string;
  medicine_id: string;
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  status: string;
  created_at: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  read: boolean;
  createdAt: string;
  userId?: string;
}

export interface Staff {
  id: string;
  fullName: string;
  role: "admin" | "doctor" | "nurse" | "pharmacist" | "receptionist";
  department: string;
  email: string;
  phone: string;
  gender: "male" | "female" | "other";
  employeeId: string;
  joinDate: string;
  username: string;
  shift: "morning" | "evening" | "night" | "full-time";
  status: "active" | "inactive" | "on-leave";
  accessRole: "admin" | "doctor" | "nurse" | "pharmacist" | "receptionist";
  profilePicture?: string;
  address?: string;
  emergencyContact?: string;
  qualifications?: string[];
  specialization?: string;
}
