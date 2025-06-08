import { Inngest } from "inngest";
import { onTicketCreated } from "./functions/on-ticket-create";
import { onTicketStatusChanged } from "./functions/onTicketStatusChanged";

export const inngest = new Inngest({
    name: "My App",
    schemas: {
        "ticket/created": {
            data: {
                ticketId: "string",
            },
        },
        "ticket/status.changed": {
            data: {
                ticketId: "string",
                oldStatus: "string",
                newStatus: "string",
                userId: "string",
            },
        },
    },
});

export const functions = [
    onTicketCreated,
    onTicketStatusChanged,
];