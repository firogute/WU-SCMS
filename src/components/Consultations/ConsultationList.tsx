import React, { useState } from 'react';
import { Stethoscope, Plus, Search, Filter, Download, Eye, Edit, FileText } from 'lucide-react';
import { Consultation } from '../../types';
import Button from '../UI/Button';

const ConsultationList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [consultations, setConsultations] = useState<Consultation[]>([
    {
      id: '1',
      patientId: '1',
      doctorId: '2',
      appointmentId: '1',
      date: new Date().toISOString().split('T')[0],
      symptoms: 'Headache, fever, body aches',
      diagnosis: 'Viral fever',
      treatment: 'Rest, fluids, paracetamol',
      prescriptions: [
        {
          medicineId: '1',
          medicineName: 'Paracetamol',
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '5 days',
          instructions: 'Take after meals'
        }
      ],
      followUpDate: '2024-02-15',
      notes: 'Patient advised to return if symptoms worsen'
    },
    {
      id: '2',
      patientId: '2',
      doctorId: '2',
      appointmentId: '2',
      date: '2024-01-28',
      symptoms: 'Chest pain, shortness of breath',
      diagnosis: 'Hypertension',
      treatment: 'Lifestyle changes, medication',
      prescriptions: [
        {
          medicineId: '3',
          medicineName: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          duration: '30 days',
          instructions: 'Take in the morning'
        }
      ],
      notes: 'Regular monitoring required'
    }
  ]);

  const filteredConsultations = consultations.filter(consultation =>
    consultation.symptoms.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consultation.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consultation.treatment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPatientName = (patientId: string) => {
    const patients = {
      '1': 'John Doe',
      '2': 'Jane Smith',
      '3': 'Michael Johnson'
    };
    return patients[patientId as keyof typeof patients] || 'Unknown Patient';
  };

  const getDoctorName = (doctorId: string) => {
    const doctors = {
      '2': 'Dr. Michael Brown',
      '3': 'Dr. Sarah Johnson'
    };
    return doctors[doctorId as keyof typeof doctors] || 'Unknown Doctor';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consultations</h1>
          <p className="text-gray-600">View and manage patient consultations and medical records</p>
        </div>
        <Button icon={Plus}>
          New Consultation
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search consultations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              />
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredConsultations.map((consultation) => (
            <div key={consultation.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Stethoscope className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {getPatientName(consultation.patientId)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {getDoctorName(consultation.doctorId)} • {new Date(consultation.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Symptoms</h4>
                      <p className="text-sm text-gray-600">{consultation.symptoms}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Diagnosis</h4>
                      <p className="text-sm text-gray-600">{consultation.diagnosis}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Treatment</h4>
                      <p className="text-sm text-gray-600">{consultation.treatment}</p>
                    </div>
                  </div>

                  {consultation.prescriptions.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Prescriptions</h4>
                      <div className="space-y-2">
                        {consultation.prescriptions.map((prescription, index) => (
                          <div key={index} className="bg-green-50 p-3 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-green-800">{prescription.medicineName}</p>
                                <p className="text-sm text-green-600">
                                  {prescription.dosage} • {prescription.frequency} • {prescription.duration}
                                </p>
                                {prescription.instructions && (
                                  <p className="text-xs text-green-600 mt-1">{prescription.instructions}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {consultation.followUpDate && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Follow-up Date</h4>
                      <p className="text-sm text-blue-600">{new Date(consultation.followUpDate).toLocaleDateString()}</p>
                    </div>
                  )}

                  {consultation.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Notes</h4>
                      <p className="text-sm text-gray-600">{consultation.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="View Details">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors" title="Edit Consultation">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors" title="Generate Report">
                    <FileText className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredConsultations.length === 0 && (
          <div className="text-center py-12">
            <Stethoscope className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No consultations found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationList;