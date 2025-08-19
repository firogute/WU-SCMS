import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { debounce } from "lodash";
import {
  Collapse,
  Button,
  Input,
  Select,
  Table,
  Tag,
  Divider,
  Form,
  Modal,
  message,
} from "antd";
import { ArrowLeft, User, Heart, Calendar, Beaker, Tablet } from "lucide-react";
import { supabase } from "../../lib/supabase";

const { TextArea } = Input;

type Patient = {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  blood_type?: string;
  email?: string;
  phone?: string;
  address?: string;
  emergency_contact?: string;
  status?: string;
};

type Appointment = {
  id: string;
  date: string;
  patient_id: string;
  doctor_id: string;
  symptoms: string;
  diagnosis?: string;
  notes?: string;
  lab_tests?: any[];
  nurse_tasks?: any[];
  prescriptions?: any[];
};

const PatientMedicalPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [localAppointments, setLocalAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<{
    type: "lab" | "nurse" | "prescription" | null;
    appointment?: Appointment;
  }>({ type: null });

  const [form] = Form.useForm();

  const getStatusColor = (status: string) => {
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

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data: apptsData, error: apptError } = await supabase
        .from("appointments")
        .select("*")
        .eq("id", appointmentId);

      if (apptError) throw apptError;

      if (apptsData?.length) {
        const appt = apptsData[0];
        setAppointments([appt]);
        setLocalAppointments([appt]);

        const { data: patientData, error: patientError } = await supabase
          .from("patients")
          .select("*")
          .eq("id", appt.patient_id)
          .single();

        if (patientError) throw patientError;

        setPatient(patientData);
      } else {
        message.error("Appointment not found");
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [appointmentId]);

  // Debounced Medical History Update
  const updateMedicalHistory = useCallback(
    debounce(
      async (appointmentId: string, symptoms: string, diagnosis: string) => {
        try {
          // Check if history exists
          const { data: existing, error: checkError } = await supabase
            .from("medical_history")
            .select("*")
            .eq("appointment_id", appointmentId)
            .single();

          if (checkError && checkError.code !== "PGRST116") throw checkError; // ignore no rows

          if (existing) {
            // Update
            await supabase
              .from("medical_history")
              .update({ symptoms, diagnosis })
              .eq("id", existing.id);
          } else {
            // Insert new
            await supabase
              .from("medical_history")
              .insert([{ appointment_id: appointmentId, symptoms, diagnosis }]);
          }
        } catch (err) {
          console.error(err);
          message.error("Failed to save medical history");
        }
      },
      1000
    ),
    []
  );

  const handleFieldChange = (
    apptId: string,
    field: "symptoms" | "diagnosis",
    value: string
  ) => {
    // Optimistic UI
    setLocalAppointments((prev) =>
      prev.map((appt) =>
        appt.id === apptId ? { ...appt, [field]: value } : appt
      )
    );

    // Update DB for medical_history table
    const appt = localAppointments.find((a) => a.id === apptId);
    if (!appt) return;
    const symptoms = field === "symptoms" ? value : appt.symptoms;
    const diagnosis = field === "diagnosis" ? value : appt.diagnosis || "";

    updateMedicalHistory(apptId, symptoms, diagnosis);
  };

  const handleOpenModal = (
    type: "lab" | "nurse" | "prescription",
    appointment: Appointment
  ) => {
    setActiveModal({ type, appointment });
    form.resetFields();
  };

  const handleSaveModal = async () => {
    const values = await form.validateFields();
    if (!activeModal.appointment) return;

    const apptId = activeModal.appointment.id;

    try {
      if (activeModal.type === "lab") {
        await supabase
          .from("lab_tests")
          .insert([{ ...values, appointment_id: apptId }]);
      }
      if (activeModal.type === "nurse") {
        await supabase
          .from("nurse_tasks")
          .insert([{ ...values, appointment_id: apptId }]);
      }
      if (activeModal.type === "prescription") {
        await supabase
          .from("prescriptions")
          .insert([{ ...values, appointment_id: apptId }]);
      }
      message.success("Saved successfully!");
      setActiveModal({ type: null });
      fetchAppointments();
    } catch (err) {
      console.error(err);
      message.error("Failed to save");
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!patient) return <div className="p-6 text-center">Patient not found</div>;

  const collapseItems = localAppointments.map((appt) => ({
    key: appt.id,
    label: `Appointment on ${new Date(appt.date).toLocaleString()}`,
    children: (
      <div>
        <div className="mb-4">
          <h3 className="font-semibold text-gray-700 mb-2">
            Symptoms & Diagnosis
          </h3>
          <TextArea
            value={appt.symptoms}
            placeholder="Symptoms"
            onChange={(e) =>
              handleFieldChange(appt.id, "symptoms", e.target.value)
            }
            className="mb-2"
          />
          <TextArea
            value={appt.diagnosis || ""}
            placeholder="Diagnosis"
            onChange={(e) =>
              handleFieldChange(appt.id, "diagnosis", e.target.value)
            }
          />
        </div>

        <Divider orientation="left">Lab Tests</Divider>
        <Button onClick={() => handleOpenModal("lab", appt)} className="mb-2">
          <Beaker className="inline w-4 h-4 mr-1" /> Add Lab Test
        </Button>
        <Table
          dataSource={appt.lab_tests || []}
          columns={[
            { title: "Test Name", dataIndex: "test_name" },
            {
              title: "Status",
              dataIndex: "status",
              render: (status: string) => (
                <Tag color={getStatusColor(status)}>{status}</Tag>
              ),
            },
          ]}
          pagination={false}
          rowKey="id"
        />

        <Divider orientation="left">Nurse Tasks</Divider>
        <Button onClick={() => handleOpenModal("nurse", appt)} className="mb-2">
          <User className="inline w-4 h-4 mr-1" /> Add Nurse Task
        </Button>
        <Table
          dataSource={appt.nurse_tasks || []}
          columns={[
            { title: "Task", dataIndex: "task" },
            {
              title: "Status",
              dataIndex: "status",
              render: (status: string) => (
                <Tag color={getStatusColor(status)}>{status}</Tag>
              ),
            },
          ]}
          pagination={false}
          rowKey="id"
        />

        <Divider orientation="left">Prescriptions</Divider>
        <Button
          onClick={() => handleOpenModal("prescription", appt)}
          className="mb-2"
        >
          <Tablet className="inline w-4 h-4 mr-1" /> Add Prescription
        </Button>
        <Table
          dataSource={appt.prescriptions || []}
          columns={[
            { title: "Medication", dataIndex: "medication" },
            { title: "Dosage", dataIndex: "dosage" },
            { title: "Frequency", dataIndex: "frequency" },
          ]}
          pagination={false}
          rowKey="id"
        />
      </div>
    ),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <Button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5" /> <span>Back to Patients</span>
        </Button>

        <h1 className="text-3xl font-bold mb-1">
          {patient.first_name} {patient.last_name}
        </h1>
        <p className="text-gray-500 mb-6">Patient management dashboard</p>

        <Collapse accordion items={collapseItems} />

        <Modal
          title={`Add ${activeModal.type?.toUpperCase()}`}
          open={!!activeModal.type}
          onOk={handleSaveModal}
          onCancel={() => setActiveModal({ type: null })}
        >
          <Form form={form} layout="vertical">
            {activeModal.type === "lab" && (
              <>
                <Form.Item
                  name="test_name"
                  label="Test Name"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item name="status" label="Status" initialValue="pending">
                  <Select>
                    <Select.Option value="pending">Pending</Select.Option>
                    <Select.Option value="in_progress">
                      In Progress
                    </Select.Option>
                    <Select.Option value="completed">Completed</Select.Option>
                  </Select>
                </Form.Item>
              </>
            )}
            {activeModal.type === "nurse" && (
              <>
                <Form.Item
                  name="task"
                  label="Task"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item name="status" label="Status" initialValue="pending">
                  <Select>
                    <Select.Option value="pending">Pending</Select.Option>
                    <Select.Option value="in_progress">
                      In Progress
                    </Select.Option>
                    <Select.Option value="completed">Completed</Select.Option>
                  </Select>
                </Form.Item>
              </>
            )}
            {activeModal.type === "prescription" && (
              <>
                <Form.Item
                  name="medication"
                  label="Medication"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="dosage"
                  label="Dosage"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="frequency"
                  label="Frequency"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </>
            )}
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default PatientMedicalPage;
