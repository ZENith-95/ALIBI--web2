import { supabase } from './supabase';
import { PostgrestError } from '@supabase/supabase-js';

// Types (adapted for Supabase)
export interface Event {
  id: string; // Supabase uses UUID for IDs
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer_id: string; // Link to auth.users table
  image_url: string | null;
  art_style: string;
  ticketTypes: TicketType[]; // Joined from ticket_types table
  totalCapacity: number; // Calculate from ticketTypes
  ticketsSold: number; // Calculate from ticketTypes
  status: string; // e.g., 'active', 'cancelled'
  created_at: string; // ISO timestamp string
}

export interface TicketType {
  id: string; // Supabase uses UUID for IDs
  event_id: string; // Foreign key
  name: string;
  price: number; // Use number for currency
  capacity: number;
  sold: number;
  description: string | null;
}

export interface Ticket {
  id: string; // Supabase uses UUID for IDs
  event_id: string; // Foreign key
  ticket_type_id: string; // Foreign key
  owner_id: string; // Foreign key referencing auth.users
  is_used: boolean;
  metadata: any; // JSONB type in Supabase
  minted_at: string; // ISO timestamp string
}

export interface Profile {
  id: string; // Foreign key referencing auth.users
  username: string;
  bio: string | null;
  created_at: string; // ISO timestamp string
}

export interface CreateEventRequest {
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image_url: string | null;
  art_style: string;
  ticketTypes: {
    name: string;
    price: number;
    capacity: number;
    description: string | null;
  }[];
}

export interface MintTicketRequest {
  event_id: string;
  ticket_type_id: string;
}

export type Result<T, E> = { data: T } | { error: E };

export type Error =
  | { type: 'NotFound' }
  | { type: 'AlreadyExists' }
  | { type: 'NotAuthorized' }
  | { type: 'SoldOut' }
  | { type: 'InvalidInput' }
  | { type: 'CannotModify' }
  | { type: 'SystemError', details?: string };


// API implementation that connects to Supabase
export class SupabaseApi {

  private async handleResponse<T>(
    response: { data: T | null; error: PostgrestError | null },
    notFoundError: Error,
    systemErrorDetails?: string
  ): Promise<Result<T, Error>> {
    if (response.error) {
      console.error('Supabase error:', response.error);
      // Map Supabase errors to our custom Error type
      if (response.error.code === 'PGRST(404)') { // Example error code for not found
         return { error: notFoundError };
      }
      // Add more specific error mappings as needed
      return { error: { type: 'SystemError', details: response.error.message || systemErrorDetails } };
    }
    if (response.data === null) {
       return { error: notFoundError };
    }
    return { data: response.data };
  }

  async getAllEvents(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*, ticket_types(*)') // Join with ticket_types
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all events:', error);
      return [];
    }

    return data.map(this.mapSupabaseEventToFrontend);
  }

  async getEvent(eventId: string): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .select('*, ticket_types(*)')
      .eq('id', eventId)
      .single(); // Expecting a single result

    if (error) {
      console.error(`Error fetching event with ID ${eventId}:`, error);
      return null;
    }

    return this.mapSupabaseEventToFrontend(data);
  }

  async getOrganizerEvents(organizerId: string): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*, ticket_types(*)')
      .eq('organizer_id', organizerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching events for organizer ${organizerId}:`, error);
      return [];
    }

    return data.map(this.mapSupabaseEventToFrontend);
  }

  async createEvent(request: CreateEventRequest): Promise<Result<string, Error>> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      return { error: { type: 'NotAuthorized' } };
    }

    const { data, error } = await supabase
      .from('events')
      .insert({
        name: request.name,
        description: request.description,
        date: request.date,
        time: request.time,
        location: request.location,
        image_url: request.image_url,
        art_style: request.art_style, // Corrected field name
        organizer_id: user.data.user.id,
        status: 'active', // Default status
      })
      .select('id') // Select the newly created event's ID
      .single();

    if (error) {
      console.error('Error creating event:', error);
      return { error: { type: 'SystemError', details: error.message } };
    }

    const newEventId = data.id;

    // Insert ticket types
    const ticketTypesToInsert = request.ticketTypes.map(tt => ({
      event_id: newEventId,
      name: tt.name,
      price: tt.price,
      capacity: tt.capacity,
      sold: 0, // Initially 0 sold
      description: tt.description,
    }));

    const { error: ticketTypesError } = await supabase
      .from('ticket_types')
      .insert(ticketTypesToInsert);

    if (ticketTypesError) {
      console.error('Error creating ticket types:', ticketTypesError);
      // Consider rolling back event creation here if necessary
      return { error: { type: 'SystemError', details: ticketTypesError.message } };
    }

    return { data: newEventId };
  }

  async mintTicket(request: MintTicketRequest): Promise<Result<string, Error>> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      return { error: { type: 'NotAuthorized' } };
    }

    // Check if ticket type exists and has capacity
    const { data: ticketType, error: ticketTypeError } = await supabase
      .from('ticket_types')
      .select('*')
      .eq('id', request.ticket_type_id)
      .eq('event_id', request.event_id)
      .single();

    if (ticketTypeError || !ticketType) {
      console.error('Error fetching ticket type or ticket type not found:', ticketTypeError);
      return { error: { type: 'NotFound' } };
    }

    if (ticketType.sold >= ticketType.capacity) {
      return { error: { type: 'SoldOut' } };
    }

    // Check if event is active (optional, can be done with RLS)
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('status')
      .eq('id', request.event_id)
      .single();

    if (eventError || !event || event.status !== 'active') {
       console.error('Error fetching event or event not active:', eventError);
       return { error: { type: 'CannotModify' } }; // Or a more specific error like EventNotActive
    }


    // Increment sold count for the ticket type
    const { error: updateError } = await supabase
      .from('ticket_types')
      .update({ sold: ticketType.sold + 1 })
      .eq('id', request.ticket_type_id);

    if (updateError) {
      console.error('Error updating ticket type sold count:', updateError);
      return { error: { type: 'SystemError', details: updateError.message } };
    }

    // Create ticket metadata (can be adapted based on AI art generation)
    const metadata = {
      name: `${event.name} - ${ticketType.name}`,
      description: `NFT Ticket for ${event.name}`,
      imageUrl: event.image_url, // Using event image for now
      attributes: [
        { trait_type: "Event", value: event.name },
        { trait_type: "Ticket Type", value: ticketType.name },
        // Add more attributes as needed
      ],
    };

    // Insert the ticket
    const { data: newTicket, error: insertError } = await supabase
      .from('tickets')
      .insert({
        event_id: request.event_id,
        ticket_type_id: request.ticket_type_id,
        owner_id: user.data.user.id,
        is_used: false,
        metadata: metadata,
      })
      .select('id') // Select the newly created ticket's ID
      .single();

    if (insertError) {
      console.error('Error minting ticket:', insertError);
      // Consider rolling back the sold count update here if necessary
      return { error: { type: 'SystemError', details: insertError.message } };
    }

    return { data: newTicket.id };
  }

  async getUserTickets(userId: string): Promise<Ticket[]> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('owner_id', userId);

    if (error) {
      console.error(`Error fetching tickets for user ${userId}:`, error);
      return [];
    }

    return data as Ticket[];
  }

  async getTicket(ticketId: string): Promise<Ticket | null> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .single();

    if (error) {
      console.error(`Error fetching ticket with ID ${ticketId}:`, error);
      return null;
    }

    return data as Ticket;
  }

  async verifyTicket(ticketId: string): Promise<Result<boolean, Error>> {
    // In a real-world scenario, you might want to add extra security checks here,
    // like verifying the user performing the verification has permissions (e.g., is the event organizer).
    // For this demo, we'll just update the ticket status.

    const { data: ticket, error: fetchError } = await supabase
      .from('tickets')
      .select('is_used')
      .eq('id', ticketId)
      .single();

    if (fetchError || !ticket) {
      console.error(`Error fetching ticket for verification with ID ${ticketId}:`, fetchError);
      return { error: { type: 'NotFound' } };
    }

    if (ticket.is_used) {
      return { data: false }; // Already used
    }

    const { error: updateError } = await supabase
      .from('tickets')
      .update({ is_used: true })
      .eq('id', ticketId);

    if (updateError) {
      console.error(`Error verifying ticket with ID ${ticketId}:`, updateError);
      return { error: { type: 'SystemError', details: updateError.message } };
    }

    return { data: true }; // Successfully verified and marked as used
  }

  async createProfile(username: string, bio: string | null): Promise<Result<boolean, Error>> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      return { error: { type: 'NotAuthorized' } };
    }

    // Check if profile already exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.data.user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST(404)') { // Ignore not found error
       console.error('Error checking for existing profile:', fetchError);
       return { error: { type: 'SystemError', details: fetchError.message } };
    }

    if (existingProfile) {
      return { error: { type: 'AlreadyExists' } };
    }

    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.data.user.id,
        username: username,
        bio: bio,
      });

    if (insertError) {
      console.error('Error creating profile:', insertError);
      // Check for unique constraint violation on username
      if (insertError.code === '23505') { // PostgreSQL unique violation error code
         return { error: { type: 'AlreadyExists' } }; // Username already exists
      }
      return { error: { type: 'SystemError', details: insertError.message } };
    }

    return { data: true };
  }

  async getProfile(userId: string): Promise<Result<Profile, Error>> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error(`Error fetching profile for user ${userId}:`, error);
      if (error.code === 'PGRST(404)') {
        return { error: { type: 'NotFound' } };
      }
      return { error: { type: 'SystemError', details: error.message } };
    }

    return { data: data as Profile };
  }

  async updateProfile(username: string, bio: string | null): Promise<Result<boolean, Error>> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      return { error: { type: 'NotAuthorized' } };
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        username: username,
        bio: bio,
      })
      .eq('id', user.data.user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
       // Check for unique constraint violation on username
      if (updateError.code === '23505') { // PostgreSQL unique violation error code
         return { error: { type: 'AlreadyExists' } }; // Username already exists
      }
      return { error: { type: 'SystemError', details: updateError.message } };
    }

    return { data: true };
  }

  async getProfileByPrincipal(principalId: string): Promise<Profile | null> {
     // Supabase uses UUIDs for user IDs, not Principals.
     // We would need a mapping between Principal and Supabase user ID if this was a requirement.
     // For this migration, we'll assume user identification is solely via Supabase Auth.
     console.warn("getProfileByPrincipal is not directly supported with Supabase Auth using Principal. Use getProfile with Supabase user ID instead.");
     return null;
  }


  async transferTicket(ticketId: string, newOwnerId: string): Promise<Result<boolean, Error>> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      return { error: { type: 'NotAuthorized' } };
    }

    // Verify caller owns the ticket
    const { data: ticket, error: fetchError } = await supabase
      .from('tickets')
      .select('owner_id, is_used')
      .eq('id', ticketId)
      .single();

    if (fetchError || !ticket) {
      console.error(`Error fetching ticket for transfer with ID ${ticketId}:`, fetchError);
      return { error: { type: 'NotFound' } };
    }

    if (ticket.owner_id !== user.data.user.id) {
       return { error: { type: 'NotAuthorized' } }; // Caller does not own the ticket
    }

    // Cannot transfer used tickets
    if (ticket.is_used) {
       return { error: { type: 'CannotModify' } }; // Or a more specific error like TicketAlreadyUsed
    }

    // Update ticket ownership
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ owner_id: newOwnerId })
      .eq('id', ticketId);

    if (updateError) {
      console.error(`Error transferring ticket with ID ${ticketId}:`, updateError);
      return { error: { type: 'SystemError', details: updateError.message } };
    }

    return { data: true };
  }

  async cancelEvent(eventId: string): Promise<Result<boolean, Error>> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      return { error: { type: 'NotAuthorized' } };
    }

    // Verify caller is the event organizer
    const { data: event, error: fetchError } = await supabase
      .from('events')
      .select('organizer_id')
      .eq('id', eventId)
      .single();

    if (fetchError || !event) {
      console.error(`Error fetching event for cancellation with ID ${eventId}:`, fetchError);
      return { error: { type: 'NotFound' } };
    }

    if (event.organizer_id !== user.data.user.id) {
       return { error: { type: 'NotAuthorized' } }; // Caller is not the organizer
    }

    // Update event status to cancelled
    const { error: updateError } = await supabase
      .from('events')
      .update({ status: 'cancelled' })
      .eq('id', eventId);

    if (updateError) {
      console.error(`Error cancelling event with ID ${eventId}:`, updateError);
      return { error: { type: 'SystemError', details: updateError.message } };
    }

    return { data: true };
  }


  // Helper to map Supabase event data to frontend Event type
  private mapSupabaseEventToFrontend = (supabaseEvent: any): Event => {
    // Calculate total capacity and tickets sold from joined ticket_types
    let totalCapacity = 0;
    let ticketsSold = 0;
    const ticketTypes = supabaseEvent.ticket_types || [];

    for (const tt of ticketTypes) {
      totalCapacity += tt.capacity;
      ticketsSold += tt.sold;
    }

    return {
      id: supabaseEvent.id,
      name: supabaseEvent.name,
      description: supabaseEvent.description,
      date: supabaseEvent.date,
      time: supabaseEvent.time,
      location: supabaseEvent.location,
      organizer_id: supabaseEvent.organizer_id,
      image_url: supabaseEvent.image_url,
      art_style: supabaseEvent.art_style,
      ticketTypes: ticketTypes.map((tt: any) => ({
         id: tt.id,
         event_id: tt.event_id,
         name: tt.name,
         price: tt.price,
         capacity: tt.capacity,
         sold: tt.sold,
         description: tt.description,
      })),
      totalCapacity,
      ticketsSold,
      status: supabaseEvent.status,
      created_at: supabaseEvent.created_at,
    };
  }
}

// Export a singleton instance for convenience
export const supabaseApi = new SupabaseApi();

// Re-export types for use in frontend components
export type { Event, TicketType, Ticket, Profile, CreateEventRequest, MintTicketRequest, Result, Error };
