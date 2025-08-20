import React from "react";
import { Modal, Form, Input, Select } from "antd";
import { Plus } from "lucide-react";

const { Option } = Select;
const { TextArea } = Input;

const AddItemModal = ({ activeModal, staffMembers, form, onCancel, onSubmit }) => {
  if (!activeModal.type) return null;

  return (
    <Modal
      title={`Add ${activeModal.type === "lab" ? "Lab Test" : activeModal.type === "nurse" ? "Nurse Task" : "Prescription"}`}
      open={!!activeModal.type}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        {activeModal.type === "lab" && (
          <>
            <Form.Item name="test_name" label="Test Name" rules={[{ required: true }]}>
              <Input placeholder="e.g., Complete Blood Count" />
            </Form.Item>
            <Form.Item name="assigned_to" label="Assign To" rules={[{ required: true }]}>
              <Select placeholder="Select lab technician">
                {staffMembers.filter(staff => staff.role === "laboratory").map(staff => (
                  <Option key={staff.id} value={staff.id}>{staff.name} ({staff.department})</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="notes" label="Notes">
              <TextArea rows={3} placeholder="Additional instructions..." />
            </Form.Item>
          </>
        )}

        {activeModal.type === "nurse" && (
          <>
            <Form.Item name="task" label="Task" rules={[{ required: true }]}>
              <Input placeholder="e.g., Administer medication" />
            </Form.Item>
            <Form.Item name="assigned_to" label="Assign To" rules={[{ required: true }]}>
              <Select placeholder="Select nurse">
                {staffMembers.filter(staff => staff.role === "nurse").map(staff => (
                  <Option key={staff.id} value={staff.id}>{staff.name} ({staff.department})</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="notes" label="Notes">
              <TextArea rows={3} placeholder="Additional instructions..." />
            </Form.Item>
          </>
        )}

        {activeModal.type === "prescription" && (
          <>
            <Form.Item name="medication" label="Medication" rules={[{ required: true }]}>
              <Input placeholder="e.g., Amoxicillin" />
            </Form.Item>
            <Form.Item name="dosage" label="Dosage" rules={[{ required: true }]}>
              <Input placeholder="e.g., 500mg" />
            </Form.Item>
            <Form.Item name="frequency" label="Frequency" rules={[{ required: true }]}>
              <Input placeholder="e.g., Three times daily" />
            </Form.Item>
            <Form.Item name="duration" label="Duration" rules={[{ required: true }]}>
              <Input placeholder="e.g., 10 days" />
            </Form.Item>
            <Form.Item name="instructions" label="Instructions">
              <TextArea rows={2} placeholder="e.g., Take with food" />
            </Form.Item>
          </>
        )}

        <div className="flex justify-end space-x-2 mt-4">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            Add {activeModal.type === "lab" ? "Test" : activeModal.type === "nurse" ? "Task" : "Prescription"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddItemModal;