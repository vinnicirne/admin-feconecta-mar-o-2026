import { Globe, Trash } from "lucide-react";
import { AppCommunity } from "@/types";

// components
import { Button } from "@/components/ui/button";

interface CommunityHeaderProps {
  community: AppCommunity;
  isOwner: boolean;
  isMember: boolean;
  onJoin: () => void;
  onDelete: () => void;
}

export function CommunityHeader({ community, isOwner, isMember, onJoin, onDelete }: CommunityHeaderProps) {
  return (
    <div style={{ width: "100%", background: "white", borderBottom: "1px solid var(--line)" }}>
      {/* Cover */}
      <div style={{ width: "100%", height: 180, background: community.cover_url ? `url(${community.cover_url}) center/cover` : "linear-gradient(135deg, #d97706 0%, #92400e 100%)", position: "relative" }}>
         {isOwner && (
            <Button 
               variant="danger"
               onClick={onDelete} 
               title="Excluir Comunidade" 
               style={{ position: "absolute", top: 16, right: 16, width: 44, height: 44, borderRadius: "50%", padding: 0 }}
            >
              <Trash size={18} />
            </Button>
         )}
      </div>

      {/* Profile Info */}
      <div style={{ padding: "0 32px 32px", marginTop: -40, position: "relative" }}>
         <div style={{ width: 80, height: 80, borderRadius: 24, background: "white", padding: 4, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
            <div style={{ width: "100%", height: "100%", borderRadius: 20, background: "var(--accent)", display: "grid", placeItems: "center", color: "white" }}>
               <Globe size={40} />
            </div>
         </div>
         
         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 16 }}>
            <div>
               <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, letterSpacing: "-0.02em" }}>{community.name}</h1>
               <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)" }}>{community.category}</span>
                  <span style={{ color: "var(--muted)" }}>•</span>
                  <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>{community.leader?.full_name}</span>
               </div>
            </div>
            
            <Button 
               onClick={onJoin}
               variant={isMember ? "secondary" : "primary"}
            >
               {isMember ? "Membro" : "Participar"}
            </Button>
         </div>
      </div>
    </div>
  );
}

