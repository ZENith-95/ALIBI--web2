import { create } from 'zustand'

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
    login: (email: string, password: string) => {
        // Simulate an API call
        setTimeout(() => {
            set({ email, token: 'fake-token', isAuthenticated: true });
        }, 1000);
    },
    logout: () => {
        // Simulate an API call
        setTimeout(() => {
            set({ email: undefined, token: undefined, isAuthenticated: false });
        }, 1000);
    }
}))


export default useAuthStore;