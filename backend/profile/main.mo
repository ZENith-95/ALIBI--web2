import Types "../types";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Iter "mo:base/Iter";
import Debug "mo:base/Debug";
import Option "mo:base/Option";

actor Profile {
  type Profile = Types.Profile;
  type GetProfileResponse = Types.GetProfileResponse;
  type GetProfileError = Types.GetProfileError;
  type CreateProfileResponse = Types.CreateProfileResponse;
  type CreateProfileError = Types.CreateProfileError;

  // Storage for profiles
  private stable var profileEntries : [(Principal, Profile)] = [];
  private var profiles = HashMap.HashMap<Principal, Profile>(10, Principal.equal, Principal.hash);

  // Initialize the profiles hashmap from stable storage
  system func preupgrade() {
    profileEntries := Iter.toArray(profiles.entries());
  };

  system func postupgrade() {
    profiles := HashMap.fromIter<Principal, Profile>(profileEntries.vals(), 10, Principal.equal, Principal.hash);
    profileEntries := [];
  };

  // Get a user's profile
  public query ({caller}) func getProfile() : async GetProfileResponse {
    if (Principal.isAnonymous(caller)) {
      return #err(#userNotAuthenticated);
    };

    switch (profiles.get(caller)) {
      case (?profile) {
        #ok(profile);
      };
      case (null) {
        #err(#profileNotFound);
      };
    };
  };

  // Create a new profile
  public shared ({caller}) func createProfile(username : Text, bio : Text) : async CreateProfileResponse {
    if (Principal.isAnonymous(caller)) {
      return #err(#userNotAuthenticated);
    };

    // Check if profile already exists
    switch (profiles.get(caller)) {
      case (?_) {
        return #err(#profileAlreadyExists);
      };
      case (null) {
        // Create new profile
        let newProfile : Profile = {
          username = username;
          bio = bio;
        };

        profiles.put(caller, newProfile);
        #ok(true);
      };
    };
  };

  // Update a user's profile
  public shared ({caller}) func updateProfile(username : Text, bio : Text) : async Result.Result<Bool, {#userNotAuthenticated; #profileNotFound}> {
    if (Principal.isAnonymous(caller)) {
      return #err(#userNotAuthenticated);
    };

    // Check if profile exists
    switch (profiles.get(caller)) {
      case (null) {
        return #err(#profileNotFound);
      };
      case (?_) {
        // Update profile
        let updatedProfile : Profile = {
          username = username;
          bio = bio;
        };

        profiles.put(caller, updatedProfile);
        #ok(true);
      };
    };
  };

  // Get a profile by principal (for admin or public lookup purposes)
  public query func getProfileByPrincipal(principal : Principal) : async ?Profile {
    profiles.get(principal);
  };
} 