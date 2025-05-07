import Types "../types";
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Debug "mo:base/Debug";
import Time "mo:base/Time";
import Error "mo:base/Error";

actor Ticket {
  type Ticket = Types.Ticket;
  type TicketId = Types.TicketId;
  type TicketMetadata = Types.TicketMetadata;
  type MintTicketRequest = Types.MintTicketRequest;
  type MintTicketResponse = Types.MintTicketResponse;
  type MintTicketError = Types.MintTicketError;
  type VerifyTicketRequest = Types.VerifyTicketRequest;
  type VerifyTicketResponse = Types.VerifyTicketResponse;
  type VerifyTicketError = Types.VerifyTicketError;

  // External canister interfaces
  type Event = Types.Event;
  type EventId = Types.EventId;
  type TicketTypeId = Types.TicketTypeId;
  type TicketType = Types.TicketType;

  // Service interfaces for cross-canister calls
  type EventsService = actor {
    getEvent : (eventId : EventId) -> async Result.Result<Event, Types.GetEventError>;
  };

  // Storage for tickets
  private stable var ticketEntries : [(TicketId, Ticket)] = [];
  private var tickets = HashMap.HashMap<TicketId, Ticket>(10, Text.equal, Text.hash);
  
  // ID counter
  private stable var nextTicketId : Nat = 1;

  // Initialize from stable storage
  system func preupgrade() {
    ticketEntries := Iter.toArray(tickets.entries());
  };

  system func postupgrade() {
    tickets := HashMap.fromIter<TicketId, Ticket>(ticketEntries.vals(), 10, Text.equal, Text.hash);
    ticketEntries := [];
  };

  // Function to generate a new unique ticket ID
  private func generateTicketId() : TicketId {
    let id = nextTicketId;
    nextTicketId += 1;
    Nat.toText(id);
  };

  // Get a ticket by ID
  public query func getTicket(ticketId : TicketId) : async ?Ticket {
    tickets.get(ticketId);
  };

  // Get all tickets owned by the caller
  public query ({caller}) func getUserTickets() : async [Ticket] {
    let userTickets = Array.filter<Ticket>(
      Iter.toArray(tickets.vals()),
      func (ticket : Ticket) : Bool {
        Principal.equal(ticket.owner, caller)
      }
    );
    userTickets;
  };

  // Check if a ticket is valid without marking it as used
  public query func isTicketValid(ticketId : TicketId) : async Bool {
    switch (tickets.get(ticketId)) {
      case (null) { false };
      case (?ticket) { not ticket.isUsed };
    };
  };

  // Verify a ticket and mark it as used (for event entry)
  public shared({caller}) func verifyTicket(request : VerifyTicketRequest) : async VerifyTicketResponse {
    if (Principal.isAnonymous(caller)) {
      return #err(#userNotAuthenticated);
    };

    try {
      switch (tickets.get(request.ticketId)) {
        case (null) {
          #err(#ticketNotFound);
        };
        case (?ticket) {
          // Check if ticket is already used
          if (ticket.isUsed) {
            return #ok(false);
          };

          // Verify with events canister that event is active
          // This would be a cross-canister call in a real implementation

          // Mark ticket as used
          let updatedTicket = {
            id = ticket.id;
            eventId = ticket.eventId;
            ticketTypeId = ticket.ticketTypeId;
            owner = ticket.owner;
            isUsed = true;
            metadata = ticket.metadata;
            mintedAt = ticket.mintedAt;
          };

          tickets.put(ticket.id, updatedTicket);
          #ok(true);
        };
      };
    } catch (e) {
      Debug.print("Error verifying ticket: " # Error.message(e));
      #err(#systemError);
    };
  };

  // Transfer a ticket to another user (FR005)
  public shared({caller}) func transferTicket(ticketId : TicketId, newOwner : Principal) : async Result.Result<Bool, {#ticketNotFound; #userNotAuthenticated; #systemError}> {
    if (Principal.isAnonymous(caller)) {
      return #err(#userNotAuthenticated);
    };

    try {
      switch (tickets.get(ticketId)) {
        case (null) {
          #err(#ticketNotFound);
        };
        case (?ticket) {
          // Verify caller owns the ticket
          if (not Principal.equal(caller, ticket.owner)) {
            return #err(#userNotAuthenticated);
          };
          
          // Cannot transfer used tickets
          if (ticket.isUsed) {
            return #err(#systemError);
          };

          // Update ticket ownership
          let updatedTicket = {
            id = ticket.id;
            eventId = ticket.eventId;
            ticketTypeId = ticket.ticketTypeId;
            owner = newOwner;
            isUsed = ticket.isUsed;
            metadata = ticket.metadata;
            mintedAt = ticket.mintedAt;
          };

          tickets.put(ticket.id, updatedTicket);
          #ok(true);
        };
      };
    } catch (e) {
      Debug.print("Error transferring ticket: " # Error.message(e));
      #err(#systemError);
    };
  };

  // Admin function to mint a ticket directly from the ticket canister
  // In a real implementation, this would be called from the Events canister
  public shared({caller}) func mintTicket(eventId : EventId, ticketTypeId : TicketTypeId, owner : Principal, metadata : TicketMetadata) : async Result.Result<TicketId, {#userNotAuthenticated; #systemError}> {
    if (Principal.isAnonymous(caller)) {
      return #err(#userNotAuthenticated);
    };
    
    try {
      let ticketId = generateTicketId();
      
      let ticket : Ticket = {
        id = ticketId;
        eventId = eventId;
        ticketTypeId = ticketTypeId;
        owner = owner;
        isUsed = false;
        metadata = metadata;
        mintedAt = Time.now();
      };
      
      tickets.put(ticketId, ticket);
      #ok(ticketId);
    } catch (e) {
      Debug.print("Error minting ticket: " # Error.message(e));
      #err(#systemError);
    };
  };
} 