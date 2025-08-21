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
  Space,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  CalendarOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  EditOutlined,
} from "@ant-design/icons";
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
    if (!user) {
      message.error("Please log in to access this page");
      navigate("/login");
      return;
    }

    if (user.role !== "doctor") {
      message.error("Unauthorized access");
      navigate("/");
      return;
    }

    fetchTestDetails();
  }, [user, testId, navigate]);

  const fetchTestDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("lab_tests")
        .select(
          `
          *,
          patient_id:patients (
            id,
            first_name,
            last_name,
            date_of_birth,
            gender
          ),
          appointment_id:appointments (
            id,
            date,
            time,
            type
          ),
          assigned_to:users (
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

      const { data: appointment, error: appError } = await supabase
        .from("appointments")
        .select("doctor_id")
        .eq("id", data.appointment_id.id)
        .single();

      if (appError) throw appError;

      if (appointment.doctor_id !== user.id) {
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

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "orange";
      case "completed":
        return "green";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  const canEditTest = () => {
    // Doctors cannot edit lab results, only lab technicians can
    return false;
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
        <Alert
          message="Test not found"
          description="The requested lab test could not be found or you don't have permission to view it."
          type="error"
          showIcon
          action={
            <Button
              type="primary"
              onClick={() => navigate("/doctor/lab-results")}
            >
              Back to Lab Results
            </Button>
          }
        />
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
              {testData.assigned_to?.role || "N/A"})
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

          <Title level={4}>
            <FileTextOutlined className="mr-2" />
            Results
          </Title>
          {testData.results ? (
            <div className="bg-gray-50 p-4 rounded-md">
              <Text>{testData.results}</Text>
            </div>
          ) : (
            <Text type="secondary">No results available yet.</Text>
          )}

          <Divider />

          <Title level={4}>
            <FileTextOutlined className="mr-2" />
            Notes
          </Title>
          {testData.notes ? (
            <div className="bg-gray-50 p-4 rounded-md">
              <Text>{testData.notes}</Text>
            </div>
          ) : (
            <Text type="secondary">No notes.</Text>
          )}

          <Divider />

          {canEditTest() && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => setEditModalVisible(true)}
            >
              Edit Results & Notes
            </Button>
          )}
        </Card>

        <Modal
          title="Edit Lab Test Details"
          open={editModalVisible}
          onCancel={() => setEditModalVisible(false)}
          footer={null}
          destroyOnClose
        >
          <Alert
            message="Permission Denied"
            description="Doctors are not allowed to edit lab results. Please contact a lab technician for modifications."
            type="error"
            showIcon
          />
        </Modal>
      </div>
    </div>
  );
};

export default LabTestDetailPage;
