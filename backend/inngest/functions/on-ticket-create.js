import { inngest } from "../client.js";
import Ticket from "../../models/ticket.js";
import User from "../../models/user.js";
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utils/mailer.js";
import analyzeTicket from "../../utils/ai.js";

export const onTicketCreated = inngest.createFunction(
    { id: "on-ticket-created", retries: 2 },
    { event: "ticket/created" },
    async ({ event, step }) => {
        try {
            const { ticketId } = event.data;

            const ticket = await step.run("fetch-ticket", async () => {
                const ticketObject = await Ticket.findById(ticketId);
                if (!ticketObject) {
                    throw new NonRetriableError("Ticket not found");
                }
                return ticketObject;
            });

            await step.run("update-ticket-status", async () => {
                await Ticket.findByIdAndUpdate(ticket._id, { status: "TODO" });
            });

            const aiResponse = await analyzeTicket(ticket);

            const relatedskills = await step.run("ai-processing", async () => {
                let skills = [];
                if (aiResponse) {
                    await Ticket.findByIdAndUpdate(ticket._id, {
                        priority: !["low", "medium", "high"].includes(aiResponse.priority)
                            ? "medium"
                            : aiResponse.priority,
                        helpfulNotes: aiResponse.helpfulNotes || "No helpful notes provided by AI.",
                        status: "IN_PROGRESS",
                        relatedSkills: aiResponse.relatedSkills || [],
                    });
                    skills = aiResponse.relatedSkills || [];
                }
                return skills;
            });

            const moderator = await step.run("assign-moderator", async () => {
                let user = null;

                if (relatedskills && relatedskills.length > 0) {
                    user = await User.findOne({
                        role: "moderator",
                        skills: {
                            $elemMatch: {
                                $regex: relatedskills.join("|"),
                                $options: "i",
                            },
                        },
                    });
                }
                if (!user) {
                    user = await User.findOne({
                        role: "admin",
                    });
                } await Ticket.findByIdAndUpdate(ticket._id, {
                    assignedTo: user?._id || null,
                    status: "ASSIGNED"
                });
                return user;
            });

            await step.run("send-email-notification", async () => {
                if (moderator) {
                    const finalTicket = await Ticket.findById(ticket._id);
                    if (finalTicket) {
                        await sendMail(
                            moderator.email,
                            "Ticket Assigned",
                            `A new ticket is assigned to you: ${finalTicket.title}\n\nDescription: ${finalTicket.description}\n\nPriority: ${finalTicket.priority || 'N/A'}\nStatus: ${finalTicket.status}`
                        );
                    } 
                    else {
                        console.warn(`Ticket ${ticket._id} not found for email notification.`);
                    }
                } 
                else {
                    console.log("No moderator assigned, skipping email notification.");
                }
            });

            return { success: true };
        } 
        catch (err) {
            console.error("❌ Error running the step", err.message);
            return { success: false, error: err.message };
        }
    }
);