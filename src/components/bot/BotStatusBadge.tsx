import { Loader2 } from "lucide-react";
import type { BotStatus } from "../../lib/ipc";

const statusConfig: Record<BotStatus, { label: string; color: string; dot: string }> = {
  running: { label: "Running", color: "text-emerald-400", dot: "bg-emerald-400" },
  stopped: { label: "Stopped", color: "text-text-muted", dot: "bg-text-muted" },
  crashed: { label: "Crashed", color: "text-red-400", dot: "bg-red-400" },
  starting: { label: "Starting", color: "text-amber-400", dot: "bg-amber-400" },
  stopping: { label: "Stopping", color: "text-amber-400", dot: "bg-amber-400" },
};

export function BotStatusBadge({ status }: { status: BotStatus }) {
  const config = statusConfig[status] || statusConfig.stopped;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${config.color}`}>
      {status === "starting" || status === "stopping" ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      )}
      {config.label}
    </span>
  );
}
