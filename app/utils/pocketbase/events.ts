import { pb } from "./base";
import { Event, TicketType, CreateEventRequest } from "../../types/data-types";
import { RecordModel } from "pocketbase";

const EVENTS_COLLECTION_ID = "pbc_1687431684"; // User-provided ID for events
const TICKET_TYPES_COLLECTION_ID = "pbc_1324638565"; // ID from list_collections output

// Helper function to fetch related ticket types and calculate totals
async function enrichEventWithTicketData(eventRecord: RecordModel): Promise<Event> {
    let totalCapacity = 0;
    let ticketsSold = 0;
    let ticketTypes: TicketType[] = [];

    try {
        const ticketTypeRecords = await pb.collection(TICKET_TYPES_COLLECTION_ID).getFullList<TicketType>({
            filter: `event_id = "${eventRecord.id}"`,
        });
        
        ticketTypes = ticketTypeRecords.map(tt => ({
            id: tt.id,
            event_id: tt.event_id,
            name: tt.name,
            price: Number(tt.price) || 0,
            capacity: Number(tt.capacity) || 0,
            sold: Number(tt.sold) || 0,
            description: tt.description || null,
        }));

        ticketTypes.forEach(tt => {
            totalCapacity += tt.capacity;
            ticketsSold += tt.sold;
        });
    } catch (error) {
        console.error(`Error fetching ticket types for event ${eventRecord.id}:`, error);
    }

    return {
        id: eventRecord.id,
        name: eventRecord.name || "",
        description: eventRecord.description || "",
        date: eventRecord.date ? eventRecord.date.substring(0, 10) : "", 
        time: eventRecord.time || "",
        location: eventRecord.location || "",
        organizer_id: eventRecord.expand?.organizer_id?.username || eventRecord.organizer_id, 
        image_url: eventRecord.image_url || (eventRecord.image_url && eventRecord.collectionId && eventRecord.id ? pb.getFileUrl(eventRecord, eventRecord.image_url) : null),
        art_style: eventRecord.art_style || "",
        status: eventRecord.status || "unknown",
        created_at: eventRecord.created,
        ticketTypes: ticketTypes,
        totalCapacity: totalCapacity,
        ticketsSold: ticketsSold,
    };
}

export async function getAllEvents(): Promise<Event[]> {
    try {
        const records = await pb.collection(EVENTS_COLLECTION_ID).getFullList<RecordModel>({
            // sort: '-created', // Re-add if needed after fixing collection ID
            // expand: 'organizer_id', 
        });
        return Promise.all(records.map(enrichEventWithTicketData));
    } catch (error) {
        console.error(`PocketBase error fetching all events from ${EVENTS_COLLECTION_ID}:`, error);
        throw error;
    }
}

export async function getEventById(eventId: string): Promise<Event | null> {
    try {
        const record = await pb.collection(EVENTS_COLLECTION_ID).getOne<RecordModel>(eventId, {
             // expand: 'organizer_id', // Temporarily remove to isolate potential 400 error
        });
        return enrichEventWithTicketData(record);
    } catch (error: any) {
        if (error?.status === 404) {
             console.warn(`Event with ID ${eventId} not found in ${EVENTS_COLLECTION_ID}.`);
             return null; 
        }
        console.error(`PocketBase error fetching event ${eventId} from ${EVENTS_COLLECTION_ID}:`, error);
        throw error;
    }
}

export async function getOrganizerEvents(organizerId: string): Promise<Event[]> {
     try {
        const records = await pb.collection(EVENTS_COLLECTION_ID).getFullList<RecordModel>({
            filter: `organizer_id = "${organizerId}"`, 
            sort: '-created_at', // Correct sort field based on schema
            // expand: 'organizer_id', // Remove expand as organizer_id is currently a text field
        });
        return Promise.all(records.map(enrichEventWithTicketData));
    } catch (error) {
        console.error(`PocketBase error fetching events for organizer ${organizerId} from ${EVENTS_COLLECTION_ID}:`, error);
        throw error;
    }
}

export async function createEvent(request: CreateEventRequest, organizerId: string): Promise<string> {
    let newEventId = "";
    try {
        const eventData = {
            name: request.name,
            description: request.description,
            date: request.date,
            time: request.time,
            location: request.location,
            image_url: request.image_url, 
            art_style: request.art_style,
            organizer_id: organizerId,
            status: 'active', 
        };
        
        const newEvent = await pb.collection(EVENTS_COLLECTION_ID).create<RecordModel>(eventData);
        newEventId = newEvent.id;

        if (request.ticketTypes && request.ticketTypes.length > 0) {
            for (const tt of request.ticketTypes) {
                const ticketTypeData = {
                    event_id: newEventId,
                    name: tt.name,
                    price: tt.price,
                    capacity: tt.capacity,
                    sold: 0,
                    description: tt.description,
                };
                await pb.collection(TICKET_TYPES_COLLECTION_ID).create(ticketTypeData);
            }
        }
        return newEventId;
    } catch (error) {
        console.error(`PocketBase error creating event in ${EVENTS_COLLECTION_ID}:`, error);
        if (newEventId) {
            try {
                await pb.collection(EVENTS_COLLECTION_ID).delete(newEventId);
            } catch (cleanupError) {
                console.error(`Failed to delete orphaned event ${newEventId} from ${EVENTS_COLLECTION_ID}:`, cleanupError);
            }
        }
        throw error;
    }
}
