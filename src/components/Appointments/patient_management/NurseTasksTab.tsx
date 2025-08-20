import React, { useState } from "react";
import { Card, Table, Tag, Button, Modal, message } from "antd";
import {
  Plus,
  Edit,
  Delete,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

const NurseTasksTab = ({ nurseTasks, onAddTask }) => {
  const [loading, setLoading] = useState(false);

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

  const handleDeleteTask = async (taskId) => {
    Modal.confirm({
      title: "Delete Nurse Task",
      content: "Are you sure you want to delete this task?",
      onOk: async () => {
        try {
          setLoading(true);
          const { error } = await supabase
            .from("nurse_tasks")
            .delete()
            .eq("id", taskId);

          if (error) throw error;
          message.success("Task deleted successfully");
          window.location.reload();
        } catch (error) {
          console.error("Error deleting task:", error);
          message.error("Failed to delete task");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      setLoading(true);
      const updateData = { status: newStatus };

      if (newStatus === "completed") {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("nurse_tasks")
        .update(updateData)
        .eq("id", taskId);

      if (error) throw error;
      message.success("Task status updated successfully");
      window.location.reload();
    } catch (error) {
      console.error("Error updating task status:", error);
      message.error("Failed to update task status");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
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
      title: "Completed At",
      dataIndex: "completed_at",
      key: "completed_at",
      render: (date) =>
        date ? new Date(date).toLocaleString() : "Not completed",
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
            onClick={() => handleDeleteTask(record.id)}
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
      title="Nurse Tasks"
      extra={
        <Button icon={<Plus size={14} />} onClick={onAddTask}>
          Add Task
        </Button>
      }
    >
      <Table
        dataSource={nurseTasks}
        columns={columns}
        pagination={false}
        rowKey="id"
        loading={loading}
      />
    </Card>
  );
};

export default NurseTasksTab;
