import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "./useToast";

import { FaBars, FaSun, FaMoon, FaUserCircle, FaSignOutAlt, FaPlusSquare } from 'react-icons/fa';
import { MdAdminPanelSettings } from 'react-icons/md';

export default function Navbar({ onThemeToggle, currentTheme }) {
    const token = localStorage.getItem("token");
    let user = localStorage.getItem("user");
    const navigate = useNavigate();
    const showToast = useToast();

    if (user) {
        try {
            user = JSON.parse(user);
        }
        catch (e) {
            console.error("Failed to parse user data from localStorage", e);
            localStorage.removeItem("user");
            user = null;
        }
    }

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        showToast("Logged out successfully!", "success");
        navigate("/login");
    };
    const isDarkModeActive = currentTheme === 'dark'; return (
        <div className="navbar bg-base-200 shadow-lg px-4 sticky top-0 z-50">
            <div className="navbar-start">
                <div className="dropdown lg:hidden">
                    <div tabIndex={0} role="button" className="btn btn-ghost">
                        <FaBars className="h-5 w-5" />
                    </div>
                    <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                        <li><Link to="/">Tickets</Link></li>
                        {user && user?.role === "admin" && (
                            <li><Link to="/admin">Admin Panel</Link></li>
                        )}
                    </ul>
                </div>
                <Link to="/" className="btn btn-ghost text-xl normal-case">
                    Ticket AI
                </Link>
            </div>

            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1">
                    <li><Link to="/">Tickets</Link></li>
                    {user && user?.role === "admin" && (
                        <li><Link to="/admin">Admin Panel</Link></li>
                    )}
                </ul>
            </div>            <div className="navbar-end">
                <label className="swap swap-rotate btn btn-ghost btn-circle mr-2">
                    <input type="checkbox" onChange={onThemeToggle} checked={isDarkModeActive} />
                    <FaSun className="swap-on fill-current w-6 h-6" />
                    <FaMoon className="swap-off fill-current w-6 h-6" />
                </label>

                {!token ? (
                    <div className="flex gap-2">
                        <Link to="/signup" className="btn btn-primary btn-sm">
                            Signup
                        </Link>
                        <Link to="/login" className="btn btn-outline btn-sm">
                            Login
                        </Link>
                    </div>
                ) : (
                    <div className="dropdown dropdown-end">
                        <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                            <div className="w-10 rounded-full">
                                <img
                                    src={`https://www.gravatar.com/avatar/${user?.email ? btoa(user.email) : 'default'}?d=identicon`}
                                    alt="User Avatar"
                                />
                            </div>
                        </label>
                        <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                            <li>
                                <span className="justify-between text-base-content font-semibold px-4 py-2 cursor-default">
                                    <FaUserCircle className="inline-block mr-2" /> Hi, {user?.email}
                                </span>
                            </li>
                            {user && user?.role === "admin" && (
                                <li>
                                    <Link to="/admin" className="btn btn-ghost justify-start text-left normal-case">
                                        <MdAdminPanelSettings className="inline-block mr-2" /> Admin Panel
                                    </Link>
                                </li>
                            )}
                            <li>
                                <button onClick={logout} className="btn btn-ghost justify-start text-left normal-case">
                                    <FaSignOutAlt className="inline-block mr-2" /> Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}