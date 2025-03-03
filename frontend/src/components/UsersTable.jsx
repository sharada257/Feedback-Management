import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosConfig";

const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => {
    axiosInstance
      .get("users/")
      .then((response) => {
        console.log(" Users API Response:", response.data);
        setUsers(response.data);
        setFilteredUsers(response.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        setError("Failed to load users data");
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(term) ||
          user.email?.toLowerCase().includes(term) ||
          user.username?.toLowerCase().includes(term)
      );
    }

    if (roleFilter) {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Sort users
    filtered = [...filtered].sort((a, b) => {
      const fieldA = a[sortField]?.toLowerCase() || "";
      const fieldB = b[sortField]?.toLowerCase() || "";

      if (sortDirection === "asc") {
        return fieldA.localeCompare(fieldB);
      } else {
        return fieldB.localeCompare(fieldA);
      }
    });

    setFilteredUsers(filtered);
  }, [users, searchTerm, sortField, sortDirection, roleFilter]);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Get all unique roles for the filter dropdown
  const uniqueRoles = [...new Set(users.map((user) => user.role))].filter(Boolean);

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">Users</h2>

          <div className="flex flex-wrap gap-4 mb-4">
            {/* Search Input */}
            <div className="flex-grow max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Users
              </label>
              <input
                type="text"
                className="w-full border p-2 rounded"
                placeholder="Search by name, email, or username"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Role
              </label>
              <select
                className="border p-2 rounded w-40"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                {uniqueRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6">Loading users...</div>
        ) : error ? (
          <div className="p-6 text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th 
                    className="px-6 py-4 text-left cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      Name
                      {sortField === "username" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center">
                      Email
                      {sortField === "email" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                
                  <th 
                    className="px-6 py-4 text-left cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("role")}
                  >
                    <div className="flex items-center">
                      Role
                      {sortField === "role" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">Joined Date</th>
                
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          
                          <span>{user.username || "N/A"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{user.email || "N/A"}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {user.role || "User"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDate(user.created_at)}
                      </td>
                      
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {filteredUsers.length > 0 && (
              <div className="px-6 py-3 text-sm text-gray-500">
                Showing {filteredUsers.length} of {users.length} users
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersTable;