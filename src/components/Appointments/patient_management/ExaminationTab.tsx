import React from "react";
import { Card, Input } from "antd";

const { TextArea } = Input;

const ExaminationTab = ({
  symptoms,
  diagnosis,
  notes,
  onSymptomsChange,
  onDiagnosisChange,
  onNotesChange,
}) => {
  return (
    <Card title="Symptoms & Diagnosis">
      <div className="mb-6">
        <h4 className="font-medium mb-2">Symptoms</h4>
        <TextArea
          rows={4}
          value={symptoms}
          onChange={(e) => onSymptomsChange(e.target.value)}
          placeholder="Describe patient symptoms..."
        />
      </div>

      <div className="mb-6">
        <h4 className="font-medium mb-2">Diagnosis</h4>
        <TextArea
          rows={3}
          value={diagnosis}
          onChange={(e) => onDiagnosisChange(e.target.value)}
          placeholder="Enter diagnosis..."
        />
      </div>

      <div>
        <h4 className="font-medium mb-2">Notes</h4>
        <TextArea
          rows={3}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Additional notes..."
        />
      </div>
    </Card>
  );
};

export default ExaminationTab;
