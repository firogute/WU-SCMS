import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  Spin,
  message,
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
  RefreshCw,
} from "lucide-react";
import { supabase } from "../../../lib/supabase"; // Adjust path as needed

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const PatientMedicalPage = () => {
  const { appointmentId, patientId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [patient, setPatient] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [labTests, setLabTests] = useState([]);
  const [nurseTasks, setNurseTasks] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [chronicConditions, setChronicConditions] = useState([]);
  const [surgicalHistory, setSurgicalHistory] = useState([]);
  const [familyHistory, setFamilyHistory] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [activeModal, setActiveModal] = useState({
    type: null,
    data: null,
  });
  const [expandedHistory, setExpandedHistory] = useState({});
  const [form] = Form.useForm();

  // Fetch all data on component mount
  useEffect(() => {
    if (patientId && appointmentId) {
      fetchPatientData();
    }
  }, [patientId, appointmentId]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);

      // Fetch patient data
      const { data: patientData, error: patientError } = await supabase
        .from("patients")
        .select("*")
        .eq("id", patientId)
        .single();

      if (patientError) throw patientError;
      setPatient(patientData);

      // Fetch appointment data
      const { data: appointmentData, error: appointmentError } = await supabase
        .from("appointments")
        .select("*")
        .eq("id", appointmentId)
        .single();

      if (appointmentError) throw appointmentError;
      setAppointment(appointmentData);
      setSymptoms(appointmentData.symptoms || "");
      setDiagnosis(appointmentData.diagnosis || "");
      setNotes(appointmentData.notes || "");

      // Fetch lab tests
      const { data: labTestsData, error: labTestsError } = await supabase
        .from("lab_tests")
        .select("*")
        .eq("appointment_id", appointmentId);

      if (labTestsError) throw labTestsError;

      // Get staff names for lab tests
      const labTestsWithStaff = await Promise.all(
        (labTestsData || []).map(async (labTest) => {
          if (labTest.assigned_to) {
            const { data: staffData } = await supabase
              .from("users")
              .select("name")
              .eq("id", labTest.assigned_to)
              .single();

            return {
              ...labTest,
              assigned_to_user: staffData || { name: "Unassigned" },
            };
          }
          return labTest;
        })
      );

      setLabTests(labTestsWithStaff || []);

      // Fetch nurse tasks
      const { data: nurseTasksData, error: nurseTasksError } = await supabase
        .from("nurse_tasks")
        .select("*")
        .eq("appointment_id", appointmentId);

      if (nurseTasksError) throw nurseTasksError;

      // Get staff names for nurse tasks
      const nurseTasksWithStaff = await Promise.all(
        (nurseTasksData || []).map(async (task) => {
          if (task.assigned_to) {
            const { data: staffData } = await supabase
              .from("users")
              .select("name")
              .eq("id", task.assigned_to)
              .single();

            return {
              ...task,
              assigned_to_user: staffData || { name: "Unassigned" },
            };
          }
          return task;
        })
      );

      setNurseTasks(nurseTasksWithStaff || []);

      // Fetch prescriptions
      const { data: prescriptionsData, error: prescriptionsError } =
        await supabase
          .from("prescriptions")
          .select("*")
          .eq("appointment_id", appointmentId);

      if (prescriptionsError) throw prescriptionsError;
      setPrescriptions(prescriptionsData || []);

      // Fetch medical history (previous appointments)
      const { data: medicalHistoryData, error: medicalHistoryError } =
        await supabase
          .from("appointments")
          .select("*")
          .eq("patient_id", patientId)
          .neq("id", appointmentId)
          .order("date", { ascending: false });

      if (medicalHistoryError) throw medicalHistoryError;

      // Fetch related data for each appointment in medical history
      const medicalHistoryWithDetails = await Promise.all(
        (medicalHistoryData || []).map(async (appointment) => {
          // Get doctor info
          const { data: doctorData } = await supabase
            .from("users")
            .select("name")
            .eq("id", appointment.doctor_id)
            .single();

          // Get medical records
          const { data: medicalRecords } = await supabase
            .from("medical_records")
            .select("*")
            .eq("appointment_id", appointment.id);

          // Get prescriptions
          const { data: prescriptions } = await supabase
            .from("prescriptions")
            .select("*")
            .eq("appointment_id", appointment.id);

          // Get lab tests
          const { data: labTests } = await supabase
            .from("lab_tests")
            .select("*")
            .eq("appointment_id", appointment.id);

          return {
            ...appointment,
            doctor: doctorData || { name: "Unknown Doctor" },
            medical_records: medicalRecords || [],
            prescriptions: prescriptions || [],
            lab_tests: labTests || [],
          };
        })
      );

      setMedicalHistory(medicalHistoryWithDetails || []);

      // Fetch surgical history
      const { data: surgicalHistoryData, error: surgicalHistoryError } =
        await supabase
          .from("surgical_history")
          .select("*")
          .eq("patient_id", patientId)
          .order("date", { ascending: false });

      if (surgicalHistoryError) throw surgicalHistoryError;
      setSurgicalHistory(surgicalHistoryData || []);

      // Fetch chronic conditions
      const { data: chronicConditionsData, error: chronicConditionsError } =
        await supabase
          .from("chronic_conditions")
          .select("*")
          .eq("patient_id", patientId)
          .order("diagnosed_date", { ascending: false });

      if (chronicConditionsError) throw chronicConditionsError;
      setChronicConditions(chronicConditionsData || []);

      // Fetch family history
      const { data: familyHistoryData, error: familyHistoryError } =
        await supabase
          .from("family_history")
          .select("*")
          .eq("patient_id", patientId)
          .order("relation", { ascending: true });

      if (familyHistoryError) throw familyHistoryError;
      setFamilyHistory(familyHistoryData || []);

      // Fetch staff members
      const { data: staffData, error: staffError } = await supabase
        .from("users")
        .select("id, name, role, department")
        .in("role", ["doctor", "nurse", "laboratory"]);

      if (staffError) throw staffError;
      setStaffMembers(staffData || []);
    } catch (error) {
      console.error("Error fetching patient data:", error);
      message.error("Failed to load patient data");
    } finally {
      setLoading(false);
    }
  };

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

  const handleSaveMedicalData = async () => {
    try {
      setSaving(true);

      // Update appointment with new data
      const { error } = await supabase
        .from("appointments")
        .update({
          symptoms,
          diagnosis,
          notes,
        })
        .eq("id", appointmentId);

      if (error) throw error;

      message.success("Medical data saved successfully!");
    } catch (error) {
      console.error("Error saving medical data:", error);
      message.error("Failed to save medical data");
    } finally {
      setSaving(false);
    }
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

  const handleModalSubmit = async (values) => {
    try {
      if (activeModal.type === "lab") {
        const { error } = await supabase.from("lab_tests").insert({
          appointment_id: appointmentId,
          patient_id: patientId,
          test_name: values.test_name,
          status: "pending",
          assigned_to: values.assigned_to,
          notes: values.notes,
          created_at: new Date().toISOString(),
        });

        if (error) throw error;
        message.success("Lab test assigned successfully");
      } else if (activeModal.type === "nurse") {
        const { error } = await supabase.from("nurse_tasks").insert({
          appointment_id: appointmentId,
          patient_id: patientId,
          task: values.task,
          status: "pending",
          assigned_to: values.assigned_to,
          notes: values.notes,
          created_at: new Date().toISOString(),
        });

        if (error) throw error;
        message.success("Nurse task assigned successfully");
      } else if (activeModal.type === "prescription") {
        // First check if a medical record exists for this appointment
        const { data: existingMedicalRecord, error: checkError } =
          await supabase
            .from("medical_records")
            .select("id")
            .eq("appointment_id", appointmentId)
            .maybeSingle(); // Use maybeSingle to handle case where no record exists

        if (checkError) throw checkError;

        let consultationId = existingMedicalRecord?.id;

        // If no medical record exists, create one
        if (!consultationId) {
          const { data: newMedicalRecord, error: createError } = await supabase
            .from("medical_records")
            .insert({
              patient_id: patientId,
              doctor_id: appointment.doctor_id,
              appointment_id: appointmentId,
              date: new Date().toISOString().split("T")[0],
              symptoms: appointment.symptoms || "",
              diagnosis: appointment.diagnosis || "",
              treatment: "Prescription added",
              notes: "Medical record created automatically for prescription",
            })
            .select("id")
            .single();

          if (createError) throw createError;
          consultationId = newMedicalRecord.id;
          message.info("Created new medical record for this appointment");
        }

        // First get medicine ID if it exists
        const { data: medicineData } = await supabase
          .from("medicines")
          .select("id")
          .ilike("name", `%${values.medication}%`)
          .single();

        const { error: prescriptionError } = await supabase
          .from("prescriptions")
          .insert({
            appointment_id: consultationId,
            medicine_id: medicineData?.id || null,
            medicine_name: values.medication,
            dosage: values.dosage,
            frequency: values.frequency,
            duration: values.duration,
            instructions: values.instructions,
          });

        if (prescriptionError) throw prescriptionError;
        message.success("Prescription added successfully");
      }

      // Refresh data
      fetchPatientData();
      setActiveModal({ type: null, data: null });
      form.resetFields();
    } catch (error) {
      console.error("Error adding item:", error);
      message.error("Failed to add item");
    }
  };

  const handleSendToPharmacy = async () => {
    try {
      // Update prescription status to sent
      const { error } = await supabase
        .from("prescriptions")
        .update({ status: "sent" })
        .eq("appointment_id", appointmentId);

      if (error) throw error;

      message.success("Prescriptions sent to pharmacy successfully");
      fetchPatientData();
    } catch (error) {
      console.error("Error sending to pharmacy:", error);
      message.error("Failed to send prescriptions to pharmacy");
    }
  };

  const handleCompleteAppointment = async () => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "completed" })
        .eq("id", appointmentId);

      if (error) throw error;

      message.success("Appointment marked as completed");
      navigate(-1); // Go back to appointments list
    } catch (error) {
      console.error("Error completing appointment:", error);
      message.error("Failed to complete appointment");
    }
  };

  const toggleHistoryExpansion = (id) => {
    setExpandedHistory((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderVitalSigns = () => {
    if (!appointment.vital_signs) return null;

    const vitalSigns =
      typeof appointment.vital_signs === "string"
        ? JSON.parse(appointment.vital_signs)
        : appointment.vital_signs;

    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card size="small" className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Thermometer className="text-blue-500 mr-2" size={16} />
            <span className="font-semibold">Temperature</span>
          </div>
          <div className="text-2xl font-bold">
            {vitalSigns.temperature || "N/A"}°C
          </div>
        </Card>

        <Card size="small" className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Activity className="text-red-500 mr-2" size={16} />
            <span className="font-semibold">BP</span>
          </div>
          <div className="text-2xl font-bold">
            {vitalSigns.blood_pressure || "N/A"}
          </div>
        </Card>

        <Card size="small" className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Heart className="text-pink-500 mr-2" size={16} />
            <span className="font-semibold">Heart Rate</span>
          </div>
          <div className="text-2xl font-bold">
            {vitalSigns.heart_rate || "N/A"}bpm
          </div>
        </Card>

        <Card size="small" className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Eye className="text-green-500 mr-2" size={16} />
            <span className="font-semibold">Resp. Rate</span>
          </div>
          <div className="text-2xl font-bold">
            {vitalSigns.respiratory_rate || "N/A"}
          </div>
        </Card>

        <Card size="small" className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Droplets className="text-purple-500 mr-2" size={16} />
            <span className="font-semibold">SpO2</span>
          </div>
          <div className="text-2xl font-bold">
            {vitalSigns.oxygen_saturation || "N/A"}%
          </div>
        </Card>
      </div>
    );
  };

  const renderPatientInfo = () => (
    <Card className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <Avatar size={64} icon={<User />} className="mr-4" />
          <div>
            <h2 className="text-2xl font-bold">
              {patient.first_name} {patient.last_name}
            </h2>
            <p className="text-gray-600">
              {patient.gender} •
              {new Date().getFullYear() -
                new Date(patient.date_of_birth).getFullYear()}{" "}
              years •{patient.blood_type}
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
        <Descriptions.Item label="Contact">{patient.phone}</Descriptions.Item>
        <Descriptions.Item label="Email">{patient.email}</Descriptions.Item>
        <Descriptions.Item label="Emergency Contact">
          {patient.emergency_contact}
        </Descriptions.Item>
        <Descriptions.Item label="Address">{patient.address}</Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color="green">Active</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Allergies">
          {patient.allergies?.map((allergy) => (
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
        loading={saving}
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

      <Button icon={<RefreshCw size={16} />} onClick={fetchPatientData}>
        Refresh
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
              {medicalHistory.map((visit) => (
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
                        {visit.doctor?.name}
                      </h4>
                      <p className="text-gray-600 text-sm">{visit.diagnosis}</p>
                    </div>
                    <div className="flex items-center">
                      <Tag color="blue">
                        {visit.prescriptions?.length || 0} prescriptions
                      </Tag>
                      <Tag color="green">
                        {visit.lab_tests?.length || 0} lab tests
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

                      {visit.medical_records?.[0]?.treatment && (
                        <div className="mb-3">
                          <h5 className="font-medium mb-1">Treatment:</h5>
                          <p className="text-gray-700">
                            {visit.medical_records[0].treatment}
                          </p>
                        </div>
                      )}

                      {visit.notes && (
                        <div className="mb-3">
                          <h5 className="font-medium mb-1">Notes:</h5>
                          <p className="text-gray-700">{visit.notes}</p>
                        </div>
                      )}

                      {visit.prescriptions &&
                        visit.prescriptions.length > 0 && (
                          <div className="mb-3">
                            <h5 className="font-medium mb-1">Prescriptions:</h5>
                            <ul className="list-disc pl-5">
                              {visit.prescriptions.map((rx, idx) => (
                                <li key={idx} className="text-gray-700">
                                  {rx.medicine_name} {rx.dosage} -{" "}
                                  {rx.frequency} for {rx.duration}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                      {visit.lab_tests && visit.lab_tests.length > 0 && (
                        <div className="mb-3">
                          <h5 className="font-medium mb-1">Lab Tests:</h5>
                          <ul className="list-disc pl-5">
                            {visit.lab_tests.map((lab, idx) => (
                              <li key={idx} className="text-gray-700">
                                <span className="font-medium">
                                  {lab.test_name}:
                                </span>{" "}
                                {lab.status}
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
              dataSource={chronicConditions}
              pagination={false}
              rowKey="id"
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
                  render: (date) =>
                    date ? new Date(date).toLocaleDateString() : "Unknown",
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
              dataSource={surgicalHistory}
              pagination={false}
              rowKey="id"
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
              {familyHistory.map((item, index) => (
                <Descriptions.Item key={index} label={item.relation}>
                  {item.condition}
                  {item.age_of_onset && ` (age ${item.age_of_onset})`}
                  {item.notes && ` - ${item.notes}`}
                </Descriptions.Item>
              ))}
            </Descriptions>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" tip="Loading patient data..." />
      </div>
    );
  }

  if (!patient || !appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert
          message="Patient or appointment not found"
          description="The requested patient or appointment could not be found."
          type="error"
          showIcon
        />
      </div>
    );
  }

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
                {new Date(appointment.date).toLocaleDateString()} at{" "}
                {appointment.time}
              </h3>
              <p className="text-gray-600 capitalize">
                {appointment.type} Visit
              </p>
            </div>
            <Tag color="blue" className="mt-2 md:mt-0">
              {appointment.status}
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
                    dataIndex: "assigned_to_user",
                    key: "assigned_to",
                    render: (user) => user?.name || "Unassigned",
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
                    dataIndex: "assigned_to_user",
                    key: "assigned_to",
                    render: (user) => user?.name || "Unassigned",
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
                    dataIndex: "medicine_name",
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
                      <Tag color={status === "sent" ? "green" : "blue"}>
                        {status || "active"}
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
                      .filter((staff) => staff.role === "laboratory")
                      .map((staff) => (
                        <Option key={staff.id} value={staff.id}>
                          {staff.name} ({staff.department || "Laboratory"})
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
                        <Option key={staff.id} value={staff.id}>
                          {staff.name} ({staff.department})
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
