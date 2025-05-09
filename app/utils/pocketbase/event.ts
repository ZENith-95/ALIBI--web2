import { pb } from "./base";
import { Event as EventType } from "../../types/data-types";
export async function getAllEvents() {
    const events = await pb.collection('events').getFullList(200, {
        sort: '-created',
        expand: "event_type",
    });
    console.log("Events fetched:", events);

    return events;
}


export async function getEventByUser(userId: string) {
    const events = await pb.collection("events").getList(1, 500, {
        filter: `events.user_id = ${userId}`
    })
    return events.items

}
export async function getEventById(id: string) {
    const event = await pb.collection('events').getOne(id, {
        expand: "event_type",
    });
    console.log("EventType fetched:", event);
    return event;
}
export async function createEvent(eventData: any) {
    const event = await pb.collection('events').create(eventData);
    console.log("EventType created:", event);
    return event as unknown as EventType;
}
export async function updateEvent(id: string, eventData: any) {
    const event = await pb.collection('events').update(id, eventData);
    console.log("EventType updated:", event);
    return event;
}
export async function deleteEvent(id: string) {
    const event = await pb.collection('events').delete(id);
    console.log("EventType deleted:", event);
    return event;
}