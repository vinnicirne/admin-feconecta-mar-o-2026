"use client";

import { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({ 
  children, 
  variant = "primary", 
  size = "md", 
  loading, 
  className,
  style,
  disabled,
  ...props 
}: ButtonProps) {
  
  const variants = {
    primary: { background: "var(--primary)", color: "white", border: "0", boxShadow: "0 8px 15px rgba(15, 118, 110, 0.2)" },
    secondary: { background: "var(--primary-soft)", color: "var(--primary)", border: "0" },
    outline: { background: "transparent", color: "var(--foreground)", border: "1px solid var(--line)" },
    ghost: { background: "transparent", color: "var(--muted)", border: "0" },
    danger: { background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "0" }
  };

  const sizes = {
    sm: { padding: "8px 16px", fontSize: 13 },
    md: { padding: "12px 24px", fontSize: 14 },
    lg: { padding: "16px 32px", fontSize: 16 }
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderRadius: 12,
        fontWeight: 800,
        cursor: (disabled || loading) ? "not-allowed" : "pointer",
        opacity: (disabled || loading) ? 0.6 : 1,
        transition: "all 0.2s ease",
        ...variants[variant],
        ...sizes[size],
        ...style
      }}
      className={`church-btn ${className || ""}`}
      onMouseEnter={(e) => {
        if (!disabled && !loading && (variant === 'primary')) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.filter = "brightness(1.1)";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading && (variant === 'primary')) {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.filter = "brightness(1)";
        }
      }}
    >
      {loading && (
        <svg style={{ animation: "spin 1s linear infinite", width: 16, height: 16 }} viewBox="0 0 24 24">
          <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </button>
  );
}
