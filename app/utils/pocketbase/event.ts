import { pb } from "./base";

export async function getAllEvents() {
    const events = await pb.collection('events').getFullList(200, {
        sort: '-created',
        expand: "event_type",
    });
    console.log("Events fetched:", events);

    return events;
}


export async function getEventById(id: string) {
    const event = await pb.collection('events').getOne(id, {
        expand: "event_type",
    });
    console.log("Event fetched:", event);
    return event;
}
export async function createEvent(eventData: any) {
    const event = await pb.collection('events').create(eventData);
    console.log("Event created:", event);
    return event as unknown as Event;
}
export async function updateEvent(id: string, eventData: any) {
    const event = await pb.collection('events').update(id, eventData);
    console.log("Event updated:", event);
    return event;
}
export async function deleteEvent(id: string) {
    const event = await pb.collection('events').delete(id);
    console.log("Event deleted:", event);
    return event;
}