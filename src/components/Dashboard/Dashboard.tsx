import React from 'react';
import { 
  Users, 
  Calendar, 
  Pill, 
  TrendingUp, 
  Clock,
  UserCheck,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import StatCard from './StatCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // Mock data for charts
  const appointmentData = [
    { name: 'Mon', appointments: 12 },
    { name: 'Tue', appointments: 19 },
    { name: 'Wed', appointments: 15 },
    { name: 'Thu', appointments: 22 },
    { name: 'Fri', appointments: 18 },
    { name: 'Sat', appointments: 8 },
    { name: 'Sun', appointments: 5 }
  ];

  const patientData = [
    { name: 'Jan', patients: 245 },
    { name: 'Feb', patients: 312 },
    { name: 'Mar', patients: 298 },
    { name: 'Apr', patients: 356 },
    { name: 'May', patients: 389 },
    { name: 'Jun', patients: 423 }
  ];

  const getStatsForRole = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { title: 'Total Patients', value: '1,234', change: '+12% from last month', changeType: 'increase' as const, icon: Users, color: 'blue' as const },
          { title: 'Today\'s Appointments', value: '42', change: '8 completed', changeType: 'neutral' as const, icon: Calendar, color: 'green' as const },
          { title: 'Active Staff', value: '28', change: '2 on leave', changeType: 'neutral' as const, icon: UserCheck, color: 'purple' as const },
          { title: 'Revenue (This Month)', value: '$12,450', change: '+8.2% from last month', changeType: 'increase' as const, icon: TrendingUp, color: 'green' as const }
        ];
      case 'doctor':
        return [
          { title: 'My Patients', value: '156', change: '+5 new this week', changeType: 'increase' as const, icon: Users, color: 'blue' as const },
          { title: 'Today\'s Appointments', value: '8', change: '3 completed', changeType: 'neutral' as const, icon: Calendar, color: 'green' as const },
          { title: 'Pending Consultations', value: '5', change: '2 urgent', changeType: 'neutral' as const, icon: Clock, color: 'yellow' as const },
          { title: 'Prescriptions Today', value: '12', change: '+3 from yesterday', changeType: 'increase' as const, icon: Pill, color: 'purple' as const }
        ];
      case 'nurse':
        return [
          { title: 'Patients Checked', value: '23', change: 'Today', changeType: 'neutral' as const, icon: Users, color: 'blue' as const },
          { title: 'Vitals Recorded', value: '18', change: 'Today', changeType: 'neutral' as const, icon: Activity, color: 'green' as const },
          { title: 'Upcoming Appointments', value: '15', change: 'Next 2 hours', changeType: 'neutral' as const, icon: Calendar, color: 'purple' as const },
          { title: 'Pending Tasks', value: '7', change: '2 urgent', changeType: 'neutral' as const, icon: Clock, color: 'yellow' as const }
        ];
      case 'pharmacist':
        return [
          { title: 'Prescriptions Filled', value: '34', change: 'Today', changeType: 'neutral' as const, icon: Pill, color: 'blue' as const },
          { title: 'Low Stock Items', value: '8', change: '3 critical', changeType: 'decrease' as const, icon: AlertTriangle, color: 'red' as const },
          { title: 'Total Medicines', value: '245', change: '+12 new stock', changeType: 'increase' as const, icon: Pill, color: 'green' as const },
          { title: 'Monthly Revenue', value: '$3,280', change: '+15% from last month', changeType: 'increase' as const, icon: TrendingUp, color: 'green' as const }
        ];
      case 'receptionist':
        return [
          { title: 'Appointments Today', value: '42', change: '12 walk-ins', changeType: 'neutral' as const, icon: Calendar, color: 'blue' as const },
          { title: 'New Registrations', value: '8', change: 'Today', changeType: 'increase' as const, icon: Users, color: 'green' as const },
          { title: 'Pending Checkouts', value: '5', change: '2 payments pending', changeType: 'neutral' as const, icon: Clock, color: 'yellow' as const },
          { title: 'Phone Calls', value: '23', change: 'Today', changeType: 'neutral' as const, icon: Activity, color: 'purple' as const }
        ];
      default:
        return [];
    }
  };

  const stats = getStatsForRole();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-gray-600">Here's what's happening at the clinic today.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Section */}
      {(user?.role === 'admin' || user?.role === 'doctor') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Appointments</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={appointmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="appointments" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={patientData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="patients" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              { time: '10 minutes ago', activity: 'New patient registered: John Smith', type: 'user' },
              { time: '25 minutes ago', activity: 'Appointment completed with Dr. Johnson', type: 'appointment' },
              { time: '1 hour ago', activity: 'Prescription filled for Patient #1234', type: 'prescription' },
              { time: '2 hours ago', activity: 'Low stock alert: Paracetamol', type: 'alert' },
              { time: '3 hours ago', activity: 'Monthly report generated', type: 'report' }
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-md">
                <div className={`w-2 h-2 rounded-full ${
                  item.type === 'user' ? 'bg-blue-500' :
                  item.type === 'appointment' ? 'bg-green-500' :
                  item.type === 'prescription' ? 'bg-purple-500' :
                  item.type === 'alert' ? 'bg-red-500' : 'bg-gray-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{item.activity}</p>
                  <p className="text-xs text-gray-500">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;