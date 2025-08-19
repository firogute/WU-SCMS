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

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  address: string;
  emergencyContact: string;
  medicalHistory: string[];
  allergies: string[];
  bloodType: string;
  registrationDate: string;
  status: "active" | "inactive";
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  type: "consultation" | "follow-up" | "emergency" | "checkup";
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  notes?: string;
  symptoms?: string;
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  manufacturer: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
  expiryDate: string;
  batchNumber: string;
  description: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId: string;
  date: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  prescriptions: Prescription[];
  followUpDate?: string;
  notes: string;
}

export interface Prescription {
  medicineId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
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
