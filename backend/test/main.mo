import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Result "mo:base/Result";
import Bool "mo:base/Bool";
import Array "mo:base/Array";

actor {
    type Profile = {
        username : Text;
        bio : Text;
    };

    type Ticket = {
        owner: Principal;
        metadata: [(Text, Text)];
    };

    type GetProfileError = {
        #userNotAuthenticated;
        #profileNotFound;
    };

    type GetProfileResponse = Result.Result<Profile, GetProfileError>;

    type CreateProfileError = {
        #profileAlreadyExists;
        #userNotAuthenticated;
    };

    type CreateProfileResponse = Result.Result<Bool, CreateProfileError>;

    let profiles = HashMap.HashMap<Principal, Profile>(0, Principal.equal, Principal.hash);

    public query ({caller}) func getProfile () : async GetProfileResponse {
        if (Principal.isAnonymous(caller)) return #err(#userNotAuthenticated);

        let profile = profiles.get(caller);

        switch profile {
            case (?profile) {
                #ok(profile);
            };
            case null {
                #err(#profileNotFound);
            };
        }
    };

    public shared ({caller}) func createProfile (username : Text, bio : Text) : async CreateProfileResponse {
        if (Principal.isAnonymous(caller)) return #err(#userNotAuthenticated);

        let profile = profiles.get(caller);

        if (profile != null) return #err(#profileAlreadyExists);

        let newProfile: Profile = {
            username = username;
            bio = bio;
        };
        
        profiles.put(caller, newProfile);

        #ok(true);
    };

    stable var tickets: [Ticket] = [];

    public shared func mint(owner: Principal, svg: Text): async Text {
        let newTicket = {
            owner = owner;
            metadata = [("image", svg), ("status", "active")];
        };
        tickets := Array.append(tickets, [newTicket]);
        return "Ticket minted successfully!";
    };

    public shared func verify(qrHash: Text): async Bool {
        let ticket = Array.find(tickets, func (t: Ticket) : Bool {
            Array.find(t.metadata, func (pair: (Text, Text)) : Bool {
                pair.0 == "qrHash" and pair.1 == qrHash
            }) != null
        });
        return ticket != null;
    };
}
