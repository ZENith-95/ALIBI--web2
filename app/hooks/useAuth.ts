import { create } from 'zustand'
import { loginUser, logoutUser } from '../utils/pocketbase/auth';

interface AuthState {
    email?: string;
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
const useAuthStore = create<AuthState & AuthActions>((set) => ({
    ...initialState,
    login: async (email: string, password: string) => {
        try {
            set({ processing: true });
            const data = await loginUser(email, password);

            set({ email: data.record.email, isAuthenticated: true, token: data.token, processing: false });
        } catch (e) {
            console.log("Error logging in:", e);
            console.error(e);
            console.log(e);
            set({ processing: false });
        }
    },
    logout: async () => {
        await logoutUser();
        set({ email: undefined, isAuthenticated: false, token: undefined })
    }
}))


export default useAuthStore;