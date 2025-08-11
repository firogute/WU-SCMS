import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    avatar: "",
  });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setFormData({
          name: data.name || "",
          email: data.email || "",
          role: data.role || "",
          department: data.department || "",
          avatar: data.avatar || "",
        });
      }

      setLoading(false);
    };

    fetchUser();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    const { error } = await supabase
      .from("users")
      .update({
        name: formData.name,
        department: formData.department,
        avatar: formData.avatar,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user?.id);

    if (!error) setSuccess(true);
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">Loading profile...</div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-12 px-6">
      <div className="bg-white border border-gray-200 shadow-xl rounded-xl p-8">
        <div className="flex items-center gap-6 mb-8">
          <img
            src={
              formData.avatar ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${formData.name}`
            }
            alt="Avatar"
            className="w-20 h-20 rounded-full border-4 border-blue-500 shadow-md object-cover"
          />
          <div>
            <h1 className="text-3xl font-semibold text-gray-800">
              {formData.name || "Your Name"}
            </h1>
            <p className="text-gray-500 text-sm">
              {formData.role || "Staff Role"} · {formData.department || "N/A"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Personal Information
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 rounded-md bg-gray-100 text-gray-500 border border-gray-300 cursor-not-allowed"
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Work Details
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Role</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  disabled
                  className="w-full px-4 py-2 rounded-md bg-gray-100 text-gray-500 border border-gray-300 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Avatar Image URL
            </h2>
            <input
              type="text"
              name="avatar"
              value={formData.avatar}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
          </section>

          <div className="flex justify-end mt-8">
            <button
              type="submit"
              className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Save Changes
            </button>
          </div>

          {success && (
            <div className="text-green-600 text-sm text-right font-medium mt-2 animate-pulse">
              ✅ Profile updated successfully!
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
