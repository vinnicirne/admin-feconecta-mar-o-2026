"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Pause, RefreshCw, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AudioRecorderProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { image_url: string; media_type: "audio" }) => void;
}

export default function AudioRecorder({ open, onClose, onSubmit }: AudioRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [seconds, setSeconds] = useState(0);
  
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!open) {
      setAudioUrl(null);
      setRecording(false);
      setSeconds(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [open]);

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRef.current = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      
      mediaRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      
      mediaRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((t) => t.stop());
      };
      
      mediaRef.current.start();
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch (err) {
      console.error("Falha ao acessar microfone:", err);
      alert("Acesso ao microfone negado ou não suportado.");
    }
  };

  const stopRec = () => {
    if (mediaRef.current && recording) {
      mediaRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      setRecording(false);
    }
  };

  const togglePlay = () => {
    if (!audioElRef.current) return;
    if (playing) {
      audioElRef.current.pause();
      setPlaying(false);
    } else {
      audioElRef.current.play();
      setPlaying(true);
    }
  };

  const handleReset = () => {
    setAudioUrl(null);
    setSeconds(0);
    setPlaying(false);
  };

  const handleSubmit = async () => {
    if (!audioUrl || chunksRef.current.length === 0) return;
    
    setUploading(true);
    try {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const fileName = `audio-${Date.now()}-${Math.random().toString(36).substring(7)}.webm`;
      
      const { data, error } = await supabase.storage
        .from("post-media")
        .upload(fileName, blob, { contentType: "audio/webm", upsert: true });

      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage.from("post-media").getPublicUrl(fileName);
      
      onSubmit({ image_url: publicUrl, media_type: "audio" });
      onClose();
    } catch (err: any) {
      console.error("Erro no upload de áudio:", err);
      alert("Erro ao publicar áudio: " + err.message);
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent style={{ maxWidth: 380, borderRadius: 24, padding: "32px 24px" }}>
        <DialogHeader>
          <DialogTitle style={{ textAlign: "center", width: "100%" }}>🎙️ Mensagem de Fé</DialogTitle>
        </DialogHeader>
        
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, padding: "10px 0" }}>
          
          <div 
            style={{ 
              width: 100, height: 100, borderRadius: "50%", background: recording ? "rgba(239, 68, 68, 0.1)" : "var(--line)", 
              display: "grid", placeItems: "center", position: "relative",
              transition: "0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          >
            {recording && (
               <div style={{ position: "absolute", width: "100%", height: "100%", borderRadius: "50%", border: "4px solid rgba(239, 68, 68, 0.4)", animation: "ping 1.5s infinite" }}></div>
            )}
            <Mic size={40} color={recording ? "#ef4444" : "var(--muted)"} />
          </div>

          <span style={{ fontSize: 32, fontWeight: 900, fontFamily: "monospace", color: recording ? "#ef4444" : "inherit" }}>
            {formatTime(seconds)}
          </span>

          {audioUrl && <audio ref={audioElRef} src={audioUrl} onEnded={() => setPlaying(false)} className="hidden" />}

          <div style={{ display: "flex", gap: 12, width: "100%" }}>
            {!audioUrl ? (
              recording ? (
                <Button variant="danger" style={{ flex: 1, height: 50, borderRadius: 16 }} onClick={stopRec}>
                  <Square size={18} fill="currentColor" /> Parar
                </Button>
              ) : (
                <Button variant="primary" style={{ flex: 1, height: 50, borderRadius: 16 }} onClick={startRec}>
                  <Mic size={18} /> Começar Gravação
                </Button>
              )
            ) : (
              <>
                <Button variant="secondary" style={{ width: 50, height: 50, padding: 0, borderRadius: 16 }} onClick={togglePlay}>
                  {playing ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
                </Button>
                <Button variant="outline" style={{ flex: 1, height: 50, borderRadius: 16 }} onClick={handleReset}>
                  <RefreshCw size={18} /> Regravar
                </Button>
                <Button variant="primary" loading={uploading} style={{ flex: 2, height: 50, borderRadius: 16 }} onClick={handleSubmit}>
                  Publicar Áudio
                </Button>
              </>
            )}
          </div>
        </div>

        <style>{`
          @keyframes ping {
            0% { transform: scale(1); opacity: 1; }
            75%, 100% { transform: scale(1.5); opacity: 0; }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
