"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { AppCommunity, AppPost, PrayerRoom, Ministry } from "@/types";

export function useCommunity(communityId: string) {
  const supabase = useMemo(() => createClient(), []);
  
  const [community, setCommunity] = useState<AppCommunity | null>(null);
  const [posts, setPosts] = useState<AppPost[]>([]);
  const [rooms, setRooms] = useState<PrayerRoom[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 👥 PRESENCE STATUS
  const [onlineMembers, setOnlineMembers] = useState<string[]>([]);

  const loadAll = useCallback(async () => {
    if (!communityId) return;
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const [commRes, roomsRes, ministriesRes, postsRes] = await Promise.all([
        supabase.from("communities").select(`*, leader:profiles!leader_id(full_name, username), members:community_members(count)`).eq("id", communityId).single(),
        supabase.from("prayer_rooms").select("*, host:profiles!host_id(full_name)").eq("community_id", communityId).eq("status", "live"),
        supabase.from("ministries").select("*").eq("community_id", communityId).eq("status", "active"),
        supabase.from("community_posts").select("*, author:profiles!author_id(full_name)").eq("community_id", communityId).order("created_at", { ascending: false })
      ]);

      if (commRes.error) throw commRes.error;
      
      setCommunity(commRes.data as AppCommunity);
      if (roomsRes.data) setRooms(roomsRes.data as PrayerRoom[]);
      if (ministriesRes.data) setMinistries(ministriesRes.data as Ministry[]);
      if (postsRes.data) setPosts(postsRes.data as AppPost[]);

      if (session?.user?.id) {
          const { data: member } = await supabase
            .from("community_members")
            .select("*")
            .eq("community_id", communityId)
            .eq("profile_id", session.user.id)
            .single();
          setIsMember(!!member);
      }

    } catch (err: any) {
      setError(err.message);
      console.error("Community fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [communityId, supabase]);

  const join = useCallback(async (userId: string) => {
    if (!communityId || !userId) return false;
    const { error } = await supabase
      .from("community_members")
      .insert({ profile_id: userId, community_id: communityId });
    if (!error) {
      setIsMember(true);
      return true;
    }
    return false;
  }, [communityId, supabase]);

  // 📡 PRESENCE SYNC
  useEffect(() => {
    if (!communityId) return;

    const channel = supabase.channel(`comm-presence:${communityId}`, {
      config: { presence: { key: communityId } }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        // Coleta todos os users/keys presentes
        const presences = Object.keys(state);
        setOnlineMembers(presences);
      })
      .subscribe(async (status: any) => {
        if (status === 'SUBSCRIBED') {
          // Track current user
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await channel.track({ online_at: new Date().toISOString(), user_id: user.id });
          }
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [communityId, supabase]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const value = useMemo(() => ({
    community,
    posts,
    rooms,
    ministries,
    isMember,
    loading,
    error,
    onlineCount: onlineMembers.length,
    join,
    refresh: loadAll,
    setPosts,
    setRooms
  }), [community, posts, rooms, ministries, isMember, loading, error, onlineMembers.length, join, loadAll]);

  return value;
}
