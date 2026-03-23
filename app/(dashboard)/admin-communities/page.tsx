import { CommunityManagementPanel } from "@/components/dashboard/community-management-panel";
import { managedCommunities } from "@/lib/data/dashboard";

export default function CommunitiesPage() {
  return <CommunityManagementPanel communities={managedCommunities} />;
}
