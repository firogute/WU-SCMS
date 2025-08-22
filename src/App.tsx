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
import PatientManagement from "./components/Appointments/PatientManagement";
import LaboratoryTestDetail from "./components/Laboratory/tests/LaboratoryTestDetail";
import DoctorLabResultsPage from "./pages/doctor/DoctorLabResultsPage";
import LabTestDetailPage from "./pages/doctor/LabTestDetailPage";
import StaffDetail from "./components/Staff/StaffDetail";

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: string[];
}> = ({ children, allowedRoles = [] }) => {
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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          Unauthorized: You do not have permission to access this page.
        </div>
      </div>
    );
  }

  return <>{children}</>;
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
          path="appointment/:appointmentId/patient/:patientId"
          element={<PatientManagement />}
        />
        <Route path="consultations" element={<ConsultationList />} />
        <Route path="pharmacy" element={<PharmacyInventory />} />
        <Route path="laboratory" element={<LaboratoryTests />} />
        <Route
          path="laboratory/tests/:testId"
          element={<LaboratoryTestDetail />}
        />
        <Route path="reports" element={<ReportsModule />} />
        <Route path="staff" element={<StaffList />} />
        <Route path="staff/:id" element={<StaffDetail />} />
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
        {/* New doctor-specific routes */}
        <Route
          path="doctor/lab-results"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorLabResultsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="doctor/lab-results/:testId"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <LabTestDetailPage />
            </ProtectedRoute>
          }
        />
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
