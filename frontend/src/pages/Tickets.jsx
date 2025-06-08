// frontend2/src/pages/Tickets.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlusSquare, FaTicketAlt, FaInfoCircle, FaCheckCircle, FaHourglassHalf, FaSpinner, FaCircle } from 'react-icons/fa';
import { useToast } from '../components/useToast';

// Assume your backend API URL is from .env
const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL;

// Framer Motion variants for staggered animation
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function Tickets() {
    const [form, setForm] = useState({ title: "", description: "" });
    const [tickets, setTickets] = useState([]);
    const [loadingTickets, setLoadingTickets] = useState(true);
    const [submittingTicket, setSubmittingTicket] = useState(false);
    const [error, setError] = useState(null);
    const showToast = useToast();
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    // const user = JSON.parse(localStorage.getItem('user'));

    // Inline function for capitalizing the first letter
    const capitalizeFirstLetter = (string) => {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    // Function to fetch tickets - wrapped in useCallback for useEffect dependency stability
    const fetchTickets = useCallback(async () => {
        setLoadingTickets(true);
        setError(null);

        if (!token) {
            showToast("Authentication required. Please log in.", "error");
            setLoadingTickets(false);
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/tickets`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    showToast("Session expired or unauthorized. Please log in again.", "error");
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to fetch tickets: ${response.statusText}`);
            }

            const data = await response.json();
            // FIX: Changed from data.tickets to data as per your console log
            setTickets(data || []);
        } catch (err) {
            console.error("Error fetching tickets:", err);
            setError(err.message);
            showToast(`Error fetching tickets: ${err.message}`, "error");
        } finally {
            setLoadingTickets(false);
        }
    }, [token, navigate, showToast]);

    // Effect to fetch tickets on component mount and when fetchTickets function changes
    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmittingTicket(true);

        if (!token) {
            showToast("Authentication required to create a ticket. Please log in.", "error");
            setSubmittingTicket(false);
            navigate('/login');
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/tickets`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (res.ok) {
                showToast("Ticket created successfully!", "success");
                setForm({ title: "", description: "" });
                fetchTickets(); // Re-fetch tickets to show the new one
            } else {
                showToast(data.message || "Ticket creation failed", "error");
            }
        } catch (err) {
            showToast("Network error, please try again.", "error");
            console.error("Error creating ticket:", err);
        } finally {
            setSubmittingTicket(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'TODO': return <div className="badge badge-info gap-2 text-xs font-semibold px-3 py-2"><FaInfoCircle /> {capitalizeFirstLetter(status)}</div>;
            case 'IN_PROGRESS': return <div className="badge badge-warning gap-2 text-xs font-semibold px-3 py-2"><FaHourglassHalf /> {capitalizeFirstLetter(status.replace('_', ' '))}</div>;
            case 'RESOLVED': return <div className="badge badge-success gap-2 text-xs font-semibold px-3 py-2"><FaCheckCircle /> {capitalizeFirstLetter(status)}</div>;
            case 'CLOSED': return <div className="badge badge-neutral gap-2 text-xs font-semibold px-3 py-2"><FaCircle /> {capitalizeFirstLetter(status)}</div>;
            default: return <div className="badge badge-info gap-2 text-xs font-semibold px-3 py-2"><FaCircle /> {capitalizeFirstLetter(status || 'Unknown')}</div>;
        }
    };

    const getPriorityBadgeClass = (priority) => {
        switch (priority) {
            case 'high': return 'badge-error';
            case 'medium': return 'badge-warning';
            case 'low': return 'badge-success';
            default: return 'badge-info';
        }
    };

    if (loadingTickets) {
        return (
            <div className="flex justify-center items-center h-64">
                <FaSpinner className="animate-spin text-primary text-4xl" />
                <p className="ml-3 text-lg">Loading tickets...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-error mt-4 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Error loading tickets: {error}</span>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 lg:p-8">
            <h2 className="text-3xl font-bold mb-6 text-center text-primary">
                <FaTicketAlt className="inline-block mr-2" /> Your Tickets
            </h2>

            {/* Create Ticket Section */}
            <div className="card bg-base-100 shadow-xl p-6 mb-10">
                <h3 className="card-title text-2xl mb-4">Create New Ticket</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Ticket Title</span>
                        </label>
                        <input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="Brief summary of the issue"
                            className="input input-bordered w-full"
                            required
                        />
                    </div>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Description</span>
                        </label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Provide detailed information about your issue"
                            className="textarea textarea-bordered w-full h-32"
                            required
                        ></textarea>
                    </div>
                    <div className="form-control mt-4">
                        <button
                            className="btn btn-primary w-full"
                            type="submit"
                            disabled={submittingTicket}
                        >
                            {submittingTicket ? (
                                <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                                "Submit New Ticket"
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* All Tickets Section */}
            <h2 className="text-2xl font-bold mb-6 text-center">All Submitted Tickets</h2>
            {tickets.length === 0 ? (
                <div className="md:col-span-2 lg:col-span-3 text-center py-10">
                    <div className="alert alert-info shadow-lg inline-flex">
                        <span>No tickets found. Start by creating a new one!</span>
                    </div>
                </div>
            ) : (
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {tickets.map((ticket) => (
                        <motion.div
                            key={ticket._id}
                            className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow duration-300 border border-base-300"
                            variants={itemVariants}
                            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                        >
                            <Link to={`/tickets/${ticket._id}`} className="card-body">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="card-title text-lg text-secondary">{ticket.title}</h3>
                                    {ticket.status && getStatusBadge(ticket.status)}
                                </div>
                                <p className="text-sm text-base-content line-clamp-2">{ticket.description}</p>
                                <div className="card-actions justify-end mt-4">
                                    {ticket.priority && (
                                        <div className={`badge ${getPriorityBadgeClass(ticket.priority)} badge-outline`}>
                                            {capitalizeFirstLetter(ticket.priority)} Priority
                                        </div>
                                    )}
                                    {/* Ensure assignedTo exists and has an email property before trying to split */}
                                    {ticket.assignedTo && ticket.assignedTo.email && (
                                        <div className="badge badge-ghost badge-outline">
                                            Assigned: {ticket.assignedTo.email.split('@')[0]}
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-2 text-right">
                                    Created: {new Date(ticket.createdAt).toLocaleString()}
                                </p>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}