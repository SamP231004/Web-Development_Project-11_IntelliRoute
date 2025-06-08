import { inngest } from '../inngest/client.js'
import Ticket from '../models/ticket.js'

export const createTicket = async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title || !description) {
            return res
                .status(400)
                .json({ message: "Title ans description are required." });
        }
        const newTicket = Ticket.create({
            title,
            description,
            createdBy: req.user._id.toString(),
        });

        await inngest.send({
            name: "ticket/created",
            data: {
                ticketId: (await newTicket)._id.toString(),
                title,
                description,
                createdBy: req.user._id.toString(),
            },
        });
        return res
            .status(201)
        json({
            message: "Ticket created and processing started",
            ticket: newTicket,
        });
    }
    catch (error) {
        console.error("Error creating ticket", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getTickets = async (req, res) => {
    try {
        const user = req.user;
        let tickets;
        if (user.role !== "user") {
            tickets = await Ticket.find({})
                .populate("assignedTo", ["email", "_id"])
                .sort({ createdAt: -1 })
                .lean()
        }
        else {
            tickets = await Ticket.find({ createdBy: user._id })
                .select("title description status createdAt priority helpfulNotes relatedSkills assignedTo")
                .populate("assignedTo", ["email", "_id"])
                .sort({ createdAt: -1 })
                .lean();
        }
        return res
            .status(200)
            .json(tickets);
    }
    catch (error) {
        console.error("Error fetching tickets", error.message);
        return res
            .status(500)
            .json({ message: "Internal Server Error" });
    }
};

export const getTicket = async (req, res) => {
    try {
        const user = req.user;
        let ticket;

        if (user.role !== "user") {
            ticket = await Ticket
                .findById(req.params.id)
                .populate("assignedTo", ["email", "_id"]);
        }
        else {
            ticket = await Ticket.findOne({
                createdBy: user._id,
                _id: req.params.id,
            }).select("title description status createdAt priority helpfulNotes relatedSkills assignedTo")
                .populate("assignedTo", ["email", "_id"]);
        }

        if (!ticket) {
            return res
                .status(404)
                .json({ message: "Ticket not found" });
        }

        return res
            .status(200)
            .json({ ticket });
    }
    catch (error) {
        console.error("Error fetching ticket:", error.message);
        if (error.name === 'CastError') {
            return res
                .status(400)
                .json({ message: "Invalid Ticket ID format." });
        }
        return res
            .status(500)
            .json({ message: "Internal Server Error" });
    }
};

export const updateTicket = async (req, res) => {
    const { id } = req.params;
    const { status, ...updateData } = req.body;

    try {
        const oldTicket = await Ticket.findById(id);
        if (!oldTicket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        if (oldTicket.status === 'IN_PROGRESS' && status && status !== 'IN_PROGRESS') {
            const updatedTicket = await Ticket.findByIdAndUpdate(
                id,
                { status, ...updateData },
                { new: true, runValidators: true }
            ).populate("assignedTo", ["email", "_id"]);

            if (!updatedTicket) {
                return res
                    .status(404)
                    .json({ message: 'Ticket not found after update attempt' });
            }

            await inngest.send({
                name: "ticket/status.changed",
                data: {
                    ticketId: updatedTicket._id.toString(),
                    oldStatus: oldTicket.status,
                    newStatus: updatedTicket.status,
                    userId: req.user?._id.toString()
                }
            });

            return res
                .status(200)
                .json(updatedTicket);
        }
        else {
            const updatedTicket = await Ticket.findByIdAndUpdate(
                id,
                { status, ...updateData },
                { new: true, runValidators: true }
            ).populate("assignedTo", ["email", "_id"]);
            return res
                .status(200)
                .json(updatedTicket);
        }

    }
    catch (error) {
        console.error('Error updating ticket:', error);
        res
            .status(500)
            .json({ message: 'Failed to update ticket', error: error.message });
    }
};