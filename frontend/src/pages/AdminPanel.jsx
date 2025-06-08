// src/pages/AdminPanel.jsx
import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { MdAdminPanelSettings, MdPeople, MdDns, MdSecurity } from 'react-icons/md';
import { useToast } from "../components/useToast";

export default function AdminPanel() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [editingUserEmail, setEditingUserEmail] = useState(null);
    const [formData, setFormData] = useState({ role: "", skills: "" });
    const [searchQuery, setSearchQuery] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const [showUserManagement, setShowUserManagement] = useState(false);
    
    const showToast = useToast();

    const token = localStorage.getItem("token");

    // Inline function for capitalizing the first letter
    const capitalizeFirstLetter = useCallback((string) => {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    }, []);

    // Helper to fetch users
    const fetchUsers = useCallback(async () => {
        if (!token) {
            showToast("Authentication required. Please log in.", "error");
            return;
        }
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/auth/users`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const errorData = await res.json();
                showToast(errorData.error || "Failed to fetch users", "error");
                console.error("Error fetching users:", errorData.error);
                setUsers([]);
                setFilteredUsers([]);
                return;
            }

            const data = await res.json();
            setUsers(data);
            setFilteredUsers(data);
        } catch (err) {
            showToast("Error fetching users. Check console.", "error");
            console.error("Error fetching users", err);
        }
    }, [token, showToast]);

    // Fetch users initially and whenever user management view is toggled
    useEffect(() => {
        if (showUserManagement) {
            fetchUsers();
        }
    }, [showUserManagement, fetchUsers]);

    const handleEditClick = (user) => {
        setEditingUserEmail(user.email);
        setFormData({
            role: user.role,
            skills: user.skills?.join(", ") || "",
        });
    };

    const handleUpdate = async () => {
        setIsUpdating(true);
        if (!token) {
            showToast("Authentication required. Please log in.", "error");
            setIsUpdating(false);
            return;
        }
        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_API_URL}/auth/update-user`,
                {
                    method: "POST", // Changed back to POST as per your original code
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        email: editingUserEmail,
                        role: formData.role,
                        skills: formData.skills
                            .split(",")
                            .map((skill) => skill.trim())
                            .filter(Boolean),
                    }),
                }
            );

            const data = await res.json();
            if (!res.ok) {
                showToast(data.error || "Failed to update user", "error");
                return;
            }

            showToast("User updated successfully!", "success");
            setEditingUserEmail(null);
            setFormData({ role: "", skills: "" });
            fetchUsers();
        } catch (err) {
            showToast("Update failed. Check console.", "error");
            console.error("Update failed", err);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        setFilteredUsers(
            users.filter(
                (user) =>
                    user.email.toLowerCase().includes(query) ||
                    user.role.toLowerCase().includes(query) ||
                    user.skills?.some((skill) => skill.toLowerCase().includes(query))
            )
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="p-6 bg-base-200 rounded-box shadow-lg"
        >
            <h2 className="text-3xl font-bold text-accent mb-6 flex items-center">
                <MdAdminPanelSettings className="inline-block mr-3 text-4xl" /> Admin Panel
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* User Management Card */}
                <div className="card bg-base-100 shadow-md border border-base-300">
                    <div className="card-body">
                        <h3 className="card-title text-secondary flex items-center">
                            <MdPeople className="inline-block mr-2" /> User Management
                        </h3>
                        <p>View, add, edit, or delete user accounts and manage their roles.</p>
                        <div className="card-actions justify-end mt-4">
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() => setShowUserManagement(!showUserManagement)}
                            >
                                {showUserManagement ? 'Hide Users' : 'Manage Users'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* System Logs Card */}
                <div className="card bg-base-100 shadow-md border border-base-300">
                    <div className="card-body">
                        <h3 className="card-title text-secondary flex items-center">
                            <MdDns className="inline-block mr-2" /> System Logs
                        </h3>
                        <p>Review application logs for debugging and monitoring.</p>
                        <div className="card-actions justify-end mt-4">
                            <button className="btn btn-secondary btn-sm">View Logs</button>
                        </div>
                    </div>
                </div>

                {/* Security Settings Card */}
                <div className="card bg-base-100 shadow-md border border-base-300">
                    <div className="card-body">
                        <h3 className="card-title text-secondary flex items-center">
                            <MdSecurity className="inline-block mr-2" /> Security Settings
                        </h3>
                        <p>Configure security policies, authentication methods, and access controls.</p>
                        <div className="card-actions justify-end mt-4">
                            <button className="btn btn-accent btn-sm">Configure Security</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Management Table (Conditionally rendered) */}
            {showUserManagement && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-8 p-6 bg-base-100 rounded-box shadow-xl border border-base-300"
                >
                    <h3 className="text-2xl font-bold mb-6 text-center">User Accounts</h3>
                    <input
                        type="text"
                        className="input input-bordered w-full max-w-xl mx-auto block mb-8"
                        placeholder="Search users by email, role, or skills..."
                        value={searchQuery}
                        onChange={handleSearch}
                    />

                    <div className="overflow-x-auto shadow-xl rounded-lg">
                        <table className="table w-full">
                            {/* head */}
                            <thead>
                                <tr>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Skills</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4">No users found.</td>
                                    </tr>
                                )}
                                {filteredUsers.map((user) => (
                                    <tr key={user._id}>
                                        <td>{user.email}</td>
                                        <td>
                                            <div className={`badge ${
                                                user.role === 'admin' ? 'badge-error' :
                                                user.role === 'moderator' ? 'badge-warning' :
                                                'badge-info'
                                            }`}>
                                                {capitalizeFirstLetter(user.role)}
                                            </div>
                                        </td>
                                        <td>
                                            {user.skills && user.skills.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {user.skills.map((skill, idx) => (
                                                        <span key={idx} className="badge badge-outline">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-gray-500">N/A</span>
                                            )}
                                        </td>
                                        <td>
                                            {editingUserEmail === user.email ? (
                                                <div className="flex flex-col gap-2">
                                                    <select
                                                        className="select select-sm select-bordered w-full max-w-xs"
                                                        value={formData.role}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, role: e.target.value })
                                                        }
                                                    >
                                                        <option value="user">User</option>
                                                        <option value="moderator">Moderator</option>
                                                        <option value="admin">Admin</option>
                                                    </select>

                                                    <input
                                                        type="text"
                                                        placeholder="Skills (comma-separated)"
                                                        className="input input-sm input-bordered w-full max-w-xs"
                                                        value={formData.skills}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, skills: e.target.value })
                                                        }
                                                    />

                                                    <div className="flex gap-2">
                                                        <button
                                                            className="btn btn-success btn-sm flex-1"
                                                            onClick={handleUpdate}
                                                            disabled={isUpdating}
                                                        >
                                                            {isUpdating ? 'Saving...' : 'Save'}
                                                        </button>
                                                        <button
                                                            className="btn btn-ghost btn-sm flex-1"
                                                            onClick={() => {
                                                                setEditingUserEmail(null);
                                                                setFormData({ role: "", skills: "" }); // Clear form on cancel
                                                            }}
                                                            disabled={isUpdating}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    className="btn btn-info btn-sm"
                                                    onClick={() => handleEditClick(user)}
                                                >
                                                    Edit User
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            <div className="mt-8 p-4 bg-base-100 rounded-lg shadow-inner border border-base-300">
                <h3 className="text-xl font-bold text-info mb-3">Admin Quick Actions</h3>
                <div className="flex flex-wrap gap-4">
                    <button className="btn btn-outline btn-sm">Reset Cache</button>
                    <button className="btn btn-outline btn-sm">Backup Database</button>
                    <button className="btn btn-outline btn-sm">Deploy Updates</button>
                </div>
            </div>
        </motion.div>
    );
}