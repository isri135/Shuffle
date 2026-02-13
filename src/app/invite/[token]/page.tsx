"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function InviteJoinPage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const [msg, setMsg] = useState("Joining room...");

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.auth.getSession();
      if (!s.session) {
        router.replace("/login");
        return;
      }

      const { data: roomId, error } = await supabase.rpc("join_room_by_invite", {
        token: params.token,
      });

      if (error) {
        setMsg(error.message);
        return;
      }

      router.replace(`/rooms/${roomId}`);
    })();
  }, [params.token, router]);

  return <div style={{ padding: 24, fontFamily: "system-ui" }}>{msg}</div>;
}
