import { pb } from "./base";

const USERS_COLLECTION_ID = "_pb_users_auth_"; // ID from list_collections output

export async function loginUser(email: string, password: string) {
    const data = await pb.collection(USERS_COLLECTION_ID).authWithPassword(email, password);
    return data
}

export async function logoutUser() {
    pb.authStore.clear();
    console.log("User logged out");
}
