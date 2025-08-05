import React, { useState } from 'react';
import { FileText, Download, Calendar, TrendingUp, Users, Pill, DollarSign, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import Button from '../UI/Button';

const ReportsModule: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Mock data for charts
  const patientGrowthData = [
    { month: 'Jan', patients: 245, appointments: 320, revenue: 12400 },
    { month: 'Feb', patients: 312, appointments: 398, revenue: 15600 },
    { month: 'Mar', patients: 298, appointments: 445, revenue: 18200 },
    { month: 'Apr', patients: 356, appointments: 512, revenue: 21800 },
    { month: 'May', patients: 389, appointments: 578, revenue: 24500 },
    { month: 'Jun', patients: 423, appointments: 634, revenue: 28900 }
  ];

  const departmentData = [
    { name: 'General Medicine', value: 35, color: '#3B82F6' },
    { name: 'Cardiology', value: 25, color: '#10B981' },
    { name: 'Pediatrics', value: 20, color: '#F59E0B' },
    { name: 'Orthopedics', value: 12, color: '#EF4444' },
    { name: 'Others', value: 8, color: '#8B5CF6' }
  ];

  const medicineUsageData = [
    { name: 'Paracetamol', prescribed: 145, stock: 89 },
    { name: 'Amoxicillin', prescribed: 98, stock: 156 },
    { name: 'Lisinopril', prescribed: 76, stock: 234 },
    { name: 'Metformin', prescribed: 134, stock: 198 },
    { name: 'Ibuprofen', prescribed: 87, stock: 123 }
  ];

  const reportTypes = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'patients', name: 'Patient Reports', icon: Users },
    { id: 'appointments', name: 'Appointment Reports', icon: Calendar },
    { id: 'pharmacy', name: 'Pharmacy Reports', icon: Pill },
    { id: 'financial', name: 'Financial Reports', icon: DollarSign }
  ];

  const handleExportReport = (format: 'pdf' | 'csv' | 'excel') => {
    alert(`Exporting ${selectedReport} report as ${format.toUpperCase()}...`);
  };

  const renderOverviewReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-3xl font-bold text-blue-600">1,234</p>
              <p className="text-sm text-green-600 mt-1">↗ +12% from last month</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Appointments</p>
              <p className="text-3xl font-bold text-green-600">2,887</p>
              <p className="text-sm text-green-600 mt-1">↗ +8% from last month</p>
            </div>
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-3xl font-bold text-purple-600">$28,900</p>
              <p className="text-sm text-green-600 mt-1">↗ +18% from last month</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Medicines Dispensed</p>
              <p className="text-3xl font-bold text-orange-600">540</p>
              <p className="text-sm text-green-600 mt-1">↗ +5% from last month</p>
            </div>
            <Pill className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Growth Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={patientGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="patients" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={departmentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {departmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Medicine Usage vs Stock</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={medicineUsageData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="prescribed" fill="#EF4444" name="Prescribed" />
            <Bar dataKey="stock" fill="#10B981" name="Stock" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderPatientReports = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Reports</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
          <h4 className="font-medium text-gray-900">New Patient Registrations</h4>
          <p className="text-sm text-gray-600 mt-1">Monthly breakdown of new patient registrations</p>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
          <h4 className="font-medium text-gray-900">Patient Demographics</h4>
          <p className="text-sm text-gray-600 mt-1">Age, gender, and location distribution</p>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
          <h4 className="font-medium text-gray-900">Patient Visit History</h4>
          <p className="text-sm text-gray-600 mt-1">Frequency and patterns of patient visits</p>
        </div>
      </div>
    </div>
  );

  const renderAppointmentReports = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Reports</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
          <h4 className="font-medium text-gray-900">Appointment Statistics</h4>
          <p className="text-sm text-gray-600 mt-1">Scheduled, completed, and cancelled appointments</p>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
          <h4 className="font-medium text-gray-900">Doctor Utilization</h4>
          <p className="text-sm text-gray-600 mt-1">Appointment load per doctor</p>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
          <h4 className="font-medium text-gray-900">Peak Hours Analysis</h4>
          <p className="text-sm text-gray-600 mt-1">Busiest times and scheduling patterns</p>
        </div>
      </div>
    </div>
  );

  const renderPharmacyReports = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Pharmacy Reports</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
          <h4 className="font-medium text-gray-900">Inventory Status</h4>
          <p className="text-sm text-gray-600 mt-1">Current stock levels and low stock alerts</p>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
          <h4 className="font-medium text-gray-900">Medicine Usage</h4>
          <p className="text-sm text-gray-600 mt-1">Most prescribed medicines and usage trends</p>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
          <h4 className="font-medium text-gray-900">Expiry Tracking</h4>
          <p className="text-sm text-gray-600 mt-1">Medicines nearing expiry dates</p>
        </div>
      </div>
    </div>
  );

  const renderFinancialReports = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Reports</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
          <h4 className="font-medium text-gray-900">Revenue Analysis</h4>
          <p className="text-sm text-gray-600 mt-1">Monthly and yearly revenue breakdown</p>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
          <h4 className="font-medium text-gray-900">Payment Methods</h4>
          <p className="text-sm text-gray-600 mt-1">Cash, insurance, and other payment distributions</p>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
          <h4 className="font-medium text-gray-900">Cost Analysis</h4>
          <p className="text-sm text-gray-600 mt-1">Operational costs and profit margins</p>
        </div>
      </div>
    </div>
  );

  const renderReportContent = () => {
    switch (selectedReport) {
      case 'overview': return renderOverviewReport();
      case 'patients': return renderPatientReports();
      case 'appointments': return renderAppointmentReports();
      case 'pharmacy': return renderPharmacyReports();
      case 'financial': return renderFinancialReports();
      default: return renderOverviewReport();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Generate comprehensive reports and analyze clinic performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => handleExportReport('pdf')}>
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" onClick={() => handleExportReport('csv')}>
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" onClick={() => handleExportReport('excel')}>
              <Download className="w-4 h-4 mr-2" />
              Excel
            </Button>
          </div>
        </div>
      </div>

      <div className="flex space-x-6">
        {/* Report Navigation */}
        <div className="w-64 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Report Types</h3>
          <nav className="space-y-2">
            {reportTypes.map((report) => {
              const Icon = report.icon;
              return (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    selectedReport === report.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{report.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Report Content */}
        <div className="flex-1">
          {renderReportContent()}
        </div>
      </div>
    </div>
  );
};

export default ReportsModule;