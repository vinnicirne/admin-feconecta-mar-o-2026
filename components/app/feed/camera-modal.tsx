"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, FlipHorizontal, RefreshCw, X, Loader2, Play, Square, Type } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface CameraModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { 
    image_url: string; 
    media_type: "image" | "video"; 
    metadata?: { 
      overlay_text?: string;
      trim_start?: number;
      trim_end?: number;
    }
  }) => void;
}

type MediaType = "image" | "video";

export default function CameraModal({ open, onClose, onSubmit }: CameraModalProps) {
  // Capture states
  const [captured, setCaptured] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [mediaTypeCaptured, setMediaTypeCaptured] = useState<MediaType | null>(null);
  
  // Camera settings
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isVideoMode, setIsVideoMode] = useState(false);
  
  // Recording states
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [overlayText, setOverlayText] = useState("");

  // Trimming states
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [open, facingMode, isVideoMode]);

  const startCamera = async () => {
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode, width: { ideal: 1080 }, height: { ideal: 1920 } },
        audio: isVideoMode
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      // alert("Permissão de câmera negada. Verifique as configurações do navegador.");
      // onClose();
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const toggleFacing = () => {
    setFacingMode((f) => (f === "user" ? "environment" : "user"));
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Flip if using user camera
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    
    ctx.drawImage(videoRef.current, 0, 0);
    setCaptured(canvas.toDataURL("image/jpeg", 0.85));
    setMediaTypeCaptured("image");
    stopCamera();
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    const getMimeType = () => {
      const possibleTypes = [
        'video/mp4;codecs=avc1',
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=vp8',
        'video/webm'
      ];
      for (const t of possibleTypes) {
        if (MediaRecorder.isTypeSupported(t)) return t;
      }
      return "";
    };

    const mimeType = getMimeType();
    if (!mimeType) {
      alert("Gravação de vídeo não suportada neste navegador/dispositivo.");
      setIsVideoMode(false);
      return;
    }

    console.log("Usando mimeType:", mimeType);

    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    mediaRecorderRef.current = recorder;
    chunksRef.current = [];
    
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    
    recorder.onstop = () => {
      const blobMime = mediaRecorderRef.current?.mimeType || mimeType || "video/webm";
      const blob = new Blob(chunksRef.current, { type: blobMime });
      const url = URL.createObjectURL(blob);
      console.log("Blob criado com type:", blob.type, "tamanho:", blob.size);
      setVideoUrl(url);
      setMediaTypeCaptured("video");
      stopCamera();
    };
    
    recorder.start(1000); // Collect data every second
    setRecording(true);
    setSeconds(0);
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s >= 59) { // 60s limit
          stopRecording();
          return s;
        }
        return s + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  const handleReset = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setCaptured(null);
    setVideoUrl(null);
    setMediaTypeCaptured(null);
    setSeconds(0);
    chunksRef.current = [];
    startCamera();
  };

  const handleSubmit = async () => {
    if (!mediaTypeCaptured) return;
    
    setUploading(true);
    try {
      let blob: Blob;
      const actualMimeType = mediaTypeCaptured === "image" ? "image/jpeg" : (mediaRecorderRef.current?.mimeType || "video/webm");
      const extension = mediaTypeCaptured === "image" ? "jpg" : (actualMimeType.includes("mp4") ? "mp4" : "webm");
      
      if (mediaTypeCaptured === "image" && captured) {
        const res = await fetch(captured);
        blob = await res.blob();
      } else if (mediaTypeCaptured === "video") {
        blob = new Blob(chunksRef.current, { type: actualMimeType });
      } else {
        throw new Error("No media captured.");
      }

      const fileName = `camera/${new Date().toISOString().replace(/[:.]/g, "-")}-${Math.random().toString(36).substring(2, 10)}.${extension}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("post-media")
        .upload(fileName, blob, { contentType: actualMimeType, cacheControl: "3600" });

      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage.from("post-media").getPublicUrl(fileName);
      
      onSubmit({ 
        image_url: publicUrl, 
        media_type: mediaTypeCaptured,
        metadata: { 
          overlay_text: overlayText || undefined,
          trim_start: mediaTypeCaptured === "video" ? trimStart : undefined,
          trim_end: mediaTypeCaptured === "video" ? trimEnd : undefined
        }
      });
      onClose();
      handleReset();
    } catch (err: any) {
      console.error("Upload error:", err);
      alert("Erro ao publicar: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent style={{ maxWidth: 450, borderRadius: 32, padding: "32px 24px", overflow: "hidden" }}>
        <DialogHeader>
          <DialogTitle style={{ textAlign: "center", width: "100%" }}>📸 Capturar Momento</DialogTitle>
        </DialogHeader>

        <div style={{ position: "relative", width: "100%", aspectRatio: "3/4", borderRadius: 24, overflow: "hidden", background: "black", boxShadow: "inset 0 0 100px rgba(0,0,0,0.5)" }}>
          {captured ? (
             <>
               <img src={captured} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
               {overlayText && (
                  <div style={{ position: "absolute", top: "40%", left: "10%", right: "10%", textAlign: "center", color: "white", fontSize: 24, fontWeight: 900, textShadow: "0 2px 10px rgba(0,0,0,0.5)", background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: 16 }}>{overlayText}</div>
               )}
             </>
          ) : videoUrl ? (
             <>
               <video 
                 src={videoUrl} 
                 autoPlay 
                 loop 
                 muted
                 playsInline
                 onLoadedMetadata={(e) => {
                    const vid = e.currentTarget;
                    setDuration(vid.duration);
                    setTrimEnd(vid.duration);
                    setTrimStart(0);
                    console.log("Metadata carregada: duration =", vid.duration);
                 }}
                 onTimeUpdate={(e) => {
                    const vid = e.currentTarget;
                    if (vid.currentTime < trimStart) vid.currentTime = trimStart;
                    if (vid.currentTime > trimEnd) vid.currentTime = trimStart;
                 }}
                 onError={(e) => {
                   const vid = e.currentTarget;
                   console.error("Erro no <video> preview:", vid.error);
                   console.log("Mensagem:", vid.error?.message);
                   console.log("Code:", vid.error?.code);
                   console.log("Src atual:", videoUrl);
                   alert(`Erro ao carregar preview (${vid.error?.code}). Veja console.`);
                 }}
                 onLoadedData={() => console.log("Vídeo loaded data OK")}
                 onCanPlay={() => console.log("Can play!")}
                 style={{ width: "100%", height: "100%", objectFit: "cover" }} 
               />
               {overlayText && (
                  <div style={{ position: "absolute", top: "40%", left: "10%", right: "10%", textAlign: "center", color: "white", fontSize: 24, fontWeight: 900, textShadow: "0 2px 10px rgba(0,0,0,0.5)", pointerEvents: "none", background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: 16 }}>{overlayText}</div>
               )}
             </>
          ) : (
             <>
               <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover", transform: facingMode === "user" ? "scaleX(-1)" : "none" }} />
               {overlayText && (
                  <div style={{ position: "absolute", top: "40%", left: "10%", right: "10%", textAlign: "center", color: "white", fontSize: 24, fontWeight: 900, textShadow: "0 2px 10px rgba(0,0,0,0.5)", pointerEvents: "none", background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: 16 }}>{overlayText}</div>
               )}
               {recording && (
                  <div style={{ position: "absolute", top: 16, left: 16, background: "#ef4444", color: "white", padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 900, display: "flex", alignItems: "center", gap: 6, animation: "pulse 1.5s infinite" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "white" }}></div> {formatTime(seconds)}
                  </div>
               )}
             </>
          )}
        </div>

        {mediaTypeCaptured === "video" && videoUrl && (
           <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1 }}>Corte do Vídeo (Trim)</span>
                <span style={{ fontSize: 11, fontWeight: 900, color: "var(--primary)" }}>{trimStart.toFixed(1)}s - {trimEnd.toFixed(1)}s</span>
              </div>
              <div style={{ position: "relative", height: 24, display: "flex", alignItems: "center", gap: 12 }}>
                 <input 
                   type="range" min={0} max={duration} step={0.1} value={trimStart} 
                   onChange={(e) => setTrimStart(Math.min(parseFloat(e.target.value), trimEnd - 0.5))}
                   style={{ flex: 1, accentColor: "var(--primary)" }}
                 />
                 <input 
                   type="range" min={0} max={duration} step={0.1} value={trimEnd} 
                   onChange={(e) => setTrimEnd(Math.max(parseFloat(e.target.value), trimStart + 0.5))}
                   style={{ flex: 1, accentColor: "var(--primary)" }}
                 />
              </div>
           </div>
        )}

        <div style={{ marginTop: 20 }}>
           <span style={{ fontSize: 11, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, display: "block" }}>
             <Type size={12} style={{ verticalAlign: "middle", marginRight: 4 }} /> Legenda sobre a mídia
           </span>
           <input 
             value={overlayText}
             onChange={(e) => setOverlayText(e.target.value)}
             placeholder="Escreva algo inspirador..."
             style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid var(--line)", outline: "none", fontSize: 14, background: "#f8fafc" }}
           />
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
          {!mediaTypeCaptured ? (
            <>
              <Button variant="outline" style={{ width: 50, height: 50, padding: 0, borderRadius: 16 }} onClick={toggleFacing} disabled={recording}>
                <FlipHorizontal size={20} />
              </Button>
              <Button variant="outline" style={{ flex: 1, height: 50, borderRadius: 16, fontWeight: 800 }} onClick={() => setIsVideoMode(!isVideoMode)} disabled={recording}>
                {isVideoMode ? "📸 Ir para Foto" : "🎥 Ir para Vídeo"}
              </Button>
              {isVideoMode ? (
                <Button 
                  variant="danger" 
                  style={{ width: 60, height: 60, borderRadius: 30, padding: 0, boxShadow: "0 10px 30px rgba(239, 68, 68, 0.3)" }} 
                  onClick={recording ? stopRecording : startRecording}
                >
                   {recording ? <Square size={20} fill="currentColor" /> : <Play size={24} fill="currentColor" style={{ marginLeft: 4 }} />}
                </Button>
              ) : (
                <Button 
                  variant="primary" 
                  style={{ width: 60, height: 60, borderRadius: 30, padding: 0, boxShadow: "0 10px 30px rgba(15, 118, 110, 0.3)" }} 
                  onClick={capturePhoto}
                >
                  <Camera size={26} />
                </Button>
              )}
            </>
          ) : (
            <>
              <Button variant="outline" style={{ flex: 1, height: 50, borderRadius: 16 }} onClick={handleReset} disabled={uploading}>
                <RefreshCw size={18} /> Repetir
              </Button>
              <Button variant="primary" loading={uploading} style={{ flex: 2, height: 50, borderRadius: 16 }} onClick={handleSubmit}>
                Publicar Agora
              </Button>
            </>
          )}
        </div>

        <style>{`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.6; }
            100% { opacity: 1; }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
