import { Principal } from "@dfinity/principal"
import { Identity, Actor, HttpAgent } from "@dfinity/agent"
import { 
  eventsIdlFactory,
  ticketIdlFactory,
  profileIdlFactory,
  EventsService,
  TicketService,
  ProfileService
} from "../declarations/index"
// Import proper Candid types from the declarations
import type { 
  CreateEventRequest as CandidCreateEventRequest,
  _SERVICE as EventsServiceType
} from "../declarations/events/events.did"
import type {
  MintTicketRequest as CandidMintTicketRequest,
  _SERVICE as TicketServiceType
} from "../declarations/ticket/ticket.did"

// Types
export interface Event {
  id: bigint
  name: string
  description: string
  date: string
  time: string
  location: string
  organizer: Principal
  imageUrl: string | null
  artStyle: string
  ticketTypes: TicketType[]
  totalCapacity: bigint
  ticketsSold: bigint
  isActive: boolean
  createdAt: bigint
}

export interface TicketType {
  id: bigint
  name: string
  price: bigint
  capacity: bigint
  sold: bigint
  description: string | null
}

export interface Ticket {
  id: bigint
  eventId: bigint
  ticketTypeId: bigint
  owner: Principal
  isUsed: boolean
  metadata: {
    name: string
    description: string
    imageUrl: string | null
    attributes: [string, string][]
  }
  mintedAt: bigint
}

export interface CreateEventRequest {
  name: string
  description: string
  date: string
  time: string
  location: string
  imageUrl: string | null
  artStyle: string
  ticketTypes: {
    name: string
    price: bigint
    capacity: bigint
    description: string | null
  }[]
}

export interface MintTicketRequest {
  eventId: bigint
  ticketTypeId: bigint
}

export type Result<T, E> = { ok: T } | { err: E }

export type Error =
  | { NotFound: null }
  | { AlreadyExists: null }
  | { NotAuthorized: null }
  | { SoldOut: null }
  | { InvalidInput: null }
  | { CannotModify: null }
  | { SystemError: null }

// API implementation that connects to backend canisters
export class IcApi {
  private eventsActor: EventsService | null = null
  private ticketActor: TicketService | null = null
  private profileActor: ProfileService | null = null
  private agent: HttpAgent | null = null
  private host: string = process.env.NEXT_PUBLIC_IC_HOST || "http://localhost:8000"

  constructor() {
    this.initializeActors()
  }

  private initializeActors() {
    // Create an anonymous agent
    this.agent = new HttpAgent({ 
      host: this.host,
      fetchOptions: { timeout: 30000 } 
    });

    // For local development, we need to fetch the root key
    if (this.host.includes("localhost") || this.host.includes("127.0.0.1")) {
      this.agent.fetchRootKey().catch((err) => {
        console.warn("Unable to fetch root key. If you're running locally, this is expected:", err)
      })
    }

    // Create actors using anonymous identity
    this.createActors()
  }

  private createActors() {
    try {
      const eventsCanisterId = process.env.NEXT_PUBLIC_EVENTS_CANISTER_ID
      const ticketCanisterId = process.env.NEXT_PUBLIC_TICKET_CANISTER_ID
      const profileCanisterId = process.env.NEXT_PUBLIC_PROFILE_CANISTER_ID

      if (!this.agent) {
        console.error("Agent not initialized")
        return
      }

      if (eventsCanisterId) {
        this.eventsActor = Actor.createActor<EventsService>(eventsIdlFactory, {
          agent: this.agent,
          canisterId: eventsCanisterId,
        })
      } else {
        console.warn("Events canister ID not found in environment variables")
      }

      if (ticketCanisterId) {
        this.ticketActor = Actor.createActor<TicketService>(ticketIdlFactory, {
          agent: this.agent,
          canisterId: ticketCanisterId,
        })
      } else {
        console.warn("Ticket canister ID not found in environment variables")
      }

      if (profileCanisterId) {
        this.profileActor = Actor.createActor<ProfileService>(profileIdlFactory, {
          agent: this.agent,
          canisterId: profileCanisterId,
        })
      } else {
        console.warn("Profile canister ID not found in environment variables")
      }
    } catch (error) {
      console.error("Error creating actors:", error)
    }
  }

  async updateIdentity(identity: any): Promise<void> {
    console.log("Updating identity", identity ? "with authenticated identity" : "to anonymous");
    
    if (!identity) {
      // Reinitialize with anonymous identity
      this.initializeActors()
      return
    }

    try {
      // Create a new agent with the authenticated identity
      this.agent = new HttpAgent({ 
        host: this.host, 
        identity,
        fetchOptions: { timeout: 30000 }
      });

      // For local development, we need to fetch the root key
      if (this.host.includes("localhost") || this.host.includes("127.0.0.1")) {
        await this.agent.fetchRootKey().catch((err) => {
          console.warn("Unable to fetch root key:", err)
        })
      }

      // Log the principal to verify authentication
      const principal = await this.agent.getPrincipal();
      console.log("Authenticated with principal:", principal.toString());

      // Recreate the actors with the authenticated identity
      this.createActors()
    } catch (error) {
      console.error("Error updating identity:", error)
    }
  }

  // Map backend event to frontend event model
  private mapEventToFrontend = (backendEvent: any): Event => {
    const ticketTypes = Array.isArray(backendEvent.ticketTypes)
      ? backendEvent.ticketTypes.map((tt: any) => ({
          id: BigInt(tt.id),
          name: tt.name,
          price: BigInt(tt.price),
          capacity: BigInt(tt.capacity),
          sold: BigInt(tt.sold),
          description: tt.description?.[0] || null,
        }))
      : []

    let totalCapacity = 0n
    let ticketsSold = 0n

    // Calculate totals
    for (const tt of ticketTypes) {
      totalCapacity += tt.capacity
      ticketsSold += tt.sold
    }

    // Determine if event is active based on status
    const isActive = backendEvent.status?.active !== undefined

    return {
      id: BigInt(backendEvent.id),
      name: backendEvent.name,
      description: backendEvent.description,
      date: backendEvent.date,
      time: backendEvent.time,
      location: backendEvent.location,
      organizer: backendEvent.organizer,
      imageUrl: backendEvent.imageUrl?.[0] || null,
      artStyle: backendEvent.artStyle,
      ticketTypes,
      totalCapacity,
      ticketsSold,
      isActive,
      createdAt: BigInt(Date.now()), // Backend doesn't store creation time
    }
  }

  // Map backend ticket to frontend ticket model
  private mapTicketToFrontend = (backendTicket: any): Ticket => {
    return {
      id: BigInt(backendTicket.id),
      eventId: BigInt(backendTicket.eventId),
      ticketTypeId: BigInt(backendTicket.ticketTypeId),
      owner: backendTicket.owner,
      isUsed: backendTicket.isUsed,
      metadata: {
        name: backendTicket.metadata.name,
        description: backendTicket.metadata.description,
        imageUrl: backendTicket.metadata.imageUrl?.[0] || null,
        attributes: backendTicket.metadata.attributes,
      },
      mintedAt: BigInt(backendTicket.mintedAt),
    }
  }

  async getAllEvents(): Promise<Event[]> {
    if (!this.eventsActor) {
      console.error("Events actor not initialized")
      return []
    }

    try {
      const response = await this.eventsActor.getAllEvents()
      if ("ok" in response) {
        const events = response.ok as any[]
        return events.map((event) => this.mapEventToFrontend(event))
      } else {
        console.error("Error getting all events:", response)
        return []
      }
    } catch (error) {
      console.error("Error calling getAllEvents:", error)
      return []
    }
  }

  async getEvent(eventId: bigint): Promise<Event | null> {
    if (!this.eventsActor) {
      console.error("Events actor not initialized")
      return null
    }

    try {
      const response = await this.eventsActor.getEvent(eventId.toString())
      if ("ok" in response) {
        return this.mapEventToFrontend(response.ok)
      } else {
        console.error("Error getting event:", response)
        return null
      }
    } catch (error) {
      console.error("Error calling getEvent:", error)
      return null
    }
  }

  async getOrganizerEvents(): Promise<Event[]> {
    if (!this.eventsActor) {
      console.error("Events actor not initialized")
      return []
    }

    try {
      // Use the anonymous principal if the agent is not available
      let principal = Principal.anonymous();
      
      // Get the current principal from the agent if available
      if (this.agent) {
        try {
          principal = await this.agent.getPrincipal();
        } catch (error) {
          console.error("Error getting principal:", error);
        }
      }
      
      // Pass the principal as required by the canister interface
      const response = await this.eventsActor.getOrganizerEvents(principal)
      if ("ok" in response) {
        const events = response.ok as any[]
        return events.map((event) => this.mapEventToFrontend(event))
      } else {
        console.error("Error getting organizer events:", response)
        return []
      }
    } catch (error) {
      console.error("Error calling getOrganizerEvents:", error)
      return []
    }
  }

  async createEvent(request: CreateEventRequest): Promise<Result<bigint, Error>> {
    if (!this.eventsActor) {
      console.error("Events actor not initialized")
      return { err: { SystemError: null } }
    }

    try {
      // Convert request to backend format explicitly using the CandidCreateEventRequest type
      const backendRequest: CandidCreateEventRequest = {
      name: request.name,
      description: request.description,
      date: request.date,
      time: request.time,
      location: request.location,
        // For optional values, use [] (empty array) or [value] (array with one element)
        imageUrl: request.imageUrl ? [request.imageUrl] : [],
      artStyle: request.artStyle,
        ticketTypes: request.ticketTypes.map((tt) => ({
          name: tt.name,
          price: BigInt(tt.price),
          capacity: BigInt(tt.capacity),
          // For optional values, use [] (empty array) or [value] (array with one element)
          description: tt.description ? [tt.description] : [],
        })),
      }

      const response = await this.eventsActor.createEvent(backendRequest)

      if ("ok" in response) {
        const event = response.ok as any
        return { ok: BigInt(event.id) }
      } else {
        console.error("Error creating event:", response)
        // Map backend error to frontend error
        const err = response.err as any
        if ("userNotAuthenticated" in err) {
          return { err: { NotAuthorized: null } }
        } else if ("invalidInput" in err) {
          return { err: { InvalidInput: null } }
        } else {
          return { err: { SystemError: null } }
        }
      }
    } catch (error) {
      console.error("Error calling createEvent:", error)
      return { err: { SystemError: null } }
    }
  }

  // Map result types to our frontend result type
  async mintTicket(request: MintTicketRequest): Promise<Result<bigint, Error>> {
    if (!this.ticketActor) {
      console.error("Ticket actor not initialized")
      return { err: { SystemError: null } }
    }

    try {
      // Extract the eventId and ticketTypeId as strings
      const eventIdStr = request.eventId.toString();
      const ticketTypeIdStr = request.ticketTypeId.toString();
      
      // Get the user's principal
      let userPrincipal;
      if (this.agent) {
        try {
          userPrincipal = await this.agent.getPrincipal();
        } catch (err) {
          console.error("Error getting user principal:", err);
          return { err: { NotAuthorized: null } };
        }
      } else {
      return { err: { NotAuthorized: null } };
    }

      // Create metadata for the ticket
      const metadata = {
        name: `Ticket for Event #${eventIdStr}`,
        description: `NFT Ticket for event ${eventIdStr}, ticket type ${ticketTypeIdStr}`,
        imageUrl: [] as any[], // Empty opt value
        attributes: [] as [string, string][] // Empty vec
      };

      console.log("Calling mintTicket with correct parameters:", {
        eventId: eventIdStr,
        ticketTypeId: ticketTypeIdStr,
        principal: userPrincipal.toString(),
        metadata
      });

      try {
        // Use any to bypass type checking since the generated types don't match actual API
        const mintTicketFn = (this.ticketActor as any).mintTicket;
        
        if (!mintTicketFn) {
          console.error("mintTicket function not found on the actor");
          return { err: { SystemError: null } };
        }
        
        // Call with the exact parameters the backend expects
        const response = await mintTicketFn(
          eventIdStr,
          ticketTypeIdStr,
          userPrincipal,
          metadata
        );

        if (response && typeof response === 'object') {
          if ('ok' in response && response.ok) {
            const ticketId = String(response.ok);
            console.log("Ticket minted successfully, ID:", ticketId);
            return { ok: BigInt(ticketId) };
          } else if ('err' in response && response.err) {
            console.error("Error minting ticket:", response);
            const err = response.err;
            
            if (err.userNotAuthenticated) {
              return { err: { NotAuthorized: null } };
            }
          }
        }
        
        console.error("Unknown response format:", response);
        return { err: { SystemError: null } };
      } catch (callError) {
        console.error("Error in ticket actor call:", callError);
        return { err: { SystemError: null } };
      }
    } catch (error) {
      console.error("Error calling mintTicket:", error);
      return { err: { SystemError: null } };
    }
  }

  async getUserTickets(): Promise<Ticket[]> {
    if (!this.ticketActor) {
      console.error("Ticket actor not initialized")
      return []
    }

    try {
      const response = await this.ticketActor.getUserTickets()
      if ("ok" in response) {
        return response.ok.map((ticket: any) => this.mapTicketToFrontend(ticket))
      } else {
        console.error("Error getting user tickets:", response)
        return []
      }
    } catch (error) {
      console.error("Error calling getUserTickets:", error)
      return []
    }
  }

  async getTicket(ticketId: bigint): Promise<Ticket | null> {
    if (!this.ticketActor) {
      console.error("Ticket actor not initialized")
      return null
    }

    try {
      const ticket = await this.ticketActor.getTicket(ticketId.toString())
      return ticket ? this.mapTicketToFrontend(ticket) : null
    } catch (error) {
      console.error("Error calling getTicket:", error)
      return null
    }
  }

  async verifyTicket(ticketId: bigint): Promise<Result<boolean, Error>> {
    if (!this.ticketActor) {
      console.error("Ticket actor not initialized")
      return { err: { SystemError: null } }
    }

    try {
      // Pass ticketId as a string directly
      const response = await this.ticketActor.verifyTicket(ticketId.toString())

      if ("ok" in response) {
        return { ok: response.ok }
      } else {
        console.error("Error verifying ticket:", response)
        // Map backend error to frontend error
        const err = response.err as any
        if ("userNotAuthenticated" in err) {
          return { err: { NotAuthorized: null } }
        } else if ("ticketNotFound" in err) {
      return { err: { NotFound: null } }
        } else {
          return { err: { SystemError: null } }
        }
      }
    } catch (error) {
      console.error("Error calling verifyTicket:", error)
      return { err: { SystemError: null } }
    }
  }

  async createProfile(username: string, bio: string): Promise<Result<boolean, Error>> {
    if (!this.profileActor) {
      console.error("Profile actor not initialized")
      return { err: { SystemError: null } }
    }

    try {
      const response = await this.profileActor.createProfile(username, bio)

      if ("ok" in response) {
        return { ok: response.ok }
      } else {
        console.error("Error creating profile:", response)
        // Map backend error to frontend error
        const err = response.err as any
        if ("userNotAuthenticated" in err) {
          return { err: { NotAuthorized: null } }
        } else if ("profileAlreadyExists" in err) {
          return { err: { AlreadyExists: null } }
        } else {
          return { err: { SystemError: null } }
        }
      }
    } catch (error) {
      console.error("Error calling createProfile:", error)
      return { err: { SystemError: null } }
    }
  }

  async getProfile(): Promise<Result<{ username: string; bio: string }, Error>> {
    if (!this.profileActor) {
      console.error("Profile actor not initialized")
      return { err: { SystemError: null } }
    }

    try {
      const response = await this.profileActor.getProfile()

      if ("ok" in response) {
        const profile = response.ok as any
        return { ok: { username: profile.username, bio: profile.bio } }
      } else {
        console.error("Error getting profile:", response)
        // Map backend error to frontend error
        const err = response.err as any
        if ("userNotAuthenticated" in err) {
          return { err: { NotAuthorized: null } }
        } else if ("profileNotFound" in err) {
          return { err: { NotFound: null } }
        } else {
          return { err: { SystemError: null } }
        }
      }
    } catch (error) {
      console.error("Error calling getProfile:", error)
      return { err: { SystemError: null } }
    }
  }

  // These methods are not currently supported by the backend API.
  // For future implementation, they will need to match the backend API.
  
  async transferTicket(ticketId: bigint, newOwner: Principal): Promise<Result<boolean, Error>> {
    // This functionality is not available in the current backend
    console.error("TransferTicket method is not implemented in the backend")
    return { err: { SystemError: null } }
  }

  async cancelEvent(eventId: bigint): Promise<Result<boolean, Error>> {
    // This functionality is not available in the current backend
    console.error("CancelEvent method is not implemented in the backend")
    return { err: { SystemError: null } }
  }
}

// Export a singleton instance for convenience
export const icApi = new IcApi()