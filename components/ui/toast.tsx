"use client";

import { useState, useCallback, createContext, useContext, ReactNode } from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (title: string, description?: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((title: string, description?: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        
        {toasts.map((t) => (
          <ToastPrimitive.Root 
            key={t.id} 
            open={true} 
            onOpenChange={(open) => {
               if (!open) setToasts((prev) => prev.filter((item) => item.id !== t.id));
            }}
            duration={5000}
            className={`toast-root ${t.type}`}
            style={{
               background: "white",
               padding: 20,
               borderRadius: 24,
               boxShadow: "var(--shadow-lg)",
               border: `2px solid ${t.type === 'success' ? 'var(--success)' : t.type === 'error' ? 'var(--danger)' : 'var(--primary)'}`,
               display: "flex",
               flexDirection: "column",
               gap: 8,
               minWidth: 300,
               animation: "toast-slide-in 0.3s ease-out forwards",
               pointerEvents: "auto",
               marginBottom: 12
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <ToastPrimitive.Title style={{ fontWeight: 900, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
                 {t.type === 'success' && <CheckCircle size={18} color="var(--success)" />}
                 {t.type === 'error' && <AlertCircle size={18} color="var(--danger)" />}
                 {t.type === 'info' && <Info size={18} color="var(--primary)" />}
                 {t.title}
              </ToastPrimitive.Title>
              <ToastPrimitive.Close style={{ background: "none", border: 0, cursor: "pointer", color: "var(--muted)" }}>
                 <X size={16} />
              </ToastPrimitive.Close>
            </div>
            {t.description && (
              <ToastPrimitive.Description style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>
                {t.description}
              </ToastPrimitive.Description>
            )}
          </ToastPrimitive.Root>
        ))}

        <ToastPrimitive.Viewport style={{
           position: "fixed",
           bottom: 24,
           right: 24,
           display: "flex",
           flexDirection: "column",
           gap: 12,
           zIndex: 10000,
           maxWidth: "100vw",
           margin: 0,
           listStyle: "none",
           outline: "none"
        }} />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
