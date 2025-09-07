import React, { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  AlertTriangle,
  LogIn,
  Heart,
  Shield,
  Zap,
  ChevronDown,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

const demoCredentials = [
  { role: "Admin", email: "admin@wollega.edu.et", password: "password123" },
  { role: "Doctor", email: "doctor@wollega.edu.et", password: "password123" },
  { role: "Nurse", email: "nurse@wollega.edu.et", password: "password123" },
  {
    role: "Pharmacist",
    email: "pharmacist@wollega.edu.et",
    password: "password123",
  },
  {
    role: "Receptionist",
    email: "receptionist@wollega.edu.et",
    password: "password123",
  },
  {
    role: "Laboratorist",
    email: "laboratory@wollega.edu.et",
    password: "password123",
  },
];

const LoginForm: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState({ email: false, password: false });
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);
  const { user, setUser } = useAuth();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && !user) {
      setUser(JSON.parse(storedUser));
    }
  }, [user, setUser]);

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    const { data, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (fetchError || !data) {
      setIsLoading(false);
      setError("Invalid email or password");
      return;
    }

    if (data.password !== password) {
      setIsLoading(false);
      setError("Invalid email or password");
      return;
    }

    setUser(data);
    localStorage.setItem("user", JSON.stringify(data));
    setIsLoading(false);
  };

  const fillCredentials = (credential: { email: string; password: string }) => {
    setEmail(credential.email);
    setPassword(credential.password);
    setShowDemoCredentials(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-4xl flex flex-col lg:flex-row rounded-2xl overflow-hidden shadow-2xl">
        {/* Left: Medical Image */}
        <div className="lg:w-2/5 relative hidden lg:block">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-800/20 to-indigo-900/40 z-10"></div>
          <div className="absolute bottom-6 left-6 z-20 text-white"></div>
          <img
            src="doctor-placeholder.png"
            alt="Healthcare Professional"
            className="object-cover w-full h-full"
          />
        </div>

        {/* Right: Login Form */}
        <div className="lg:w-3/5 bg-white p-8 lg:p-12 flex flex-col justify-center relative">
          {/* Demo Credentials Button */}
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setShowDemoCredentials(!showDemoCredentials)}
              className="flex items-center text-xs text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full"
            >
              <User className="w-3 h-3 mr-1" />
              Demo Logins
              <ChevronDown
                className={`w-3 h-3 ml-1 transition-transform ${
                  showDemoCredentials ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Demo Credentials Dropdown */}
            {showDemoCredentials && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10 overflow-hidden">
                <div className="p-3 bg-blue-50 border-b border-blue-100">
                  <p className="text-xs font-medium text-blue-800">
                    Select a demo role
                  </p>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {demoCredentials.map((cred, index) => (
                    <button
                      key={index}
                      onClick={() => fillCredentials(cred)}
                      className="w-full text-left p-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {cred.role}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {cred.email}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute -inset-2 bg-blue-100 rounded-full opacity-75 animate-pulse"></div>
              <img
                src="logo.png"
                alt="Logo"
                className="w-16 h-16 relative z-10"
              />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 text-center mb-2 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            Welcome to SCMS
          </h2>
          <p className="text-sm text-gray-600 text-center mb-8">
            Wollega University Clinic Management System
          </p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3 animate-shake">
                <div className="bg-red-100 p-2 rounded-full">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <span className="text-red-700 text-sm font-medium">
                  {error}
                </span>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div
                className={`relative transition-all duration-300 ${
                  isFocused.email ? "transform scale-105" : ""
                }`}
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsFocused({ ...isFocused, email: true })}
                  onBlur={() => setIsFocused({ ...isFocused, email: false })}
                  className="w-full px-4 py-4 border-0 bg-blue-50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-300 shadow-sm"
                  placeholder="Enter your email"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div
                className={`relative transition-all duration-300 ${
                  isFocused.password ? "transform scale-105" : ""
                }`}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsFocused({ ...isFocused, password: true })}
                  onBlur={() => setIsFocused({ ...isFocused, password: false })}
                  className="w-full px-4 py-4 border-0 bg-blue-50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-300 shadow-sm pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400 hover:text-blue-500 transition-colors" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400 hover:text-blue-500 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:transform-none disabled:hover:shadow-lg flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="bg-blue-100 p-3 rounded-full inline-flex">
                  <Heart className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-xs text-gray-600 mt-2">Secure</p>
              </div>
              <div className="text-center">
                <div className="bg-indigo-100 p-3 rounded-full inline-flex">
                  <Shield className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-xs text-gray-600 mt-2">Private</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 p-3 rounded-full inline-flex">
                  <Zap className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-xs text-gray-600 mt-2">Fast</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
