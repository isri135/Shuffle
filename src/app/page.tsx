"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/dashboard");
      else router.replace("/login");
    });
  }, [router]);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <p>Loading...</p>
    </div>
  );
}
