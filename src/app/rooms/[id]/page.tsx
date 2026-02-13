"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type TaskRow = {
  id: string;
  title: string;
  difficulty: number;
  created_at: string;
  created_by: string;
  is_done: boolean;
  task_assignments?: { assignee_id: string | null; assigned_at: string | null } | null;
};

type MemberRow = {
  user_id: string;
  role: string;
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
    fontWeight: 700,
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
    fontWeight: 700,
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
    fontWeight: 700,
    fontSize: 13,
  },
  btnSmallPrimary: {
    background: "#ffffff",
    color: "#0b0f19",
    border: "none",
    borderRadius: 10,
    padding: "8px 10px",
    cursor: "pointer",
    fontWeight: 800,
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
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 130px 140px",
    gap: 10,
    marginTop: 12,
  },
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
  select: {
    width: "100%",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#e5e7eb",
    borderRadius: 12,
    padding: "10px 12px",
    outline: "none",
    fontSize: 14,
    appearance: "none",
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
  },
  itemTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  itemTitle: { fontWeight: 800, fontSize: 14, margin: 0 },
  itemMeta: { color: "#9ca3af", fontSize: 12, marginTop: 6 },
  rowBetween: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 10 },
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

export default function RoomPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const roomId = params.id;

  const [roomName, setRoomName] = useState<string>("");
  const [me, setMe] = useState<{ id: string; email: string | null } | null>(null);

  const [isOwner, setIsOwner] = useState(false);

  // Add task
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<number>(3);
  const [addMsg, setAddMsg] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  // Tasks
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksErr, setTasksErr] = useState<string | null>(null);

  const myTasks = useMemo(
    () => tasks.filter((t) => t.task_assignments?.assignee_id === me?.id),
    [tasks, me?.id]
  );

  // Members (for admin manual assignment)
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [membersErr, setMembersErr] = useState<string | null>(null);

  // Admin actions
  const [randomizing, setRandomizing] = useState(false);
  const [adminMsg, setAdminMsg] = useState<string | null>(null);

  const origin = useMemo(() => (typeof window !== "undefined" ? window.location.origin : ""), []);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        router.replace("/login");
        return;
      }
      setMe({ id: u.user.id, email: u.user.email ?? null });

      await Promise.all([loadRoom(), loadTasks(), loadMembersAndOwner(u.user.id)]);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  async function loadRoom() {
    const { data, error } = await supabase.from("rooms").select("name").eq("id", roomId).single();
    if (!error && data) setRoomName(data.name);
  }

  async function loadTasks() {
    setTasksLoading(true);
    setTasksErr(null);
    try {
      const { data, error } = await supabase
        .from("room_tasks")
        .select(
          `
          id, title, difficulty, created_at, created_by, is_done,
          task_assignments ( assignee_id, assigned_at )
        `
        )
        .eq("room_id", roomId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const normalized = (data ?? []).map((t: any) => ({
        ...t,
        task_assignments: Array.isArray(t.task_assignments) ? t.task_assignments[0] ?? null : t.task_assignments,
      })) as TaskRow[];

      setTasks(normalized);
    } catch (e: any) {
      setTasksErr(e?.message ?? "Failed to load tasks");
    } finally {
      setTasksLoading(false);
    }
  }

  async function loadMembersAndOwner(myId: string) {
    setMembersErr(null);
    try {
      const { data: room, error: roomErr } = await supabase
        .from("rooms")
        .select("owner_id")
        .eq("id", roomId)
        .single();

      if (!roomErr && room?.owner_id) setIsOwner(room.owner_id === myId);

      const { data: mems, error: memErr } = await supabase
        .from("room_members")
        .select("user_id, role")
        .eq("room_id", roomId);

      if (memErr) throw memErr;
      setMembers((mems ?? []) as MemberRow[]);
    } catch (e: any) {
      setMembersErr(e?.message ?? "Failed to load members");
    }
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    setAddMsg(null);
    setAdminMsg(null);

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setAddMsg("Task title is required.");
      return;
    }
    if (difficulty < 1 || difficulty > 5) {
      setAddMsg("Difficulty must be between 1 and 5.");
      return;
    }

    setAdding(true);
    try {
      const { error } = await supabase.rpc("add_room_task", {
        rid: roomId,
        task_title: cleanTitle,
        diff: difficulty,
      });
      if (error) throw error;

      setTitle("");
      setDifficulty(3);
      setAddMsg("Task added.");
      await loadTasks();
    } catch (e: any) {
      setAddMsg(e?.message ?? "Failed to add task");
    } finally {
      setAdding(false);
    }
  }

  async function randomize() {
    setAdminMsg(null);
    setAddMsg(null);
    setRandomizing(true);
    try {
      const { data: count, error } = await supabase.rpc("randomize_tasks", { rid: roomId });
      if (error) throw error;

      setAdminMsg(`Randomized assignments for ${count ?? 0} task(s).`);
      await loadTasks();
    } catch (e: any) {
      setAdminMsg(e?.message ?? "Failed to randomize");
    } finally {
      setRandomizing(false);
    }
  }

  async function assignTask(taskId: string, assigneeId: string) {
    setAdminMsg(null);
    setAddMsg(null);
    try {
      const { error } = await supabase.rpc("assign_task", { tid: taskId, assignee: assigneeId });
      if (error) throw error;

      setAdminMsg("Assigned.");
      await loadTasks();
    } catch (e: any) {
      setAdminMsg(e?.message ?? "Failed to assign");
    }
  }

  async function markDone(taskId: string, done: boolean) {
    setAdminMsg(null);
    setAddMsg(null);
    const { error } = await supabase.from("room_tasks").update({ is_done: done }).eq("id", taskId);
    if (!error) loadTasks();
  }

  function difficultyLabel(d: number) {
    if (d <= 1) return "Easy";
    if (d === 2) return "Light";
    if (d === 3) return "Medium";
    if (d === 4) return "Hard";
    return "Brutal";
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topbar}>
          <div>
            <h1 style={styles.title}>{roomName || "Room"}</h1>
            <div style={styles.subtitle}>
              Signed in as <b>{me?.email ?? "..."}</b>
              <div style={styles.pillRow}>
                <span style={styles.pill}>
                  Room: <span style={{ fontFamily: styles.inputMono.fontFamily }}>{roomId}</span>
                </span>
                {isOwner ? <span style={styles.pill}>Admin</span> : <span style={styles.pill}>Member</span>}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button style={styles.btnGhost} type="button" onClick={() => router.push("/dashboard")}>
              ← Back
            </button>
          </div>
        </div>

        {/* Create / Admin row */}
        <div style={styles.grid2}>
          {/* Add task */}
          <section style={styles.card}>
            <h2 style={styles.cardTitle}>Add a task</h2>
            <p style={styles.cardDesc}>Anyone in the room can add chores. Difficulty is 1–5.</p>

            <form onSubmit={addTask} style={styles.formRow}>
              <div>
                <label style={styles.label}>Task</label>
                <input
                  style={styles.input}
                  placeholder="e.g., Dishes, Vacuum, Laundry"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label style={styles.label}>Difficulty</label>
                <select
                  style={styles.select}
                  value={difficulty}
                  onChange={(e) => setDifficulty(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5].map((d) => (
                    <option key={d} value={d}>
                      {d} – {difficultyLabel(d)}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ alignSelf: "end" }}>
                <button style={styles.btnSmallPrimary} type="submit" disabled={adding}>
                  {adding ? "Adding…" : "Add"}
                </button>
              </div>
            </form>

            {addMsg && <div style={styles.msg}>{addMsg}</div>}
          </section>

          {/* Admin tools */}
          <section style={styles.card}>
            <h2 style={styles.cardTitle}>Admin tools</h2>
            <p style={styles.cardDesc}>
              {isOwner ? "Assign chores or randomize tasks for everyone." : "Only the room owner can assign/randomize."}
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
              <button
                style={isOwner ? styles.btn : { ...styles.btn, opacity: 0.5, cursor: "not-allowed" }}
                type="button"
                disabled={!isOwner || randomizing}
                onClick={randomize}
              >
                {randomizing ? "Randomizing…" : "Randomize assignments"}
              </button>
            </div>

            {adminMsg && <div style={styles.msg}>{adminMsg}</div>}
            {membersErr && <div style={styles.msgError}>{membersErr}</div>}
          </section>
        </div>

        {/* My chores */}
        <section style={{ ...styles.card, marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <div>
              <h2 style={styles.cardTitle}>My chores</h2>
              <p style={styles.cardDesc}>Tasks currently assigned to you.</p>
            </div>
            <button style={styles.btnSmall} type="button" onClick={loadTasks} disabled={tasksLoading}>
              {tasksLoading ? "Loading…" : "Refresh"}
            </button>
          </div>

          {tasksErr && <div style={styles.msgError}>{tasksErr}</div>}

          {tasksLoading ? (
            <p style={{ marginTop: 12, color: "#9ca3af" }}>Loading…</p>
          ) : myTasks.length === 0 ? (
            <p style={{ marginTop: 12, color: "#9ca3af" }}>You have no assigned chores 🎉</p>
          ) : (
            <div style={styles.list}>
              {myTasks.map((t) => (
                <div key={t.id} style={styles.item}>
                  <div style={styles.itemTop}>
                    <div>
                      <div
                        style={{
                          ...styles.itemTitle,
                          textDecoration: t.is_done ? "line-through" : "none",
                          opacity: t.is_done ? 0.7 : 1,
                        }}
                      >
                        {t.title}
                      </div>
                      <div style={styles.itemMeta}>
                        Difficulty: {t.difficulty}/5 • {difficultyLabel(t.difficulty)}
                      </div>
                    </div>
                    <button style={styles.btnSmall} type="button" onClick={() => markDone(t.id, !t.is_done)}>
                      {t.is_done ? "Undo" : "Done"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* All tasks */}
        <section style={{ ...styles.card, marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <div>
              <h2 style={styles.cardTitle}>All tasks</h2>
              <p style={styles.cardDesc}>Everyone in the room sees the same list.</p>
            </div>
            <button style={styles.btnSmall} type="button" onClick={loadTasks} disabled={tasksLoading}>
              {tasksLoading ? "Loading…" : "Refresh"}
            </button>
          </div>

          {tasksLoading ? (
            <p style={{ marginTop: 12, color: "#9ca3af" }}>Loading…</p>
          ) : tasks.length === 0 ? (
            <p style={{ marginTop: 12, color: "#9ca3af" }}>No tasks yet.</p>
          ) : (
            <div style={styles.list}>
              {tasks.map((t) => {
                const assignee = t.task_assignments?.assignee_id ?? null;

                return (
                  <div key={t.id} style={styles.item}>
                    <div style={styles.itemTop}>
                      <div>
                        <div
                          style={{
                            ...styles.itemTitle,
                            textDecoration: t.is_done ? "line-through" : "none",
                            opacity: t.is_done ? 0.7 : 1,
                          }}
                        >
                          {t.title}
                        </div>
                        <div style={styles.itemMeta}>
                          Difficulty: {t.difficulty}/5 • {difficultyLabel(t.difficulty)} •{" "}
                          {new Date(t.created_at).toLocaleString()} • {t.is_done ? "Done" : "Not done"}
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <button style={styles.btnSmall} type="button" onClick={() => markDone(t.id, !t.is_done)}>
                          {t.is_done ? "Undo" : "Done"}
                        </button>
                      </div>
                    </div>

                    <div style={styles.rowBetween}>
                      <span style={styles.badge}>
                        Assigned:{" "}
                        {assignee ? (
                          <span style={{ fontFamily: styles.inputMono.fontFamily }}>{assignee.slice(0, 8)}…</span>
                        ) : (
                          <span style={{ color: "#9ca3af" }}>Unassigned</span>
                        )}
                      </span>

                      {isOwner && (
                        <div style={{ width: 320, maxWidth: "100%" }}>
                          <select
                            style={styles.select}
                            value={assignee ?? ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (!val) return;
                              assignTask(t.id, val);
                            }}
                          >
                            <option value="">Assign to…</option>
                            {members.map((m) => (
                              <option key={m.user_id} value={m.user_id}>
                                {m.user_id}
                                {m.role === "owner" ? " (owner)" : ""}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Invite reminder */}
        <section style={{ ...styles.card, marginTop: 14 }}>
          <h2 style={styles.cardTitle}>Invite</h2>
          <p style={styles.cardDesc}>
            Invite links look like: <input style={{ ...styles.inputMono, marginTop: 8 }} readOnly value={`${origin}/invite/<token>`} />
          </p>
        </section>
      </div>
    </div>
  );
}
