import { AutomationModerationPanel } from "@/components/dashboard/automation-moderation-panel";
import { moderationDetectors, prohibitedWords } from "@/lib/data/dashboard";

export default function AutomationPage() {
  return <AutomationModerationPanel words={prohibitedWords} detectors={moderationDetectors} />;
}
