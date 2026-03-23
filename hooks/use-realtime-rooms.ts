"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function useRealtimeRooms(
  communityId: string,
  setRooms: (rooms: any[]) => void
) {
  const supabase = createClient();

  useEffect(() => {
    if (!communityId) return;

    // 🔥 FETCH INICIAL ISOLADO
    const fetchRooms = async () => {
      const { data } = await supabase
        .from("prayer_rooms")
        .select("*")
        .eq("community_id", communityId)
        .eq("status", "live")
        .order("created_at", { ascending: false });

      if (data) setRooms(data);
    };

    fetchRooms();

    // 🔴 REALTIME FILTRADO (ESSENCIAL PARA ISOLAMENTO)
    const channel = supabase
      .channel("rooms-" + communityId)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "prayer_rooms",
          filter: `community_id=eq.${communityId}`,
        },
        () => {
          fetchRooms(); // Atualiza apenas as salas desta igreja
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [communityId, setRooms]);
}
