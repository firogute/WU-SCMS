import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Input,
  Select,
  Table,
  Tag,
  Divider,
  Form,
  Modal,
  Tabs,
  Collapse,
  Alert,
  Avatar,
  Badge,
  Progress,
  Timeline,
  Descriptions,
  Switch,
  List,
} from "antd";
import {
  ArrowLeft,
  User,
  Heart,
  Calendar,
  Beaker,
  Tablet,
  Stethoscope,
  FileText,
  Plus,
  Edit,
  Save,
  Send,
  Clock,
  AlertCircle,
  CheckCircle,
  Activity,
  Thermometer,
  Droplets,
  Eye,
  History,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;

// Static data for demonstration
const staticPatient = {
  id: "patient-001",
  first_name: "John",
  last_name: "Doe",
  date_of_birth: "1985-06-15",
  gender: "Male",
  blood_type: "A+",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  address: "123 Main St, Anytown, USA",
  emergency_contact: "Jane Doe (Spouse) - +1 (555) 987-6543",
  status: "Active",
  allergies: ["Penicillin", "Shellfish"],
  conditions: ["Hypertension", "Type 2 Diabetes"],
};

const staticAppointment = {
  id: "appt-001",
  date: "2023-10-15T14:30:00",
  patient_id: "patient-001",
  doctor_id: "doctor-001",
  symptoms: "Fever, headache, and sore throat for 3 days",
  diagnosis: "Suspected streptococcal pharyngitis",
  notes: "Patient reports difficulty swallowing. Tonsils appear inflamed.",
  status: "in-progress",
  type: "Emergency",
  vital_signs: {
    temperature: 38.5,
    blood_pressure: "130/85",
    heart_rate: 92,
    respiratory_rate: 18,
    oxygen_saturation: 98,
  },
};

const staticLabTests = [
  {
    id: "lab-001",
    test_name: "Complete Blood Count",
    status: "pending",
    assigned_to: "Lab Technician A",
    notes: "Routine test",
    created_at: "2023-10-15T14:35:00",
  },
  {
    id: "lab-002",
    test_name: "Throat Culture",
    status: "in-progress",
    assigned_to: "Lab Technician B",
    notes: "Check for strep",
    created_at: "2023-10-15T14:40:00",
  },
];

const staticNurseTasks = [
  {
    id: "nurse-001",
    task: "Administer ibuprofen 400mg",
    status: "completed",
    assigned_to: "Nurse Jane",
    notes: "Given at 14:45",
    created_at: "2023-10-15T14:35:00",
    completed_at: "2023-10-15T14:50:00",
  },
  {
    id: "nurse-002",
    task: "Check vitals in 2 hours",
    status: "pending",
    assigned_to: "Nurse John",
    notes: "Monitor temperature",
    created_at: "2023-10-15T14:50:00",
  },
];

const staticPrescriptions = [
  {
    id: "rx-001",
    medication: "Amoxicillin",
    dosage: "500mg",
    frequency: "Three times daily",
    duration: "10 days",
    instructions: "Take with food",
    status: "active",
  },
  {
    id: "rx-002",
    medication: "Ibuprofen",
    dosage: "400mg",
    frequency: "As needed for pain",
    duration: "5 days",
    instructions: "Do not exceed 1200mg in 24 hours",
    status: "active",
  },
];

// Static data for medical history
const staticMedicalHistory = [
  {
    id: "history-001",
    date: "2023-08-12T10:15:00",
    doctor: "Dr. Sarah Johnson",
    symptoms: "Persistent cough, chest congestion, mild fever",
    diagnosis: "Acute bronchitis",
    treatment: "Rest, increased fluid intake, cough suppressant",
    notes: "Patient advised to return if symptoms worsen",
    prescriptions: [
      {
        medication: "Dextromethorphan",
        dosage: "30mg",
        frequency: "Every 6 hours as needed",
        duration: "7 days",
      },
    ],
    lab_results: [
      {
        test_name: "Chest X-ray",
        result: "Clear, no signs of pneumonia",
        status: "completed",
      },
    ],
  },
  {
    id: "history-002",
    date: "2023-05-22T09:30:00",
    doctor: "Dr. Michael Chen",
    symptoms: "Routine checkup, blood pressure monitoring",
    diagnosis: "Hypertension management",
    treatment: "Lifestyle modifications, continued medication",
    notes: "Blood pressure well-controlled with current medication",
    prescriptions: [
      {
        medication: "Lisinopril",
        dosage: "10mg",
        frequency: "Once daily",
        duration: "Ongoing",
      },
    ],
    lab_results: [
      {
        test_name: "Complete Metabolic Panel",
        result: "Within normal limits",
        status: "completed",
      },
      {
        test_name: "Lipid Panel",
        result: "Cholesterol slightly elevated at 215 mg/dL",
        status: "completed",
      },
    ],
  },
  {
    id: "history-003",
    date: "2023-02-10T14:00:00",
    doctor: "Dr. Sarah Johnson",
    symptoms: "Annual physical examination",
    diagnosis: "General health maintenance",
    treatment: "Preventive care recommendations",
    notes:
      "Patient in generally good health. Recommended dietary adjustments for prediabetes.",
    prescriptions: [],
    lab_results: [
      {
        test_name: "Hemoglobin A1C",
        result: "5.9% (prediabetes range)",
        status: "completed",
      },
      {
        test_name: "Complete Blood Count",
        result: "Within normal limits",
        status: "completed",
      },
    ],
  },
];

const staticChronicConditions = [
  {
    condition: "Hypertension",
    diagnosed_date: "2021-03-15",
    status: "Controlled with medication",
    severity: "Mild",
  },
  {
    condition: "Type 2 Diabetes",
    diagnosed_date: "2022-08-10",
    status: "Prediabetes - Diet controlled",
    severity: "Mild",
  },
];

const staticSurgicalHistory = [
  {
    procedure: "Appendectomy",
    date: "2015-11-05",
    surgeon: "Dr. Robert Wong",
    facility: "City General Hospital",
    outcome: "Successful, full recovery",
  },
  {
    procedure: "Tonsillectomy",
    date: "1998-07-12",
    surgeon: "Dr. Elizabeth Grant",
    facility: "Children's Medical Center",
    outcome: "Successful, no complications",
  },
];

const staffMembers = [
  { id: "staff-001", name: "Dr. Sarah Johnson", role: "doctor" },
  { id: "staff-002", name: "Dr. Michael Chen", role: "doctor" },
  { id: "staff-003", name: "Nurse Jane Smith", role: "nurse" },
  { id: "staff-004", name: "Nurse John Davis", role: "nurse" },
  { id: "staff-005", name: "Lab Technician A", role: "lab_technician" },
  { id: "staff-006", name: "Lab Technician B", role: "lab_technician" },
];

const PatientMedicalPage = () => {
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState(staticAppointment.symptoms);
  const [diagnosis, setDiagnosis] = useState(staticAppointment.diagnosis || "");
  const [notes, setNotes] = useState(staticAppointment.notes || "");
  const [labTests, setLabTests] = useState(staticLabTests);
  const [nurseTasks, setNurseTasks] = useState(staticNurseTasks);
  const [prescriptions, setPrescriptions] = useState(staticPrescriptions);
  const [isSaving, setIsSaving] = useState(false);
  const [activeModal, setActiveModal] = useState({
    type: null,
    data: null,
  });
  const [expandedHistory, setExpandedHistory] = useState({});
  const [form] = Form.useForm();

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "orange";
      case "in_progress":
        return "blue";
      case "completed":
        return "green";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock size={14} />;
      case "in_progress":
        return <Activity size={14} />;
      case "completed":
        return <CheckCircle size={14} />;
      case "cancelled":
        return <AlertCircle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  const handleSaveMedicalData = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      console.log("Saving medical data:", { symptoms, diagnosis, notes });
      setIsSaving(false);
      Modal.success({
        title: "Success",
        content: "Medical data saved successfully!",
      });
    }, 1000);
  };

  const handleAssignToLab = () => {
    setActiveModal({ type: "lab", data: null });
  };

  const handleAssignToNurse = () => {
    setActiveModal({ type: "nurse", data: null });
  };

  const handleAddPrescription = () => {
    setActiveModal({ type: "prescription", data: null });
  };

  const handleModalSubmit = (values) => {
    const newItem = {
      id: `new-${Date.now()}`,
      ...values,
      created_at: new Date().toISOString(),
      status: values.status || "pending",
    };

    if (activeModal.type === "lab") {
      setLabTests([...labTests, newItem]);
    } else if (activeModal.type === "nurse") {
      setNurseTasks([...nurseTasks, newItem]);
    } else if (activeModal.type === "prescription") {
      setPrescriptions([...prescriptions, newItem]);
    }

    setActiveModal({ type: null, data: null });
    form.resetFields();
  };

  const handleSendToPharmacy = () => {
    Modal.success({
      title: "Prescriptions Sent",
      content: "All prescriptions have been sent to the pharmacy successfully.",
    });
  };

  const handleCompleteAppointment = () => {
    Modal.confirm({
      title: "Complete Appointment",
      content: "Are you sure you want to mark this appointment as completed?",
      onOk() {
        Modal.success({
          title: "Appointment Completed",
          content: "The appointment has been marked as completed.",
        });
      },
    });
  };

  const toggleHistoryExpansion = (id) => {
    setExpandedHistory((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderVitalSigns = () => (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <Card size="small" className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Thermometer className="text-blue-500 mr-2" size={16} />
          <span className="font-semibold">Temperature</span>
        </div>
        <div className="text-2xl font-bold">
          {staticAppointment.vital_signs.temperature}°C
        </div>
      </Card>

      <Card size="small" className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Activity className="text-red-500 mr-2" size={16} />
          <span className="font-semibold">BP</span>
        </div>
        <div className="text-2xl font-bold">
          {staticAppointment.vital_signs.blood_pressure}
        </div>
      </Card>

      <Card size="small" className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Heart className="text-pink-500 mr-2" size={16} />
          <span className="font-semibold">Heart Rate</span>
        </div>
        <div className="text-2xl font-bold">
          {staticAppointment.vital_signs.heart_rate}bpm
        </div>
      </Card>

      <Card size="small" className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Eye className="text-green-500 mr-2" size={16} />
          <span className="font-semibold">Resp. Rate</span>
        </div>
        <div className="text-2xl font-bold">
          {staticAppointment.vital_signs.respiratory_rate}
        </div>
      </Card>

      <Card size="small" className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Droplets className="text-purple-500 mr-2" size={16} />
          <span className="font-semibold">SpO2</span>
        </div>
        <div className="text-2xl font-bold">
          {staticAppointment.vital_signs.oxygen_saturation}%
        </div>
      </Card>
    </div>
  );

  const renderPatientInfo = () => (
    <Card className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <Avatar size={64} icon={<User />} className="mr-4" />
          <div>
            <h2 className="text-2xl font-bold">
              {staticPatient.first_name} {staticPatient.last_name}
            </h2>
            <p className="text-gray-600">
              {staticPatient.gender} •{" "}
              {new Date().getFullYear() -
                new Date(staticPatient.date_of_birth).getFullYear()}{" "}
              years • {staticPatient.blood_type}
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            icon={<FileText size={16} />}
            onClick={() => {
              const element = document.getElementById(
                "medical-history-section"
              );
              if (element) {
                element.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            View Full History
          </Button>
          <Button type="primary" danger icon={<AlertCircle size={16} />}>
            Allergies
          </Button>
        </div>
      </div>

      <Divider />

      <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small">
        <Descriptions.Item label="Contact">
          {staticPatient.phone}
        </Descriptions.Item>
        <Descriptions.Item label="Email">
          {staticPatient.email}
        </Descriptions.Item>
        <Descriptions.Item label="Emergency Contact">
          {staticPatient.emergency_contact}
        </Descriptions.Item>
        <Descriptions.Item label="Address">
          {staticPatient.address}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color="green">{staticPatient.status}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Allergies">
          {staticPatient.allergies.map((allergy) => (
            <Tag color="red" key={allergy}>
              {allergy}
            </Tag>
          ))}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );

  const renderActionButtons = () => (
    <div className="flex flex-wrap gap-3 mb-6">
      <Button
        type="primary"
        icon={<Save size={16} />}
        loading={isSaving}
        onClick={handleSaveMedicalData}
      >
        Save Examination
      </Button>

      <Button icon={<Beaker size={16} />} onClick={handleAssignToLab}>
        Assign Lab Test
      </Button>

      <Button icon={<User size={16} />} onClick={handleAssignToNurse}>
        Assign Nurse Task
      </Button>

      <Button icon={<Tablet size={16} />} onClick={handleAddPrescription}>
        Add Prescription
      </Button>

      <Button
        type="default"
        icon={<Send size={16} />}
        onClick={handleSendToPharmacy}
      >
        Send to Pharmacy
      </Button>

      <Button
        type="primary"
        ghost
        icon={<CheckCircle size={16} />}
        onClick={handleCompleteAppointment}
      >
        Complete Appointment
      </Button>
    </div>
  );

  const renderMedicalHistory = () => (
    <div id="medical-history-section" className="mt-8">
      <Card
        title={
          <div className="flex items-center">
            <History className="mr-2" size={18} />
            <span>Medical History</span>
          </div>
        }
        className="mb-6"
      >
        <Tabs defaultActiveKey="visits" type="card">
          <TabPane tab="Previous Visits" key="visits">
            <div className="space-y-4">
              {staticMedicalHistory.map((visit) => (
                <Card
                  key={visit.id}
                  size="small"
                  className="cursor-pointer"
                  onClick={() => toggleHistoryExpansion(visit.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">
                        {new Date(visit.date).toLocaleDateString()} -{" "}
                        {visit.doctor}
                      </h4>
                      <p className="text-gray-600 text-sm">{visit.diagnosis}</p>
                    </div>
                    <div className="flex items-center">
                      <Tag color="blue">
                        {visit.prescriptions.length} prescriptions
                      </Tag>
                      <Tag color="green">
                        {visit.lab_results.length} lab tests
                      </Tag>
                      {expandedHistory[visit.id] ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </div>
                  </div>

                  {expandedHistory[visit.id] && (
                    <div className="mt-4 pl-4 border-l-2 border-blue-200">
                      <div className="mb-3">
                        <h5 className="font-medium mb-1">Symptoms:</h5>
                        <p className="text-gray-700">{visit.symptoms}</p>
                      </div>

                      <div className="mb-3">
                        <h5 className="font-medium mb-1">Treatment:</h5>
                        <p className="text-gray-700">{visit.treatment}</p>
                      </div>

                      {visit.notes && (
                        <div className="mb-3">
                          <h5 className="font-medium mb-1">Notes:</h5>
                          <p className="text-gray-700">{visit.notes}</p>
                        </div>
                      )}

                      {visit.prescriptions.length > 0 && (
                        <div className="mb-3">
                          <h5 className="font-medium mb-1">Prescriptions:</h5>
                          <ul className="list-disc pl-5">
                            {visit.prescriptions.map((rx, idx) => (
                              <li key={idx} className="text-gray-700">
                                {rx.medication} {rx.dosage} - {rx.frequency} for{" "}
                                {rx.duration}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {visit.lab_results.length > 0 && (
                        <div className="mb-3">
                          <h5 className="font-medium mb-1">Lab Results:</h5>
                          <ul className="list-disc pl-5">
                            {visit.lab_results.map((lab, idx) => (
                              <li key={idx} className="text-gray-700">
                                <span className="font-medium">
                                  {lab.test_name}:
                                </span>{" "}
                                {lab.result}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </TabPane>

          <TabPane tab="Chronic Conditions" key="conditions">
            <Table
              dataSource={staticChronicConditions}
              pagination={false}
              rowKey="condition"
              columns={[
                {
                  title: "Condition",
                  dataIndex: "condition",
                  key: "condition",
                },
                {
                  title: "Diagnosed",
                  dataIndex: "diagnosed_date",
                  key: "diagnosed_date",
                  render: (date) => new Date(date).toLocaleDateString(),
                },
                {
                  title: "Status",
                  dataIndex: "status",
                  key: "status",
                },
                {
                  title: "Severity",
                  dataIndex: "severity",
                  key: "severity",
                  render: (severity) => (
                    <Tag
                      color={
                        severity === "Mild"
                          ? "green"
                          : severity === "Moderate"
                          ? "orange"
                          : "red"
                      }
                    >
                      {severity}
                    </Tag>
                  ),
                },
              ]}
            />
          </TabPane>

          <TabPane tab="Surgical History" key="surgical">
            <Table
              dataSource={staticSurgicalHistory}
              pagination={false}
              rowKey="procedure"
              columns={[
                {
                  title: "Procedure",
                  dataIndex: "procedure",
                  key: "procedure",
                },
                {
                  title: "Date",
                  dataIndex: "date",
                  key: "date",
                  render: (date) => new Date(date).toLocaleDateString(),
                },
                {
                  title: "Surgeon",
                  dataIndex: "surgeon",
                  key: "surgeon",
                },
                {
                  title: "Facility",
                  dataIndex: "facility",
                  key: "facility",
                },
                {
                  title: "Outcome",
                  dataIndex: "outcome",
                  key: "outcome",
                },
              ]}
            />
          </TabPane>

          <TabPane tab="Family History" key="family">
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Father">
                Hypertension (diagnosed at 52), Heart disease (died at 68)
              </Descriptions.Item>
              <Descriptions.Item label="Mother">
                Type 2 Diabetes (diagnosed at 48), Osteoarthritis
              </Descriptions.Item>
              <Descriptions.Item label="Paternal Grandfather">
                Prostate cancer (died at 72)
              </Descriptions.Item>
              <Descriptions.Item label="Maternal Grandmother">
                Alzheimer's disease (diagnosed at 76)
              </Descriptions.Item>
              <Descriptions.Item label="Siblings">
                One brother (35) - healthy, one sister (31) - asthma
              </Descriptions.Item>
            </Descriptions>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={() => navigate(-1)}
            className="flex items-center"
            icon={<ArrowLeft size={16} />}
          >
            Back to Appointments
          </Button>

          <div className="flex items-center">
            <span className="mr-2 text-gray-600">Dr. Smith</span>
            <Avatar size="small" icon={<User />} />
          </div>
        </div>

        {renderPatientInfo()}

        <Card title="Current Appointment" className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold">
                {new Date(staticAppointment.date).toLocaleDateString()} at{" "}
                {new Date(staticAppointment.date).toLocaleTimeString()}
              </h3>
              <p className="text-gray-600 capitalize">
                {staticAppointment.type} Visit
              </p>
            </div>
            <Tag color="blue" className="mt-2 md:mt-0">
              In Progress
            </Tag>
          </div>

          {renderVitalSigns()}
        </Card>

        {renderActionButtons()}

        <Tabs defaultActiveKey="examination" type="card">
          <TabPane tab="Examination" key="examination">
            <Card title="Symptoms & Diagnosis">
              <div className="mb-6">
                <h4 className="font-medium mb-2">Symptoms</h4>
                <TextArea
                  rows={4}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe patient symptoms..."
                />
              </div>

              <div className="mb-6">
                <h4 className="font-medium mb-2">Diagnosis</h4>
                <TextArea
                  rows={3}
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Enter diagnosis..."
                />
              </div>

              <div>
                <h4 className="font-medium mb-2">Notes</h4>
                <TextArea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes..."
                />
              </div>
            </Card>
          </TabPane>

          <TabPane tab="Lab Tests" key="lab">
            <Card
              title="Laboratory Tests"
              extra={
                <Button icon={<Plus size={14} />} onClick={handleAssignToLab}>
                  Add Test
                </Button>
              }
            >
              <Table
                dataSource={labTests}
                pagination={false}
                rowKey="id"
                columns={[
                  {
                    title: "Test Name",
                    dataIndex: "test_name",
                    key: "test_name",
                  },
                  {
                    title: "Status",
                    dataIndex: "status",
                    key: "status",
                    render: (status) => (
                      <Tag
                        icon={getStatusIcon(status)}
                        color={getStatusColor(status)}
                      >
                        {status.replace("_", " ")}
                      </Tag>
                    ),
                  },
                  {
                    title: "Assigned To",
                    dataIndex: "assigned_to",
                    key: "assigned_to",
                  },
                  {
                    title: "Notes",
                    dataIndex: "notes",
                    key: "notes",
                    ellipsis: true,
                  },
                  {
                    title: "Actions",
                    key: "actions",
                    render: (_, record) => (
                      <Button
                        type="link"
                        size="small"
                        icon={<Edit size={14} />}
                      >
                        Edit
                      </Button>
                    ),
                  },
                ]}
              />
            </Card>
          </TabPane>

          <TabPane tab="Nurse Tasks" key="nurse">
            <Card
              title="Nurse Tasks"
              extra={
                <Button icon={<Plus size={14} />} onClick={handleAssignToNurse}>
                  Add Task
                </Button>
              }
            >
              <Table
                dataSource={nurseTasks}
                pagination={false}
                rowKey="id"
                columns={[
                  {
                    title: "Task",
                    dataIndex: "task",
                    key: "task",
                  },
                  {
                    title: "Status",
                    dataIndex: "status",
                    key: "status",
                    render: (status) => (
                      <Tag
                        icon={getStatusIcon(status)}
                        color={getStatusColor(status)}
                      >
                        {status.replace("_", " ")}
                      </Tag>
                    ),
                  },
                  {
                    title: "Assigned To",
                    dataIndex: "assigned_to",
                    key: "assigned_to",
                  },
                  {
                    title: "Notes",
                    dataIndex: "notes",
                    key: "notes",
                    ellipsis: true,
                  },
                  {
                    title: "Actions",
                    key: "actions",
                    render: (_, record) => (
                      <Button
                        type="link"
                        size="small"
                        icon={<Edit size={14} />}
                      >
                        Edit
                      </Button>
                    ),
                  },
                ]}
              />
            </Card>
          </TabPane>

          <TabPane tab="Prescriptions" key="prescriptions">
            <Card
              title="Prescriptions"
              extra={
                <div className="flex space-x-2">
                  <Button
                    icon={<Plus size={14} />}
                    onClick={handleAddPrescription}
                  >
                    Add Prescription
                  </Button>
                  <Button
                    type="primary"
                    icon={<Send size={14} />}
                    onClick={handleSendToPharmacy}
                  >
                    Send to Pharmacy
                  </Button>
                </div>
              }
            >
              <Table
                dataSource={prescriptions}
                pagination={false}
                rowKey="id"
                columns={[
                  {
                    title: "Medication",
                    dataIndex: "medication",
                    key: "medication",
                  },
                  {
                    title: "Dosage",
                    dataIndex: "dosage",
                    key: "dosage",
                  },
                  {
                    title: "Frequency",
                    dataIndex: "frequency",
                    key: "frequency",
                  },
                  {
                    title: "Duration",
                    dataIndex: "duration",
                    key: "duration",
                  },
                  {
                    title: "Status",
                    dataIndex: "status",
                    key: "status",
                    render: (status) => (
                      <Tag color={status === "active" ? "green" : "default"}>
                        {status}
                      </Tag>
                    ),
                  },
                  {
                    title: "Actions",
                    key: "actions",
                    render: (_, record) => (
                      <Button
                        type="link"
                        size="small"
                        icon={<Edit size={14} />}
                      >
                        Edit
                      </Button>
                    ),
                  },
                ]}
              />
            </Card>
          </TabPane>
        </Tabs>

        {renderMedicalHistory()}

        {/* Modals for adding items */}
        <Modal
          title={`Add ${
            activeModal.type === "lab"
              ? "Lab Test"
              : activeModal.type === "nurse"
              ? "Nurse Task"
              : "Prescription"
          }`}
          open={!!activeModal.type}
          onCancel={() => setActiveModal({ type: null, data: null })}
          footer={null}
          width={600}
        >
          <Form form={form} layout="vertical" onFinish={handleModalSubmit}>
            {activeModal.type === "lab" && (
              <>
                <Form.Item
                  name="test_name"
                  label="Test Name"
                  rules={[
                    { required: true, message: "Please enter test name" },
                  ]}
                >
                  <Input placeholder="e.g., Complete Blood Count" />
                </Form.Item>

                <Form.Item
                  name="assigned_to"
                  label="Assign To"
                  rules={[
                    {
                      required: true,
                      message: "Please assign to a technician",
                    },
                  ]}
                >
                  <Select placeholder="Select lab technician">
                    {staffMembers
                      .filter((staff) => staff.role === "lab_technician")
                      .map((staff) => (
                        <Option key={staff.id} value={staff.name}>
                          {staff.name}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>

                <Form.Item name="notes" label="Notes">
                  <TextArea
                    rows={3}
                    placeholder="Additional instructions or notes..."
                  />
                </Form.Item>
              </>
            )}

            {activeModal.type === "nurse" && (
              <>
                <Form.Item
                  name="task"
                  label="Task"
                  rules={[
                    {
                      required: true,
                      message: "Please enter task description",
                    },
                  ]}
                >
                  <Input placeholder="e.g., Administer medication" />
                </Form.Item>

                <Form.Item
                  name="assigned_to"
                  label="Assign To"
                  rules={[
                    { required: true, message: "Please assign to a nurse" },
                  ]}
                >
                  <Select placeholder="Select nurse">
                    {staffMembers
                      .filter((staff) => staff.role === "nurse")
                      .map((staff) => (
                        <Option key={staff.id} value={staff.name}>
                          {staff.name}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>

                <Form.Item name="notes" label="Notes">
                  <TextArea
                    rows={3}
                    placeholder="Additional instructions or notes..."
                  />
                </Form.Item>
              </>
            )}

            {activeModal.type === "prescription" && (
              <>
                <Form.Item
                  name="medication"
                  label="Medication"
                  rules={[
                    { required: true, message: "Please enter medication name" },
                  ]}
                >
                  <Input placeholder="e.g., Amoxicillin" />
                </Form.Item>

                <Form.Item
                  name="dosage"
                  label="Dosage"
                  rules={[{ required: true, message: "Please enter dosage" }]}
                >
                  <Input placeholder="e.g., 500mg" />
                </Form.Item>

                <Form.Item
                  name="frequency"
                  label="Frequency"
                  rules={[
                    { required: true, message: "Please enter frequency" },
                  ]}
                >
                  <Input placeholder="e.g., Three times daily" />
                </Form.Item>

                <Form.Item
                  name="duration"
                  label="Duration"
                  rules={[{ required: true, message: "Please enter duration" }]}
                >
                  <Input placeholder="e.g., 10 days" />
                </Form.Item>

                <Form.Item name="instructions" label="Instructions">
                  <TextArea rows={2} placeholder="e.g., Take with food" />
                </Form.Item>
              </>
            )}

            <div className="flex justify-end space-x-2 mt-4">
              <Button
                onClick={() => setActiveModal({ type: null, data: null })}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Add{" "}
                {activeModal.type === "lab"
                  ? "Test"
                  : activeModal.type === "nurse"
                  ? "Task"
                  : "Prescription"}
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default PatientMedicalPage;
