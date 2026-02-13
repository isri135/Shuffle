"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function RoomPage({ params }: { params: { id: string } }) {
  const [roomName, setRoomName] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select("name")
        .eq("id", params.id)
        .single();

      if (!error && data) setRoomName(data.name);
    })();
  }, [params.id]);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Room</h1>
      <p>Room ID: {params.id}</p>
      <p>Name: {roomName || "..."}</p>
    </div>
  );
}
