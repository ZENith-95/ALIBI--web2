import { persist } from "zustand/middleware";
import { Event as EventType } from "../types/data-types";
import { create } from 'zustand';
import { CreateEventRequest } from '../types/data-types';
import { createEvent, getAllEvents, getEventById, getEventByUser } from '../utils/pocketbase/event';

interface EventState {
    events: EventType[];
    loading: boolean;
    error: string | null;
}


interface EventActions {
    fetchEvents: () => Promise<void>;
    fetchEventById: (id: string) => Promise<void>;
    createEvent: (eventData: CreateEventRequest) => Promise<void>;
    eventsByCreator: (eventId: string) => Promise<void>;
}
const initialState: EventState = {
    events: [],
    loading: false,
    error: null,
};
const useEventStore = create<EventState & EventActions>()(persist((set) => ({
    ...initialState,
    fetchEvents: async () => {
        set({ loading: true });
        try {
            const events = await getAllEvents() as EventType[];
            set({ events, loading: false, error: null });
        } catch (error) {
            console.error("Error fetching events:", error);
            set({ loading: false, error: "Failed to fetch events." });
        }
    },
    eventsByCreator: async (userId) => {
        set({ loading: true })
        try {
            const events = await getEventByUser(userId)
            set({ events: events })
        } catch (e) {
            const error = e as Error
            set({ error: error.toString(), loading: false })
        }
    },
    fetchEventById: async (id: string) => {
        set({ loading: true });
        try {
            // const event = await getEventById(id);
            // set({ events: [event], loading: false, error: null });
        }
        catch (error) {
            console.error("Error fetching event by ID:", error);
            set({ loading: false, error: "Failed to fetch event." });
        }
    },
    createEvent: async (eventData: CreateEventRequest) => {
        set({ loading: true });
        try {
            const event = await createEvent(eventData);
            set((state) => ({
                events: [...state.events, event],
                loading: false,
                error: null,
            }));
            // set((state) => ({ events: [...state.events, event], loading: false, error: null }));
        } catch (error) {
            console.error("Error creating event:", error);
            set({ loading: false, error: "Failed to create event." });
        }
    }
}), {
    name: "event-storage", // unique name
}));
export default useEventStore;