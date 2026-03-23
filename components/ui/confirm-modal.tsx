"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "./button";
import { Card } from "./card";
import { Trash2, AlertTriangle } from "lucide-react";
import React from "react";

interface ConfirmModalProps {
  title: string;
  description: string;
  onConfirm: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
}

export const ConfirmModal = ({ 
  title, 
  description, 
  onConfirm, 
  open, 
  onOpenChange,
  loading 
}: ConfirmModalProps) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 100 }} />
        <Dialog.Content style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "100%", maxWidth: 400, zIndex: 101 }}>
          <Card variant="elevated" padding={32} style={{ textAlign: "center" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#fee2e2", display: "grid", placeItems: "center", margin: "0 auto 20px" }}>
               <AlertTriangle size={32} color="#ef4444" />
            </div>
            
            <Dialog.Title style={{ fontSize: 20, fontWeight: 900, marginBottom: 12 }}>{title}</Dialog.Title>
            <Dialog.Description style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6, marginBottom: 24 }}>
               {description}
            </Dialog.Description>
            
            <div style={{ display: "flex", gap: 12 }}>
              <Dialog.Close asChild>
                <Button variant="ghost" style={{ flex: 1 }}>Cancelar</Button>
              </Dialog.Close>
              <Button 
                variant="primary" 
                onClick={() => { onConfirm(); onOpenChange(false); }} 
                style={{ flex: 1, background: "#ef4444" }}
                disabled={loading}
              >
                Sim, Remover
              </Button>
            </div>
          </Card>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
