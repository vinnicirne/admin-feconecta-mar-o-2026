"use client";

import { useState, useEffect, useMemo } from "react";
import { Music, Play, Radio, Users, Heart, Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { updatePraiseTrack } from "@/app/actions/praise-actions";
import { createClient } from "@/lib/supabase/client";

const PLAYLIST_DE_FE = [
  { id: "7Euvg8YkL_0", title: "Hino da Vitória (Harpa Cristã)" },
  { id: "v_Vv0fU0e_w", title: "Louvor & Adoração - Instrumental Soaking" },
  { id: "9PZ7zF3N3Xo", title: "Praise & Worship Mix 2026" },
  { id: "kM9f9rD8SjM", title: "Corinhos de Fogo (Especial Oração)" }
];

export default function AdminPraisePage() {
  const supabase = useMemo(() => createClient(), []);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [listeners, setListeners] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchState = async () => {
      const { data } = await supabase.from('praise_session').select('*').limit(1).single();
      if (data) setCurrentTrack(data);
    };
    fetchState();

    const channel = supabase.channel('global_praise', {
      config: { presence: { key: 'admin' } }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setListeners(Object.values(state).flat().length);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  const handleBroadcast = async (track: typeof PLAYLIST_DE_FE[0]) => {
    setLoading(true);
    const res = await updatePraiseTrack(track.id, track.title);
    if (res.success) {
      setCurrentTrack({ track_id: track.id, track_title: track.title, started_at: new Date().toISOString() });
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 40, maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
          <Radio className="primary" size={32} /> Central de Adoração Global
        </h1>
        <p className="muted">Controle o ambiente espiritual de toda a plataforma em tempo real.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        {/* TRANSMITINDO AGORA */}
        <Card variant="elevated" padding={32} style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", color: "white" }}>
          <span style={{ background: "#ef4444", color: "white", padding: "4px 12px", borderRadius: 100, fontSize: 10, fontWeight: 900, letterSpacing: 1 }}>NO AR AGORA</span>
          <h2 style={{ fontSize: 24, fontWeight: 900, margin: "20px 0 8px" }}>{currentTrack?.track_title || "Nenhum louvor ativo"}</h2>
          <p style={{ opacity: 0.7, fontSize: 14 }}>Youtube ID: {currentTrack?.track_id || "---"}</p>
          
          <div style={{ marginTop: 40, display: "flex", gap: 24 }}>
             <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Users size={20} color="#10b981" />
                <strong style={{ fontSize: 24 }}>{listeners}</strong>
                <span className="muted" style={{ fontSize: 12 }}>fies ouvindo</span>
             </div>
             <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Heart size={20} color="#f43f5e" />
                <strong style={{ fontSize: 24 }}>1.2k+</strong>
                <span className="muted" style={{ fontSize: 12 }}>reações hoje</span>
             </div>
          </div>
        </Card>

        {/* PLAYLIST DE TRANSMISSÃO */}
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 900, marginBottom: 20 }}>Mudar Ambiente (Playlist)</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {PLAYLIST_DE_FE.map(track => (
              <Card 
                key={track.id} 
                variant="flat" 
                padding={16} 
                style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  border: currentTrack?.track_id === track.id ? "2px solid var(--primary)" : "1px solid var(--line)"
                }}
              >
                 <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Music size={18} className="muted" />
                    <strong style={{ fontSize: 14 }}>{track.title}</strong>
                 </div>
                 <Button 
                   variant={currentTrack?.track_id === track.id ? "primary" : "outline"} 
                   size="sm"
                   disabled={loading || currentTrack?.track_id === track.id}
                   onClick={() => handleBroadcast(track)}
                 >
                   {currentTrack?.track_id === track.id ? "TRANSMITINDO" : "SOLTAR"}
                 </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
