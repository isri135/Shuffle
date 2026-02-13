"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [sendingReset, setSendingReset] = useState(false);
  const [sendingResend, setSendingResend] = useState(false);

  // If already logged in, bounce to dashboard
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/dashboard");
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace("/dashboard");
    });

    return () => sub.subscription.unsubscribe();
  }, [router]);

  const cleanEmail = useMemo(() => email.trim().toLowerCase(), [email]);
  const isSuccess = !!msg && /success|sent|check your email|copied/i.test(msg);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            // If you created app/auth/callback/page.tsx, this will bring users back after email confirm
            emailRedirectTo: `${location.origin}/auth/callback`,
          },
        });
        if (error) throw error;

        // If email confirmations are OFF, a session may exist immediately
        if (data.session) {
          router.replace("/dashboard");
          return;
        }

        setMsg("Account created. Check your email to confirm, then come back and log in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) throw error;
        router.replace("/dashboard");
      }
    } catch (err: any) {
      setMsg(err?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function resendConfirmation() {
    setMsg(null);
    if (!cleanEmail) {
      setMsg("Enter your email first.");
      return;
    }
    setSendingResend(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: cleanEmail,
      });
      if (error) throw error;
      setMsg("Confirmation email sent. Check your inbox/spam.");
    } catch (err: any) {
      setMsg(err?.message ?? "Could not resend confirmation email");
    } finally {
      setSendingResend(false);
    }
  }

  async function forgotPassword() {
    setMsg(null);
    if (!cleanEmail) {
      setMsg("Enter your email first.");
      return;
    }
    setSendingReset(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${location.origin}/auth/callback`,
      });
      if (error) throw error;
      setMsg("Password reset email sent. Check your inbox/spam.");
    } catch (err: any) {
      setMsg(err?.message ?? "Could not send password reset email");
    } finally {
      setSendingReset(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b0f19",
        color: "#e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          borderRadius: 18,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          padding: 18,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, letterSpacing: -0.2 }}>
              {mode === "login" ? "Log in" : "Create account"}
            </h1>
            <p style={{ margin: "8px 0 0", color: "#9ca3af", fontSize: 13, lineHeight: 1.4 }}>
              {mode === "login"
                ? "Welcome back. Enter your details to continue."
                : "Create an account to start using rooms and chores."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            style={{
              background: "transparent",
              color: "#e5e7eb",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 12,
              padding: "9px 12px",
              cursor: "pointer",
              fontWeight: 800,
              fontSize: 13,
              whiteSpace: "nowrap",
            }}
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: 16, display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, color: "#cbd5e1" }}>Email</span>
            <input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                height: 44,
                borderRadius: 12,
                padding: "10px 12px",
                outline: "none",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#e5e7eb",
                fontSize: 14,
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, color: "#cbd5e1" }}>Password</span>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              style={{
                height: 44,
                borderRadius: 12,
                padding: "10px 12px",
                outline: "none",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#e5e7eb",
                fontSize: 14,
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{
              height: 44,
              borderRadius: 12,
              border: "none",
              background: "#ffffff",
              color: "#0b0f19",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 900,
              fontSize: 14,
              opacity: loading ? 0.7 : 1,
              boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
            }}
          >
            {loading ? "Working…" : mode === "login" ? "Log in" : "Create account"}
          </button>

          {/* Helpers */}
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={forgotPassword}
              disabled={sendingReset || loading}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#e5e7eb",
                borderRadius: 12,
                padding: "9px 12px",
                cursor: sendingReset || loading ? "not-allowed" : "pointer",
                fontWeight: 800,
                fontSize: 13,
                opacity: sendingReset || loading ? 0.6 : 1,
              }}
            >
              {sendingReset ? "Sending…" : "Forgot password"}
            </button>

            {mode === "login" && (
              <button
                type="button"
                onClick={resendConfirmation}
                disabled={sendingResend || loading}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#e5e7eb",
                  borderRadius: 12,
                  padding: "9px 12px",
                  cursor: sendingResend || loading ? "not-allowed" : "pointer",
                  fontWeight: 800,
                  fontSize: 13,
                  opacity: sendingResend || loading ? 0.6 : 1,
                }}
              >
                {sendingResend ? "Sending…" : "Resend confirmation"}
              </button>
            )}
          </div>
        </form>

        {msg && (
          <div
            style={{
              marginTop: 14,
              padding: "10px 12px",
              borderRadius: 12,
              border: isSuccess ? "1px solid rgba(34,197,94,0.35)" : "1px solid rgba(239,68,68,0.35)",
              background: isSuccess ? "rgba(34,197,94,0.10)" : "rgba(239,68,68,0.10)",
              color: isSuccess ? "#bbf7d0" : "#fecaca",
              fontSize: 13,
              lineHeight: 1.4,
            }}
          >
            {msg}
          </div>
        )}

        <div style={{ marginTop: 14, fontSize: 13, color: "#9ca3af" }}>
          Tip: if you just signed up and login fails, confirm your email (or disable confirmation in Supabase while
          building).
        </div>
      </div>
    </div>
  );
}
