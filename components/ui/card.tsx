"use client";

import { ReactNode, HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "elevated" | "flat" | "outline" | "glass" | "modern" | "premium";
  padding?: number | string;
}

export function Card({ 
  children, 
  variant = "flat", 
  padding, 
  className, 
  style, 
  ...props 
}: CardProps) {
  
  const variantClasses = {
    elevated: "bg-white shadow-[0_10px_30px_rgba(0,0,0,0.04)]",
    flat: "bg-white border border-black/5",
    outline: "bg-transparent border-2 border-black/5",
    glass: "bg-white/70 backdrop-blur-md border border-white/20 shadow-sm",
    modern: "bg-white/70 backdrop-blur-md border border-black/5 shadow-sm",
    premium: "bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-xl border border-white/10 shadow-lg"
  };

  return (
    <div
      {...props}
      className={`
        rounded-2xl 
        transition-all duration-200
        ${variantClasses[variant]}
        ${className || ""}
      `}
      style={{
        padding: padding !== undefined ? padding : "24px",
        ...style
      }}
    >
      {children}
    </div>
  );
}
