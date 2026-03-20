import { ReportManagementPanel } from "@/components/dashboard/report-management-panel";
import { moderationReports } from "@/lib/data/dashboard";

export default function ReportsPage() {
  return <ReportManagementPanel reports={moderationReports} />;
}

