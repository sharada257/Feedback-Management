import React, { useEffect, useState } from "react";
import { getUserProfile } from "../api/auth";
import { User, Mail, Shield, UserCircle } from "lucide-react"; 

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
      <div className="p-8 max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <div className="flex flex-col items-center">
              <div className="bg-white/10 p-4 rounded-full backdrop-blur-sm mb-4">
                <UserCircle size={80} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2">
                {profile?.user?.username}
              </h2>
              <span className="px-4 py-1.5 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                {profile?.role}
              </span>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-8">
            <div className="space-y-6">
              <div className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors shadow-lg">
                <User className="text-blue-600 w-6 h-6 mr-4" />
                <div>
                  <p className="text-sm text-gray-500">Username</p>
                  <p className="font-medium text-gray-900">{profile?.user?.username}</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors shadow-lg">
                <Mail className="text-blue-600 w-6 h-6 mr-4" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{profile?.user?.email}</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors shadow-lg">
                <Shield className="text-blue-600 w-6 h-6 mr-4" />
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium text-gray-900">{profile?.role}</p>
                </div>
              </div>

              
              {(profile?.user?.first_name || profile?.user?.last_name) && (
                <div className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <User className="text-blue-600 w-6 h-6 mr-4" />
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-900">
                      {`${profile?.user?.first_name || ''} ${profile?.user?.last_name || ''}`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;