"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { 
  Flame, 
  Users, 
  Globe,
  Radio,
  ChevronRight,
  Music,
  Heart,
  Volume2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// hooks
import { useAuth } from "@/hooks/use-auth";
import { useCommunity } from "@/hooks/use-community";
import { useRealtimeRooms } from "@/hooks/use-realtime-rooms";
import { useToast } from "@/components/ui/toast";

import { 
  HeroSection, 
  LiveSections, 
  RoomsSection, 
  PrayerRequests,
  TimelineSection
} from "@/components/app/communities/sections";
import { RightSidebar } from "@/components/app/communities/right-sidebar";
import { getCommunityPostsAction } from "@/app/actions/post-actions";

export default function CommunityChurchPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { toast } = useToast();
  const { user } = useAuth();

  const [localRooms, setLocalRooms] = useState<any[]>([]);
  const [globalRooms, setGlobalRooms] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);

  const {
    community,
    loading: communityLoading,
    onlineCount,
  } = useCommunity(id);

  const fetchPosts = async () => {
    const res = await getCommunityPostsAction(id);
    if (res.success) setPosts(res.data || []);
  };

  useEffect(() => {
    fetchPosts();
  }, [id]);

  // 🔴 REALTIME
  useRealtimeRooms(id, setLocalRooms);

  // 🌍 MONITOR GLOBAL
  useEffect(() => {
    const fetchGlobal = async () => {
      const { data } = await supabase.from("prayer_rooms").select("*").is('community_id', null).eq('status', 'live').limit(5);
      setGlobalRooms(data || []);
    };
    fetchGlobal();
    const ch = supabase.channel('global-sync-altar').on('postgres_changes', { event: '*', table: 'prayer_rooms', filter: 'community_id=is.null' }, () => fetchGlobal()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [supabase]);

  const handleAction = async () => {
    const active = localRooms[0] || globalRooms[0];
    if (active) {
       router.push(`/war-room/${active.id}`);
       return;
    }
    
    try {
      if (!user) { toast("Login necessário", "Entre para iniciar o clamor.", "error"); return; }
      const { data } = await supabase.from("prayer_rooms").insert({ name: `Clamor ${currentCommunity.name}`, community_id: id, status: "live", host_id: user.id }).select().single();
      if (data) router.push(`/war-room/${data.id}`);
    } catch (e) { toast("Erro", "Falha técnica no altar.", "error"); }
  };

  if (communityLoading || !community) return <div className="min-h-screen bg-slate-50" />;

  const currentCommunity = community!;

  const activePrayer = localRooms[0] || globalRooms[0];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 p-6">
        
        {/* COLUNA PRINCIPAL */}
        <main className="flex flex-col gap-6">
          <HeroSection 
            community={currentCommunity} 
            activePrayer={activePrayer} 
            handleAction={handleAction} 
          />
          <LiveSections onlineCount={onlineCount} />
          
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">
            <div className="flex flex-col gap-8">
               <TimelineSection posts={posts} onRefresh={fetchPosts} communityId={id} />
            </div>
            <div className="flex flex-col gap-8">
               <RoomsSection globalRooms={globalRooms} localRooms={localRooms} />
               <PrayerRequests />
            </div>
          </div>
        </main>

        {/* SIDEBAR */}
        <RightSidebar 
          community={currentCommunity} 
          activeRoomsCount={localRooms.length + globalRooms.length} 
          onlineCount={onlineCount} 
        />
        
      </div>
    </div>
  );
}
