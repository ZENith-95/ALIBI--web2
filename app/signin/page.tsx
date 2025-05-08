"use client"
import { useState } from "react";
import { Button } from "../components/ui/button"
import useAuthStore from "../hooks/useAuth"
import { useRouter } from "next/navigation";

export default function SignInPage() {
    return <div className="mx-auto">
        <SignInForm />
    </div>

}


function SignInForm() {
    const router = useRouter();
    const loginState = useAuthStore();
    const { isAuthenticated } = loginState;
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const login = async () => {
        await loginState.login(email, password);
        if (isAuthenticated) {
            router.push("/")
        }

    }
    return <form>
        <div className="flex flex-col gap-y-10 mx-auto w-full">
            <input onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" />
            <input onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
            <Button onClick={login}>
                Login
            </Button>
        </div>
    </form>
}