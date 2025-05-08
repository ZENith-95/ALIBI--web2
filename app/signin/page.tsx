"use client"
import { useState } from "react";
import { Button } from "../components/ui/button"
import useAuthStore from "../hooks/useAuth"
import { useRouter } from "next/navigation";
import { signup } from "./actions";

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
    return <form className="flex flex-col gap-y-10 mx-auto w-full">
        <label htmlFor="email">Email:</label>
        <input onChange={(e) => setEmail(e.target.value)} id="email" name="email" type="email" required />
        <label htmlFor="password">Password:</label>
        <input onChange={(e) => setPassword(e.target.value)} id="password" name="password" type="password" required />      <button formAction={login}>Log in</button>
        <button formAction={signup}>Sign up</button>
   
    </form>
}