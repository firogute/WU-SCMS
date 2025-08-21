// src/pages/doctor/LabTestDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  message,
  Spin,
  Typography,
  Divider,
  Alert,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  SaveOutlined,
  UserOutlined,
  CalendarOutlined,
  ExperimentOutlined,
  FileTextOutlined,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import moment from "moment";

const { Title, Text } = Typography;
const { TextArea } = Input;

const LabTestDetailPage = () => {
  const { testId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [testData, setTestData] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (user && user.role === "doctor") {
      fetchTestDetails();
    } else {
      message.error("Unauthorized access");
      navigate("/login");
    }
  }, [user, testId]);

  const fetchTestDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("lab_tests")
        .select(
          `
          *,
          patient_id (
            id,
            first_name,
            last_name,
            date_of_birth,
            gender
          ),
          appointment_id (
            id,
            date,
            time,
            type
          ),
          assigned_to (
            id,
            name,
            role
          )
        `
        )
        .eq("id", testId)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Test not found");

      // Verify if this test belongs to the doctor's appointment
      const { data: appointment, error: appError } = await supabase
        .from("appointments")
        .select("doctor_id")
        .eq("id", data.appointment_id.id)
        .single();

      if (appError || appointment.doctor_id !== user.id) {
        throw new Error("Unauthorized to view this test");
      }

      setTestData(data);
    } catch (error) {
      console.error("Error fetching test details:", error);
      message.error(error.message || "Failed to load test details");
      navigate("/doctor/lab-results");
    } finally {
      setLoading(false);
    }
  };

  const handleEditResults = () => {
    form.setFieldsValue({
      results: testData.results,
      notes: testData.notes,
    });
    setEditModalVisible(true);
  };

  const handleSaveChanges = async (values) => {
    try {
      const { error } = await supabase
        .from("lab_tests")
        .update({
          results: values.results,
          notes: values.notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", testId);

      if (error) throw error;
      message.success("Test details updated successfully");
      setEditModalVisible(false);
      fetchTestDetails();
    } catch (error) {
      console.error("Error updating test:", error);
      message.error("Failed to update test details");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "orange";
      case "completed":
        return "green";
      default:
        return "gray";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" tip="Loading test details..." />
      </div>
    );
  }

  if (!testData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert message="Test not found" type="error" showIcon />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/doctor/lab-results")}
          className="mb-4"
        >
          Back to Lab Results
        </Button>

        <Card>
          <Title level={3}>Lab Test Details</Title>
          <Divider />

          <Descriptions bordered column={1}>
            <Descriptions.Item label="Test Name">
              <Space>
                <ExperimentOutlined />
                {testData.test_name}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Patient">
              <Space>
                <UserOutlined />
                {`${testData.patient_id.first_name} ${testData.patient_id.last_name}`}{" "}
                ({testData.patient_id.gender},{" "}
                {moment().diff(testData.patient_id.date_of_birth, "years")}{" "}
                years)
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Appointment">
              <Space>
                <CalendarOutlined />
                {moment(testData.appointment_id.date).format(
                  "MMM DD, YYYY"
                )} at {testData.appointment_id.time} (
                {testData.appointment_id.type})
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={getStatusColor(testData.status)}>
                {testData.status.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Assigned To">
              {testData.assigned_to?.name || "Unassigned"} (
              {testData.assigned_to?.role})
            </Descriptions.Item>
            <Descriptions.Item label="Created At">
              {moment(testData.created_at).format("MMM DD, YYYY HH:mm")}
            </Descriptions.Item>
            <Descriptions.Item label="Updated At">
              {testData.updated_at
                ? moment(testData.updated_at).format("MMM DD, YYYY HH:mm")
                : "N/A"}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          <Title level={4}>Results</Title>
          {testData.results ? (
            <Text>{testData.results}</Text>
          ) : (
            <Text type="secondary">No results available yet.</Text>
          )}

          <Divider />

          <Title level={4}>Notes</Title>
          {testData.notes ? (
            <Text>{testData.notes}</Text>
          ) : (
            <Text type="secondary">No notes.</Text>
          )}

          <Divider />

          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={handleEditResults}
          >
            Edit Results & Notes
          </Button>
        </Card>

        <Modal
          title="Edit Lab Test Details"
          visible={editModalVisible}
          onCancel={() => setEditModalVisible(false)}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleSaveChanges}>
            <Form.Item name="results" label="Results">
              <TextArea rows={6} placeholder="Enter detailed lab results" />
            </Form.Item>
            <Form.Item name="notes" label="Notes">
              <TextArea rows={4} placeholder="Additional notes" />
            </Form.Item>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              Save Changes
            </Button>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default LabTestDetailPage;
