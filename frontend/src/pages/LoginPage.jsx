import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../components/useToast";
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL;

const defaultCredentials = {
    user: {
        email: "testuser@example.com",
        password: "password123",
    },
    moderator: {
        email: "moderator@example.com",
        password: "password123",
    },
    admin: {
        email: "admin@example.com",
        password: "adminpassword",
    },
};

export default function LoginPage() {
    const [selectedRole, setSelectedRole] = useState('user'); 
    
    const [form, setForm] = useState(defaultCredentials[selectedRole]); 
    
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const showToast = useToast();

    useEffect(() => {
        setForm(defaultCredentials[selectedRole]);
    }, [selectedRole]); 

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRoleChange = (e) => {
        const newRole = e.target.value;
        setSelectedRole(newRole);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                showToast("Login successful!", "success");
                navigate("/");
            } 
            else {
                showToast(data.message || "Login failed", "error");
            }
        } 
        catch (err) {
            showToast("Network error. Please check your connection and try again.", "error");
            console.error("Login Error:", err);
        } 
        finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
            <div className="hero-content flex-col lg:flex-row-reverse w-full max-w-2xl">
                <div className="text-center lg:text-left lg:w-1/2 p-4">
                    <h1 className="text-5xl font-bold text-primary">Login Now!</h1>
                    <p className="py-6 text-lg">Access your personalized ticket management dashboard. Log in to create, track, and resolve issues efficiently.</p>
                </div>
                <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100 lg:w-1/2">                    <form onSubmit={handleLogin} className="card-body">
                        <h2 className="card-title text-3xl font-bold justify-center mb-6">Login</h2>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Select Role</span>
                            </label>
                            <select
                                name="role"
                                className="select select-bordered w-full"
                                value={selectedRole}
                                onChange={handleRoleChange}
                            >
                                <option value="user">User</option>
                                <option value="moderator">Moderator</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Email</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="email@example.com"
                                className="input input-bordered w-full"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Password</span>
                            </label>                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="password"
                                    className="input input-bordered w-full pr-10"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                />
                                <span
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                    onClick={togglePasswordVisibility}
                                >
                                    {showPassword ? <FaEyeSlash className="h-5 w-5 text-gray-500" /> : <FaEye className="h-5 w-5 text-gray-500" />}
                                </span>
                            </div>
                            <label className="label">
                                <a href="#" className="label-text-alt link link-hover">Forgot password?</a>
                            </label>
                        </div>

                        <div className="form-control mt-6">
                            <button
                                type="submit"
                                className="btn btn-primary w-full"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="loading loading-spinner loading-sm"></span>
                                ) : (
                                    "Login"
                                )}
                            </button>
                        </div>
                        <p className="text-center text-sm mt-4">
                            Don't have an account?{" "}
                            <Link to="/signup" className="link link-primary">
                                Sign Up
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}