"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import React from "react";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;

export const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(15, 23, 42, 0.4)",
      backdropFilter: "blur(8px)",
      zIndex: 1000
    }}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ children, style, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "95%",
        maxWidth: 500,
        zIndex: 1001,
        borderRadius: 32,
        background: "white",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        padding: 24,
        maxHeight: "90vh",
        overflowY: "auto",
        ...style
      }}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          background: "var(--line)",
          border: 0,
          width: 32,
          height: 32,
          borderRadius: 10,
          cursor: "pointer",
          display: "grid",
          placeItems: "center"
        }}
      >
        <X size={18} />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

export const DialogHeader = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ marginBottom: 20, ...style }} {...props} />
);

export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ style, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.5px", ...style }}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;
