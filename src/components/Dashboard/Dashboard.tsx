import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Pill,
  AlertTriangle,
  Activity,
  UserCheck,
  TrendingUp,
  TestTube,
  Stethoscope,
  UserCog,
  Microscope,
  Bell,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Search,
  Filter,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  time: string;
  type: string;
  status: string;
  symptoms: string;
  notes: string;
  patients: {
    first_name: string;
    last_name: string;
  };
  users?: {
    name: string;
  };
}

interface LabTest {
  id: string;
  test_name: string;
  status: string;
  notes: string;
  results: string;
  appointments: {
    date: string;
    time: string;
    doctor_id: string;
    patients: {
      first_name: string;
      last_name: string;
    };
  };
}

interface MedicineAlert {
  id: string;
  name: string;
  stock: number;
  min_stock: number;
  expiry_date: string;
}

interface NurseTask {
  id: string;
  task: string;
  status: string;
  notes: string;
  completed_at: string;
  appointments: {
    date: string;
    time: string;
    patients: {
      first_name: string;
      last_name: string;
    };
  };
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [medicineAlerts, setMedicineAlerts] = useState<MedicineAlert[]>([]);
  const [nurseTasks, setNurseTasks] = useState<NurseTask[]>([]);
  const [loading, setLoading] = useState(true);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch data based on user role
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const today = new Date().toISOString().split("T")[0];

        switch (user?.role) {
          case "doctor":
            // Fetch today's appointments
            const { data: appointmentsData } = await supabase
              .from("appointments")
              .select(
                `
                id, patient_id, doctor_id, date, time, type, status, symptoms, notes,
                patients (first_name, last_name)
              `
              )
              .eq("doctor_id", user.id)
              .eq("date", today)
              .neq("status", "completed")
              .order("time", { ascending: true });

            setAppointments(appointmentsData || []);

            // Fetch lab tests assigned by this doctor
            const { data: labTestsData } = await supabase
              .from("lab_tests")
              .select(
                `
                id, test_name, status, notes, results,
                appointments (date, time, doctor_id, patients (first_name, last_name))
              `
              )
              .eq("status", "completed")
              .order("created_at", { ascending: true });

            // Filter on the client side since we can't filter by nested field directly
            const filteredLabTests =
              labTestsData?.filter(
                (test) => test.appointments?.doctor_id === user.id
              ) || [];

            setLabTests(filteredLabTests);
            break;

          case "admin":
            // Fetch low stock medicines
            const { data: medicinesData } = await supabase
              .from("medicines")
              .select("id, name, stock, min_stock, expiry_date")
              .lte("stock", supabase.raw("min_stock + 5"))
              .order("stock", { ascending: true });

            setMedicineAlerts(medicinesData || []);
            break;

          case "laboratory":
            // Fetch pending lab tests
            const { data: pendingLabTests } = await supabase
              .from("lab_tests")
              .select(
                `
                id, test_name, status, notes, results,
                appointments (date, time, patients (first_name, last_name))
              `
              )
              .eq("status", "pending")
              .order("created_at", { ascending: true });

            setLabTests(pendingLabTests || []);
            break;

          case "receptionist":
            // Fetch today's appointments
            const { data: receptionAppointments } = await supabase
              .from("appointments")
              .select(
                `
                id, patient_id, doctor_id, date, time, type, status, symptoms, notes,
                patients (first_name, last_name),
                users (name)
              `
              )
              .eq("date", today)
              .order("time", { ascending: true });

            setAppointments(receptionAppointments || []);
            break;

          case "nurse":
            // Fetch today's nurse tasks
            const { data: nurseTasksData } = await supabase
              .from("nurse_tasks")
              .select(
                `
                id, task, status, notes, completed_at,
                appointments (date, time, patients (first_name, last_name))
              `
              )
              .eq("assigned_to", user.id)
              .eq("status", "pending")
              .order("created_at", { ascending: true });

            setNurseTasks(nurseTasksData || []);
            break;

          default:
            break;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const formatTime = (time: string) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getGreeting()}, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-gray-600">
            {currentTime.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <p className="text-lg font-medium text-gray-800">
            {currentTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-white rounded-full p-2 shadow-sm">
            <Bell className="h-5 w-5 text-gray-600" />
          </div>
          <div className="flex items-center space-x-2 bg-white rounded-full pl-2 pr-4 py-1 shadow-sm">
            <div className="bg-blue-100 rounded-full p-1">
              <UserCog className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-700 capitalize">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Role-specific content */}
      {user?.role === "doctor" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Appointments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Today's Appointments
              </h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {appointments.length}
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {appointment.patients?.first_name}{" "}
                          {appointment.patients?.last_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatTime(appointment.time)} • {appointment.type}
                        </p>
                        {appointment.symptoms && (
                          <p className="text-sm text-gray-700 mt-1">
                            Symptoms: {appointment.symptoms}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                          appointment.status === "scheduled"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {appointment.status}
                      </span>
                      <button className="p-1 hover:bg-gray-200 rounded">
                        <MoreHorizontal className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  No appointments scheduled for today
                </p>
              </div>
            )}
          </div>

          {/* Lab Tests */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <TestTube className="h-5 w-5 mr-2 text-purple-600" />
                Completed Lab Tests
              </h2>
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {labTests.length}
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : labTests.length > 0 ? (
              <div className="space-y-4">
                {labTests.map((test) => (
                  <div
                    key={test.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Microscope className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {test.appointments?.patients?.first_name}{" "}
                          {test.appointments?.patients?.last_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {test.test_name}
                        </p>
                        {test.notes && (
                          <p className="text-sm text-gray-700 mt-1">
                            Notes: {test.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        Completed
                      </span>
                      <button className="p-1 hover:bg-gray-200 rounded">
                        <MoreHorizontal className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TestTube className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  No completed lab tests ordered by you
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {user?.role === "admin" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
              Medicine Stock Alerts
            </h2>
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {medicineAlerts.length} alerts
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : medicineAlerts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Medicine
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Current Stock
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Minimum Stock
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Expiry Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {medicineAlerts.map((medicine) => (
                    <tr key={medicine.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {medicine.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {medicine.stock}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {medicine.min_stock}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(medicine.expiry_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            medicine.stock <= medicine.min_stock
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {medicine.stock <= medicine.min_stock
                            ? "Critical"
                            : "Low"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900">
                          Reorder
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-500">
                All medicines are sufficiently stocked
              </p>
            </div>
          )}
        </div>
      )}

      {user?.role === "laboratory" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Microscope className="h-5 w-5 mr-2 text-purple-600" />
              Pending Lab Tests
            </h2>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tests..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <button className="p-2 border border-gray-300 rounded-lg">
                <Filter className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : labTests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {labTests.map((test) => (
                <div
                  key={test.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-gray-900">
                      {test.test_name}
                    </h3>
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      Pending
                    </span>
                  </div>
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">
                      Patient: {test.appointments?.patients?.first_name}{" "}
                      {test.appointments?.patients?.last_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Scheduled:{" "}
                      {new Date(test.appointments?.date).toLocaleDateString()}{" "}
                      at {formatTime(test.appointments?.time)}
                    </p>
                  </div>
                  {test.notes && (
                    <p className="text-sm text-gray-700 mb-3">
                      Notes: {test.notes}
                    </p>
                  )}
                  <div className="flex justify-between items-center">
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      View Details
                    </button>
                    <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                      Upload Results
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Microscope className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No pending lab tests</p>
            </div>
          )}
        </div>
      )}

      {user?.role === "receptionist" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Today's Appointments
            </h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {appointments.length} appointments
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : appointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Time
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Patient
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Doctor
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatTime(appointment.time)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {appointment.patients?.first_name}{" "}
                          {appointment.patients?.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {appointment.users?.name || "Not assigned"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">
                          {appointment.type}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            appointment.status === "scheduled"
                              ? "bg-yellow-100 text-yellow-800"
                              : appointment.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                No appointments scheduled for today
              </p>
            </div>
          )}
        </div>
      )}

      {user?.role === "nurse" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-green-600" />
              Your Tasks for Today
            </h2>
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {nurseTasks.length} tasks
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : nurseTasks.length > 0 ? (
            <div className="space-y-4">
              {nurseTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Activity className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{task.task}</h3>
                      <p className="text-sm text-gray-500">
                        Patient: {task.appointments?.patients?.first_name}{" "}
                        {task.appointments?.patients?.last_name}
                      </p>
                      {task.notes && (
                        <p className="text-sm text-gray-700 mt-1">
                          Notes: {task.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
                      Mark Complete
                    </button>
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <MoreHorizontal className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-500">No tasks assigned for today</p>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {user?.role === "doctor" && (
            <>
              <button className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <Stethoscope className="h-6 w-6 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-blue-700">
                  New Consultation
                </span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <Pill className="h-6 w-6 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-purple-700">
                  Write Prescription
                </span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <TestTube className="h-6 w-6 text-green-600 mb-2" />
                <span className="text-sm font-medium text-green-700">
                  Request Lab Test
                </span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Calendar className="h-6 w-6 text-gray-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">
                  View Schedule
                </span>
              </button>
            </>
          )}

          {user?.role === "admin" && (
            <>
              <button className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <UserCog className="h-6 w-6 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-blue-700">
                  Manage Users
                </span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <Pill className="h-6 w-6 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-purple-700">
                  Inventory
                </span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <TrendingUp className="h-6 w-6 text-green-600 mb-2" />
                <span className="text-sm font-medium text-green-700">
                  Reports
                </span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Calendar className="h-6 w-6 text-gray-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">
                  Schedules
                </span>
              </button>
            </>
          )}

          {user?.role === "receptionist" && (
            <>
              <button className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <UserCheck className="h-6 w-6 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-blue-700">
                  New Patient
                </span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <Calendar className="h-6 w-6 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-purple-700">
                  Schedule Appointment
                </span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <Clock className="h-6 w-6 text-green-600 mb-2" />
                <span className="text-sm font-medium text-green-700">
                  Check Availability
                </span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Activity className="h-6 w-6 text-gray-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">
                  Patient Lookup
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
