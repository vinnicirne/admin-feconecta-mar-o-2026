"use client";

import { X, Mic2, Globe, Type, Image, Camera, Mic } from "lucide-react";
import React, { useState, useRef } from "react";
import AudioRecorder from "@/components/app/feed/audio-recorder";
import CameraModal from "@/components/app/feed/camera-modal";
import TextEditorModal from "@/components/app/feed/text-editor-modal";
import { createPostAction } from "@/app/actions/post-actions";
import { supabase } from "@/lib/supabase";

interface FaithActionsModalProps {
  onClose: () => void;
}

export function FaithActionsModal({ onClose }: FaithActionsModalProps) {
  const [activeModal, setActiveModal] = useState<"text" | "camera" | "audio" | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleMediaSubmit = async (data: any) => {
    try {
      const res = await createPostAction({
        content: "",
        post_type: "compartilhar",
        ...data,
        status: "published"
      });
      if (res.success) {
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
      const { data, error } = await supabase.storage.from("post-media").upload(fileName, file, { contentType, cacheControl: "3600" });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("post-media").getPublicUrl(fileName);
      await handleMediaSubmit({ image_url: publicUrl, media_type: contentType.startsWith('video') ? 'video' : 'image' });
    } catch (err: any) { alert("Erro: " + err.message); }
  };

  const primaryActions = [
    { icon: Type, label: "Texto", color: "#9333ea", onClick: () => setActiveModal("text") },
    { icon: Image, label: "Galeria", color: "#3b82f6", onClick: () => fileRef.current?.click() },
    { icon: Camera, label: "Câmera", color: "#10b981", onClick: () => setActiveModal("camera") },
    { icon: Mic, label: "Áudio", color: "#f59e0b", onClick: () => setActiveModal("audio") },
  ];

  if (activeModal) {
    if (activeModal === "text") return <TextEditorModal open={true} onClose={() => setActiveModal(null)} onSubmit={handleMediaSubmit} />;
    if (activeModal === "camera") return <CameraModal open={true} onClose={() => setActiveModal(null)} onSubmit={handleMediaSubmit} />;
    if (activeModal === "audio") return <AudioRecorder open={true} onClose={() => setActiveModal(null)} onSubmit={handleMediaSubmit} />;
  }

  return (
    <>
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)", zIndex: 2000, display: "flex", alignItems: "flex-end" }} onClick={onClose}>
        <div 
          onClick={(e) => e.stopPropagation()}
          style={{ width: "100%", background: "white", borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: "24px 20px 48px", maxHeight: "90vh", overflowY: "auto", animation: "slide-up 0.3s ease" }}
        >
          <div style={{ width: 40, height: 4, borderRadius: 10, background: "var(--line)", margin: "0 auto 20px" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0, color: "#1e293b" }}>Ações de Fé</h2>
            <button onClick={onClose} style={{ background: "#f1f5f9", border: 0, width: 44, height: 44, borderRadius: "50%", display: "grid", placeItems: "center", cursor: "pointer" }}><X size={24}/></button>
          </div>

          <div style={{ background: "#f8fafc", borderRadius: 28, padding: 20, border: "1px solid var(--line)", marginBottom: 24 }}>
             <p style={{ fontSize: 13, fontWeight: 800, color: "var(--muted)", margin: "0 0 16px" }}>O QUE DEUS COLOCOU NO SEU CORAÇÃO?</p>
             <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                {primaryActions.map(({ icon: Icon, label, color, onClick }) => (
                  <button key={label} onClick={onClick} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, background: "none", border: 0, cursor: "pointer" }}>
                    <div style={{ width: 56, height: 56, borderRadius: 18, background: "white", display: "grid", placeItems: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                       <Icon size={24} style={{ color }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 900, color: "#64748b" }}>{label}</span>
                  </button>
                ))}
             </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <button onClick={() => window.location.href = '/war-room/new'} style={{ background: "var(--primary-soft)", padding: "24px 16px", borderRadius: 28, border: 0, display: "flex", flexDirection: "column", gap: 12, alignItems: "center", cursor: "pointer" }}>
              <Mic2 size={28} color="var(--primary)" />
              <strong style={{ fontSize: 14, color: "var(--primary)", fontWeight: 900 }}>Sala de Guerra</strong>
            </button>
            <button onClick={() => window.location.href = '/communities/new'} style={{ background: "rgba(217, 119, 6, 0.1)", padding: "24px 16px", borderRadius: 28, border: 0, display: "flex", flexDirection: "column", gap: 12, alignItems: "center", cursor: "pointer" }}>
              <Globe size={28} color="var(--accent)" />
              <strong style={{ fontSize: 14, color: "var(--accent)", fontWeight: 900 }}>Criar Igreja</strong>
            </button>
          </div>

          <input ref={fileRef} type="file" accept="image/*,video/*" hidden onChange={handleGallery} />
        </div>
      </div>
      <style>{`@keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
    </>
  );
}
