"use client";

import { ReactNode } from "react";

interface SectionProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  spacing?: number;
  className?: string;
}

export function Section({ 
  title, 
  description, 
  action, 
  children, 
  spacing = 32,
  className = "" 
}: SectionProps) {
  return (
    <section className={`layout-section ${className}`} style={{ marginBottom: spacing }}>
      {(title || action) && (
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "flex-end", 
          marginBottom: 16,
          paddingLeft: 8
        }}>
          <div>
            {title && (
              <h3 style={{ 
                fontSize: 18, 
                fontWeight: 900, 
                letterSpacing: "-0.01em",
                color: "var(--foreground)"
              }}>
                {title}
              </h3>
            )}
            {description && (
              <p style={{ 
                fontSize: 13, 
                color: "var(--muted)", 
                marginTop: 4,
                fontWeight: 600
              }}>
                {description}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {children}
      </div>
    </section>
  );
}
