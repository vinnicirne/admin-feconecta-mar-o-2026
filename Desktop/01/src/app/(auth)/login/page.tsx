import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="shell" style={{ display: "grid", placeItems: "center", minHeight: "100vh", padding: 20 }}>
      <LoginForm />
    </main>
  );
}

