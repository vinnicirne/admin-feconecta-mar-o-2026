"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Share2, Copy, MessageCircle, Facebook, Twitter, Link as LinkIcon } from "lucide-react";
import { useToast } from "./toast";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postUrl: string;
  postContent: string;
}

export function ShareModal({ open, onOpenChange, postUrl, postContent }: ShareModalProps) {
  const { toast } = useToast();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(postUrl);
    toast("Link Copiado 🔗", "Semeie essa palavra agora! 🙏", "success");
    onOpenChange(false);
  };

  const shareOptions = [
    { 
      name: "WhatsApp", 
      icon: MessageCircle, 
      color: "#25D366", 
      href: `https://wa.me/?text=${encodeURIComponent(postContent + "\n\n" + postUrl)}` 
    },
    { 
      name: "Facebook", 
      icon: Facebook, 
      color: "#1877F2", 
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}` 
    },
    { 
      name: "Twitter", 
      icon: Twitter, 
      color: "#1DA1F2", 
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(postContent)}&url=${encodeURIComponent(postUrl)}` 
    }
  ];

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[3000] transition-all animate-in fade-in"
        />
        <DialogPrimitive.Content 
          className="fixed left-[50%] top-[50%] z-[3001] w-[min(480px,95vw)] translate-x-[-50%] translate-y-[-50%] rounded-[32px] bg-white p-8 shadow-2xl transition-all animate-in zoom-in-95"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-14 bg-primary-soft text-primary flex items-center justify-center">
                  <Share2 size={20} />
               </div>
               <div>
                  <DialogPrimitive.Title className="text-xl font-black m-0">Compalhar Palavra</DialogPrimitive.Title>
                  <DialogPrimitive.Description className="text-sm text-muted font-bold">Leve essa edificação adiante 🙏</DialogPrimitive.Description>
               </div>
            </div>
            <DialogPrimitive.Close className="w-10 h-10 rounded-14 hover:bg-black/5 flex items-center justify-center transition-colors">
              <X size={20} className="muted" />
            </DialogPrimitive.Close>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-8">
             {shareOptions.map((opt) => (
               <a 
                 key={opt.name} 
                 href={opt.href} 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="flex flex-col items-center gap-2 group"
                 onClick={() => onOpenChange(false)}
               >
                  <div 
                    style={{ background: `${opt.color}15`, color: opt.color }}
                    className="w-14 h-14 rounded-20 flex items-center justify-center transition-transform group-hover:scale-110"
                  >
                     <opt.icon size={28} />
                  </div>
                  <span className="text-[10px] font-black uppercase text-muted tracking-wide">{opt.name}</span>
               </a>
             ))}
             
             <button 
               onClick={handleCopy}
               className="flex flex-col items-center gap-2 group"
             >
                <div className="w-14 h-14 rounded-20 bg-black/5 text-black flex items-center justify-center transition-transform group-hover:scale-110">
                   <Copy size={28} />
                </div>
                <span className="text-[10px] font-black uppercase text-muted tracking-wide">Copiar</span>
             </button>
          </div>

          <div className="p-4 bg-line rounded-20 border border-black/5 flex items-center gap-3">
             <LinkIcon size={16} className="muted flex-shrink-0" />
             <div className="text-xs font-bold text-muted truncate flex-1">{postUrl}</div>
             <button 
               onClick={handleCopy}
               className="text-[10px] font-black text-primary uppercase whitespace-nowrap hover:underline"
             >
                Copia Link
             </button>
          </div>

        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
