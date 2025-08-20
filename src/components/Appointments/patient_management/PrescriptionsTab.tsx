import React, { useState } from "react";
import { Card, Table, Tag, Button, Modal, message } from "antd";
import { Plus, Edit, Delete } from "lucide-react";
import { supabase } from "../../../lib/supabase";

const PrescriptionsTab = ({
  prescriptions,
  onAddPrescription,
  onSendToPharmacy,
}) => {
  const [loading, setLoading] = useState(false);

  const handleDeletePrescription = async (prescriptionId) => {
    Modal.confirm({
      title: "Delete Prescription",
      content: "Are you sure you want to delete this prescription?",
      onOk: async () => {
        try {
          setLoading(true);
          const { error } = await supabase
            .from("prescriptions")
            .delete()
            .eq("id", prescriptionId);

          if (error) throw error;
          message.success("Prescription deleted successfully");
          window.location.reload();
        } catch (error) {
          console.error("Error deleting prescription:", error);
          message.error("Failed to delete prescription");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleUpdateStatus = async (prescriptionId, currentStatus) => {
    try {
      setLoading(true);
      const newStatus = currentStatus === "sent" ? "active" : "sent";

      const { error } = await supabase
        .from("prescriptions")
        .update({ status: newStatus })
        .eq("id", prescriptionId);

      if (error) throw error;
      message.success(
        `Prescription ${newStatus === "sent" ? "sent" : "marked as active"}`
      );
      window.location.reload();
    } catch (error) {
      console.error("Error updating prescription status:", error);
      message.error("Failed to update prescription status");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
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
      title: "Instructions",
      dataIndex: "instructions",
      key: "instructions",
      ellipsis: true,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button
            size="small"
            onClick={() => handleUpdateStatus(record.id, record.status)}
          >
            {record.status === "sent" ? "Mark Active" : "Mark Sent"}
          </Button>
          <Button
            size="small"
            danger
            icon={<Delete size={12} />}
            onClick={() => handleDeletePrescription(record.id)}
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
      title="Prescriptions"
      extra={
        <div className="flex space-x-2">
          <Button icon={<Plus size={14} />} onClick={onAddPrescription}>
            Add Prescription
          </Button>
          <Button
            type="primary"
            icon={<Edit size={14} />}
            onClick={onSendToPharmacy}
            loading={loading}
          >
            Send to Pharmacy
          </Button>
        </div>
      }
    >
      <Table
        dataSource={prescriptions}
        columns={columns}
        pagination={false}
        rowKey="id"
        loading={loading}
      />
    </Card>
  );
};

export default PrescriptionsTab;
