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
  page: {
    minHeight: "100vh",
    background: "#0b0f19",
    color: "#e5e7eb",
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
  },
  container: {
    maxWidth: 980,
    margin: "0 auto",
    padding: "28px 18px 60px",
  },
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 18,
  },
  title: { margin: 0, fontSize: 28, letterSpacing: -0.2 },
  subtitle: { margin: "8px 0 0", color: "#9ca3af", fontSize: 13, lineHeight: 1.4 },
  pillRow: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 },
  pill: {
    fontSize: 12,
    color: "#cbd5e1",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    padding: "6px 10px",
    borderRadius: 999,
  },
  btn: {
    background: "#ffffff",
    color: "#0b0f19",
    border: "none",
    borderRadius: 12,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 14,
    boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
    whiteSpace: "nowrap",
  },
  btnGhost: {
    background: "transparent",
    color: "#e5e7eb",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 12,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 14,
    whiteSpace: "nowrap",
  },
  btnSmall: {
    background: "rgba(255,255,255,0.08)",
    color: "#e5e7eb",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10,
    padding: "8px 10px",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 13,
  },
  btnSmallPrimary: {
    background: "#ffffff",
    color: "#0b0f19",
    border: "none",
    borderRadius: 10,
    padding: "8px 10px",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 13,
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
    alignItems: "start",
    marginTop: 12,
  },
  card: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },
  cardTitle: { margin: 0, fontSize: 16, letterSpacing: -0.2 },
  cardDesc: { margin: "8px 0 0", color: "#9ca3af", fontSize: 13, lineHeight: 1.4 },
  formCol: { display: "grid", gap: 10, marginTop: 12 },
  label: { display: "block", color: "#cbd5e1", fontSize: 12, marginBottom: 6 },
  input: {
    width: "100%",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#e5e7eb",
    borderRadius: 12,
    padding: "10px 12px",
    outline: "none",
    fontSize: 14,
  },
  inputMono: {
    width: "100%",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#e5e7eb",
    borderRadius: 12,
    padding: "10px 12px",
    outline: "none",
    fontSize: 13,
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  msg: {
    marginTop: 10,
    padding: "10px 12px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    color: "#e5e7eb",
    fontSize: 13,
  },
  msgError: {
    marginTop: 10,
    padding: "10px 12px",
    borderRadius: 12,
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.30)",
    color: "#fecaca",
    fontSize: 13,
  },
  list: { display: "grid", gap: 10, marginTop: 12 },
  item: {
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 14,
    padding: 12,
    background: "rgba(0,0,0,0.20)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  itemTitle: { fontWeight: 900, fontSize: 14, margin: 0 },
  itemMeta: { color: "#9ca3af", fontSize: 12, marginTop: 6 },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    color: "#cbd5e1",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    padding: "6px 10px",
    borderRadius: 999,
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
          <section style={styles.card}>
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
                    <button
                      style={styles.btnSmall}
                      type="button"
                      onClick={() => router.push(`/rooms/${createdRoomId}`)}
                    >
                      Go to room →
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Join room */}
          <section style={styles.card}>
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
        <section style={{ ...styles.card, marginTop: 14 }}>
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
            <p style={{ marginTop: 12, color: "#9ca3af" }}>Loading…</p>
          ) : rooms.length === 0 ? (
            <p style={{ marginTop: 12, color: "#9ca3af" }}>You’re not in any rooms yet.</p>
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
                      <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <span style={styles.badge}>ID: {r.id.slice(0, 8)}…</span>
                        {isMine ? <span style={styles.badge}>Admin</span> : <span style={styles.badge}>Member</span>}
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
