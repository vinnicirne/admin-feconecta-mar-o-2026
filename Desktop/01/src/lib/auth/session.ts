import type { AdminRole } from "@/types";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  mfaEnabled: boolean;
};

export async function getMockSession(): Promise<SessionUser> {
  return {
    id: "session-1",
    name: "Marina Costa",
    email: "marina@feconecta.com",
    role: "super_admin",
    mfaEnabled: true
  };
}

