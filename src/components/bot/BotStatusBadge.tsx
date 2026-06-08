import { Play, Square, AlertTriangle, Loader2, Pause } from "lucide-react";
import type { BotStatus } from "../../lib/ipc";

const statusConfig: Record<BotStatus, { label: string; color: string; bg: string; border: string; Icon: React.FC<{ className?: string }> }> = {
  running: { label: "Running", color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/30", Icon: Play },
  stopped: { label: "Stopped", color: "text-text-muted", bg: "bg-surface-base", border: "border-border-default", Icon: Square },
  crashed: { label: "Crashed", color: "text-red-400", bg: "bg-red-500/15", border: "border-red-500/30", Icon: AlertTriangle },
  starting: { label: "Starting", color: "text-amber-400", bg: "bg-amber-500/15", border: "border-amber-500/30", Icon: Loader2 },
  stopping: { label: "Stopping", color: "text-amber-400", bg: "bg-amber-500/15", border: "border-amber-500/30", Icon: Pause },
};

export function BotStatusBadge({ status }: { status: BotStatus }) {
  const config = statusConfig[status] || statusConfig.stopped;
  const { Icon } = config;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold border ${config.color} ${config.bg} ${config.border}`}>
      <Icon className={`w-3 h-3 ${status === "starting" ? "animate-spin" : ""}`} />
      {config.label}
    </span>
  );
}
