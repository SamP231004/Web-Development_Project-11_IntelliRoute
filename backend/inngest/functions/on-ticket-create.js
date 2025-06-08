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

            // Fetch Ticket from DB
            const ticket = await step.run("fetch-ticket", async () => {
                const ticketObject = await Ticket.findById(ticketId);
                // FIX: Corrected variable name from 'ticket' to 'ticketObject'
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
                    // Check if aiResponse.relatedSkills is an array before using .includes()
                    // and ensure aiResponse.helpfulNotes is defined.
                    await Ticket.findByIdAndUpdate(ticket._id, {
                        priority: !["low", "medium", "high"].includes(aiResponse.priority)
                            ? "medium"
                            : aiResponse.priority,
                        helpfulNotes: aiResponse.helpfulNotes || "No helpful notes provided by AI.", // Added fallback for helpfulNotes
                        status: "IN_PROGRESS",
                        relatedSkills: aiResponse.relatedSkills || [], // Ensure it's an array
                    });
                    skills = aiResponse.relatedSkills || [];
                }
                return skills;
            });

            const moderator = await step.run("assign-moderator", async () => {
                let user = null; // Initialize user to null

                // Only attempt to find a skilled moderator if relatedskills are present
                if (relatedskills && relatedskills.length > 0) {
                    user = await User.findOne({
                        role: "moderator",
                        skills: {
                            $elemMatch: {
                                // Join only if relatedskills has elements, otherwise regex might be invalid
                                $regex: relatedskills.join("|"),
                                $options: "i",
                            },
                        },
                    });
                }
                
                if (!user) {
                    // Fallback to finding an admin if no skilled moderator or no skills to match
                    user = await User.findOne({
                        role: "admin",
                    });
                }

                await Ticket.findByIdAndUpdate(ticket._id, {
                    assignedTo: user?._id || null,
                });
                return user;
            });

            // FIX: Corrected typo from 'setp.run' to 'step.run'
            await step.run("send-email-notification", async () => {
                if (moderator) {
                    const finalTicket = await Ticket.findById(ticket._id);
                    // Ensure finalTicket exists before sending email
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