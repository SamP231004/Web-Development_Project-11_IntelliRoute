import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { useToast } from "../components/useToast";
import { FaSpinner, FaInfoCircle, FaHourglassHalf, FaCheckCircle, FaCircle } from 'react-icons/fa';

export default function TicketDetailsPage() {
    const { id } = useParams();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const showToast = useToast();
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    const capitalizeFirstLetter = (string) => {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    const fetchTicket = useCallback(async () => {
        setLoading(true);
        if (!token) {
            showToast("Authentication required. Please log in.", "error");
            setLoading(false);
            navigate('/login');
            return;
        }

        try {
            const requestUrl = `${import.meta.env.VITE_BACKEND_API_URL}/tickets/${id}`;
            console.log("Frontend fetching from URL:", requestUrl); 

            const res = await fetch(
                requestUrl,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!res.ok) {
                const errorText = await res.text();
                console.error(`Fetch failed with status ${res.status}:`, errorText);
                showToast(`Error: ${res.statusText || 'Failed to fetch ticket details'}`, "error");

                if (res.status === 404 || res.status === 401 || res.status === 403) {
                    navigate('/tickets');
                }
                setLoading(false);
                return;
            }

            const data = await res.json();
            console.log("Ticket data received:", data);
            setTicket(data.ticket);
        } 
        catch (err) {
            showToast("Something went wrong fetching ticket details. Please check console.", "error");
            console.error("Fetch error:", err);
        } 
        finally {
            setLoading(false);
        }
    }, [id, token, showToast, navigate]);

    useEffect(() => {
        fetchTicket();
    }, [fetchTicket]);

    const getStatusBadge = (status) => {
        let badgeClass = "badge-info";
        let Icon = FaCircle;

        switch (status) {
            case "IN_PROGRESS":
                badgeClass = "badge-warning";
                Icon = FaHourglassHalf;
                break;
            case "ASSIGNED":
                badgeClass = "badge-success";
                Icon = FaCheckCircle;
                break;
            case "CLOSED":
                badgeClass = "badge-neutral";
                Icon = FaCircle;
                break;
            case "TODO":
                badgeClass = "badge-info";
                Icon = FaInfoCircle;
                break;
            default:
                badgeClass = "badge-info";
                Icon = FaCircle;
        }
        return (
            <span className={`badge ${badgeClass} text-xs font-semibold px-3 py-2 gap-2`}>
                <Icon /> {capitalizeFirstLetter(status.replace('_', ' '))}
            </span>
        );
    };

    const getPriorityBadgeClass = (priority) => {
        switch (priority) {
            case "high": return "badge-error";
            case "medium": return "badge-warning";
            case "low": return "badge-success";
            default: return "badge-info";
        }
    };

    if (loading)
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <p className="ml-4 text-lg">Loading ticket details...</p>
            </div>
        );
    if (!ticket)
        return (
            <div className="text-center mt-10 p-4">
                <div className="alert alert-warning shadow-lg max-w-md mx-auto">
                    <span>Ticket not found or you don't have access.</span>
                </div>
            </div>
        );

    return (
        <div className="container mx-auto p-4 lg:p-8">
            <h2 className="text-3xl font-bold mb-6 text-center">Ticket Details</h2>

            <div className="card bg-base-100 shadow-xl p-6 space-y-5">
                <h3 className="text-2xl font-semibold text-primary">{ticket.title}</h3>                <p className="text-base-content leading-relaxed">{ticket.description}</p>

                <div className="divider text-lg text-gray-500">AI Analysis & Status</div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="stat">
                        <div className="stat-title">Status</div>
                        <div className="stat-value text-xl">
                            {ticket.status && getStatusBadge(ticket.status)}
                        </div>
                    </div>

                    {ticket.priority && (
                        <div className="stat">
                            <div className="stat-title">Priority</div>
                            <div className="stat-value text-xl">
                                <span className={`badge ${getPriorityBadgeClass(ticket.priority)}`}>
                                    {capitalizeFirstLetter(ticket.priority)}
                                </span>
                            </div>
                        </div>
                    )}                    {ticket.assignedTo && (
                        <div className="stat">
                            <div className="stat-title">Assigned To</div>
                            <div className="stat-value text-xl text-info">
                                {ticket.assignedTo?.email || 'Not Assigned'}
                            </div>
                        </div>
                    )}
                </div>

                {ticket.relatedSkills?.length > 0 && (
                    <div className="py-2">
                        <strong className="block text-gray-600 mb-2">Related Skills:</strong>
                        <div className="flex flex-wrap gap-2">
                            {ticket.relatedSkills.map((skill, idx) => (
                                <div key={idx} className="badge badge-accent badge-outline">
                                    {skill}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {ticket.helpfulNotes && (
                    <div>
                        <strong className="block text-gray-600 mb-2">Helpful Notes:</strong>
                        <div className="prose prose-sm max-w-none bg-base-200 p-4 rounded-lg shadow-inner">
                            <ReactMarkdown>{ticket.helpfulNotes}</ReactMarkdown>
                        </div>
                    </div>
                )}

                {ticket.createdAt && (
                    <p className="text-sm text-gray-500 text-right mt-4">
                        Created At: {new Date(ticket.createdAt).toLocaleDateString('en-GB')}
                    </p>
                )}
            </div>
        </div>
    );
}