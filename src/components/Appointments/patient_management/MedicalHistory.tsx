import React, { useState } from "react";
import {
  Card,
  Tabs,
  Table,
  Tag,
  Descriptions,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  message,
  Collapse,
} from "antd";
import {
  History,
  Plus,
  Edit,
  Delete,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

const MedicalHistory = ({
  medicalHistory,
  chronicConditions,
  surgicalHistory,
  familyHistory,
  onRefresh,
}) => {
  const [editingItem, setEditingItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentTab, setCurrentTab] = useState("visits");
  const [expandedHistory, setExpandedHistory] = useState({});
  const [form] = Form.useForm();

  const toggleHistoryExpansion = (id) => {
    setExpandedHistory((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDelete = async (type, id) => {
    Modal.confirm({
      title: `Delete ${type}`,
      content: "Are you sure you want to delete this record?",
      onOk: async () => {
        try {
          const { error } = await supabase
            .from(
              type === "chronic"
                ? "chronic_conditions"
                : type === "surgical"
                ? "surgical_history"
                : "family_history"
            )
            .delete()
            .eq("id", id);

          if (error) throw error;
          message.success("Record deleted successfully");
          onRefresh();
        } catch (error) {
          console.error("Error deleting record:", error);
          message.error("Failed to delete record");
        }
      },
    });
  };

  const handleEdit = (type, item) => {
    setEditingItem({ type, ...item });
    form.setFieldsValue(item);
    setShowAddModal(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingItem) {
        const { error } = await supabase
          .from(
            editingItem.type === "chronic"
              ? "chronic_conditions"
              : editingItem.type === "surgical"
              ? "surgical_history"
              : "family_history"
          )
          .update(values)
          .eq("id", editingItem.id);

        if (error) throw error;
        message.success("Record updated successfully");
      } else {
        const { error } = await supabase
          .from(
            currentTab === "conditions"
              ? "chronic_conditions"
              : currentTab === "surgical"
              ? "surgical_history"
              : "family_history"
          )
          .insert(values);

        if (error) throw error;
        message.success("Record added successfully");
      }

      setShowAddModal(false);
      setEditingItem(null);
      form.resetFields();
      onRefresh();
    } catch (error) {
      console.error("Error saving record:", error);
      message.error("Failed to save record");
    }
  };

  const renderAddButton = () => (
    <Button
      type="primary"
      icon={<Plus size={14} />}
      onClick={() => {
        setEditingItem(null);
        form.resetFields();
        setShowAddModal(true);
      }}
    >
      Add{" "}
      {currentTab === "conditions"
        ? "Condition"
        : currentTab === "surgical"
        ? "Surgery"
        : "Family History"}
    </Button>
  );

  return (
    <div id="medical-history-section" className="mt-8">
      <Card
        title={
          <div className="flex items-center">
            <History className="mr-2" size={18} />
            <span>Medical History</span>
          </div>
        }
      >
        <Tabs
          defaultActiveKey="visits"
          type="card"
          onChange={setCurrentTab}
          tabBarExtraContent={currentTab !== "visits" && renderAddButton()}
        >
          {/* Previous Visits Tab */}
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
                        {visit.time}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {visit.type} - {visit.status}
                      </p>
                    </div>
                    <div className="flex items-center">
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
                        <p className="text-gray-700">
                          {visit.symptoms || "No symptoms recorded"}
                        </p>
                      </div>

                      {visit.diagnosis && (
                        <div className="mb-3">
                          <h5 className="font-medium mb-1">Diagnosis:</h5>
                          <p className="text-gray-700">{visit.diagnosis}</p>
                        </div>
                      )}

                      {visit.notes && (
                        <div className="mb-3">
                          <h5 className="font-medium mb-1">Notes:</h5>
                          <p className="text-gray-700">{visit.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))}
              {medicalHistory.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No previous visits found
                </p>
              )}
            </div>
          </TabPane>

          {/* Chronic Conditions Tab */}
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
                  render: (date) => new Date(date).toLocaleDateString(),
                },
                { title: "Status", dataIndex: "status", key: "status" },
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
                {
                  title: "Actions",
                  key: "actions",
                  render: (_, record) => (
                    <div className="flex space-x-2">
                      <Button
                        size="small"
                        icon={<Edit size={12} />}
                        onClick={() => handleEdit("chronic", record)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        danger
                        icon={<Delete size={12} />}
                        onClick={() => handleDelete("chronic", record.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          </TabPane>

          {/* Surgical History Tab */}
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
                { title: "Surgeon", dataIndex: "surgeon", key: "surgeon" },
                { title: "Facility", dataIndex: "facility", key: "facility" },
                { title: "Outcome", dataIndex: "outcome", key: "outcome" },
                {
                  title: "Actions",
                  key: "actions",
                  render: (_, record) => (
                    <div className="flex space-x-2">
                      <Button
                        size="small"
                        icon={<Edit size={12} />}
                        onClick={() => handleEdit("surgical", record)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        danger
                        icon={<Delete size={12} />}
                        onClick={() => handleDelete("surgical", record.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          </TabPane>

          {/* Family History Tab */}
          <TabPane tab="Family History" key="family">
            <Table
              dataSource={familyHistory}
              pagination={false}
              rowKey="id"
              columns={[
                { title: "Relation", dataIndex: "relation", key: "relation" },
                {
                  title: "Condition",
                  dataIndex: "condition",
                  key: "condition",
                },
                {
                  title: "Age of Onset",
                  dataIndex: "age_of_onset",
                  key: "age_of_onset",
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
                    <div className="flex space-x-2">
                      <Button
                        size="small"
                        icon={<Edit size={12} />}
                        onClick={() => handleEdit("family", record)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        danger
                        icon={<Delete size={12} />}
                        onClick={() => handleDelete("family", record.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={`${editingItem ? "Edit" : "Add"} ${
          currentTab === "conditions"
            ? "Chronic Condition"
            : currentTab === "surgical"
            ? "Surgical History"
            : "Family History"
        }`}
        open={showAddModal}
        onCancel={() => {
          setShowAddModal(false);
          setEditingItem(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {currentTab === "conditions" && (
            <>
              <Form.Item
                name="condition"
                label="Condition"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="diagnosed_date"
                label="Diagnosed Date"
                rules={[{ required: true }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="severity"
                label="Severity"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="Mild">Mild</Option>
                  <Option value="Moderate">Moderate</Option>
                  <Option value="Severe">Severe</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="treatment"
                label="Treatment"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item name="notes" label="Notes">
                <TextArea rows={3} />
              </Form.Item>
            </>
          )}

          {currentTab === "surgical" && (
            <>
              <Form.Item
                name="procedure"
                label="Procedure"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item name="date" label="Date" rules={[{ required: true }]}>
                <DatePicker className="w-full" />
              </Form.Item>
              <Form.Item
                name="surgeon"
                label="Surgeon"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="facility"
                label="Facility"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="outcome"
                label="Outcome"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item name="notes" label="Notes">
                <TextArea rows={3} />
              </Form.Item>
            </>
          )}

          {currentTab === "family" && (
            <>
              <Form.Item
                name="relation"
                label="Relation"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="condition"
                label="Condition"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="age_of_onset"
                label="Age of Onset"
                rules={[{ required: true }]}
              >
                <Input type="number" />
              </Form.Item>
              <Form.Item name="notes" label="Notes">
                <TextArea rows={3} />
              </Form.Item>
            </>
          )}

          <div className="flex justify-end space-x-2 mt-4">
            <Button
              onClick={() => {
                setShowAddModal(false);
                setEditingItem(null);
                form.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default MedicalHistory;
