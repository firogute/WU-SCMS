import React, { useEffect, useState, useRef } from "react";
import {
  Camera,
  Save,
  User,
  Mail,
  Shield,
  Bell,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Upload,
  Download,
  Lock,
  Smartphone,
  Building,
  Calendar,
  MapPin,
  Heart,
  Key,
  RotateCw,
  Trash2,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../UI/Button";
import ToastNotification from "../UI/ToastNotification";
import LoadingSpinner from "../UI/LoadingSpinner";

const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    appointmentReminders: true,
    newsletter: false,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    avatar: "",
    address: "",
    emergency_contact: "",
    date_of_birth: "",
    gender: "prefer-not-to-say",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          role: data.role || "",
          department: data.department || "",
          avatar: data.avatar || "",
          address: data.address || "",
          emergency_contact: data.emergency_contact || "",
          date_of_birth: data.date_of_birth || "",
          gender: data.gender || "prefer-not-to-say",
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (type: string, checked: boolean) => {
    setNotifications((prev) => ({ ...prev, [type]: checked }));
  };

  const validateProfileForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {};

    if (!passwordForm.currentPassword)
      newErrors.currentPassword = "Current password is required";
    if (!passwordForm.newPassword)
      newErrors.newPassword = "New password is required";
    if (passwordForm.newPassword.length < 8)
      newErrors.newPassword = "Password must be at least 8 characters";
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProfileForm()) return;

    setSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from("users")
        .update({
          name: formData.name,
          phone: formData.phone,
          department: formData.department,
          avatar: formData.avatar,
          address: formData.address,
          emergency_contact: formData.emergency_contact,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id);

      if (error) throw error;

      setSuccess("Profile updated successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    setSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from("users")
        .update({ password: passwordForm.newPassword })
        .eq("id", user.id);

      if (error) throw error;

      setSuccess("Password updated successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    setError(null);

    try {
      // Check if user has permission to update their profile
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single();

      if (userError) {
        throw new Error("You don't have permission to update this profile");
      }

      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
          cacheControl: "3600",
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const avatarUrl = urlData.publicUrl;

      // Save URL in your users table
      const { error: dbError } = await supabase
        .from("users")
        .update({ avatar: avatarUrl })
        .eq("id", user.id);

      if (dbError) {
        if (dbError.message.includes("row-level security policy")) {
          throw new Error(
            "Permission denied: You can only update your own profile"
          );
        }
        throw dbError;
      }

      // Update local state
      setFormData((prev) => ({ ...prev, avatar: avatarUrl }));
      setSuccess("Avatar updated successfully");
    } catch (err: any) {
      setError(err.message || "Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(formData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
      dataStr
    )}`;

    const exportFileDefaultName = `${formData.name.replace(
      /\s+/g,
      "_"
    )}_profile_data.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Notifications */}
        {error && (
          <ToastNotification
            type="error"
            message={error}
            onClose={() => setError(null)}
            className="mb-6"
          />
        )}

        {success && (
          <ToastNotification
            type="success"
            message={success}
            onClose={() => setSuccess(null)}
            className="mb-6"
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="relative inline-block mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {formData.avatar ? (
                      <img
                        src={formData.avatar}
                        alt={formData.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      formData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-md hover:bg-blue-700 transition-colors"
                  >
                    {uploading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {formData.name}
                </h2>
                <p className="text-sm text-gray-600">
                  {formData.role} · {formData.department || "No department"}
                </p>
              </div>

              <nav className="space-y-1">
                {[
                  { id: "profile", label: "Profile", icon: User },
                  { id: "security", label: "Security", icon: Shield },
                  { id: "notifications", label: "Notifications", icon: Bell },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === item.id
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={exportData}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  <span className="font-medium">Export Data</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <form onSubmit={handleProfileSubmit}>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <User className="w-5 h-5 mr-2 text-blue-600" />
                      Personal Information
                    </h3>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          disabled
                          className="w-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 text-gray-500 border border-gray-300 rounded-lg cursor-not-allowed"
                          placeholder="Enter your full name"
                        />
                        {errors.name && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="email"
                            value={formData.email}
                            disabled
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 text-gray-500 border border-gray-300 rounded-lg cursor-not-allowed"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Contact admin to change email
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) =>
                              handleInputChange("phone", e.target.value)
                            }
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="+251-911-123456"
                          />
                        </div>
                        {errors.phone && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.phone}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Department
                        </label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            value={formData.department}
                            onChange={(e) =>
                              handleInputChange("department", e.target.value)
                            }
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Your department"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date of Birth
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="date"
                            value={formData.date_of_birth}
                            onChange={(e) =>
                              handleInputChange("date_of_birth", e.target.value)
                            }
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gender
                        </label>
                        <select
                          value={formData.gender}
                          onChange={(e) =>
                            handleInputChange("gender", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer-not-to-say">
                            Prefer not to say
                          </option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <textarea
                          value={formData.address}
                          onChange={(e) =>
                            handleInputChange("address", e.target.value)
                          }
                          rows={3}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your address"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Contact
                      </label>
                      <div className="relative">
                        <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="tel"
                          value={formData.emergency_contact}
                          onChange={(e) =>
                            handleInputChange(
                              "emergency_contact",
                              e.target.value
                            )
                          }
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="+251-911-654321"
                        />
                      </div>
                      {errors.emergency_contact && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.emergency_contact}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Avatar URL
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={formData.avatar}
                          onChange={(e) =>
                            handleInputChange("avatar", e.target.value)
                          }
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Paste image URL or upload above"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <Upload className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                    <Button type="submit" icon={<Save />} loading={saving}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <form onSubmit={handlePasswordSubmit}>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-purple-600" />
                      Security Settings
                    </h3>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">
                        Change Password
                      </h4>
                      <p className="text-sm text-blue-700">
                        Ensure your account is using a long, random password to
                        stay secure.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            value={passwordForm.currentPassword}
                            onChange={(e) =>
                              handlePasswordChange(
                                "currentPassword",
                                e.target.value
                              )
                            }
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                        {errors.currentPassword && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.currentPassword}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password *
                        </label>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={passwordForm.newPassword}
                            onChange={(e) =>
                              handlePasswordChange(
                                "newPassword",
                                e.target.value
                              )
                            }
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showNewPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                        {errors.newPassword && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.newPassword}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password *
                        </label>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={passwordForm.confirmPassword}
                            onChange={(e) =>
                              handlePasswordChange(
                                "confirmPassword",
                                e.target.value
                              )
                            }
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.confirmPassword}
                          </p>
                        )}
                      </div>

                      <div className="flex items-end">
                        <Button
                          type="button"
                          onClick={() => {
                            const chars =
                              "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
                            let password = "";
                            for (let i = 0; i < 12; i++) {
                              password += chars.charAt(
                                Math.floor(Math.random() * chars.length)
                              );
                            }
                            handlePasswordChange("newPassword", password);
                            handlePasswordChange("confirmPassword", password);
                          }}
                          icon={<RotateCw />}
                          variant="outline"
                        >
                          Generate Strong Password
                        </Button>
                      </div>
                    </div>

                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <h4 className="font-medium text-yellow-900 mb-2">
                        Password Requirements
                      </h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li className="flex items-center">
                          {passwordForm.newPassword.length >= 8 ? (
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-400 mr-2" />
                          )}
                          At least 8 characters long
                        </li>
                        <li className="flex items-center">
                          {/[A-Z]/.test(passwordForm.newPassword) ? (
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-400 mr-2" />
                          )}
                          Contains uppercase letters
                        </li>
                        <li className="flex items-center">
                          {/[0-9]/.test(passwordForm.newPassword) ? (
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-400 mr-2" />
                          )}
                          Contains numbers
                        </li>
                        <li className="flex items-center">
                          {/[^A-Za-z0-9]/.test(passwordForm.newPassword) ? (
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-400 mr-2" />
                          )}
                          Contains special characters
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                    <Button type="submit" icon={<Save />} loading={saving}>
                      Update Password
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Bell className="w-5 h-5 mr-2 text-orange-600" />
                    Notification Preferences
                  </h3>
                </div>

                <div className="p-6 space-y-6">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Manage Notifications
                    </h4>
                    <p className="text-sm text-blue-700">
                      Choose how you want to be notified about different
                      activities in the system.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        id: "email",
                        label: "Email Notifications",
                        description: "Receive important updates via email",
                      },
                      {
                        id: "sms",
                        label: "SMS Alerts",
                        description: "Get critical alerts via text message",
                      },
                      {
                        id: "push",
                        label: "Push Notifications",
                        description: "Receive browser push notifications",
                      },
                      {
                        id: "appointmentReminders",
                        label: "Appointment Reminders",
                        description: "Reminders for upcoming appointments",
                      },
                      {
                        id: "newsletter",
                        label: "Newsletter",
                        description: "Monthly newsletter and updates",
                      },
                    ].map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {item.label}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {item.description}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={
                              notifications[
                                item.id as keyof typeof notifications
                              ]
                            }
                            onChange={(e) =>
                              handleNotificationChange(
                                item.id,
                                e.target.checked
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                  <Button
                    onClick={() => {
                      setSuccess("Notification preferences saved");
                      setTimeout(() => setSuccess(null), 3000);
                    }}
                    icon={<Save />}
                  >
                    Save Preferences
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
