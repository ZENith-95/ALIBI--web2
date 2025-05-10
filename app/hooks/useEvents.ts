import { persist } from "zustand/middleware";
import { Event as EventType } from "../types/data-types";
import { create } from "zustand";
import { CreateEventRequest } from "../types/data-types";
import {
  createEvent as createEventUtil, // Alias to avoid conflict with action name
  getAllEvents,
  getEventById,
  getOrganizerEvents, // Use the consolidated and correctly named function
} from "../utils/pocketbase/events"; // Use plural 'events.ts'

interface EventState {
  events: EventType[];
  loading: boolean;
  error: string | null;
}

interface EventActions {
  fetchEvents: () => Promise<void>;
  fetchEventById: (id: string) => Promise<EventType | null>; // Updated return type
  createEvent: (eventData: CreateEventRequest, organizerId: string) => Promise<string | undefined>; // Updated params and return type
  fetchOrganizerEvents: (userId: string) => Promise<void>; // Renamed and updated param type
}
const initialState: EventState = {
  events: [],
  loading: false,
  error: null,
};
const useEventStore = create<EventState & EventActions>()(
  persist(
    (set) => ({
      ...initialState,
      fetchEvents: async () => {
        set({ loading: true });
        try {
          const events = (await getAllEvents()) as EventType[];
          set({ events, loading: false, error: null });
        } catch (error) {
          console.error("Error fetching events:", error);
          set({ loading: false, error: "Failed to fetch events." });
        }
      },
      fetchOrganizerEvents: async (userId: string) => { // Renamed and typed userId
        set({ loading: true, error: null });
        try {
          const events = await getOrganizerEvents(userId); // Use imported getOrganizerEvents
          set({ events: events, loading: false });
        } catch (error: any) { // Catch specific error type if known, else any
          console.error("Error fetching organizer events:", error);
          set({ error: error.message || "Failed to fetch organizer events.", loading: false });
        }
      },
      fetchEventById: async (id: string): Promise<EventType | null> => { // Implement and return
        set({ loading: true, error: null });
        try {
          const event = await getEventById(id); // Use imported getEventById
          set({ loading: false }); // Only set loading, event is returned
          return event; 
        } catch (error: any) {
          console.error("Error fetching event by ID:", error);
          set({ loading: false, error: error.message || "Failed to fetch event." });
          return null;
        }
      },
      createEvent: async (eventData: CreateEventRequest, organizerId: string): Promise<string | undefined> => {
        set({ loading: true, error: null });
        try {
          const newEventId = await createEventUtil(eventData, organizerId); // Use aliased util and pass organizerId
          if (newEventId) {
            // Optionally, fetch the new event and add it to the store, or trigger a refetch of all events
            // For simplicity here, we'll assume the component might trigger a refetch or handle it.
            // Or, fetch the new event:
            const newEvent = await getEventById(newEventId);
            if (newEvent) {
              set((state) => ({
                events: [...state.events, newEvent],
                loading: false,
              }));
            } else {
               // If fetching the new event fails, at least stop loading
               set({loading: false});
            }
          } else {
             set({loading: false});
          }
          return newEventId;
        } catch (error: any) {
          console.error("Error creating event:", error);
          set({ loading: false, error: error.message || "Failed to create event." });
          return undefined;
        }
      },
    }),
    {
      name: "event-storage", // unique name
    }
  )
);
export default useEventStore;
