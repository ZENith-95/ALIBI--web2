import { pb } from "./base";

export async function loginUser(email: string, password: string) {
    const data = await pb.collection("users").authWithPassword(email, password);
    return data
}

export async function logoutUser() {
    pb.authStore.clear();
    console.log("User logged out");
}