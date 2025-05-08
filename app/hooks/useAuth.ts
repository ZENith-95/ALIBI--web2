import { create } from 'zustand'
import { supabaseSignin } from '../utils/supabase/auth';

interface AuthState {
    email?: string;
    token?: string;
    isAuthenticated: boolean;

}
interface AuthActions {
    login: (email: string, password: string) => void;
    logout: () => void;
}
const initialState: AuthState = {
    isAuthenticated: false,

}
const useAuthStore = create<AuthState & AuthActions>((set) => ({
    ...initialState,
    login: async (email: string, password: string) => {
        try {
            const data = await supabaseSignin(email, password);
            set({ email: data.user.email, isAuthenticated: true, token: data.session.access_token })
        } catch (e) {
            console.log("Error logging in:", e);
            console.log(e);
        }
    },
    logout: async () => {
        // await supabaseSignOut();
        set({ email: undefined, isAuthenticated: false, token: undefined })
    }
}))


export default useAuthStore;