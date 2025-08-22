import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ToastNotificationProps {
  type: "success" | "error";
  message: string;
  onClose: () => void;
  className?: string;
  duration?: number;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  type,
  message,
  onClose,
  className = "",
  duration = 5000,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === "success"
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800"
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-current hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ToastNotification;
