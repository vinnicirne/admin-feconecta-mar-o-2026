"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Type, Image, Camera, Mic, X, TrendingUp, Sparkles } from "lucide-react";
import AudioRecorder from "./audio-recorder";
import CameraModal from "./camera-modal";
import TextEditorModal from "./text-editor-modal";
import { createPostAction } from "@/app/actions/post-actions";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

interface MobilePostSheetProps {
  open: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
  communityId?: string;
}

export default function MobilePostSheet({ open, onClose, onPostCreated, communityId }: MobilePostSheetProps) {
  const [activeModal, setActiveModal] = useState<"text" | "camera" | "audio" | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  if (!open) return null;

  const handleMediaSubmit = async (data: any) => {
    try {
      const res = await createPostAction({
        content: "",
        post_type: "compartilhar",
        community_id: communityId,
        ...data,
        status: "published"
      });
      if (res.success) {
        onPostCreated?.();
        onClose();
        setActiveModal(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const contentType = file.type;
      const extension = file.name.split('.').pop();
      const fileName = `gallery/${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
      
      const { data, error } = await supabase.storage
        .from("post-media")
        .upload(fileName, file, { contentType, cacheControl: "3600" });

      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage.from("post-media").getPublicUrl(fileName);
      
      await handleMediaSubmit({ 
        image_url: publicUrl, 
        media_type: contentType.startsWith('video') ? 'video' : 'image' 
      });
    } catch (err: any) {
      alert("Erro no upload da galeria: " + err.message);
    }
  };

  const actions = [
    { icon: Type, label: "Texto", color: "bg-violet-100 text-violet-600", onClick: () => setActiveModal("text") },
    { icon: Camera, label: "Câmera", color: "bg-green-100 text-green-600", onClick: () => setActiveModal("camera") },
    { icon: Mic, label: "Gravar Áudio", color: "bg-orange-100 text-orange-600", onClick: () => setActiveModal("audio") },
    { icon: Image, label: "Galeria", color: "bg-blue-100 text-blue-600", onClick: () => fileRef.current?.click() },
  ];

  return (
    <>
      <div 
        className="fixed inset-0 z-[2000] bg-black/40 backdrop-blur-sm" 
        onClick={onClose}
        style={{ animation: "fade-in 0.3s ease" }}
      />

      <div 
        className="fixed bottom-0 left-0 right-0 z-[2001] bg-white rounded-t-[40px] shadow-2xl"
        style={{ animation: "slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)", padding: "20px 24px 60px" }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <div style={{ width: 40, height: 4, borderRadius: 10, background: "var(--line)" }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", flex: 1, alignItems: "center", gap: 12 }}>
             <div style={{ width: 44, height: 44, borderRadius: 14, background: "var(--primary-soft)", display: "grid", placeItems: "center", overflow: "hidden" }}>
                {user?.user_metadata?.avatar_url ? <img src={user.user_metadata.avatar_url} style={{ width: "100%", height: "100%", borderRadius: 14, objectFit: "cover" }} /> : <TrendingUp size={22} color="var(--primary)" />}
             </div>
             <div>
                <h3 style={{ fontSize: 16, fontWeight: 900, margin: 0 }}>{user?.user_metadata?.full_name?.split(' ')[0] || 'Opa'}, o que vamos edificar? 🕊️</h3>
                <p style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700, margin: 0 }}>Escolha uma forma de semear a palavra.</p>
             </div>
          </div>
          <button onClick={onClose} style={{ border: 0, background: "var(--line)", width: 36, height: 36, borderRadius: 12, cursor: "pointer" }}><X size={20} /></button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {actions.map(({ icon: Icon, label, color, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              style={{
                display: "flex", alignItems: "center", gap: 16, padding: "20px", borderRadius: 24, background: "var(--line)",
                border: 0, cursor: "pointer", transition: "0.2s", textAlign: "left"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f1f5f9"}
            >
              <div className={color} style={{ width: 48, height: 48, borderRadius: 14, display: "grid", placeItems: "center" }}>
                <Icon size={24} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 900 }}>{label}</span>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 20, textAlign: "center" }}>
           <p style={{ fontSize: 11, fontWeight: 900, color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
             <Sparkles size={12} /> DEIXE SUA LUZ BRILHAR DIANTE DOS HOMENS
           </p>
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/*,video/*" hidden onChange={handleGallery} />

      <AudioRecorder open={activeModal === "audio"} onClose={() => setActiveModal(null)} onSubmit={handleMediaSubmit} />
      <CameraModal open={activeModal === "camera"} onClose={() => setActiveModal(null)} onSubmit={handleMediaSubmit} />
      <TextEditorModal open={activeModal === "text"} onClose={() => setActiveModal(null)} onSubmit={handleMediaSubmit} />

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </>
  );
}
