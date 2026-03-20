import { SignUpForm } from "@/components/auth/signup-form";

export default function SignUpPage() {
  return (
    <main className="shell" style={{ display: "grid", placeItems: "center", minHeight: "100vh", padding: 20 }}>
      <SignUpForm />
    </main>
  );
}
