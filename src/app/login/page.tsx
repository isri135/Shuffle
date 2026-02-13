"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#F6EFE5",
    color: "#151515",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    fontFamily:
      '"Space Grotesk", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
  },

  wrap: {
    width: "100%",
    maxWidth: 460,
    position: "relative",
  },

  // A chunky “sticker” card
  card: {
    width: "100%",
    borderRadius: 24,
    background: "#FFFFFF",
    border: "2px solid #151515",
    boxShadow: "10px 10px 0 #151515",
    padding: 18,
  },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 10,
  },
  title: {
    margin: 0,
    fontSize: 30,
    letterSpacing: -0.6,
    lineHeight: 1.05,
    fontWeight: 900,
  },
  desc: {
    margin: "10px 0 0",
    color: "rgba(0,0,0,0.65)",
    fontSize: 13,
    lineHeight: 1.5,
  },

  // Pills / tabs
  switchBtn: {
    background: "#FFF6B3",
    color: "#151515",
    border: "2px solid #151515",
    borderRadius: 16,
    padding: "9px 12px",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 13,
    whiteSpace: "nowrap",
    boxShadow: "4px 4px 0 #151515",
  },

  form: { marginTop: 16, display: "grid", gap: 12 },

  label: { display: "grid", gap: 6 },
  labelText: { fontSize: 12, color: "rgba(0,0,0,0.80)", fontWeight: 800 },

  input: {
    height: 46,
    borderRadius: 16,
    padding: "10px 12px",
    outline: "none",
    background: "#FFFFFF",
    border: "2px solid #151515",
    color: "#151515",
    fontSize: 14,
    boxShadow: "inset 0 1px 0 rgba(0,0,0,0.08)",
  },

  primaryBtn: {
    height: 46,
    borderRadius: 16,
    border: "2px solid #151515",
    background: "#B9F5D8",
    color: "#151515",
    cursor: "pointer",
    fontWeight: 950,
    fontSize: 14,
    boxShadow: "4px 4px 0 #151515",
  },

  helpersRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },

  helperBtn: {
    background: "#FFFFFF",
    border: "2px solid #151515",
    color: "#151515",
    borderRadius: 16,
    padding: "9px 12px",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 13,
    boxShadow: "3px 3px 0 #151515",
  },

  msg: {
    marginTop: 14,
    padding: "10px 12px",
    borderRadius: 16,
    border: "2px solid #151515",
    background: "#E9F0FF",
    color: "#151515",
    fontSize: 13,
    lineHeight: 1.5,
    boxShadow: "4px 4px 0 #151515",
  },
  msgSuccess: {
    background: "#B9F5D8",
  },
  msgError: {
    background: "#FFD7D7",
  },

  tip: {
    marginTop: 14,
    fontSize: 13,
    color: "rgba(0,0,0,0.65)",
    lineHeight: 1.5,
  },

  // // little corner doodles
  // doodle: {
  //   position: "absolute",
  //   right: -8,
  //   top: -10,
  //   width: 56,
  //   height: 56,
  //   borderRadius: 18,
  //   background: "#FFD7D7",
  //   border: "2px solid #151515",
  //   boxShadow: "6px 6px 0 #151515",
  //   transform: "rotate(8deg)",
  // },
  // doodle2: {
  //   position: "absolute",
  //   left: -10,
  //   bottom: -12,
  //   width: 64,
  //   height: 44,
  //   borderRadius: 18,
  //   background: "#FFF6B3",
  //   border: "2px solid #151515",
  //   boxShadow: "6px 6px 0 #151515",
  //   transform: "rotate(-6deg)",
  // },
};

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
  const isSuccess = !!msg && /success|sent|check your email|copied|created/i.test(msg);

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
            emailRedirectTo: `${location.origin}/auth/callback`,
          },
        });
        if (error) throw error;

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
    <div style={styles.page}>
      {/* Retro font (same as dashboard) */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800&display=swap");
        body {
          background: ${styles.page.background};
        }
      `}</style>

      <div style={styles.wrap}>
        <div style={styles.doodle} />
        <div style={styles.doodle2} />

        <div style={styles.card}>
          <div style={styles.headerRow}>
            <div>
              <h1 style={styles.title}>{mode === "login" ? "Log in" : "Create account"}</h1>
              <p style={styles.desc}>
                {mode === "login"
                  ? "Welcome back. Enter your details to continue."
                  : "Create an account to start using rooms and chores."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              style={styles.switchBtn}
            >
              {mode === "login" ? "Sign up" : "Log in"}
            </button>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label}>
              <span style={styles.labelText}>Email</span>
              <input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={styles.input}
                onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 3px rgba(21,21,21,0.18), inset 0 1px 0 rgba(0,0,0,0.08)")}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(0,0,0,0.08)")}
              />
            </label>

            <label style={styles.label}>
              <span style={styles.labelText}>Password</span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                style={styles.input}
                onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 3px rgba(21,21,21,0.18), inset 0 1px 0 rgba(0,0,0,0.08)")}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(0,0,0,0.08)")}
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.primaryBtn,
                opacity: loading ? 0.75 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Working…" : mode === "login" ? "Log in" : "Create account"}
            </button>

            <div style={styles.helpersRow}>
              <button
                type="button"
                onClick={forgotPassword}
                disabled={sendingReset || loading}
                style={{
                  ...styles.helperBtn,
                  opacity: sendingReset || loading ? 0.65 : 1,
                  cursor: sendingReset || loading ? "not-allowed" : "pointer",
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
                    ...styles.helperBtn,
                    background: "#E9F0FF",
                    opacity: sendingResend || loading ? 0.65 : 1,
                    cursor: sendingResend || loading ? "not-allowed" : "pointer",
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
                ...styles.msg,
                ...(isSuccess ? styles.msgSuccess : styles.msgError),
              }}
            >
              {msg}
            </div>
          )}

          <div style={styles.tip}>
            Tip: if you just signed up and login fails, confirm your email (or disable confirmation in Supabase while
            building).
          </div>
        </div>
      </div>
    </div>
  );
}
