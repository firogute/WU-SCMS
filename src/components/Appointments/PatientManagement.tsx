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
  Alert,
  Avatar,
  Spin,
  message,
} from "antd";
import {
  ArrowLeft,
  User,
  FileText,
  Plus,
  Save,
  Send,
  CheckCircle,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import PatientInfo from "./patient_management/PatientInfo";
import ActionButtons from "./patient_management/ActionButtons";
import MedicalHistory from "./patient_management/MedicalHistory";
import ExaminationTab from "./patient_management/ExaminationTab";
import LabTestsTab from "./patient_management/LabTestsTab";
import NurseTasksTab from "./patient_management/NurseTasksTab";
import PrescriptionsTab from "./patient_management/PrescriptionsTab";
import AddItemModal from "./patient_management/AddItemModal";

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

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
  const [form] = Form.useForm();

  useEffect(() => {
    if (patientId && appointmentId) {
      fetchPatientData();
    }
  }, [patientId, appointmentId]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);

      const [
        patientResponse,
        appointmentResponse,
        medicalRecordResponse,
        nurseTasksResponse,
        prescriptionsResponse,
        medicalHistoryResponse,
        chronicConditionsResponse,
        surgicalHistoryResponse,
        familyHistoryResponse,
        staffResponse,
      ] = await Promise.all([
        supabase.from("patients").select("*").eq("id", patientId).single(),
        supabase
          .from("appointments")
          .select("*")
          .eq("id", appointmentId)
          .single(),
        supabase
          .from("medical_records")
          .select("*")
          .eq("appointment_id", appointmentId)
          .single(),
        supabase
          .from("nurse_tasks")
          .select("*")
          .eq("appointment_id", appointmentId),
        supabase
          .from("prescriptions")
          .select("*")
          .eq("appointment_id", appointmentId),
        supabase
          .from("appointments")
          .select("*")
          .eq("patient_id", patientId)
          .neq("id", appointmentId)
          .order("date", { ascending: false }),
        supabase
          .from("chronic_conditions")
          .select("*")
          .eq("patient_id", patientId)
          .order("diagnosed_date", { ascending: false }),
        supabase
          .from("surgical_history")
          .select("*")
          .eq("patient_id", patientId)
          .order("date", { ascending: false }),
        supabase
          .from("family_history")
          .select("*")
          .eq("patient_id", patientId)
          .order("relation", { ascending: true }),
        supabase
          .from("users")
          .select("id, name, role, department")
          .in("role", ["doctor", "nurse", "laboratory"]),
      ]);

      // Handle responses
      if (patientResponse.error) throw patientResponse.error;
      if (appointmentResponse.error) throw appointmentResponse.error;

      setPatient(patientResponse.data);
      setAppointment(appointmentResponse.data);
      setChronicConditions(chronicConditionsResponse.data);
      setSurgicalHistory(surgicalHistoryResponse.data);
      setFamilyHistory(familyHistoryResponse.data);
      setStaffMembers(staffResponse.data);

      setSymptoms(medicalRecordResponse.data?.symptoms || "");
      setDiagnosis(medicalRecordResponse.data?.diagnosis || "");
      setNotes(medicalRecordResponse.data?.notes || "");
    } catch (error) {
      console.error("Error fetching patient data:", error);
      message.error("Failed to load patient data");
    } finally {
      setLoading(false);
    }
  };
  const handleSendToPharmacy = async () => {
    try {
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
      navigate(-1);
    } catch (error) {
      console.error("Error completing appointment:", error);
      message.error("Failed to complete appointment");
    }
  };

  const handleModalSubmit = async (values) => {
    try {
      if (activeModal.type === "lab") {
        const { data, error } = await supabase
          .from("lab_tests")
          .insert({
            appointment_id: appointmentId,
            patient_id: patientId,
            test_name: values.test_name,
            status: "pending",
            assigned_to: values.assigned_to,
            notes: values.notes,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        message.success("Lab test assigned successfully");

        setLabTests((prev) => [...prev, data]);
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
        // Check if medical record exists
        const { data: existingMedicalRecord, error: checkError } =
          await supabase
            .from("medical_records")
            .select("id")
            .eq("appointment_id", appointmentId)
            .maybeSingle();

        if (checkError) throw checkError;

        let consultationId = existingMedicalRecord?.id;
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

        // Get medicine ID
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

      // fetchPatientData();
      setActiveModal({ type: null, data: null });
      form.resetFields();
    } catch (error) {
      console.error("Error adding item:", error);
      message.error("Failed to add item");
    }
  };

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
          <Button onClick={() => navigate(-1)} icon={<ArrowLeft size={16} />}>
            Back to Appointments
          </Button>
        </div>

        <PatientInfo patient={patient} />

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
        </Card>

        <ActionButtons
          onAssignLab={() => setActiveModal({ type: "lab", data: null })}
          onAssignNurse={() => setActiveModal({ type: "nurse", data: null })}
          onAddPrescription={() =>
            setActiveModal({ type: "prescription", data: null })
          }
          onSendToPharmacy={handleSendToPharmacy}
          onCompleteAppointment={handleCompleteAppointment}
          onRefresh={fetchPatientData}
        />

        <Tabs defaultActiveKey="examination" type="card">
          <TabPane tab="Examination" key="examination">
            <ExaminationTab
              appointmentId={appointmentId}
              patientId={patientId}
              doctorId={appointment.doctor_id}
              initialSymptoms={symptoms}
              initialDiagnosis={diagnosis}
              initialNotes={notes}
            />
          </TabPane>

          <TabPane tab="Lab Tests" key="lab">
            <LabTestsTab
              appointmentId={appointmentId}
              labTests={labTests}
              setLabTests={setLabTests}
              onAddTest={() => setActiveModal({ type: "lab", data: null })}
            />
          </TabPane>

          <TabPane tab="Nurse Tasks" key="nurse">
            <NurseTasksTab
              nurseTasks={nurseTasks}
              onAddTask={() => setActiveModal({ type: "nurse", data: null })}
            />
          </TabPane>

          <TabPane tab="Prescriptions" key="prescriptions">
            <PrescriptionsTab
              prescriptions={prescriptions}
              onAddPrescription={() =>
                setActiveModal({ type: "prescription", data: null })
              }
              onSendToPharmacy={handleSendToPharmacy}
            />
          </TabPane>
        </Tabs>

        <MedicalHistory
          patientId={patientId}
          chronicConditions={chronicConditions}
          surgicalHistory={surgicalHistory}
          familyHistory={familyHistory}
          onRefresh={fetchPatientData}
        />

        <AddItemModal
          activeModal={activeModal}
          staffMembers={staffMembers}
          form={form}
          onCancel={() => setActiveModal({ type: null, data: null })}
          onSubmit={handleModalSubmit}
        />
      </div>
    </div>
  );
};

export default PatientMedicalPage;
