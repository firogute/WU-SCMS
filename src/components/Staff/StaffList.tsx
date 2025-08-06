import React, { useState } from 'react';
import { Search, Plus, Filter, Download, MoreVertical, Eye, Edit, Trash2, UserCheck, Shield, Clock } from 'lucide-react';
import { Staff } from '../../types';
import StaffForm from './StaffForm';
import Button from '../UI/Button';

const StaffList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | undefined>(undefined);
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [staff, setStaff] = useState<Staff[]>([
    {
      id: '1',
      fullName: 'Dr. Sarah Johnson',
      role: 'admin',
      department: 'Administration',
      email: 'admin@wollega.edu.et',
      phone: '+251-911-123456',
      gender: 'female',
      employeeId: 'EMP-0001',
      joinDate: '2023-01-15',
      username: 'sarahjohnson',
      shift: 'full-time',
      status: 'active',
      accessRole: 'admin',
      address: '123 University Ave, Nekemte',
      emergencyContact: '+251-911-654321',
      qualifications: ['MD', 'MBA Healthcare Management', 'Board Certified'],
      specialization: 'Healthcare Administration'
    },
    {
      id: '2',
      fullName: 'Dr. Michael Brown',
      role: 'doctor',
      department: 'General Medicine',
      email: 'doctor@wollega.edu.et',
      phone: '+251-911-789012',
      gender: 'male',
      employeeId: 'EMP-0002',
      joinDate: '2023-02-20',
      username: 'michaelbrown',
      shift: 'morning',
      status: 'active',
      accessRole: 'doctor',
      address: '456 Medical St, Nekemte',
      emergencyContact: '+251-911-987654',
      qualifications: ['MD', 'Internal Medicine Residency', 'ACLS Certified'],
      specialization: 'General Practice'
    },
    {
      id: '3',
      fullName: 'Mary Wilson',
      role: 'nurse',
      department: 'General Care',
      email: 'nurse@wollega.edu.et',
      phone: '+251-911-345678',
      gender: 'female',
      employeeId: 'EMP-0003',
      joinDate: '2023-03-10',
      username: 'marywilson',
      shift: 'morning',
      status: 'active',
      accessRole: 'nurse',
      address: '789 Care Lane, Nekemte',
      emergencyContact: '+251-911-876543',
      qualifications: ['BSN', 'RN License', 'BLS Certified'],
      specialization: 'General Nursing'
    },
    {
      id: '4',
      fullName: 'John Davis',
      role: 'pharmacist',
      department: 'Pharmacy',
      email: 'pharmacist@wollega.edu.et',
      phone: '+251-911-567890',
      gender: 'male',
      employeeId: 'EMP-0004',
      joinDate: '2023-04-05',
      username: 'johndavis',
      shift: 'full-time',
      status: 'active',
      accessRole: 'pharmacist',
      address: '321 Pharmacy Rd, Nekemte',
      emergencyContact: '+251-911-098765',
      qualifications: ['PharmD', 'Licensed Pharmacist', 'Clinical Pharmacy Certified'],
      specialization: 'Clinical Pharmacy'
    },
    {
      id: '5',
      fullName: 'Lisa Anderson',
      role: 'receptionist',
      department: 'Reception',
      email: 'receptionist@wollega.edu.et',
      phone: '+251-911-234567',
      gender: 'female',
      employeeId: 'EMP-0005',
      joinDate: '2023-05-12',
      username: 'lisaanderson',
      shift: 'morning',
      status: 'active',
      accessRole: 'receptionist',
      address: '654 Front Desk Ave, Nekemte',
      emergencyContact: '+251-911-765432',
      qualifications: ['Diploma in Office Administration', 'Customer Service Certified'],
      specialization: 'Patient Services'
    },
    {
      id: '6',
      fullName: 'Dr. Emily Davis',
      role: 'doctor',
      department: 'Pediatrics',
      email: 'emily.davis@wollega.edu.et',
      phone: '+251-911-890123',
      gender: 'female',
      employeeId: 'EMP-0006',
      joinDate: '2023-06-18',
      username: 'emilydavis',
      shift: 'evening',
      status: 'on-leave',
      accessRole: 'doctor',
      address: '987 Pediatric Way, Nekemte',
      emergencyContact: '+251-911-543210',
      qualifications: ['MD', 'Pediatrics Residency', 'PALS Certified'],
      specialization: 'Pediatrics'
    }
  ]);

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddStaff = () => {
    setEditingStaff(undefined);
    setShowStaffForm(true);
  };

  const handleEditStaff = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setShowStaffForm(true);
    setSelectedStaff(null);
  };

  const handleDeleteStaff = (staffId: string) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      setStaff(prev => prev.filter(s => s.id !== staffId));
      setSelectedStaff(null);
    }
  };

  const handleSaveStaff = (staffData: Partial<Staff>) => {
    if (editingStaff) {
      // Update existing staff
      setStaff(prev => prev.map(s => 
        s.id === editingStaff.id 
          ? { ...s, ...staffData } as Staff
          : s
      ));
    } else {
      // Add new staff
      const newStaff: Staff = {
        ...staffData,
        id: Date.now().toString()
      } as Staff;
      setStaff(prev => [...prev, newStaff]);
    }
    setShowStaffForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'on-leave': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'doctor': return 'bg-blue-100 text-blue-800';
      case 'nurse': return 'bg-green-100 text-green-800';
      case 'pharmacist': return 'bg-orange-100 text-orange-800';
      case 'receptionist': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getShiftIcon = (shift: string) => {
    switch (shift) {
      case 'morning': return '🌅';
      case 'evening': return '🌆';
      case 'night': return '🌙';
      case 'full-time': return '⏰';
      default: return '⏰';
    }
  };

  const exportStaffData = (format: 'csv' | 'pdf') => {
    alert(`Exporting staff data as ${format.toUpperCase()}...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600">Manage clinic staff members and their information</p>
        </div>
        <Button onClick={handleAddStaff} icon={Plus}>
          Add Staff Member
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Staff</p>
              <p className="text-2xl font-bold text-gray-900">{staff.length}</p>
            </div>
            <UserCheck className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Staff</p>
              <p className="text-2xl font-bold text-green-600">
                {staff.filter(s => s.status === 'active').length}
              </p>
            </div>
            <Shield className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">On Leave</p>
              <p className="text-2xl font-bold text-yellow-600">
                {staff.filter(s => s.status === 'on-leave').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Departments</p>
              <p className="text-2xl font-bold text-purple-600">
                {new Set(staff.map(s => s.department)).size}
              </p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-bold">D</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                />
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
                <option value="pharmacist">Pharmacist</option>
                <option value="receptionist">Receptionist</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on-leave">On Leave</option>
              </select>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => exportStaffData('csv')}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>CSV</span>
              </button>
              <button 
                onClick={() => exportStaffData('pdf')}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>PDF</span>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role & Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shift & Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStaff.map((staffMember) => (
                <tr key={staffMember.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="font-medium text-blue-600">
                          {staffMember.fullName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{staffMember.fullName}</div>
                        <div className="text-sm text-gray-500">ID: {staffMember.employeeId}</div>
                        {staffMember.specialization && (
                          <div className="text-xs text-gray-400">{staffMember.specialization}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(staffMember.role)}`}>
                        {staffMember.role}
                      </span>
                      <div className="text-sm text-gray-600">{staffMember.department}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{staffMember.email}</div>
                    <div className="text-sm text-gray-500">{staffMember.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-1">{getShiftIcon(staffMember.shift)}</span>
                        {staffMember.shift.replace('-', ' ')}
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(staffMember.status)}`}>
                        {staffMember.status.replace('-', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(staffMember.joinDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative">
                      <button
                        onClick={() => setSelectedStaff(selectedStaff === staffMember.id ? null : staffMember.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {selectedStaff === staffMember.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                          <div className="py-1">
                            <button 
                              onClick={() => {/* View staff details */}}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Eye className="w-4 h-4 mr-3" />
                              View Details
                            </button>
                            <button 
                              onClick={() => handleEditStaff(staffMember)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Edit className="w-4 h-4 mr-3" />
                              Edit Staff
                            </button>
                            <button 
                              onClick={() => handleDeleteStaff(staffMember.id)}
                              className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                            >
                              <Trash2 className="w-4 h-4 mr-3" />
                              Delete Staff
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredStaff.length}</span> of{' '}
              <span className="font-medium">{staff.length}</span> results
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50" disabled>
                Previous
              </button>
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">1</button>
              <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">2</button>
              <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <StaffForm
        staff={editingStaff}
        isOpen={showStaffForm}
        onClose={() => setShowStaffForm(false)}
        onSave={handleSaveStaff}
      />
    </div>
  );
};

export default StaffList;