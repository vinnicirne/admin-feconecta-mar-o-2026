import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div style={{ 
      minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", 
      padding: 20, background: "linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%)" 
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
           <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--primary)", color: "white", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
              <span style={{ fontWeight: 900, fontSize: 24 }}>F</span>
           </div>
           <h2 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>Bem-vindo ao Refúgio</h2>
           <p className="muted" style={{ marginTop: 8 }}>Entre para compartilhar sua fé e edificar irmãos.</p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
}
