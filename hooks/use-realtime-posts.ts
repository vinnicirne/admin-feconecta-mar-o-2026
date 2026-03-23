"use client";

import { useEffect, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { AppPost } from "@/types";

export function useRealtimePosts(communityId: string | null, setPosts: React.Dispatch<React.SetStateAction<AppPost[]>>) {
  const supabase = useMemo(() => createClient(), []);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!communityId) return;

    // Função de limpeza robusta
    const cleanup = () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };

    cleanup();

    const channel = supabase.channel(`comm-p:${communityId}`)
      .on(
        'postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'community_posts', 
          filter: `community_id=eq.${communityId}` 
        }, 
        async (payload: any) => {
          const newPost = payload.new;
          
          // Busca autor para hidratar o post em tempo real
          const { data: author } = await supabase
            .from("profiles")
            .select("full_name, username, avatar_url")
            .eq("id", newPost.author_id)
            .single();
            
          if (author) {
            setPosts(prev => {
              // Prevenção de duplicados (mesmo com o filtro do Supabase pode ocorrer em edge cases de rede)
              if (prev.some(p => p.id === newPost.id)) return prev;
              return [{ ...newPost, author } as AppPost, ...prev];
            });
          }
        }
      )
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          console.log(`📡 Realtime Posts: Conectado na comunidade ${communityId}`);
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
           console.error("📡 Realtime Posts: Erro na conexão, tentando reestabelecer...");
        }
      });

    channelRef.current = channel;

    return cleanup;
  }, [communityId, supabase, setPosts]);
}
