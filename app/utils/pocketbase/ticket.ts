import { pb } from "./base";
import { Ticket, TicketType, MintTicketRequest } from "../../types/data-types"; // Import relevant types
import { RecordModel } from "pocketbase";

const TICKETS_COLLECTION_ID = "pbc_2696138989";
const TICKET_TYPES_COLLECTION_ID = "pbc_1324638565";

// Function to mint (create) a new ticket
export async function mintTicket(request: MintTicketRequest, ownerId: string): Promise<string> {
    let createdTicketId = "";
    try {
        // 1. Fetch the ticket type to check capacity and get details
        const ticketType = await pb.collection(TICKET_TYPES_COLLECTION_ID).getOne<TicketType>(request.ticket_type_id);

        if (!ticketType) {
            throw new Error(`Ticket type ${request.ticket_type_id} not found.`);
        }
        if (ticketType.event_id !== request.event_id) {
             throw new Error(`Ticket type does not belong to event ${request.event_id}.`);
        }
        if (ticketType.sold >= ticketType.capacity) {
            throw new Error(`Tickets for ${ticketType.name} are sold out.`);
        }

        // 2. Create the ticket record
        const ticketData = {
            event_id: request.event_id,
            ticket_type_id: request.ticket_type_id,
            owner_id: ownerId,
            is_used: false,
            minted_at: new Date().toISOString(), // Add minted_at
            metadata: { 
                ticket_name: ticketType.name,
            } 
        };
        const newTicket = await pb.collection(TICKETS_COLLECTION_ID).create<Ticket>(ticketData);
        createdTicketId = newTicket.id;

        // 3. Increment the 'sold' count on the ticket type
        await pb.collection(TICKET_TYPES_COLLECTION_ID).update(request.ticket_type_id, {
            sold: ticketType.sold + 1,
        });

        return createdTicketId;

    } catch (error) {
        console.error("PocketBase error minting ticket:", error);
        throw error; 
    }
}

// Function to get tickets owned by a specific user
export async function getUserTickets(userId: string): Promise<Ticket[]> {
    try {
        const records = await pb.collection(TICKETS_COLLECTION_ID).getFullList<Ticket>({
            filter: `owner_id = "${userId}"`,
            sort: '-minted_at', // Sort by minted date (assuming minted_at exists)
            // expand: 'event_id,ticket_type_id' 
            requestKey: null, // Prevent auto-cancellation
        });
        return records;
    } catch (error) {
        console.error(`PocketBase error fetching tickets for user ${userId}:`, error);
        throw error;
    }
}

// Function to verify a ticket (mark as used)
export async function verifyTicket(ticketId: string): Promise<boolean> {
     try {
        const ticket = await pb.collection(TICKETS_COLLECTION_ID).getOne<Ticket>(ticketId);

        if (ticket.is_used) {
            console.log(`Ticket ${ticketId} already used.`);
            return false; 
        }

        await pb.collection(TICKETS_COLLECTION_ID).update(ticketId, {
            is_used: true,
        });

        console.log(`Ticket ${ticketId} successfully verified and marked as used.`);
        return true; 

    } catch (error: any) {
         if (error?.status === 404) {
             console.warn(`Ticket ${ticketId} not found for verification.`);
             throw new Error(`Ticket ${ticketId} not found.`); 
         }
        console.error(`PocketBase error verifying ticket ${ticketId}:`, error);
        throw error; 
    }
}
