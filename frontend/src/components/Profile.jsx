import React, { useEffect, useState } from "react";
import { getUserProfile } from "../api/auth";
import { User, Mail, Shield, UserCircle } from "lucide-react";

// Helper function to capitalize the first letter of a string
const capitalizeFirstLetter = (str) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getUserProfile()
      .then((res) => {
        setProfile(res);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile");
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="space-y-6">
            <div className="animate-pulse h-24 w-24 bg-slate-200 rounded-full mx-auto"></div>
            <div className="animate-pulse h-8 bg-slate-200 rounded w-1/3 mx-auto"></div>
            <div className="space-y-4">
              <div className="animate-pulse h-16 bg-slate-100 rounded"></div>
              <div className="animate-pulse h-16 bg-slate-100 rounded"></div>
              <div className="animate-pulse h-16 bg-slate-100 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="flex bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 items-center">
            <div className="relative flex-shrink-0">
              <div className="bg-white/20 p-4 rounded-full mb-4">
                <UserCircle size={100} className="text-white" />
              </div>
            </div>
            <div className="ml-6">
              <h2 className="text-3xl font-bold leading-tight">
                {capitalizeFirstLetter(profile?.user?.username)}
              </h2>
              <span className="mt-2 inline-block px-6 py-2 bg-white/30 rounded-full text-lg font-medium backdrop-blur-md">
                {capitalizeFirstLetter(profile?.role)}
              </span>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-8 space-y-6">
            {/* Username */}
            <div className="flex items-center p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow">
              <User className="text-blue-600 w-6 h-6 mr-4" />
              <div>
                <p className="text-sm text-gray-500">Username</p>
                <p className="font-semibold text-gray-900">{capitalizeFirstLetter(profile?.user?.username)}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow">
              <Mail className="text-blue-600 w-6 h-6 mr-4" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-semibold text-gray-900">{profile?.user?.email}</p>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-center p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow">
              <Shield className="text-blue-600 w-6 h-6 mr-4" />
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-semibold text-gray-900">{capitalizeFirstLetter(profile?.role)}</p>
              </div>
            </div>

            {/* Full Name */}
            {(profile?.user?.first_name || profile?.user?.last_name) && (
              <div className="flex items-center p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow">
                <User className="text-blue-600 w-6 h-6 mr-4" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-semibold text-gray-900">
                    {`${capitalizeFirstLetter(profile?.user?.first_name || "")} ${capitalizeFirstLetter(profile?.user?.last_name || "")}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
