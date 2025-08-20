import React from "react";
import { Card, Button, Descriptions, Tag, Avatar, Divider } from "antd";
import { User, FileText, AlertCircle } from "lucide-react";

const PatientInfo = ({ patient }) => {
  const scrollToHistory = () => {
    const element = document.getElementById("medical-history-section");
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Card className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <Avatar size={64} icon={<User />} className="mr-4" />
          <div>
            <h2 className="text-2xl font-bold">
              {patient.first_name} {patient.last_name}
            </h2>
            <p className="text-gray-600">
              {patient.gender} •{" "}
              {new Date().getFullYear() -
                new Date(patient.date_of_birth).getFullYear()}{" "}
              years • {patient.blood_type}
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button icon={<FileText size={16} />} onClick={scrollToHistory}>
            View Full History
          </Button>
          <Button type="primary" danger icon={<AlertCircle size={16} />}>
            Allergies
          </Button>
        </div>
      </div>

      <Divider />

      <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small">
        <Descriptions.Item label="Contact">{patient.phone}</Descriptions.Item>
        <Descriptions.Item label="Email">{patient.email}</Descriptions.Item>
        <Descriptions.Item label="Emergency Contact">
          {patient.emergency_contact}
        </Descriptions.Item>
        <Descriptions.Item label="Address">{patient.address}</Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color="green">Active</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Allergies">
          {patient.allergies?.map((allergy) => (
            <Tag color="red" key={allergy}>
              {allergy}
            </Tag>
          ))}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default PatientInfo;
