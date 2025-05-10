import { create } from "zustand";
import { loginUser, logoutUser } from "../utils/pocketbase/auth";
import { User } from "../types/data-types";
import { persist } from "zustand/middleware";
interface AuthState {
  user?: User;
  token?: string;
  userId?: string; // Add userId to store
  isAuthenticated: boolean;
  processing: boolean;
  error: string | null; // Add error field
}
interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}
const initialState: AuthState = {
  isAuthenticated: false,
  processing: false,
  error: null, // Initialize error
};
const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      ...initialState,
      login: async (email: string, password: string) => {
        set({ processing: true, error: null }); // Clear previous errors
        try {
          const data = await loginUser(email, password);
          // data.record is a RecordModel, map to User type
          const userPayload: User = {
            id: data.record.id,
            email: data.record.email as string, // email is present on user auth records
            name: data.record.name as string || undefined, // name might be optional
            avatar: data.record.avatar as string || undefined, // avatar might be optional
            // Add any other fields from your 'users' collection that are in the User type
          };
          set({
            user: userPayload,
            userId: data.record.id,
            isAuthenticated: true,
            token: data.token,
            processing: false,
            error: null,
          });
        } catch (e: any) {
          console.error("Error logging in:", e);
          const errorMessage = e.message || "Login failed. Please check your credentials.";
          set({ processing: false, isAuthenticated: false, error: errorMessage, user: undefined, userId: undefined, token: undefined });
        }
      },
      logout: async () => {
        await logoutUser();
        set({ 
            user: undefined, 
            userId: undefined, 
            isAuthenticated: false, 
            token: undefined, 
            processing: false, 
            error: null 
        });
      },
    }),
    {
      name: "auth-storage", // unique name
    }
  )
);

export default useAuthStore;
