"use client";

import { User } from "lucide-react";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: number | "sm" | "md" | "lg";
  fallback?: React.ReactNode;
}

export function Avatar({ src, alt, size = "md", fallback }: AvatarProps) {
  const pixelSize = typeof size === "number" ? size : { sm: 32, md: 44, lg: 64 }[size];

  return (
    <div style={{
      width: pixelSize,
      height: pixelSize,
      borderRadius: "35%", // Squirkle look
      background: "var(--primary-soft)",
      display: "grid",
      placeItems: "center",
      overflow: "hidden",
      flexShrink: 0,
      border: "1px solid var(--line)",
      boxShadow: "var(--shadow-sm)"
    }}>
      {src ? (
        <img 
          src={src} 
          alt={alt || "Avatar"} 
          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
        />
      ) : fallback ? (
        fallback
      ) : (
        <User size={pixelSize * 0.5} className="primary" />
      )}
    </div>
  );
}
