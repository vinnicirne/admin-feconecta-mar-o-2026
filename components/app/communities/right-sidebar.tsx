"use client";

import { AppCommunity } from "@/types";
import { Card } from "@/components/ui/card";
import { LivePraisePlayer, GlobalPresence } from "@/components/layout/sidebar-right";

interface RightSidebarProps {
  community: AppCommunity;
  activeRoomsCount: number;
  onlineCount?: number;
}

export function RightSidebar({ community, activeRoomsCount, onlineCount = 0 }: RightSidebarProps) {
  return (
    <aside className="w-[320px] flex-shrink-0 flex flex-col gap-6 bg-white/80 backdrop-blur-xl border-l border-black/5 p-6 rounded-l-2xl shadow-sm">
        {/* Removido o Status Repetido (Já presente no Hero) */}

        <Card variant="glass" padding={20} style={{ marginTop: "auto" }}>
           <p style={{ margin: 0, fontSize: 13, color: "var(--muted)", lineHeight: 1.5, textAlign: "center" }}>
             "Onde dois ou mais estiverem reunidos, Eu estarei ali."
           </p>
        </Card>

        {/* 💜 AMBIENTE VIVO NA COMUNIDADE */}
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 16 }}>
           <GlobalPresence />
           <LivePraisePlayer />
        </div>
    </aside>
  );
}
