"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ImageIcon,
  Video,
  Mic,
  Sparkles,
  Heart,
  MessageCircle,
  Eye,
  Settings,
  X,
  Play,
  Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { createPostAction } from "@/app/actions/post-actions";

type PostType = "compartilhar" | "edificar" | "oracao";

const colors = {
  primary: "#059669",
  primaryDark: "#065f46",
  primaryLight: "#10b981",
  bg: "#ecfdf5",
  text: "#064e3b",
};

export function PostCreator({ forceExpanded, initialCitation }: { forceExpanded?: boolean; initialCitation?: string }) {
  const [isExpanded, setIsExpanded] = useState(forceExpanded || !!initialCitation || false);
  const [postType, setPostType] = useState<PostType>("oracao");
  const [text, setText] = useState(initialCitation ?? "");
  const [isPublishing, setIsPublishing] = useState(false);
  const router = useRouter();
  const [styles, setStyles] = useState({ bold: false, italic: false });
  const [media, setMedia] = useState<{ url: string; type: string } | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraMode, setCameraMode] = useState<"photo" | "video">("photo");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const videoChunks = useRef<Blob[]>([]);

  useEffect(() => {
    if (forceExpanded || initialCitation) setIsExpanded(true);
  }, [forceExpanded, initialCitation]);

  // 📸 LÓGICA DE CÂMERA (FOTO + VÍDEO)
  const startCamera = async (mode: "photo" | "video") => {
    setCameraMode(mode);
    setIsCameraActive(true);
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: mode === "video" 
    });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }
  };

  const takePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const photoUrl = canvas.toDataURL("image/png");
    setMedia({ url: photoUrl, type: 'image' });
    stopCamera();
  };

  const startVideoRecording = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    if (!stream) return;
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    mediaRecorderRef.current = recorder;
    videoChunks.current = [];
    recorder.ondataavailable = (e) => videoChunks.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(videoChunks.current, { type: "video/webm" });
      setVideoUrl(URL.createObjectURL(blob));
      stopCamera();
    };
    recorder.start();
    setIsRecordingVideo(true);
  };

  const stopVideoRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecordingVideo(false);
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(t => t.stop());
    setIsCameraActive(false);
    setIsRecordingVideo(false);
  };

  // 🎤 LÓGICA DE ÁUDIO
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    audioChunks.current = [];
    recorder.ondataavailable = (e) => audioChunks.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
      setAudioUrl(URL.createObjectURL(blob));
    };
    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const greenGradient = postType === "edificar" 
    ? "linear-gradient(135deg, #059669 0%, #064e3b 100%)" 
    : "radial-gradient(circle at top right, rgba(255,255,255,0.15), transparent), radial-gradient(circle at bottom left, #064e3b, #022c22)";

  const handlePublish = async () => {
    if (!text.trim() && !media && !audioUrl && !videoUrl) {
      alert("Escreva algo ou adicione uma mídia 🙏");
      return;
    }
    setIsPublishing(true);
    try {
      const res = await createPostAction({
        content: text,
        post_type: postType,
        media_type: media?.type || (videoUrl ? 'video' : (audioUrl ? 'audio' : 'text')),
        image_url: media?.url || videoUrl || audioUrl || null,
        background_style: postType === "compartilhar" ? "transparent" : greenGradient,
        is_bold: styles.bold,
        is_italic: styles.italic,
        status: 'published'
      });

      if (!res.success) throw new Error(res.error);

      setText("");
      setIsExpanded(false);
      router.refresh();
      window.location.reload(); 
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMedia({ url: URL.createObjectURL(file), type: 'image' });
    }
  };

  if (!isExpanded) {
    return (
      <div 
        className="card" 
        onClick={() => setIsExpanded(true)}
        style={{ 
          padding: "16px 20px", borderRadius: 24, display: "flex", alignItems: "center", gap: 16, cursor: "pointer",
          marginBottom: 24, border: "1px solid #d1fae5", background: "white"
        }}
      >
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: colors.primary }}></div>
        <span style={{ fontSize: 15, fontWeight: 500, color: "#6b7280" }}>O que Deus colocou no seu coração hoje?</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
           <ImageIcon size={20} color="#94a3b8" />
           <Mic size={20} color="#94a3b8" />
        </div>
      </div>
    );
  }

  return (
    <div className="card animate-in" style={{ padding: 24, borderRadius: 32, marginBottom: 32, border: `2px solid #d1fae5`, background: "white", boxShadow: "0 20px 40px rgba(0,0,0,0.05)" }}>
      <input type="file" ref={fileInputRef} onChange={handleFile} hidden accept="image/*" />
      
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
         <button onClick={() => setIsExpanded(false)} style={{ background: "none", border: 0, cursor: "pointer", color: colors.text }}><X size={20} /></button>
         <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: colors.text }}>Novo Post</h3>
         <button 
           onClick={handlePublish} 
           disabled={isPublishing || (!text && !media && !audioUrl)} 
           style={{ 
             background: colors.primary, color: "white", border: 0, borderRadius: 10, 
             padding: "8px 20px", fontWeight: 700, fontSize: 14,
             opacity: (isPublishing || (!text && !media && !audioUrl)) ? 0.6 : 1
           }}
         >
           {isPublishing ? <Loader2 size={18} className="spin" /> : "Publicar"}
         </button>
      </div>

      {/* TYPE SELECTOR */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <TypeBtn label="🙏 Compartilhar" active={postType === "compartilhar"} onClick={() => setPostType("compartilhar")} />
        <TypeBtn label="📖 Edificar" active={postType === "edificar"} onClick={() => setPostType("edificar")} />
        <TypeBtn label="🤝 Oração" active={postType === "oracao"} onClick={() => setPostType("oracao")} />
      </div>

      {/* INPUT */}
      <div style={{ background: "#f8fafc", borderRadius: 20, padding: 20, border: "1px solid #e2e8f0" }}>
        
        {isCameraActive ? (
          <div style={{ position: "relative", marginBottom: 12 }}>
            <video ref={videoRef} style={{ width: "100%", borderRadius: 16, background: "black" }} />
            
            <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 20, alignItems: "center" }}>
              {cameraMode === "photo" ? (
                <button onClick={takePhoto} style={{ background: "white", border: 0, borderRadius: "50%", width: 60, height: 60, display: "grid", placeItems: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.3)" }}>
                  <Eye size={30} color={colors.primary} />
                </button>
              ) : (
                <button 
                  onClick={isRecordingVideo ? stopVideoRecording : startVideoRecording} 
                  style={{ 
                    background: isRecordingVideo ? "#ef4444" : "white", border: "4px solid rgba(255,255,255,0.3)", 
                    borderRadius: "50%", width: 64, height: 64, display: "grid", placeItems: "center", 
                    boxShadow: "0 4px 15px rgba(0,0,0,0.3)", transition: "0.2s" 
                  }}
                >
                  {isRecordingVideo ? <div style={{ width: 20, height: 20, background: "white", borderRadius: 4 }}></div> : <div style={{ width: 24, height: 24, background: "#ef4444", borderRadius: "50%" }}></div>}
                </button>
              )}
            </div>

            <button onClick={stopCamera} style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.5)", border: 0, borderRadius: "50%", width: 34, height: 34, color: "white", display: "grid", placeItems: "center" }}><X size={18} /></button>
            {isRecordingVideo && <div style={{ position: "absolute", top: 10, left: 10, background: "#ef4444", color: "white", padding: "4px 12px", borderRadius: 100, fontSize: 10, fontWeight: 900, animation: "pulse 1s infinite" }}>REC</div>}
          </div>
        ) : (
          <textarea 
            value={text} onChange={(e) => setText(e.target.value)}
            placeholder={postType === "oracao" ? "Como podemos orar por você?" : "O que você gostaria de dizer?"} 
            style={{ 
              width: "100%", height: 120, background: "none", border: 0, outline: "none", resize: "none",
              fontSize: "1.05rem", color: colors.text, 
              fontWeight: styles.bold ? "900" : "500",
              fontStyle: styles.italic ? "italic" : "normal"
            }}
          />
        )}

        {/* TOOLBAR */}
        <div style={{ display: "flex", gap: 16, marginTop: 12, borderTop: "1px solid #e2e8f0", paddingTop: 12, alignItems: "center" }}>
            <span onClick={() => setStyles(s => ({ ...s, bold: !s.bold }))} style={{ fontSize: 16, fontWeight: styles.bold ? 900 : 500, color: styles.bold ? colors.primary : colors.text, cursor: "pointer" }}>B</span>
            <span onClick={() => setStyles(s => ({ ...s, italic: !s.italic }))} style={{ fontSize: 16, fontStyle: "italic", fontWeight: styles.italic ? 900 : 500, color: styles.italic ? colors.primary : colors.text, cursor: "pointer" }}>I</span>
            <ImageIcon onClick={() => fileInputRef.current?.click()} size={20} color={media ? colors.primaryLight : colors.primary} style={{ cursor: "pointer" }} />
            <Settings onClick={() => startCamera("photo")} size={20} color={(isCameraActive && cameraMode === "photo") ? colors.primaryLight : colors.primary} style={{ cursor: "pointer" }} />
            <Video onClick={() => startCamera("video")} size={20} color={(isCameraActive && cameraMode === "video") ? colors.primaryLight : colors.primary} style={{ cursor: "pointer" }} />
            <Mic 
              onClick={isRecording ? stopRecording : startRecording} 
              size={20} 
              color={isRecording ? "#ef4444" : colors.primary} 
              style={{ cursor: "pointer", animation: isRecording ? "pulse 1s infinite" : "none" }} 
            />
            <Sparkles size={20} color="#f59e0b" style={{ cursor: "pointer" }} />
        </div>
      </div>

      {media && (
        <div style={{ marginTop: 12, position: "relative" }}>
          <img src={media.url} style={{ width: "100%", borderRadius: 16, maxHeight: 150, objectFit: "cover" }} />
          <button onClick={() => setMedia(null)} style={{ position: "absolute", top: 8, right: 8, background: "white", border: 0, borderRadius: "50%", width: 24, height: 24, display: "grid", placeItems: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
            <X size={14} />
          </button>
        </div>
      )}

      {videoUrl && (
        <div style={{ marginTop: 12, position: "relative" }}>
          <video src={videoUrl} controls style={{ width: "100%", borderRadius: 16, maxHeight: 200, background: "black" }} />
          <button onClick={() => setVideoUrl(null)} style={{ position: "absolute", top: 8, right: 8, background: "white", border: 0, borderRadius: "50%", width: 24, height: 24, display: "grid", placeItems: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
            <X size={14} />
          </button>
        </div>
      )}

      {audioUrl && (
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10, background: "#f8fafc", padding: 10, borderRadius: 16, border: "1px solid #e2e8f0" }}>
           <audio src={audioUrl} controls style={{ flex: 1, height: 30 }} />
           <button onClick={() => setAudioUrl(null)} style={{ background: "none", border: 0, color: "#ef4444" }}><X size={18} /></button>
        </div>
      )}

      {/* PREVIEW */}
      <div style={{ marginTop: 24 }}>
        <span style={{ fontSize: 11, fontWeight: 900, color: colors.text, textTransform: "uppercase", letterSpacing: 1 }}>Preview Ministerial</span>
        <div style={{ 
          marginTop: 10, padding: 32, borderRadius: 24, 
          background: postType === "compartilhar" ? "white" : greenGradient, 
          color: postType === "compartilhar" ? colors.text : "white", 
          textAlign: postType === "compartilhar" ? "left" : "center", 
          boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
          border: postType === "compartilhar" ? "1px solid #d1fae5" : "0",
          display: "flex", flexDirection: "column", alignItems: postType === "compartilhar" ? "flex-start" : "center", gap: 12
        }}>
           <h2 style={{ fontSize: 20, fontWeight: 900, fontStyle: "italic", margin: 0 }}>
             {postType === "oracao" ? "Preciso de oração agora..." : postType === "edificar" ? "Uma palavra para você..." : "Testemunho de Fé"}
           </h2>
           
           {media && <img src={media.url} style={{ width: "100%", borderRadius: 16, marginTop: 8 }} />}
           {videoUrl && <div style={{ background: "rgba(255,255,255,0.1)", padding: 12, borderRadius: 16, width: "100%", display: "flex", alignItems: "center", gap: 10 }}>🎬 Vídeo Reels Anexado</div>}
           {audioUrl && <div style={{ background: "rgba(255,255,255,0.1)", padding: 8, borderRadius: 12, width: "100%" }}>🎧 Áudio Anexado</div>}

           <div style={{ height: 1, background: postType === "compartilhar" ? colors.primaryLight : "rgba(255,255,255,0.2)", width: 80 }}></div>
           <p style={{ 
              fontSize: 15, lineHeight: 1.5, opacity: 0.9, margin: 0,
              fontWeight: styles.bold ? "900" : "500",
              fontStyle: styles.italic ? "italic" : "normal"
            }}>
             {text || "Sua mensagem de fé aparecerá aqui para edificar a comunidade..."}
           </p>
           
           {postType === "oracao" && (
            <button style={{ 
              marginTop: 12, background: "linear-gradient(135deg, #10b981, #065f46)", border: 0, 
              borderRadius: 100, padding: "10px 24px", fontWeight: 800, color: "white" 
            }}>
              🙏 Orar por Mim
            </button>
           )}

           <div style={{ display: "flex", justifyContent: "flex-end", width: "100%", gap: 12, marginTop: 12, fontSize: 12, opacity: 0.8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}><Heart size={14} fill="#ef4444" color="#ef4444" /> 128</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}><MessageCircle size={14} /> 34</div>
           </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function TypeBtn({ label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "10px 4px",
        borderRadius: 12,
        fontWeight: 800,
        fontSize: 10,
        border: active ? 0 : "1px solid #d1fae5",
        background: active ? "linear-gradient(135deg, #10b981, #065f46)" : "white",
        color: active ? "white" : "#064e3b",
        whiteSpace: "nowrap",
        transition: "0.2s"
      }}
    >
      {label}
    </button>
  );
}
