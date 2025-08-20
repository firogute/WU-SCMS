import React from "react";
import { Button } from "antd";
import {
  Save,
  Beaker,
  User,
  Tablet,
  Send,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

const ActionButtons = ({
  onSave,
  onAssignLab,
  onAssignNurse,
  onAddPrescription,
  onSendToPharmacy,
  onCompleteAppointment,
  onRefresh,
  saving,
}) => (
  <div className="flex flex-wrap gap-3 mb-6">
    <Button
      type="primary"
      icon={<Save size={16} />}
      loading={saving}
      onClick={onSave}
    >
      Save Examination
    </Button>
    <Button icon={<Beaker size={16} />} onClick={onAssignLab}>
      Assign Lab Test
    </Button>
    <Button icon={<User size={16} />} onClick={onAssignNurse}>
      Assign Nurse Task
    </Button>
    <Button icon={<Tablet size={16} />} onClick={onAddPrescription}>
      Add Prescription
    </Button>
    <Button type="default" icon={<Send size={16} />} onClick={onSendToPharmacy}>
      Send to Pharmacy
    </Button>
    <Button
      type="primary"
      ghost
      icon={<CheckCircle size={16} />}
      onClick={onCompleteAppointment}
    >
      Complete Appointment
    </Button>
    <Button icon={<RefreshCw size={16} />} onClick={onRefresh}>
      Refresh
    </Button>
  </div>
);

export default ActionButtons;
