import { inngest } from "../client.js";
import Ticket from "../../models/ticket.js";
import User from "../../models/user.js";
import { NonRetriableError } from "inngest";

export const onTicketStatusChanged = inngest.createFunction(
    { id: "on-ticket-status-changed", retries: 2 },
    { event: "ticket/status.changed" },
    async ({ event, step }) => {
        try {
            const { ticketId, oldStatus, newStatus, userId } = event.data;

            if (oldStatus !== 'IN_PROGRESS' || newStatus === 'IN_PROGRESS') {
                console.log(`Ticket status change from ${oldStatus} to ${newStatus} is not from IN_PROGRESS. Skipping.`);
                return { skipped: true, reason: "Status change not from IN_PROGRESS to another status" };
            }

            const ticket = await step.run("fetch-ticket", async () => {
                const fetchedTicket = await Ticket.findById(ticketId);
                if (!fetchedTicket) {
                    throw new NonRetriableError("Ticket not found for status change notification.");
                }
                return fetchedTicket;
            });

            const ticketCreator = await step.run("fetch-ticket-creator", async () => {
                if (!ticket.createdBy) {
                    console.warn(`Ticket ${ticketId} has no creator. Skipping notification.`);
                    return null;
                }
                const creator = await User.findById(ticket.createdBy);
                if (!creator) {
                    console.warn(`Creator user not found for ticket ${ticketId}. Skipping notification.`);
                }
                return creator;
            });

            await step.run("notify-ticket-creator", async () => {
                if (ticketCreator) {
                    console.log(
                        `--- TICKET STATUS CHANGE NOTIFICATION (for ${ticketCreator.email || 'N/A'}) ---\n` +
                        `Ticket: "${ticket.title}" (ID: ${ticket._id})\n` +
                        `Old Status: ${oldStatus}\n` +
                        `New Status: ${newStatus}\n` +
                        `Description: ${ticket.description}\n` +
                        `Priority: ${ticket.priority || 'N/A'}\n` +
                        `--------------------------------------------------`
                    );
                } 
                else {
                    console.log(`No ticket creator to send notification for ticket ${ticketId}.`);
                }
            });

            return { 
                success: true, 
                message: `Ticket ${ticketId} status changed from ${oldStatus} to ${newStatus}. Creator processing for notification.`
            };

        } 
        catch (err) {
            console.error("❌ Error in onTicketStatusChanged function:", err.message);
            if (err instanceof NonRetriableError) {
                return { success: false, error: err.message, retriable: false };
            }
            throw err;
        }
    }
);