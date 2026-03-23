"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useMemo, useCallback } from "react";
import {
   Youtube,
   Facebook,
   Linkedin,
   Mail,
   Upload,
   Camera,
   Heart,
   MessageSquare,
   User,
   Settings,
   MapPin,
   Calendar,
   Instagram,
   Phone,
   ChevronLeft,
   Globe,
   Loader2,
   Lock as LockIcon,
   MessageCircle,
   Hash,
   X
} from "lucide-react";
import Link from "next/link";
import { followUserAction, updateProfileAction } from "@/app/actions/interaction-actions";
import { useToast } from "@/components/ui/toast";
import { PostCard } from "@/components/app/feed/post-card";
import { useFeatures } from "@/hooks/use-features";
import { useAuth } from "@/hooks/use-auth";
import * as Dialog from "@radix-ui/react-dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProfileClientProps {
   initialUsername: string;
}

const buildSocialUrl = (value: string, platform: 'instagram' | 'youtube' | 'facebook' | 'linkedin' | 'whatsapp') => {
   if (!value) return "";

   // Se já for uma URL completa, normaliza e retorna
   if (value.startsWith("http://") || value.startsWith("https://")) return value;

   // Limpeza de "@" se o usuário digitou
   const cleanValue = value.startsWith("@") ? value.substring(1) : value;

   switch (platform) {
      case 'instagram': return `https://instagram.com/${cleanValue}`;
      case 'youtube': return `https://youtube.com/@${cleanValue}`;
      case 'facebook': return `https://facebook.com/${cleanValue}`;
      case 'linkedin': return `https://linkedin.com/in/${cleanValue}`;
      case 'whatsapp': return `https://wa.me/${cleanValue.replace(/\D/g, '')}`;
      default: return value;
   }
};

export function ProfileClient({ initialUsername }: ProfileClientProps) {
   const supabase = useMemo(() => createClient(), []);
   const { toast } = useToast();
   const { isEnabled, features } = useFeatures();
   const { user: authUser, loading: authLoading } = useAuth();

   const [currentUser, setCurrentUser] = useState<any>(null);
   const [communities, setCommunities] = useState<any[]>([]);

   const [profile, setProfile] = useState<any>(null);
   const [posts, setPosts] = useState<any[]>([]);
   const [isFollowing, setIsFollowing] = useState(false);
   const [loading, setLoading] = useState(true);
   const [followLoading, setFollowLoading] = useState(false);

   // Estados para edição
   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
   const [isUpdating, setIsUpdating] = useState(false);
   const [churchSearch, setChurchSearch] = useState("");
   const [isChurchDropdownOpen, setIsChurchDropdownOpen] = useState(false);
   const [editForm, setEditForm] = useState<{
      full_name: string;
      username: string;
      email: string;
      bio: string;
      is_private: boolean;
      gender: string;
      birth_date: string;
      church: string;
      community_id: string | null;
      avatar_url: string;
      cover_url: string;
      is_birth_date_public: boolean;
      social_links: any;
   }>({
      full_name: "",
      username: "",
      email: "",
      bio: "",
      is_private: false,
      gender: "Outro",
      birth_date: "",
      church: "",
      community_id: null,
      avatar_url: "",
      cover_url: "",
      is_birth_date_public: true,
      social_links: {
         youtube: "", instagram: "", whatsapp: "", facebook: "", linkedin: ""
      }
   });

   const fetchProfileData = useCallback(async () => {
      if (!supabase) return;
      setLoading(true);
      try {
         let targetUsername = initialUsername;

         const user = authUser;
         setCurrentUser(user);

         if (targetUsername === "me") {
            if (user) {
               targetUsername = user.user_metadata?.username || user.email?.split('@')[0];
            } else {
               setLoading(false);
               return;
            }
         }

         if (!targetUsername) {
            setLoading(false);
            return;
         }

         const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('username', targetUsername)
            .single();

         if (profileError) {
            setProfile(null);
         } else {
            setProfile(profileData);

            // Carregar comunidades
            const { data: comms } = await supabase.from('communities').select('id, name').order('name');
            setCommunities(comms || []);

            setEditForm({
               full_name: profileData.full_name || "",
               username: profileData.username || "",
               email: authUser?.email || "",
               bio: profileData.bio || "",
               is_private: profileData.is_private || false,
               gender: profileData.gender || "Outro",
               birth_date: profileData.birth_date || "",
               church: profileData.church || "",
               community_id: profileData.community_id || null,
               avatar_url: profileData.avatar_url || "",
               cover_url: profileData.cover_url || "",
               is_birth_date_public: profileData.is_birth_date_public ?? true,
               social_links: {
                  instagram: profileData.social_links?.instagram || "",
                  youtube: profileData.social_links?.youtube || "",
                  whatsapp: profileData.social_links?.whatsapp || "",
                  facebook: profileData.social_links?.facebook || "",
                  linkedin: profileData.social_links?.linkedin || ""
               }
            });

            if (user && profileData.id !== user.id) {
               const { data: followData } = await supabase
                  .from('follows')
                  .select('id')
                  .eq('follower_id', user.id)
                  .eq('following_id', profileData.id)
                  .single();
               setIsFollowing(!!followData);
            }

            const { data: postData } = await supabase
               .from('posts')
               .select('*, profiles:profile_id(*)')
               .eq('profile_id', profileData.id)
               .order('created_at', { ascending: false });

            setPosts(postData || []);
         }
      } catch (err: any) {
         console.error("Profile fetch error:", err);
      } finally {
         setLoading(false);
      }
   }, [initialUsername, supabase, authUser]);

   useEffect(() => {
      if (!authLoading) {
         fetchProfileData();
      }
   }, [fetchProfileData, authLoading]);

   const handleFollowToggle = async () => {
      if (!profile || !currentUser) {
         toast("Acesso restrito", "Você precisa estar logado para seguir.", "error");
         return;
      }
      if (currentUser.id === profile.id) return;
      setFollowLoading(true);
      try {
         const res = await followUserAction(profile.id);
         if (res.success) {
            setIsFollowing(res.isFollowing!);
            setProfile((prev: any) => ({
               ...prev,
               follower_count: (prev.follower_count || 0) + (res.isFollowing ? 1 : -1)
            }));
            toast(res.isFollowing ? "Nova Conexão" : "Conexão Removida", res.isFollowing ? `Você agora segue ${profile.full_name}` : `Deixou de seguir ${profile.full_name}`, "success");
         }
      } catch (err: any) {
         toast("Erro ao Seguir", err.message, "error");
      } finally {
         setFollowLoading(false);
      }
   };

   const handleUpdateProfile = async () => {
      console.log("Iniciando salvamento do perfil...", { profile, currentUser, editForm });

      if (!profile || !currentUser) {
         toast("Ops", "Dados do perfil ainda não carregados completamente. Aguande um instante 🙏", "error");
         return;
      }

      setIsUpdating(true);
      try {
         const res = await updateProfileAction(profile.id, editForm);
         console.log("Resposta da atualização:", res);

         if (res.success) {
            toast("Sucesso", "Altar pessoal atualizado! 🙏", "success");
            setIsEditModalOpen(false);
            fetchProfileData();
         } else {
            toast("Erro ao Salvar", res.error || "Algo deu errado no altar.", "error");
         }
      } catch (err: any) {
         console.error("Erro fatal no salvamento:", err);
         toast("Erro", err.message, "error");
      } finally {
         setIsUpdating(false);
      }
   };

   const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setIsUpdating(true);
      try {
         const fileName = `avatar-${profile.id}-${Date.now()}.jpg`;
         const { error: uploadError } = await supabase.storage.from('post-media').upload(`avatars/${fileName}`, file);
         if (uploadError) throw uploadError;
         const { data: { publicUrl } } = supabase.storage.from('post-media').getPublicUrl(`avatars/${fileName}`);
         setEditForm(prev => ({ ...prev, avatar_url: publicUrl }));
         toast("Foto Carregada", "Clique em salvar para confirmar. ✨", "success");
      } catch (err: any) {
         toast("Erro no Upload", err.message, "error");
      } finally {
         setIsUpdating(false);
      }
   };

   const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setIsUpdating(true);
      try {
         const fileName = `cover-${profile.id}-${Date.now()}.jpg`;
         const { error: uploadError } = await supabase.storage.from('post-media').upload(`covers/${fileName}`, file);
         if (uploadError) throw uploadError;
         const { data: { publicUrl } } = supabase.storage.from('post-media').getPublicUrl(`covers/${fileName}`);
         setEditForm(prev => ({ ...prev, cover_url: publicUrl }));
         toast("Banner Carregado", "A imagem de capa foi atualizada. ✨", "success");
      } catch (err: any) {
         toast("Erro no Upload", err.message, "error");
      } finally {
         setIsUpdating(false);
      }
   };

   if (loading) return (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f8fafc", gap: 16 }}>
         <Loader2 size={32} className="spin primary" />
         <p style={{ fontSize: 13, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1.5 }}>Carregando Perfil...</p>
      </div>
   );

   if (!profile) return (
      <div style={{ textAlign: "center", padding: 100 }}>
         <p className="muted">Membro não encontrado no Refúgio. 🙏</p>
         <Link href="/" className="button" style={{ display: "inline-block", marginTop: 20 }}>Voltar ao Início</Link>
      </div>
   );

   const isMe = currentUser?.id === profile.id;

   return (
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 0 120px", background: "white", minHeight: "100vh" }}>
         <header style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 20, position: "sticky", top: 0, background: "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)", zIndex: 10, borderBottom: "1px solid var(--line)" }}>
            <Link href="/" style={{ color: "black", width: 40, height: 40, borderRadius: 12, background: "var(--line)", display: "grid", placeItems: "center" }}><ChevronLeft size={20} /></Link>
            <div style={{ flex: 1 }}>
               <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>{profile.full_name}</h2>
               <p className="muted" style={{ margin: 0, fontSize: 11, fontWeight: 700 }}>{posts.length} IMPACTOS</p>
            </div>
         </header>

         <div style={{ position: "relative" }}>
            <div style={{ height: 180, background: profile.cover_url ? `url(${profile.cover_url}) center/cover` : "linear-gradient(135deg, var(--primary) 0%, #0d9488 100%)", borderRadius: "0 0 32px 32px", position: "relative" }}>
               <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.1, background: "url('https://www.transparenttextures.com/patterns/church.png')" }}></div>
            </div>
            <div style={{ padding: "0 20px", position: "relative", zIndex: 5 }}>
               <div style={{ display: "flex", alignItems: "center", gap: 32, marginTop: -40 }}>
                  <div style={{ width: 90, height: 90, borderRadius: "50%", background: "white", border: "4px solid white", position: "relative", boxShadow: "var(--shadow-md)", overflow: "hidden", flexShrink: 0 }}>
                     {profile.avatar_url ? <img src={profile.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", background: "var(--line)", display: "grid", placeItems: "center" }}><User size={40} className="muted" /></div>}
                  </div>
                  <div style={{ display: "flex", flex: 1, justifyContent: "space-between", paddingTop: 40, textAlign: "center" }}>
                     <div style={{ flex: 1 }}><span style={{ display: "block", fontSize: 16, fontWeight: 900 }}>{posts.length}</span><span className="muted" style={{ fontSize: 11, fontWeight: 700 }}>Impactos</span></div>
                     <div style={{ flex: 1 }}><span style={{ display: "block", fontSize: 16, fontWeight: 900 }}>{profile.follower_count || 0}</span><span className="muted" style={{ fontSize: 11, fontWeight: 700 }}>Seguidores</span></div>
                     <div style={{ flex: 1 }}><span style={{ display: "block", fontSize: 16, fontWeight: 900 }}>{profile.following_count || 0}</span><span className="muted" style={{ fontSize: 11, fontWeight: 700 }}>Seguindo</span></div>
                  </div>
               </div>

               <div style={{ marginTop: 16 }}>
                  <h1 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900, lineHeight: 1.1 }}>{profile.full_name}</h1>
                  <p className="muted" style={{ margin: "2px 0 12px", fontSize: "0.95rem", fontWeight: 700 }}>@{profile.username}</p>
                  <p style={{ margin: "0 0 16px", fontSize: "0.95rem", lineHeight: 1.4, color: "#334155", whiteSpace: "pre-wrap" }}>{profile.bio || "Buscando edificar vidas no Refúgio. 🙏"}</p>
                  
                  {/* Info Ministerial e Datas */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
                     {profile.church && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "var(--primary)", background: "var(--primary-soft)", padding: "6px 12px", borderRadius: 100 }}>
                           <MapPin size={14} /> {profile.church.toUpperCase()}
                        </div>
                     )}
                     {(profile.is_birth_date_public || isMe) && profile.birth_date && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "var(--muted)", background: "var(--line)", padding: "6px 12px", borderRadius: 100 }}>
                           <Calendar size={14} /> {new Date(profile.birth_date).toLocaleDateString()}
                           {!profile.is_birth_date_public && isMe && <LockIcon size={12} style={{ opacity: 0.5 }} />}
                        </div>
                     )}
                  </div>

                  {/* Conexões Sociais */}
                  {profile.social_links && Object.values(profile.social_links).some(v => !!v) && (
                     <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                        {profile.social_links.instagram && (
                           <a href={buildSocialUrl(profile.social_links.instagram, 'instagram')} target="_blank" rel="noopener noreferrer" style={{ width: 40, height: 40, borderRadius: 12, background: "#f1f5f9", display: "grid", placeItems: "center", color: "#e1306c" }}>
                              <Instagram size={20} />
                           </a>
                        )}
                        {profile.social_links.youtube && (
                           <a href={buildSocialUrl(profile.social_links.youtube, 'youtube')} target="_blank" rel="noopener noreferrer" style={{ width: 40, height: 40, borderRadius: 12, background: "#f1f5f9", display: "grid", placeItems: "center", color: "#ff0000" }}>
                              <Youtube size={20} />
                           </a>
                        )}
                        {profile.social_links.whatsapp && (
                           <a href={buildSocialUrl(profile.social_links.whatsapp, 'whatsapp')} target="_blank" rel="noopener noreferrer" style={{ width: 40, height: 40, borderRadius: 12, background: "#f1f5f9", display: "grid", placeItems: "center", color: "#25d366" }}>
                              <Phone size={20} />
                           </a>
                        )}
                        {profile.social_links.facebook && (
                           <a href={buildSocialUrl(profile.social_links.facebook, 'facebook')} target="_blank" rel="noopener noreferrer" style={{ width: 40, height: 40, borderRadius: 12, background: "#f1f5f9", display: "grid", placeItems: "center", color: "#1877f2" }}>
                              <Facebook size={20} />
                           </a>
                        )}
                        {profile.social_links.linkedin && (
                           <a href={buildSocialUrl(profile.social_links.linkedin, 'linkedin')} target="_blank" rel="noopener noreferrer" style={{ width: 40, height: 40, borderRadius: 12, background: "#f1f5f9", display: "grid", placeItems: "center", color: "#0a66c2" }}>
                              <Linkedin size={20} />
                           </a>
                        )}
                     </div>
                  )}

               </div>
            </div>

            <div style={{ display: "flex", gap: 8, padding: "0 20px 20px" }}>
               {!isMe && (
                  <button disabled={followLoading} onClick={handleFollowToggle} style={{ flex: 1, height: 40, borderRadius: 12, fontSize: 13, fontWeight: 800, background: isFollowing ? "var(--line)" : "var(--primary)", color: isFollowing ? "var(--foreground)" : "white", border: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                     {followLoading ? <Loader2 size={14} className="spin" /> : null}
                     {isFollowing ? "Seguindo" : "Seguir"}
                  </button>
               )}
               {isMe && <button onClick={() => setIsEditModalOpen(true)} style={{ flex: 1, height: 40, borderRadius: 12, fontSize: 13, fontWeight: 800, background: "var(--line)", border: 0, cursor: "pointer" }}>Editar Perfil</button>}
               <button style={{ width: 40, height: 40, borderRadius: 12, background: "var(--line)", border: 0, display: "grid", placeItems: "center", cursor: "pointer" }}><User size={18} /></button>
            </div>
         </div>

         <div style={{ padding: "8px 20px" }}>

            <div className="grid" style={{ gap: 20 }}>
               <div style={{ borderBottom: "3px solid var(--primary)", alignSelf: "flex-start", paddingBottom: 12, marginBottom: 16 }}><strong style={{ fontSize: 15, fontWeight: 900 }}>MENSAGENS MINISTERIAIS</strong></div>
               {posts.length === 0 ? <p className="muted">Nenhuma publicação ainda. 🙏</p> : posts.map(post => <PostCard key={post.id} post={post} onRefresh={fetchProfileData} />)}
            </div>
         </div>

         <Dialog.Root open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <Dialog.Portal>
               <Dialog.Overlay style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(8px)", zIndex: 1000 }} />
               <Dialog.Content
                  aria-describedby={undefined}
                  style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "95%", maxWidth: 550, zIndex: 1001, maxHeight: "90vh", overflowY: "auto", borderRadius: 32, background: "white", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
               >
                  <Dialog.Title style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0, 0, 0, 0)", border: 0 }}>
                     Editar Altar Pessoal
                  </Dialog.Title>
                  <Card variant="flat" padding={32} style={{ border: 0 }}>
                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                        <h3 style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.5px" }}>Ajustar Altar Pessoal</h3>
                        <Dialog.Close asChild><button style={{ background: "var(--line)", border: 0, width: 32, height: 32, borderRadius: 10, cursor: "pointer" }}><X size={18} /></button></Dialog.Close>
                     </div>

                     <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                         {/* Foto e Banner */}
                         <div style={{ position: "relative", width: "100%", height: 160, borderRadius: 24, background: editForm.cover_url || profile.cover_url ? `url(${editForm.cover_url || profile.cover_url}) center/cover` : "var(--line)", border: "2px dashed var(--line)", marginBottom: 40 }}>
                            <label style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.5)", padding: "10px 16px", borderRadius: 12, color: "white", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 800 }}>
                               <Camera size={16} /> ALTERAR BANNER
                               <input type="file" hidden accept="image/*" onChange={handleCoverUpload} />
                            </label>

                            <div style={{ position: "absolute", bottom: -40, left: 24, width: 100, height: 100 }}>
                               <img src={editForm.avatar_url || profile.avatar_url || 'https://placehold.co/150'} style={{ width: "100%", height: "100%", borderRadius: 32, objectFit: "cover", border: "4px solid white", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }} />
                               <label style={{ position: "absolute", bottom: -4, right: -4, background: "var(--primary)", padding: 8, borderRadius: 12, color: "white", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
                                  <Camera size={16} />
                                  <input type="file" hidden accept="image/*" onChange={handleAvatarUpload} />
                               </label>
                            </div>
                         </div>

                        {/* Campos Principais */}
                        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                           <div className="form-group">
                              <label style={{ fontSize: 11, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8, display: "block" }}>Nome de Exibição</label>
                              <input value={editForm.full_name} onChange={e => setEditForm(p => ({ ...p, full_name: e.target.value }))} placeholder="Ex: Izabelle Cirne" style={{ width: "100%", padding: 14, borderRadius: 14, border: "2px solid var(--line)", fontWeight: 600 }} />
                           </div>
                           <div className="form-group">
                              <label style={{ fontSize: 11, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8, display: "block" }}>Username (@)</label>
                              <input
                                 disabled={!isEnabled('profile_edit_username')}
                                 value={editForm.username}
                                 onChange={e => setEditForm(p => ({ ...p, username: e.target.value }))}
                                 placeholder="izacirne"
                                 style={{ width: "100%", padding: 14, borderRadius: 14, border: "2px solid var(--line)", fontWeight: 600, opacity: isEnabled('profile_edit_username') ? 1 : 0.6 }}
                              />
                              <p style={{ fontSize: 10, color: "var(--muted)", marginTop: 4 }}>* Trava de 15 dias para alteração.</p>
                           </div>
                        </div>

                        <div className="form-group">
                           <label style={{ fontSize: 11, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8, display: "block" }}>Biografia</label>
                           <textarea value={editForm.bio} onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))} placeholder="Conte um pouco da sua caminhada com Cristo..." style={{ width: "100%", padding: 14, borderRadius: 14, border: "2px solid var(--line)", height: 100, fontWeight: 600, resize: "none" }} />
                        </div>

                        {isEnabled('profile_edit_email') && (
                           <div className="form-group">
                              <label style={{ fontSize: 11, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8, display: "block" }}>E-mail de Acesso (Login)</label>
                              <input type="email" value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} style={{ width: "100%", padding: 14, borderRadius: 14, border: "2px solid var(--line)", fontWeight: 600, background: "#f8fafc" }} />
                           </div>
                        )}

                        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                           <div className="form-group">
                              <label style={{ fontSize: 11, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8, display: "block" }}>Gênero</label>
                              <select value={editForm.gender} onChange={e => setEditForm(p => ({ ...p, gender: e.target.value }))} style={{ width: "100%", padding: 14, borderRadius: 14, border: "2px solid var(--line)", fontWeight: 600, background: "white" }}>
                                 <option value="Masculino">Masculino</option>
                                 <option value="Feminino">Feminino</option>
                                 <option value="Outro">Outro / Prefiro não dizer</option>
                              </select>
                           </div>
                           <div className="form-group">
                               <label style={{ fontSize: 11, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8, display: "block" }}>Nascimento</label>
                               <div style={{ display: "flex", gap: 8 }}>
                                  <input type="date" value={editForm.birth_date} onChange={e => setEditForm(p => ({ ...p, birth_date: e.target.value }))} style={{ flex: 1, padding: 14, borderRadius: 14, border: "2px solid var(--line)", fontWeight: 600 }} />
                                  <button 
                                     type="button"
                                     onClick={() => setEditForm(p => ({ ...p, is_birth_date_public: !p.is_birth_date_public }))}
                                     style={{ padding: "0 14px", borderRadius: 14, border: "2px solid var(--line)", background: editForm.is_birth_date_public ? "var(--primary-soft)" : "var(--line)", color: editForm.is_birth_date_public ? "var(--primary)" : "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 800 }}
                                  >
                                     {editForm.is_birth_date_public ? <Globe size={14} /> : <LockIcon size={14} />}
                                     {editForm.is_birth_date_public ? "PÚBLICO" : "PRIVADO"}
                                  </button>
                               </div>
                            </div>
                        </div>

                        {isEnabled('profile_edit_church') && (
                           <div className="form-group" style={{ position: "relative" }}>
                              <label style={{ fontSize: 11, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8, display: "block" }}>Vincular Igreja (Busca)</label>

                              <div style={{ position: "relative" }}>
                                 <input
                                    type="text"
                                    value={churchSearch || editForm.church}
                                    placeholder="Digite o nome ou @handle da sua igreja..."
                                    onFocus={() => setIsChurchDropdownOpen(true)}
                                    onChange={(e) => {
                                       setChurchSearch(e.target.value);
                                       setIsChurchDropdownOpen(true);
                                       if (!e.target.value) setEditForm(p => ({ ...p, community_id: null, church: "" }));
                                    }}
                                    style={{ width: "100%", padding: 14, borderRadius: 14, border: "2px solid var(--line)", fontWeight: 600, background: "white" }}
                                 />

                                 {isChurchDropdownOpen && (
                                    <div className="anim-pop-in" style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: 8, background: "white", borderRadius: 16, border: "1px solid var(--line)", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", zIndex: 10, maxHeight: 200, overflowY: "auto" }}>
                                       <div
                                          onClick={() => {
                                             setEditForm(p => ({ ...p, community_id: null, church: "" }));
                                             setChurchSearch("");
                                             setIsChurchDropdownOpen(false);
                                          }}
                                          style={{ padding: "12px 16px", cursor: "pointer", fontSize: 14, borderBottom: "1px solid var(--line)" }}
                                       >
                                          <strong>Nenhuma / Outra</strong>
                                       </div>
                                       {communities
                                          .filter(c =>
                                             c.name.toLowerCase().includes(churchSearch.toLowerCase()) ||
                                             (c.handle && c.handle.toLowerCase().includes(churchSearch.toLowerCase()))
                                          )
                                          .map(c => (
                                             <div
                                                key={c.id}
                                                onClick={() => {
                                                   setEditForm(p => ({ ...p, community_id: c.id, church: c.name }));
                                                   setChurchSearch(c.name);
                                                   setIsChurchDropdownOpen(false);
                                                }}
                                                style={{ padding: "12px 16px", cursor: "pointer", fontSize: 14, borderBottom: "1px solid var(--line)", transition: "0.2s" }}
                                             >
                                                <div style={{ fontWeight: 800 }}>{c.name}</div>
                                                {c.handle && <div style={{ fontSize: 11, color: "var(--primary)", fontWeight: 700 }}>@{c.handle}</div>}
                                             </div>
                                          ))}
                                       {communities.filter(c => c.name.toLowerCase().includes(churchSearch.toLowerCase())).length === 0 && (
                                          <div style={{ padding: 16, textAlign: "center", fontSize: 12, color: "var(--muted)" }}>Nenhuma igreja encontrada 🙏</div>
                                       )}
                                    </div>
                                 )}
                              </div>
                              <p style={{ fontSize: 10, color: "var(--muted)", marginTop: 6 }}>* Se sua igreja não aparece, ela precisa criar uma comunidade oficial.</p>
                           </div>
                        )}

                        {/* Links Sociais */}
                        {isEnabled('profile_advanced_social') && (
                           <div style={{ padding: 20, background: "var(--line)", borderRadius: 24 }}>
                              <p style={{ fontSize: 11, fontWeight: 900, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><Globe size={14} /> REDES SOCIAIS</p>
                              <div className="grid" style={{ gap: 12 }}>
                                 <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                    <Instagram size={18} className="muted" />
                                    <input value={editForm.social_links.instagram} onChange={e => setEditForm(p => ({ ...p, social_links: { ...p.social_links, instagram: e.target.value } }))} placeholder="Instagram URL" style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.1)", fontSize: 13 }} />
                                 </div>
                                 <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                    <Youtube size={18} className="muted" />
                                    <input value={editForm.social_links.youtube} onChange={e => setEditForm(p => ({ ...p, social_links: { ...p.social_links, youtube: e.target.value } }))} placeholder="YouTube URL" style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.1)", fontSize: 13 }} />
                                 </div>
                                 <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                    <Phone size={18} className="muted" />
                                    <input value={editForm.social_links.whatsapp} onChange={e => setEditForm(p => ({ ...p, social_links: { ...p.social_links, whatsapp: e.target.value } }))} placeholder="WhatsApp (com 55 DDD)" style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.1)", fontSize: 13 }} />
                                 </div>
                                 <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                    <Facebook size={18} className="muted" />
                                    <input value={editForm.social_links.facebook} onChange={e => setEditForm(p => ({ ...p, social_links: { ...p.social_links, facebook: e.target.value } }))} placeholder="Facebook URL" style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.1)", fontSize: 13 }} />
                                 </div>
                                 <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                    <Linkedin size={18} className="muted" />
                                    <input value={editForm.social_links.linkedin} onChange={e => setEditForm(p => ({ ...p, social_links: { ...p.social_links, linkedin: e.target.value } }))} placeholder="LinkedIn URL" style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.1)", fontSize: 13 }} />
                                 </div>
                              </div>
                           </div>
                        )}
                     </div>

                     <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
                        <Dialog.Close asChild><Button variant="ghost" style={{ flex: 1, height: 50, borderRadius: 16 }}>Cancelar</Button></Dialog.Close>
                        <Button variant="primary" style={{ flex: 2, height: 50, borderRadius: 16 }} disabled={isUpdating} onClick={handleUpdateProfile}>
                           {isUpdating ? <Loader2 size={20} className="spin" /> : "Salvar Alterações"}
                        </Button>
                     </div>
                  </Card>
               </Dialog.Content>
            </Dialog.Portal>
         </Dialog.Root>
      </div>
   );
}
