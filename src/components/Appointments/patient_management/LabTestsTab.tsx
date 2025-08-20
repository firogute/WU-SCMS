import React, { useState, useEffect } from "react";
import { Card, Table, Tag, Button, Modal, message } from "antd";
import { Plus, Edit, Delete } from "lucide-react";
import { supabase } from "../../../lib/supabase";

const LabTestsTab = ({ appointmentId, labTests, setLabTests, onAddTest }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLabTests();
  }, [appointmentId]);

  const fetchLabTests = async () => {
    try {
      const { data, error } = await supabase
        .from("lab_tests")
        .select("*")
        .eq("appointment_id", appointmentId);

      if (error) throw error;
      setLabTests(data || []);
    } catch (error) {
      console.error("Error fetching lab tests:", error);
      message.error("Failed to load lab tests");
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock size={14} />;
      case "completed":
        return <CheckCircle size={14} />;
      case "cancelled":
        return <AlertCircle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  const handleDeleteTest = async (testId) => {
    Modal.confirm({
      title: "Delete Lab Test",
      content: "Are you sure you want to delete this lab test?",
      onOk: async () => {
        try {
          setLoading(true);
          const { error } = await supabase
            .from("lab_tests")
            .delete()
            .eq("id", testId);

          if (error) throw error;
          message.success("Lab test deleted successfully");
        } catch (error) {
          console.error("Error deleting lab test:", error);
          message.error("Failed to delete lab test");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleUpdateStatus = async (testId, newStatus) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("lab_tests")
        .update({ status: newStatus })
        .eq("id", testId);

      if (error) throw error;
      message.success("Test status updated successfully");
      window.location.reload();
    } catch (error) {
      console.error("Error updating test status:", error);
      message.error("Failed to update test status");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
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
        <Tag color={getStatusColor(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
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
      title: "Results",
      dataIndex: "results",
      key: "results",
      render: (results) => results || "Pending",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button
            size="small"
            onClick={() =>
              handleUpdateStatus(
                record.id,
                record.status === "completed" ? "pending" : "completed"
              )
            }
          >
            {record.status === "completed" ? "Mark Pending" : "Mark Complete"}
          </Button>
          <Button
            size="small"
            danger
            icon={<Delete size={12} />}
            onClick={() => handleDeleteTest(record.id)}
            loading={loading}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card
      title="Laboratory Tests"
      extra={
        <Button icon={<Plus size={14} />} onClick={onAddTest}>
          Add Test
        </Button>
      }
    >
      <Table
        dataSource={labTests}
        columns={columns}
        pagination={false}
        rowKey="id"
        loading={loading}
      />
    </Card>
  );
};

export default LabTestsTab;
