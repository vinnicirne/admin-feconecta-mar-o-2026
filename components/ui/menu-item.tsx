"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import React from "react";

interface MenuItemProps {
  icon: LucideIcon;
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "ghost" | "primary" | "secondary";
  className?: string;
  isMobile?: boolean;
  iconColor?: string;
  style?: React.CSSProperties;
}

export function MenuItem({ 
  icon: Icon, 
  label, 
  href, 
  onClick, 
  variant = "ghost",
  className = "",
  isMobile = false,
  iconColor,
  style = {}
}: MenuItemProps) {
  const pathname = usePathname();
  const isActive = href ? (pathname === href || (href === "/" && pathname === "/")) : false;

  const content = (
    <div 
      onClick={onClick}
      className={`church-menu-item ${className}`}
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: "center",
        gap: isMobile ? 4 : 12,
        padding: isMobile ? "8px" : "12px 16px",
        borderRadius: 16,
        textDecoration: "none",
        color: isActive ? "var(--primary)" : "var(--muted)",
        background: isActive ? "var(--primary-soft)" : "transparent",
        fontWeight: isActive ? 800 : 600,
        fontSize: isMobile ? 10 : 15,
        cursor: "pointer",
        transition: "var(--transition)",
        border: "none",
        width: isMobile ? "auto" : "100%",
        textAlign: "left",
        ...style
      }}
    >
      <Icon size={isMobile ? 22 : 20} strokeWidth={isActive ? 2.5 : 2} style={{ color: iconColor }} />
      <span>{label}</span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: "none", display: "block" }}>
        {content}
      </Link>
    );
  }

  return (
    <button 
      onClick={onClick} 
      style={{ 
        background: "none", 
        border: "none", 
        padding: 0, 
        cursor: "pointer", 
        width: isMobile ? "auto" : "100%" 
      }}
    >
      {content}
    </button>
  );
}
