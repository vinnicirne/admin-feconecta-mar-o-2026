"use client";

import { Radio, Music, Volume2, Users, Globe, Flame, Heart, LayoutGrid } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { PostCard } from "@/components/app/feed/post-card";
import { PostCreatorClean as PostCreator } from "@/components/app/feed/post-creator-clean";

export function HeroSection({ community, activePrayer, handleAction }: any) {
  const router = useRouter();
  
  return (
    <div className="relative rounded-[48px] p-20 text-center text-white overflow-hidden shadow-2xl bg-gradient-to-br from-indigo-950 via-blue-900 to-indigo-900">
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
      
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2.5 bg-white/10 px-5 py-2 rounded-full mb-6 border border-white/10 backdrop-blur-md">
          <Radio size={14} className="animate-pulse text-red-500" />
          <span className="text-[11px] font-black uppercase tracking-widest">
            {activePrayer ? "Clamor em Andamento" : "Altar Aguardando Intercessores"}
          </span>
        </div>
        
        <h1 className="text-6xl font-black mb-6 tracking-tighter leading-none uppercase">
          {activePrayer ? (activePrayer.name || "CLAMOR DA NOITE") : community.name}
        </h1>

        {activePrayer ? (
          <button 
            onClick={() => router.push(`/war-room/${activePrayer.id}`)} 
            className="px-16 py-6 bg-red-600 hover:scale-105 transition-transform rounded-3xl font-black text-lg shadow-[0_20px_50px_rgba(239,68,68,0.3)]"
          >
            ENTRAR NA ORAÇÃO
          </button>
        ) : (
          <button 
            onClick={handleAction} 
            className="px-16 py-6 bg-[#F5C76B] hover:scale-105 transition-transform rounded-3xl font-black text-lg text-indigo-950 shadow-[0_20px_50px_rgba(245,199,107,0.2)]"
          >
            INICIAR CLAMOR LIVE
          </button>
        )}
      </div>
    </div>
  );
}

export function LiveSections({ onlineCount }: { onlineCount: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card variant="modern" padding="40px" className="flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <Music size={18} className="text-indigo-500" />
          <h3 className="text-[12px] font-black uppercase tracking-widest text-slate-400">Louvor ao Vivo</h3>
        </div>
        <div className="flex gap-6 items-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-700 grid place-items-center shadow-lg shadow-indigo-500/30">
            <Volume2 size={40} className="text-white" />
          </div>
          <div>
            <strong className="text-2xl font-black mb-0 tracking-tight block">Oceano</strong>
            <span className="text-slate-400 font-bold text-sm">Hillsong United</span>
          </div>
        </div>
      </Card>

      <Card variant="modern" padding="40px" className="flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <Users size={18} className="text-emerald-500" />
          <h3 className="text-[12px] font-black uppercase tracking-widest text-slate-400">Comunhão</h3>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-black tracking-tighter">{onlineCount || 1}</span>
          <span className="text-sm font-extrabold text-slate-400 uppercase tracking-widest">Intercessores Online</span>
        </div>
      </Card>
    </div>
  );
}

export function RoomsSection({ globalRooms, localRooms }: any) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-8">
      <section>
        <div className="flex items-center gap-3 mb-6 px-3">
          <Globe size={18} className="text-indigo-500" />
          <h3 className="text-[13px] font-black uppercase tracking-widest text-slate-400">Intercessão Global</h3>
        </div>
        <div className="flex flex-col gap-4">
          {globalRooms.map((room: any) => (
            <Card key={room.id} variant="modern" padding="20px 32px" className="flex justify-between items-center transition-all hover:bg-white/90">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 grid place-items-center">
                  <Globe size={20} className="text-indigo-500" />
                </div>
                <strong className="text-base text-slate-900">{room.name || "Clamor Mundial"}</strong>
              </div>
              <button 
                onClick={() => router.push(`/war-room/${room.id}`)} 
                className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-black text-[11px] hover:bg-emerald-600 transition-colors"
              >
                ENTRAR
              </button>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-6 px-3">
          <Flame size={18} className="text-amber-500" />
          <h3 className="text-[13px] font-black uppercase tracking-widest text-slate-400">Salas da Igreja</h3>
        </div>
        <div className="flex flex-col gap-4">
          {localRooms.length > 0 ? localRooms.map((room: any) => (
            <Card key={room.id} variant="modern" padding="20px 32px" className="flex justify-between items-center transition-all hover:bg-white/90">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 grid place-items-center">
                  <Flame size={20} className="text-amber-500 fill-amber-500" />
                </div>
                <strong className="text-base text-slate-900">{room.name}</strong>
              </div>
              <button 
                onClick={() => router.push(`/war-room/${room.id}`)} 
                className="px-6 py-2.5 rounded-xl bg-indigo-950 text-white font-black text-[11px] hover:bg-slate-800 transition-colors"
              >
                ENTRAR
              </button>
            </Card>
          )) : (
            <div className="text-center p-10 bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-200">
              <p className="text-[13px] text-slate-400 font-bold uppercase tracking-widest">Nenhum clamor local iniciado ainda. 🙏</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export function TimelineSection({ posts, onRefresh, communityId }: { posts: any[], onRefresh: () => void, communityId?: string }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 mb-2 px-3">
        <LayoutGrid size={18} className="text-indigo-500" />
        <h3 className="text-[13px] font-black uppercase tracking-widest text-slate-400">Timeline da Igreja</h3>
      </div>
      
      <PostCreator communityId={communityId} onSuccess={onRefresh} />
      
      {posts.length === 0 ? (
        <div className="text-center p-20 bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-200">
          <p className="text-[13px] text-slate-400 font-bold uppercase tracking-widest">Nenhuma postagem ainda. 🙏</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map(post => (
            <PostCard key={post.id} post={post} onRefresh={onRefresh} />
          ))}
        </div>
      )}
    </div>
  );
}

export function PrayerRequests() {
  return (
    <section>
      <div className="flex items-center gap-3 mb-6 px-3">
        <Heart size={18} className="text-rose-500 fill-rose-500" />
        <h3 className="text-[13px] font-black uppercase tracking-widest text-slate-400">Pedidos Urgentes</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PrayerCard text="Ore pela restauração da minha família e paz no meu lar." count={14} />
        <PrayerCard text="Pela minha saúde, exames importantes amanhã de manhã." count={8} />
      </div>
    </section>
  );
}

function PrayerCard({ text, count }: any) {
  return (
    <Card variant="modern" padding="32px" className="flex flex-col justify-between hover:shadow-md transition-shadow">
      <p className="mb-6 text-base leading-relaxed font-semibold text-slate-800 italic">"{text}"</p>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Heart size={14} className="text-rose-500 fill-rose-500" />
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">{count} INTERCESSORES</span>
        </div>
        <button className="px-5 py-2 rounded-xl bg-amber-100/50 text-amber-600 border border-amber-200/50 font-black text-[11px] hover:bg-amber-100 transition-colors">ORAR</button>
      </div>
    </Card>
  );
}
