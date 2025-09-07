import React from "react";
import { Modal, Form, Input, Select, Checkbox } from "antd";
import Button from "../../UI/Button";

const { Option } = Select;
const { TextArea } = Input;

const AddItemModal = ({
  activeModal,
  staffMembers,
  form,
  onCancel,
  onSubmit,
}) => {
  if (!activeModal.type) return null;

  return (
    <Modal
      title={`Add ${
        activeModal.type === "lab"
          ? "Lab Test"
          : activeModal.type === "nurse"
          ? "Nurse Task"
          : "Prescription"
      }`}
      open={!!activeModal.type}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        {activeModal.type === "lab" && (
          <>
            <Form.Item
              name="tests"
              label="Select Tests"
              rules={[
                { required: true, message: "Please select at least one test" },
              ]}
            >
              <Checkbox.Group className="w-full">
                <div className="grid grid-cols-2 gap-3">
                  <Checkbox value="Complete Blood Count (CBC)">
                    Complete Blood Count (CBC)
                  </Checkbox>
                  <Checkbox value="Urinalysis">Urinalysis</Checkbox>
                  <Checkbox value="Blood Glucose">Blood Glucose</Checkbox>
                  <Checkbox value="Lipid Profile">Lipid Profile</Checkbox>
                  <Checkbox value="Liver Function Tests">
                    Liver Function Tests
                  </Checkbox>
                  <Checkbox value="Renal Function Tests">
                    Renal Function Tests
                  </Checkbox>
                  <Checkbox value="thyroid">Thyroid Panel</Checkbox>
                  <Checkbox value="vitamin_d">Vitamin D</Checkbox>
                  <Checkbox value="other">Other (specify below)</Checkbox>
                </div>
              </Checkbox.Group>
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.tests !== currentValues.tests
              }
            >
              {({ getFieldValue }) =>
                getFieldValue("tests")?.includes("other") ? (
                  <Form.Item
                    name="other_test"
                    label="Other Test Name"
                    rules={[
                      {
                        required: true,
                        message: "Please specify the test name",
                      },
                    ]}
                  >
                    <Input placeholder="Enter test name" />
                  </Form.Item>
                ) : null
              }
            </Form.Item>

            <Form.Item
              name="assigned_to"
              label="Assign To"
              rules={[{ required: true }]}
            >
              <Select placeholder="Select lab technician">
                {staffMembers
                  .filter((staff) => staff.role === "laboratory")
                  .map((staff) => (
                    <Option key={staff.id} value={staff.id}>
                      {staff.name} ({staff.department})
                    </Option>
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
            <Form.Item
              name="assigned_to"
              label="Assign To"
              rules={[{ required: true }]}
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
              <TextArea rows={3} placeholder="Additional instructions..." />
            </Form.Item>
          </>
        )}

        {activeModal.type === "prescription" && (
          <>
            <Form.Item
              name="medicines"
              label="Select Medicines"
              rules={[
                {
                  required: true,
                  message: "Please select at least one medicine",
                },
              ]}
            >
              <Checkbox.Group className="w-full">
                <div className="grid grid-cols-2 gap-3">
                  <Checkbox value="amoxicillin">
                    Amoxicillin (Antibiotic)
                  </Checkbox>
                  <Checkbox value="paracetamol">
                    Paracetamol (Pain Relief)
                  </Checkbox>
                  <Checkbox value="ibuprofen">
                    Ibuprofen (Anti-inflammatory)
                  </Checkbox>
                  <Checkbox value="omeprazole">
                    Omeprazole (Acid Reducer)
                  </Checkbox>
                  <Checkbox value="atorvastatin">
                    Atorvastatin (Cholesterol)
                  </Checkbox>
                  <Checkbox value="metformin">Metformin (Diabetes)</Checkbox>
                  <Checkbox value="amlodipine">
                    Amlodipine (Blood Pressure)
                  </Checkbox>
                  <Checkbox value="salbutamol">Salbutamol (Asthma)</Checkbox>
                  <Checkbox value="other">Other (specify below)</Checkbox>
                </div>
              </Checkbox.Group>
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.medicines !== currentValues.medicines
              }
            >
              {({ getFieldValue }) =>
                getFieldValue("medicines")?.includes("other") ? (
                  <Form.Item
                    name="other_medicine"
                    label="Other Medicine Name"
                    rules={[
                      {
                        required: true,
                        message: "Please specify the medicine name",
                      },
                    ]}
                  >
                    <Input placeholder="Enter medicine name" />
                  </Form.Item>
                ) : null
              }
            </Form.Item>

            <Form.Item
              name="dosage"
              label="Dosage"
              rules={[{ required: true }]}
            >
              <Input placeholder="e.g., 500mg" />
            </Form.Item>

            <Form.Item
              name="frequency"
              label="Frequency"
              rules={[{ required: true }]}
            >
              <Select placeholder="Select frequency">
                <Option value="once_daily">Once daily</Option>
                <Option value="twice_daily">Twice daily</Option>
                <Option value="three_times_daily">Three times daily</Option>
                <Option value="four_times_daily">Four times daily</Option>
                <Option value="as_needed">As needed</Option>
                <Option value="other">Other (specify in instructions)</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="duration"
              label="Duration"
              rules={[{ required: true }]}
            >
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
  );
};

export default AddItemModal;
