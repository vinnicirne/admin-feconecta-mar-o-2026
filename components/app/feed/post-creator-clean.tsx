"use client";

import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Type, Image, Camera, Mic, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import AudioRecorder from "./audio-recorder";
import CameraModal from "./camera-modal";
import TextEditorModal from "./text-editor-modal";
import MobilePostSheet from "./mobile-post-sheet";
import { createPostAction } from "@/app/actions/post-actions";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

export function PostCreatorClean({ onSuccess, communityId }: { onSuccess?: () => void, communityId?: string }) {
  const { user } = useAuth();
  const [activeModal, setActiveModal] = useState<"text" | "camera" | "audio" | null>(null);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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
        onSuccess?.();
        setActiveModal(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const contentType = file.type;
      const extension = file.name.split('.').pop();
      const fileName = `upload-${Date.now()}.${extension}`;
      
      const { data, error } = await supabase.storage
        .from("post-media")
        .upload(fileName, file, { contentType, cacheControl: "3600" });

      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage.from("post-media").getPublicUrl(fileName);
      
      await handleMediaSubmit({ 
        image_url: publicUrl, 
        media_type: contentType.startsWith('video') ? 'video' : (contentType.startsWith('audio') ? 'audio' : 'image') 
      });
    } catch (err: any) {
      alert("Erro no upload: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const actions = [
    { icon: Type, label: "Texto", onClick: () => setActiveModal("text"), color: "var(--primary)" },
    { icon: Image, label: "Mídia", onClick: () => fileRef.current?.click(), color: "#3b82f6" },
    { icon: Camera, label: "Câmera", onClick: () => setActiveModal("camera"), color: "#10b981" },
    { icon: Mic, label: "Áudio", onClick: () => setActiveModal("audio"), color: "#f59e0b" },
  ];

  return (
    <Card variant="elevated" padding={20} style={{ borderRadius: 28, marginBottom: 24, border: "1px solid var(--line)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 16, background: "var(--primary-soft)", display: "grid", placeItems: "center", flexShrink: 0, overflow: "hidden" }}>
           {user?.user_metadata?.avatar_url ? (
             <img src={user.user_metadata.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
           ) : (
             <TrendingUp size={22} color="var(--primary)" />
           )}
        </div>

        <div 
          onClick={() => {
            if (window.innerWidth < 768) setIsMobileSheetOpen(true);
            else setActiveModal("text");
          }}
          style={{ 
            flex: 1, height: 48, background: "#f1f5f9", borderRadius: 16, display: "flex", alignItems: "center", padding: "0 20px", 
            cursor: "pointer", color: "#64748b", fontSize: 14, fontWeight: 700, transition: "0.2s" 
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#e2e8f0"}
          onMouseLeave={(e) => e.currentTarget.style.background = "#f1f5f9"}
        >
          O que Deus colocou no seu coração hoje?
        </div>

        <div style={{ display: "flex", gap: 8 }} className="desktop-actions">
           {actions.map(({ icon: Icon, onClick, color, label }) => (
             <Button 
               key={label}
               variant="ghost" 
               size="sm" 
               onClick={onClick} 
               style={{ width: 44, height: 44, padding: 0, borderRadius: 12 }}
               title={label}
             >
               <Icon size={20} style={{ color }} />
             </Button>
           ))}
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/*,video/*,audio/*" hidden onChange={handleFileUpload} />

      <AudioRecorder open={activeModal === "audio"} onClose={() => setActiveModal(null)} onSubmit={handleMediaSubmit} />
      <CameraModal open={activeModal === "camera"} onClose={() => setActiveModal(null)} onSubmit={handleMediaSubmit} />
      <TextEditorModal open={activeModal === "text"} onClose={() => setActiveModal(null)} onSubmit={handleMediaSubmit} />
      <MobilePostSheet open={isMobileSheetOpen} onClose={() => setIsMobileSheetOpen(false)} onPostCreated={onSuccess} communityId={communityId} />

      {isUploading && (
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, color: "var(--primary)", fontSize: 12, fontWeight: 800 }}>
          <Loader2 size={14} className="spin" /> SUBINDO AO ALTAR...
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-actions { display: none; }
        }
      `}</style>
    </Card>
  );
}
