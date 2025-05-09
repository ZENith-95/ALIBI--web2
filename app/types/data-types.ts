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
  
  