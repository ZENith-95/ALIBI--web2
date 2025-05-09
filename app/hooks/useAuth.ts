import { create } from 'zustand'
import { loginUser, logoutUser } from '../utils/pocketbase/auth';
import { User } from '../types/data-types';
import { persist } from "zustand/middleware";
interface AuthState {
    user?: User
    token?: string;
    isAuthenticated: boolean;
    processing: boolean;

}
interface AuthActions {
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}
const initialState: AuthState = {
    isAuthenticated: false,
    processing: false,
}
const useAuthStore = create<AuthState & AuthActions>()(persist((set) => ({
    ...initialState,
    login: async (email: string, password: string) => {
        try {
            set({ processing: true });
            const data = await loginUser(email, password);

            set({ user: data.record, isAuthenticated: true, token: data.token, processing: false });
        } catch (e) {
            console.log("Error logging in:", e);
            console.error(e);
            console.log(e);
            set({ processing: false });
        }
    },
    logout: async () => {
        await logoutUser();
        set({ user: undefined, isAuthenticated: false, token: undefined })
    }
}), {
    name: "auth-storage", // unique name
}));


export default useAuthStore;