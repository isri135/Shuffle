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
      // With RLS: this returns only rooms you are a member of (via policy)
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
      // RPC from Step 3: create_room(room_name text, access_key_plain text) returns uuid
      const { data: roomId, error } = await supabase.rpc("create_room", {
        room_name: cleanName,
        access_key_plain: roomAccessKey ?? "",
      });

      if (error) throw error;
      if (!roomId) throw new Error("Room created but no roomId returned.");

      setCreatedRoomId(roomId as string);

      // fetch invite token to build link
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

      setCreateMsg("Room created!");
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
    setCreateMsg("Invite link copied!");
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
      // RPC from Step 3: join_room_by_key(access_key_plain text) returns uuid
      const { data: roomId, error } = await supabase.rpc("join_room_by_key", {
        access_key_plain: key,
      });

      if (error) throw error;
      if (!roomId) throw new Error("No room returned.");

      setJoinKey("");
      setJoinMsg("Joined!");
      await refreshRooms();
      router.push(`/rooms/${roomId}`);
    } catch (e: any) {
      setJoinMsg(e?.message ?? "Failed to join room");
    } finally {
      setJoining(false);
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>Dashboard</h1>
          <p style={{ marginTop: 6, color: "#444" }}>Signed in as: {email ?? "..."}</p>
        </div>
        <button onClick={logout}>Log out</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 18 }}>
        {/* Create room */}
        <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>Create a room</h2>
          <form onSubmit={handleCreateRoom} style={{ display: "grid", gap: 10 }}>
            <input
              placeholder="Room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required
            />
            <input
              placeholder="Access key (optional)"
              value={roomAccessKey}
              onChange={(e) => setRoomAccessKey(e.target.value)}
            />
            <button type="submit" disabled={creating}>
              {creating ? "Creating..." : "Create room"}
            </button>
          </form>

          {createMsg && <p style={{ marginTop: 10 }}>{createMsg}</p>}

          {inviteLink && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 13, color: "#444", marginBottom: 6 }}>Invite via link</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={inviteLink} readOnly style={{ flex: 1 }} />
                <button type="button" onClick={copyInvite}>
                  Copy
                </button>
              </div>
              {createdRoomId && (
                <button
                  style={{ marginTop: 10 }}
                  type="button"
                  onClick={() => router.push(`/rooms/${createdRoomId}`)}
                >
                  Go to room
                </button>
              )}
            </div>
          )}
        </section>

        {/* Join room */}
        <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>Join a room</h2>
          <form onSubmit={handleJoinRoom} style={{ display: "grid", gap: 10 }}>
            <input
              placeholder="Enter access key"
              value={joinKey}
              onChange={(e) => setJoinKey(e.target.value)}
              required
            />
            <button type="submit" disabled={joining}>
              {joining ? "Joining..." : "Join room"}
            </button>
          </form>
          {joinMsg && <p style={{ marginTop: 10 }}>{joinMsg}</p>}
        </section>
      </div>

      {/* My rooms */}
      <section style={{ marginTop: 22, border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <h2 style={{ margin: 0 }}>My rooms</h2>
          <button onClick={refreshRooms} disabled={roomsLoading}>
            {roomsLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {roomsErr && <p style={{ marginTop: 10, color: "crimson" }}>{roomsErr}</p>}

        {roomsLoading ? (
          <p style={{ marginTop: 10 }}>Loading rooms...</p>
        ) : rooms.length === 0 ? (
          <p style={{ marginTop: 10 }}>You’re not in any rooms yet.</p>
        ) : (
          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            {rooms.map((r) => (
              <div
                key={r.id}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 10,
                  padding: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    {new Date(r.created_at).toLocaleString()}{" "}
                    {userId && r.owner_id === userId ? "• owner" : ""}
                  </div>
                </div>
                <button onClick={() => router.push(`/rooms/${r.id}`)}>Open</button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
