import Types "../types";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Time "mo:base/Time";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import Int "mo:base/Int";

actor Events {
  type Event = Types.Event;
  type EventId = Types.EventId;
  type TicketId = Types.TicketId;
  type TicketTypeId = Types.TicketTypeId;
  type TicketType = Types.TicketType;
  type Ticket = Types.Ticket;
  type TicketMetadata = Types.TicketMetadata;
  type EventStatus = Types.EventStatus;
  type CreateEventRequest = Types.CreateEventRequest;
  type CreateEventResponse = Types.CreateEventResponse;
  type CreateEventError = Types.CreateEventError;
  type MintTicketRequest = Types.MintTicketRequest;
  type MintTicketResponse = Types.MintTicketResponse;
  type MintTicketError = Types.MintTicketError;
  type VerifyTicketRequest = Types.VerifyTicketRequest;
  type VerifyTicketResponse = Types.VerifyTicketResponse;
  type VerifyTicketError = Types.VerifyTicketError;
  type GetEventResponse = Types.GetEventResponse;
  type GetEventError = Types.GetEventError;
  type GetEventsResponse = Types.GetEventsResponse;
  type GetEventsError = Types.GetEventsError;

  // Service interfaces for cross-canister calls
  type TicketService = actor {
    mintTicket : (eventId : EventId, ticketTypeId : TicketTypeId, owner : Principal, metadata : TicketMetadata) -> async Result.Result<TicketId, {#userNotAuthenticated; #systemError}>;
  };

  // Storage for events
  private stable var eventEntries : [(EventId, Event)] = [];
  private var events = HashMap.HashMap<EventId, Event>(10, Text.equal, Text.hash);
  
  // ID counter
  private stable var nextEventId : Nat = 1;

  // Initialize from stable storage
  system func preupgrade() {
    eventEntries := Iter.toArray(events.entries());
  };

  system func postupgrade() {
    events := HashMap.fromIter<EventId, Event>(eventEntries.vals(), 10, Text.equal, Text.hash);
    eventEntries := [];
  };

  // Function to generate a new unique event ID
  private func generateEventId() : EventId {
    let id = nextEventId;
    nextEventId += 1;
    Nat.toText(id);
  };

  // Function to generate a new unique ticket type ID
  private func generateTicketTypeId() : TicketTypeId {
    let id = Int.abs(Time.now()); // Convert Int to Nat by taking the absolute value
    Nat.toText(id);
  };

  // Get all events
  public query func getAllEvents() : async GetEventsResponse {
    try {
      #ok(Iter.toArray(events.vals()));
    } catch (e) {
      Debug.print("Error getting all events: " # Error.message(e));
      #err(#systemError);
    };
  };

  // Get a specific event by ID
  public query func getEvent(eventId : EventId) : async GetEventResponse {
    switch (events.get(eventId)) {
      case (?event) {
        #ok(event);
      };
      case (null) {
        #err(#eventNotFound);
      };
    };
  };

  // Get events organized by the caller
  public query ({caller}) func getOrganizerEvents() : async GetEventsResponse {
    if (Principal.isAnonymous(caller)) {
      return #err(#systemError);
    };

    try {
      let organizerEvents = Array.filter<Event>(
        Iter.toArray(events.vals()),
        func (event : Event) : Bool {
          Principal.equal(event.organizer, caller)
        }
      );
      #ok(organizerEvents);
    } catch (e) {
      Debug.print("Error getting organizer events: " # Error.message(e));
      #err(#systemError);
    };
  };

  // Create a new event
  public shared({caller}) func createEvent(request : CreateEventRequest) : async CreateEventResponse {
    if (Principal.isAnonymous(caller)) {
      return #err(#userNotAuthenticated);
    };

    try {
      let eventId = generateEventId();
      
      // Create ticket types with IDs
      let ticketTypes = Array.map<{
        name : Text;
        price : Nat;
        capacity : Nat;
        description : ?Text;
      }, TicketType>(
        request.ticketTypes,
        func (tt) {
          {
            id = generateTicketTypeId();
            name = tt.name;
            price = tt.price;
            capacity = tt.capacity;
            sold = 0; // Initially no tickets sold
            description = tt.description;
          }
        }
      );
      
      let newEvent : Event = {
        id = eventId;
        name = request.name;
        description = request.description;
        date = request.date;
        time = request.time;
        location = request.location;
        imageUrl = request.imageUrl;
        artStyle = request.artStyle;
        organizer = caller;
        ticketTypes = ticketTypes;
        status = #active; // New events are active by default
      };
      
      events.put(eventId, newEvent);
      #ok(newEvent);
    } catch (e) {
      Debug.print("Error creating event: " # Error.message(e));
      #err(#systemError);
    };
  };

  // Mint a ticket for an event
  public shared({caller}) func mintTicket(request : MintTicketRequest) : async MintTicketResponse {
    if (Principal.isAnonymous(caller)) {
      return #err(#userNotAuthenticated);
    };

    try {
      // Find the event
      switch (events.get(request.eventId)) {
        case (null) {
          return #err(#eventNotFound);
        };
        case (?event) {
          // Check if event is active
          switch (event.status) {
            case (#active) {
              // Find the ticket type
              let ticketTypeOpt = Array.find<TicketType>(
                event.ticketTypes,
                func (tt) { tt.id == request.ticketTypeId }
              );
              
              switch (ticketTypeOpt) {
                case (null) {
                  return #err(#ticketTypeNotFound);
                };
                case (?ticketType) {
                  // Check if tickets are available
                  if (ticketType.sold >= ticketType.capacity) {
                    return #err(#soldOut);
                  };
                  
                  // Update the ticket type to increment sold count
                  let updatedTicketTypes = Array.map<TicketType, TicketType>(
                    event.ticketTypes,
                    func (tt) {
                      if (tt.id == ticketType.id) {
                        {
                          id = tt.id;
                          name = tt.name;
                          price = tt.price;
                          capacity = tt.capacity;
                          sold = tt.sold + 1;
                          description = tt.description;
                        }
                      } else {
                        tt
                      }
                    }
                  );
                  
                  // Update the event with the new ticket types
                  let updatedEvent = {
                    id = event.id;
                    name = event.name;
                    description = event.description;
                    date = event.date;
                    time = event.time;
                    location = event.location;
                    imageUrl = event.imageUrl;
                    artStyle = event.artStyle;
                    organizer = event.organizer;
                    ticketTypes = updatedTicketTypes;
                    status = event.status;
                  };
                  
                  events.put(event.id, updatedEvent);
                  
                  // Create ticket metadata
                  let metadata : TicketMetadata = {
                    name = event.name # " - " # ticketType.name;
                    description = "NFT Ticket for " # event.name;
                    imageUrl = event.imageUrl;
                    attributes = [
                      ("event", event.name),
                      ("date", event.date),
                      ("time", event.time),
                      ("location", event.location),
                      ("qrHash", event.id # "-" # request.ticketTypeId # "-" # Principal.toText(caller))
                    ];
                  };
                  
                  // Create a dummy ticket as we can't actually call the Ticket canister
                  // In a real implementation, we would call the Ticket canister to mint the ticket
                  let ticket : Ticket = {
                    id = "dummy-ticket-id";
                    eventId = event.id;
                    ticketTypeId = ticketType.id;
                    owner = caller;
                    isUsed = false;
                    metadata = metadata;
                    mintedAt = Time.now();
                  };
                  
                  #ok(ticket);
                };
              };
            };
            case (_) {
              return #err(#eventNotActive);
            };
          };
        };
      };
    } catch (e) {
      Debug.print("Error minting ticket: " # Error.message(e));
      #err(#systemError);
    };
  };

  // Get all tickets for a user (this would normally be handled by the Ticket canister)
  public query ({caller}) func getUserTickets() : async [Ticket] {
    // This is a placeholder implementation
    // In a real app, this would be handled by the Ticket canister
    [];
  };

  // Get a specific ticket by ID (this would normally be handled by the Ticket canister)
  public query func getTicket(ticketId : TicketId) : async ?Ticket {
    // This is a placeholder implementation
    // In a real app, this would be handled by the Ticket canister
    null;
  };

  // Verify a ticket (this would normally be handled by the Ticket canister)
  public shared({caller}) func verifyTicket(request : VerifyTicketRequest) : async VerifyTicketResponse {
    if (Principal.isAnonymous(caller)) {
      return #err(#userNotAuthenticated);
    };
    
    // This is a placeholder implementation
    // In a real app, this would be handled by the Ticket canister
    #err(#ticketNotFound);
  };

  // Cancel an event
  public shared({caller}) func cancelEvent(eventId : EventId) : async Result.Result<Bool, CreateEventError> {
    if (Principal.isAnonymous(caller)) {
      return #err(#userNotAuthenticated);
    };

    try {
      switch (events.get(eventId)) {
        case (null) {
          return #err(#invalidInput);
        };
        case (?event) {
          // Check if the caller is the event organizer
          if (not Principal.equal(caller, event.organizer)) {
            return #err(#userNotAuthenticated);
          };
          
          // Update the event status to cancelled
          let updatedEvent = {
            id = event.id;
            name = event.name;
            description = event.description;
            date = event.date;
            time = event.time;
            location = event.location;
            imageUrl = event.imageUrl;
            artStyle = event.artStyle;
            organizer = event.organizer;
            ticketTypes = event.ticketTypes;
            status = #cancelled;
          };
          
          events.put(eventId, updatedEvent);
          #ok(true);
        };
      };
    } catch (e) {
      Debug.print("Error cancelling event: " # Error.message(e));
      #err(#systemError);
    };
  };
} 