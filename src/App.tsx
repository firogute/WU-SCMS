import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginForm from "./components/Auth/LoginForm";
import Layout from "./components/Layout/Layout";
import Dashboard from "./components/Dashboard/Dashboard";
import PatientList from "./components/Patients/PatientList";
import AppointmentCalendar from "./components/Appointments/AppointmentCalendar";
import PharmacyInventory from "./components/Pharmacy/PharmacyInventory";
import ConsultationList from "./components/Consultations/ConsultationList";
import LaboratoryTests from "./components/Laboratory/LaboratoryTests";
import ReportsModule from "./components/Reports/ReportsModule";
import StaffList from "./components/Staff/StaffList";
import PatientDetail from "./components/Patients/PatientDetail";
import ProfileSettings from "./components/Settings/ProfileSettings";
import PatientMedicalPage from "./components/Appointments/PatientMedicalPage";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="patients" element={<PatientList />} />
        <Route path="patients/:patientId" element={<PatientDetail />} />
        <Route path="appointments" element={<AppointmentCalendar />} />
        <Route
          path="appointment/:appointmentId"
          element={<PatientMedicalPage />}
        />
        <Route path="consultations" element={<ConsultationList />} />
        <Route path="pharmacy" element={<PharmacyInventory />} />
        <Route path="laboratory" element={<LaboratoryTests />} />
        <Route path="reports" element={<ReportsModule />} />
        <Route path="staff" element={<StaffList />} />
        <Route
          path="vitals"
          element={
            <div className="text-center py-12 text-gray-500">
              Vitals module coming soon...
            </div>
          }
        />
        <Route
          path="settings"
          element={
            <div className="text-center py-12 text-gray-500">
              Settings coming soon...
            </div>
          }
        />
        <Route path="settings/:id" element={<ProfileSettings />} />
        <Route path="" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
