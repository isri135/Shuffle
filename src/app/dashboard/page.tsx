"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type RoomRow = {
  id: string;
  name: string;
  created_at: string;
  owner_id: string;
};

const styles: Record<string, React.CSSProperties> = {
  // ---- RETRO THEME TOKENS ----
  page: {
    minHeight: "100vh",
    background: "#F6EFE5", // warm paper
    color: "#151515",
    fontFamily:
      '"Space Grotesk", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
  },
  // subtle paper grain / dots via overlay (we also add a global style below)
  container: {
    maxWidth: 980,
    margin: "0 auto",
    padding: "28px 18px 70px",
  },

  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 18,
  },

  title: {
    margin: 0,
    fontSize: 34,
    letterSpacing: -0.6,
    lineHeight: 1.05,
  },
  subtitle: {
    margin: "10px 0 0",
    color: "rgba(0,0,0,0.65)",
    fontSize: 13,
    lineHeight: 1.5,
  },

  pillRow: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 },
  pill: {
    fontSize: 12,
    color: "#151515",
    background: "#FFF6B3",
    border: "2px solid #151515",
    padding: "6px 10px",
    borderRadius: 999,
    boxShadow: "3px 3px 0 #151515",
  },

  // Buttons: thick outline + offset shadow
  btn: {
    background: "#151515",
    color: "#FFFFFF",
    border: "2px solid #151515",
    borderRadius: 16,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 14,
    boxShadow: "4px 4px 0 #151515",
    whiteSpace: "nowrap",
    transform: "translate(0,0)",
  },
  btnGhost: {
    background: "#FFFFFF",
    color: "#151515",
    border: "2px solid #151515",
    borderRadius: 16,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 14,
    boxShadow: "4px 4px 0 #151515",
    whiteSpace: "nowrap",
  },
  btnSmall: {
    background: "#FFFFFF",
    color: "#151515",
    border: "2px solid #151515",
    borderRadius: 14,
    padding: "8px 10px",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 13,
    boxShadow: "3px 3px 0 #151515",
  },
  btnSmallPrimary: {
    background: "#B9F5D8", // mint
    color: "#151515",
    border: "2px solid #151515",
    borderRadius: 14,
    padding: "8px 10px",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 13,
    boxShadow: "3px 3px 0 #151515",
  },

  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
    alignItems: "start",
    marginTop: 12,
  },

  // Cards: pastel fill + thick outline + big offset shadow
  card: {
    background: "#FFFFFF",
    border: "2px solid #151515",
    borderRadius: 22,
    padding: 18,
    boxShadow: "8px 8px 0 #151515",
  },
  cardTitle: { margin: 0, fontSize: 16, letterSpacing: -0.2, fontWeight: 900 },
  cardDesc: {
    margin: "8px 0 0",
    color: "rgba(0,0,0,0.65)",
    fontSize: 13,
    lineHeight: 1.5,
  },

  formCol: { display: "grid", gap: 10, marginTop: 12 },
  label: { display: "block", color: "rgba(0,0,0,0.80)", fontSize: 12, marginBottom: 6, fontWeight: 700 },

  // Inputs: white, thick border, subtle inner shadow
  input: {
    width: "100%",
    background: "#FFFFFF",
    border: "2px solid #151515",
    color: "#151515",
    borderRadius: 16,
    padding: "10px 12px",
    outline: "none",
    fontSize: 14,
    boxShadow: "inset 0 1px 0 rgba(0,0,0,0.08)",
  },
  inputMono: {
    width: "100%",
    background: "#FFFFFF",
    border: "2px solid #151515",
    color: "#151515",
    borderRadius: 16,
    padding: "10px 12px",
    outline: "none",
    fontSize: 13,
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    boxShadow: "inset 0 1px 0 rgba(0,0,0,0.08)",
  },

  // Messages: look like sticky notes
  msg: {
    marginTop: 10,
    padding: "10px 12px",
    borderRadius: 16,
    background: "#E9F0FF",
    border: "2px solid #151515",
    color: "#151515",
    fontSize: 13,
    boxShadow: "4px 4px 0 #151515",
  },
  msgError: {
    marginTop: 10,
    padding: "10px 12px",
    borderRadius: 16,
    background: "#FFD7D7",
    border: "2px solid #151515",
    color: "#151515",
    fontSize: 13,
    boxShadow: "4px 4px 0 #151515",
  },

  list: { display: "grid", gap: 10, marginTop: 12 },

  item: {
    border: "2px solid #151515",
    borderRadius: 18,
    padding: 14,
    background: "#FFF7E0", // warm card
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    boxShadow: "6px 6px 0 #151515",
  },
  itemTitle: { fontWeight: 950, fontSize: 14, margin: 0 },
  itemMeta: { color: "rgba(0,0,0,0.65)", fontSize: 12, marginTop: 6 },

  // Badges: pastel chips w/ outline
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    color: "#151515",
    background: "#FFFFFF",
    border: "2px solid #151515",
    padding: "6px 10px",
    borderRadius: 999,
    boxShadow: "3px 3px 0 #151515",
    fontWeight: 800,
  },
};

export default function DashboardPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  // Create room form
  const [roomName, setRoomName] = useState("");
  const [roomAccessKey, setRoomAccessKey] = useState("");
  const [createMsg, setCreateMsg] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  // Join room form
  const [joinKey, setJoinKey] = useState("");
  const [joinMsg, setJoinMsg] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  // My rooms list
  const [rooms, setRooms] = useState<RoomRow[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [roomsErr, setRoomsErr] = useState<string | null>(null);

  const origin = useMemo(() => (typeof window !== "undefined" ? window.location.origin : ""), []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/login");
        return;
      }
      setUserId(data.user.id);
      setEmail(data.user.email ?? null);
      await refreshRooms();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function refreshRooms() {
    setRoomsLoading(true);
    setRoomsErr(null);
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("id,name,created_at,owner_id")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRooms((data ?? []) as RoomRow[]);
    } catch (e: any) {
      setRoomsErr(e?.message ?? "Could not load rooms");
    } finally {
      setRoomsLoading(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  async function handleCreateRoom(e: React.FormEvent) {
    e.preventDefault();
    setCreateMsg(null);
    setInviteLink(null);
    setCreatedRoomId(null);
    setCreating(true);

    const cleanName = roomName.trim();
    if (!cleanName) {
      setCreateMsg("Room name is required.");
      setCreating(false);
      return;
    }

    try {
      const { data: roomId, error } = await supabase.rpc("create_room", {
        room_name: cleanName,
        access_key_plain: roomAccessKey ?? "",
      });

      if (error) throw error;
      if (!roomId) throw new Error("Room created but no roomId returned.");

      setCreatedRoomId(roomId as string);

      const { data: inviteRow, error: inviteErr } = await supabase
        .from("room_invites")
        .select("invite_token")
        .eq("room_id", roomId)
        .single();

      if (inviteErr) throw inviteErr;

      const token = inviteRow?.invite_token as string | undefined;
      if (token) {
        const link = `${origin}/invite/${token}`;
        setInviteLink(link);
      }

      setCreateMsg("Room created.");
      setRoomName("");
      setRoomAccessKey("");
      await refreshRooms();
    } catch (e: any) {
      setCreateMsg(e?.message ?? "Failed to create room");
    } finally {
      setCreating(false);
    }
  }

  async function copyInvite() {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCreateMsg("Invite link copied.");
  }

  async function handleJoinRoom(e: React.FormEvent) {
    e.preventDefault();
    setJoinMsg(null);
    setJoining(true);

    const key = joinKey.trim();
    if (!key) {
      setJoinMsg("Access key is required.");
      setJoining(false);
      return;
    }

    try {
      const { data: roomId, error } = await supabase.rpc("join_room_by_key", {
        access_key_plain: key,
      });

      if (error) throw error;
      if (!roomId) throw new Error("No room returned.");

      setJoinKey("");
      setJoinMsg("Joined.");
      await refreshRooms();
      router.push(`/rooms/${roomId}`);
    } catch (e: any) {
      setJoinMsg(e?.message ?? "Failed to join room");
    } finally {
      setJoining(false);
    }
  }

  return (
    <div style={styles.page}>
      {/* Optional: retro font + paper dots */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800&display=swap");
        body {
          background: ${styles.page.background};
        }
      `}</style>

      <div style={styles.container}>
        <div style={styles.topbar}>
          <div>
            <h1 style={styles.title}>Dashboard</h1>
            <div style={styles.subtitle}>
              Signed in as <b>{email ?? "..."}</b>
              <div style={styles.pillRow}>
                {userId ? <span style={styles.pill}>User: {userId.slice(0, 8)}…</span> : null}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button style={styles.btnGhost} onClick={refreshRooms} disabled={roomsLoading}>
              {roomsLoading ? "Refreshing…" : "Refresh"}
            </button>
            <button style={styles.btn} onClick={logout}>
              Log out
            </button>
          </div>
        </div>

        {/* Create / Join */}
        <div style={styles.grid2}>
          {/* Create room */}
          <section style={{ ...styles.card, background: "#E9F0FF" }}>
            <h2 style={styles.cardTitle}>Create a room</h2>
            <p style={styles.cardDesc}>Make a room and share an access key or invite link.</p>

            <form onSubmit={handleCreateRoom} style={styles.formCol}>
              <div>
                <label style={styles.label}>Room name</label>
                <input
                  style={styles.input}
                  placeholder="e.g., Apartment 3B"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={styles.label}>Access key (optional)</label>
                <input
                  style={styles.input}
                  placeholder="e.g., 12345"
                  value={roomAccessKey}
                  onChange={(e) => setRoomAccessKey(e.target.value)}
                />
              </div>

              <button style={styles.btnSmallPrimary} type="submit" disabled={creating}>
                {creating ? "Creating…" : "Create room"}
              </button>
            </form>

            {createMsg && <div style={styles.msg}>{createMsg}</div>}

            {inviteLink && (
              <div style={{ marginTop: 12 }}>
                <div style={{ ...styles.label, marginBottom: 6 }}>Invite link</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input style={styles.inputMono} value={inviteLink} readOnly />
                  <button style={styles.btnSmall} type="button" onClick={copyInvite}>
                    Copy
                  </button>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                  {createdRoomId && (
                    <button style={styles.btnSmall} type="button" onClick={() => router.push(`/rooms/${createdRoomId}`)}>
                      Go to room →
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Join room */}
          <section style={{ ...styles.card, background: "#FFF7E0" }}>
            <h2 style={styles.cardTitle}>Join a room</h2>
            <p style={styles.cardDesc}>Enter the access key you received.</p>

            <form onSubmit={handleJoinRoom} style={styles.formCol}>
              <div>
                <label style={styles.label}>Access key</label>
                <input
                  style={styles.input}
                  placeholder="Enter access key"
                  value={joinKey}
                  onChange={(e) => setJoinKey(e.target.value)}
                  required
                />
              </div>

              <button style={styles.btnSmallPrimary} type="submit" disabled={joining}>
                {joining ? "Joining…" : "Join room"}
              </button>
            </form>

            {joinMsg && <div style={styles.msg}>{joinMsg}</div>}
          </section>
        </div>

        {/* My rooms */}
        <section style={{ ...styles.card, marginTop: 14, background: "#FFFFFF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <div>
              <h2 style={styles.cardTitle}>My rooms</h2>
              <p style={styles.cardDesc}>Rooms you belong to (including ones you created).</p>
            </div>
            <button style={styles.btnSmall} onClick={refreshRooms} disabled={roomsLoading}>
              {roomsLoading ? "Loading…" : "Refresh"}
            </button>
          </div>

          {roomsErr && <div style={styles.msgError}>{roomsErr}</div>}

          {roomsLoading ? (
            <p style={{ marginTop: 12, color: "rgba(0,0,0,0.65)" }}>Loading…</p>
          ) : rooms.length === 0 ? (
            <p style={{ marginTop: 12, color: "rgba(0,0,0,0.65)" }}>You’re not in any rooms yet.</p>
          ) : (
            <div style={styles.list}>
              {rooms.map((r) => {
                const isMine = userId && r.owner_id === userId;
                return (
                  <div key={r.id} style={styles.item}>
                    <div>
                      <div style={styles.itemTitle}>{r.name}</div>
                      <div style={styles.itemMeta}>
                        {new Date(r.created_at).toLocaleString()} {isMine ? "• owner" : ""}
                      </div>
                      <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <span style={styles.badge}>ID: {r.id.slice(0, 8)}…</span>
                        {isMine ? <span style={{ ...styles.badge, background: "#B9F5D8" }}>Admin</span> : <span style={{ ...styles.badge, background: "#FFD7D7" }}>Member</span>}
                      </div>
                    </div>

                    <button style={styles.btnSmallPrimary} onClick={() => router.push(`/rooms/${r.id}`)}>
                      Open →
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
