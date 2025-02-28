import React, { useState } from "react";
import { registerUser } from "../api/auth";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "Contributor", 
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await registerUser(formData);
    navigate("/login");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-96 bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-center text-gray-800">Welcome</h2>
          <p className="text-center text-gray-500">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              placeholder="Create a password"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Select Role</label>
            <select
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              value={formData.role}
            >
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="contributor">Contributor</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition duration-200 hover:scale-[1.02]"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-blue-600 font-medium hover:text-blue-700 transition duration-200"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
