import React, { useState } from 'react';
import { X, Save, User, Mail, Phone, Calendar, MapPin, Shield, Clock } from 'lucide-react';
import { Staff } from '../../types';
import Button from '../UI/Button';
import FormField from '../UI/FormField';

interface StaffFormProps {
  staff?: Staff;
  isOpen: boolean;
  onClose: () => void;
  onSave: (staff: Partial<Staff>) => void;
}

const StaffForm: React.FC<StaffFormProps> = ({ staff, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Staff>>({
    fullName: staff?.fullName || '',
    role: staff?.role || 'doctor',
    department: staff?.department || '',
    email: staff?.email || '',
    phone: staff?.phone || '',
    gender: staff?.gender || 'male',
    employeeId: staff?.employeeId || '',
    joinDate: staff?.joinDate || new Date().toISOString().split('T')[0],
    username: staff?.username || '',
    shift: staff?.shift || 'morning',
    status: staff?.status || 'active',
    accessRole: staff?.accessRole || 'doctor',
    address: staff?.address || '',
    emergencyContact: staff?.emergencyContact || '',
    qualifications: staff?.qualifications || [],
    specialization: staff?.specialization || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newQualification, setNewQualification] = useState('');

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName?.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email?.trim()) newErrors.email = 'Email is required';
    if (!formData.phone?.trim()) newErrors.phone = 'Phone is required';
    if (!formData.department?.trim()) newErrors.department = 'Department is required';
    if (!formData.employeeId?.trim()) newErrors.employeeId = 'Employee ID is required';
    if (!formData.username?.trim()) newErrors.username = 'Username is required';
    if (!formData.joinDate) newErrors.joinDate = 'Join date is required';

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({
        ...formData,
        id: staff?.id || Date.now().toString(),
        employeeId: formData.employeeId || `EMP-${Date.now().toString().slice(-4)}`
      });
      onClose();
    }
  };

  const handleInputChange = (field: keyof Staff, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addQualification = () => {
    if (newQualification.trim()) {
      setFormData(prev => ({
        ...prev,
        qualifications: [...(prev.qualifications || []), newQualification.trim()]
      }));
      setNewQualification('');
    }
  };

  const removeQualification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications?.filter((_, i) => i !== index) || []
    }));
  };

  const departments = [
    'General Medicine',
    'Pediatrics',
    'Cardiology',
    'Orthopedics',
    'Dermatology',
    'Pharmacy',
    'Administration',
    'Emergency',
    'Laboratory',
    'Radiology'
  ];

  const specializations = {
    doctor: ['General Practice', 'Internal Medicine', 'Pediatrics', 'Cardiology', 'Orthopedics', 'Dermatology'],
    nurse: ['General Nursing', 'Pediatric Nursing', 'Critical Care', 'Emergency Nursing', 'Surgical Nursing'],
    pharmacist: ['Clinical Pharmacy', 'Hospital Pharmacy', 'Community Pharmacy'],
    receptionist: ['Front Desk', 'Patient Services', 'Administrative Support'],
    admin: ['Healthcare Administration', 'IT Management', 'Human Resources']
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-4xl">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-6 pt-6 pb-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {staff ? 'Edit Staff Member' : 'Add New Staff Member'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Full Name" required error={errors.fullName}>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter full name"
                      />
                    </FormField>

                    <FormField label="Gender" required>
                      <select
                        value={formData.gender}
                        onChange={(e) => handleInputChange('gender', e.target.value as 'male' | 'female' | 'other')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </FormField>

                    <FormField label="Phone" required error={errors.phone}>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+251-911-123456"
                      />
                    </FormField>

                    <FormField label="Emergency Contact">
                      <input
                        type="tel"
                        value={formData.emergencyContact}
                        onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+251-911-654321"
                      />
                    </FormField>
                  </div>

                  <div className="mt-4">
                    <FormField label="Address">
                      <textarea
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter full address"
                      />
                    </FormField>
                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                    <Shield className="w-5 h-5 mr-2 text-green-600" />
                    Professional Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Employee ID" required error={errors.employeeId}>
                      <input
                        type="text"
                        value={formData.employeeId}
                        onChange={(e) => handleInputChange('employeeId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="EMP-0001"
                      />
                    </FormField>

                    <FormField label="Role" required>
                      <select
                        value={formData.role}
                        onChange={(e) => handleInputChange('role', e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="doctor">Doctor</option>
                        <option value="nurse">Nurse</option>
                        <option value="pharmacist">Pharmacist</option>
                        <option value="receptionist">Receptionist</option>
                        <option value="admin">Admin</option>
                      </select>
                    </FormField>

                    <FormField label="Department" required error={errors.department}>
                      <select
                        value={formData.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select department</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </FormField>

                    <FormField label="Specialization">
                      <select
                        value={formData.specialization}
                        onChange={(e) => handleInputChange('specialization', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select specialization</option>
                        {specializations[formData.role as keyof typeof specializations]?.map(spec => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                      </select>
                    </FormField>

                    <FormField label="Join Date" required error={errors.joinDate}>
                      <input
                        type="date"
                        value={formData.joinDate}
                        onChange={(e) => handleInputChange('joinDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </FormField>

                    <FormField label="Shift" required>
                      <select
                        value={formData.shift}
                        onChange={(e) => handleInputChange('shift', e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="morning">Morning (8 AM - 4 PM)</option>
                        <option value="evening">Evening (4 PM - 12 AM)</option>
                        <option value="night">Night (12 AM - 8 AM)</option>
                        <option value="full-time">Full Time (8 AM - 6 PM)</option>
                      </select>
                    </FormField>
                  </div>
                </div>

                {/* System Access */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                    <Mail className="w-5 h-5 mr-2 text-purple-600" />
                    System Access
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Email" required error={errors.email}>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter email address"
                      />
                    </FormField>

                    <FormField label="Username" required error={errors.username}>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter username"
                      />
                    </FormField>

                    <FormField label="Access Role" required>
                      <select
                        value={formData.accessRole}
                        onChange={(e) => handleInputChange('accessRole', e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="doctor">Doctor Access</option>
                        <option value="nurse">Nurse Access</option>
                        <option value="pharmacist">Pharmacist Access</option>
                        <option value="receptionist">Receptionist Access</option>
                        <option value="admin">Admin Access</option>
                      </select>
                    </FormField>

                    <FormField label="Status" required>
                      <select
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="on-leave">On Leave</option>
                      </select>
                    </FormField>
                  </div>
                </div>

                {/* Qualifications */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                    <Calendar className="w-5 h-5 mr-2 text-orange-600" />
                    Qualifications & Certifications
                  </h4>
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newQualification}
                        onChange={(e) => setNewQualification(e.target.value)}
                        placeholder="Add qualification or certification"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addQualification())}
                      />
                      <Button type="button" onClick={addQualification} size="sm">
                        Add
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.qualifications?.map((qualification, index) => (
                        <div key={index} className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg">
                          <span className="text-sm text-blue-800">{qualification}</span>
                          <button
                            type="button"
                            onClick={() => removeQualification(index)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" icon={Save}>
                {staff ? 'Update Staff Member' : 'Save Staff Member'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StaffForm;