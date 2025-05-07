import Result "mo:base/Result";

module {
  public type EventId = Text;
  public type TicketId = Text;
  public type TicketTypeId = Text;

  public type Event = {
    id : EventId;
    name : Text;
    description : Text;
    date : Text;
    time : Text;
    location : Text;
    imageUrl : ?Text;
    artStyle : Text;
    organizer : Principal;
    ticketTypes : [TicketType];
    status : EventStatus;
  };

  public type TicketType = {
    id : TicketTypeId;
    name : Text;
    price : Nat;
    capacity : Nat;
    sold : Nat;
    description : ?Text;
  };

  public type Ticket = {
    id : TicketId;
    eventId : EventId;
    ticketTypeId : TicketTypeId;
    owner : Principal;
    isUsed : Bool;
    metadata : TicketMetadata;
    mintedAt : Int;
  };

  public type TicketMetadata = {
    name : Text;
    description : Text;
    imageUrl : ?Text;
    attributes : [(Text, Text)];
  };

  public type EventStatus = {
    #active;
    #completed;
    #cancelled;
  };

  public type CreateEventRequest = {
    name : Text;
    description : Text;
    date : Text;
    time : Text;
    location : Text;
    imageUrl : ?Text;
    artStyle : Text;
    ticketTypes : [{
      name : Text;
      price : Nat;
      capacity : Nat;
      description : ?Text;
    }];
  };

  public type CreateEventResponse = Result.Result<Event, CreateEventError>;

  public type CreateEventError = {
    #userNotAuthenticated;
    #invalidInput;
    #systemError;
  };

  public type MintTicketRequest = {
    eventId : EventId;
    ticketTypeId : TicketTypeId;
  };

  public type MintTicketResponse = Result.Result<Ticket, MintTicketError>;

  public type MintTicketError = {
    #userNotAuthenticated;
    #eventNotFound;
    #ticketTypeNotFound;
    #soldOut;
    #eventNotActive;
    #systemError;
  };

  public type VerifyTicketRequest = {
    ticketId : TicketId;
  };

  public type VerifyTicketResponse = Result.Result<Bool, VerifyTicketError>;

  public type VerifyTicketError = {
    #userNotAuthenticated;
    #ticketNotFound;
    #eventNotFound;
    #eventNotActive;
    #systemError;
  };

  public type GetEventResponse = Result.Result<Event, GetEventError>;

  public type GetEventError = {
    #eventNotFound;
  };

  public type GetEventsResponse = Result.Result<[Event], GetEventsError>;

  public type GetEventsError = {
    #systemError;
  };

  public type GetUserTicketsResponse = Result.Result<[Ticket], GetUserTicketsError>;

  public type GetUserTicketsError = {
    #userNotAuthenticated;
    #systemError;
  };

  public type Profile = {
    username : Text;
    bio : Text;
  };

  public type GetProfileResponse = Result.Result<Profile, GetProfileError>;

  public type GetProfileError = {
    #userNotAuthenticated;
    #profileNotFound;
  };

  public type CreateProfileResponse = Result.Result<Bool, CreateProfileError>;

  public type CreateProfileError = {
    #userNotAuthenticated;
    #profileAlreadyExists;
  };
}