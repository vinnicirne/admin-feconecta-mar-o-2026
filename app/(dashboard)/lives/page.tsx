import { LiveControlPanel } from "@/components/dashboard/live-control-panel";
import { managedLives } from "@/lib/data/dashboard";

export default function LivesPage() {
  return <LiveControlPanel lives={managedLives} />;
}
