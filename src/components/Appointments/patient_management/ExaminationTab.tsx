import React, { useState, useEffect } from "react";
import { Card, Input, Alert, Spin } from "antd";
import { Save, AlertCircle } from "lucide-react";
import { useDebounce } from "../../../hooks/useDebounce";
import { supabase } from "../../../lib/supabase";

const { TextArea } = Input;

const ExaminationTab = ({
  appointmentId,
  initialSymptoms,
  initialDiagnosis,
  initialNotes,
}) => {
  const [symptoms, setSymptoms] = useState(initialSymptoms || "");
  const [diagnosis, setDiagnosis] = useState(initialDiagnosis || "");
  const [notes, setNotes] = useState(initialNotes || "");
  const [saving, setSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(null);
  const [error, setError] = useState(null);

  // Debounce the values
  const debouncedSymptoms = useDebounce(symptoms, 1000);
  const debouncedDiagnosis = useDebounce(diagnosis, 1000);
  const debouncedNotes = useDebounce(notes, 1000);

  // Auto-save when debounced values change
  useEffect(() => {
    if (appointmentId) {
      saveMedicalData();
    }
  }, [debouncedSymptoms, debouncedDiagnosis, debouncedNotes]);

  const saveMedicalData = async () => {
    // Don't save if nothing has changed from initial values
    if (
      debouncedSymptoms === initialSymptoms &&
      debouncedDiagnosis === initialDiagnosis &&
      debouncedNotes === initialNotes
    ) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from("medical_records")
        .update({
          symptoms: debouncedSymptoms,
          diagnosis: debouncedDiagnosis,
          notes: debouncedNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", appointmentId);

      if (error) throw error;

      setLastSaveTime(new Date());
    } catch (err) {
      console.error("Error saving medical data:", err);
      setError("Failed to save data. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleManualSave = async () => {
    await saveMedicalData();
  };

  return (
    <Card
      title="Symptoms & Diagnosis"
      extra={
        <div className="flex items-center space-x-2">
          {saving && <Spin size="small" />}
          {lastSaveTime && !saving && (
            <span className="text-xs text-gray-500">
              Saved at {lastSaveTime.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={handleManualSave}
            disabled={saving}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            <Save size={14} className="mr-1" />
            Save Now
          </button>
        </div>
      }
    >
      {error && (
        <Alert
          message={error}
          type="error"
          icon={<AlertCircle size={16} />}
          className="mb-4"
          closable
          onClose={() => setError(null)}
        />
      )}

      <div className="mb-6">
        <h4 className="font-medium mb-2">Symptoms</h4>
        <TextArea
          rows={4}
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="Describe patient symptoms..."
          disabled={saving}
        />
        <p className="text-xs text-gray-500 mt-1">
          Start typing - changes are automatically saved
        </p>
      </div>

      <div className="mb-6">
        <h4 className="font-medium mb-2">Diagnosis</h4>
        <TextArea
          rows={3}
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          placeholder="Enter diagnosis..."
          disabled={saving}
        />
        <p className="text-xs text-gray-500 mt-1">
          Start typing - changes are automatically saved
        </p>
      </div>

      <div>
        <h4 className="font-medium mb-2">Notes</h4>
        <TextArea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes..."
          disabled={saving}
        />
        <p className="text-xs text-gray-500 mt-1">
          Start typing - changes are automatically saved
        </p>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded">
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> All changes are automatically saved as you
          type. You can also manually save using the "Save Now" button.
        </p>
      </div>
    </Card>
  );
};

export default ExaminationTab;
