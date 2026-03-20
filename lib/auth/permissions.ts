import type { AdminRole } from "@/types";

const permissionMap: Record<AdminRole, string[]> = {
  super_admin: ["*"],
  admin: ["dashboard.view", "users.manage", "reports.manage", "content.manage", "monetization.view"],
  moderator: ["dashboard.view", "reports.manage", "content.review"],
  support: ["dashboard.view", "users.view", "tickets.manage"]
};

export function hasPermission(role: AdminRole, permission: string) {
  const permissions = permissionMap[role];
  return permissions.includes("*") || permissions.includes(permission);
}

