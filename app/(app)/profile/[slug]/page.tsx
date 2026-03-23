import { ProfileClient } from "@/components/app/profile/profile-client";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProfilePage({ params }: PageProps) {
  const resolvedParams = await params;
  const usernameParam = resolvedParams.slug; // Usando slug aqui

  if (!usernameParam) {
    return (
      <div style={{ textAlign: "center", padding: 100 }}>
        <p>Usuário inválido no altar. 🙏</p>
      </div>
    );
  }

  return (
    <ProfileClient initialUsername={usernameParam} />
  );
}
