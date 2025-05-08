
import PocketBase from "pocketbase";
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKET_BASE_URL!)

export async function loginUser(email: string, password: string) {
    console.log("pppppppppppppp:", process.env.NEXT_PUBLIC_POCKET_BASE_URL);
    const data = await pb.collection("users").authWithPassword(email, password);
    console.log("User logged in:", data);
    return data
}

export async function logoutUser() {
    pb.authStore.clear();
    console.log("User logged out");
}