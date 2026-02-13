"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();

    const [mode, setMode] = useState<"login" | "signup">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [msg, setMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setMsg(null);
        setLoading(true);

        try {
            if (mode === "signup") {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                setMsg("Signup successful. Check your email if confirmation is enabled.")
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                router.push("/dashboard");
            }
        } catch (err: any) {
            setMsg(err?.message ?? "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ maxWidth: 420, margin: "60px auto", fontFamily: "system-ui" }}>
            <h1>{mode === "login" ? "Log in" : "Create account"}</h1>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
                <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                />
                <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                />
                <button type="submit" disabled={loading}>
                    {loading ? "..." : mode === "login" ? "Log in" : "Sign up"}
                </button>
            </form>

            {msg && <p style={{ marginTop: 12 }}>{msg}</p>}

            <p style={{ marginTop: 16 }}>
                {mode === "login" ? "No account?" : "Already have an account?"}{" "}
                <button
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                style={{ background: "none", border: "none", color: "blue", cursor: "pointer" }}
                type="button"
                >
                {mode === "login" ? "Sign up" : "Log in"}
                </button>
            </p>
        </div>
    );
}