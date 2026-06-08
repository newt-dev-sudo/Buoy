import { Link } from "@tanstack/react-router";
import { Folder, ArrowUpRight, Braces, Terminal, Settings2 } from "lucide-react";
import { BotStatusBadge } from "./BotStatusBadge";
import { BotActionBar } from "./BotActionBar";
import { formatUptime, formatMemory, formatCpu } from "../../lib/format";
import type { ManagedBot } from "../../lib/ipc";

interface BotCardProps {
  bot: ManagedBot;
}

const runtimeConfig: Record<string, { icon: React.FC<{ className?: string }>; label: string }> = {
  node: { icon: Braces, label: "Node.js" },
  python: { icon: Terminal, label: "Python" },
  custom: { icon: Settings2, label: "Custom" },
};

export function BotCard({ bot }: BotCardProps) {
  const isRunning = bot.status === "running";
  const rt = runtimeConfig[bot.runtime] || { icon: Settings2, label: bot.runtime };
  const RtIcon = rt.icon;

  const statusDot = isRunning ? "bg-status-running" : bot.status === "crashed" ? "bg-status-crashed" : "bg-status-stopped";

  return (
    <div className="group relative flex flex-col gap-3 p-4 rounded-xl bg-surface-card border border-border-subtle hover:border-border-default transition-all">
      {/* Top status line */}
      <div className={`absolute top-0 left-4 right-4 h-[2px] rounded-full ${isRunning ? "bg-status-running/40" : "bg-transparent"}`} />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
            isRunning ? "bg-emerald-500/10 text-emerald-400" : "bg-surface-base text-text-muted"
          }`}>
            {bot.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-text-primary text-[13px] truncate">{bot.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
              <BotStatusBadge status={bot.status} />
              <span className="text-[11px] text-text-muted flex items-center gap-1">
                <RtIcon className="w-3 h-3" />
                {rt.label}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <BotActionBar botId={bot.id} status={bot.status} />
          <Link
            to="/bots/$botId"
            params={{ botId: bot.id }}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-hover/60 transition-all"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2">
        <MetricBox value={bot.cpuPct != null ? formatCpu(bot.cpuPct) : "—"} label="CPU" active={isRunning} />
        <MetricBox value={bot.memMb != null ? formatMemory(bot.memMb) : "—"} label="RAM" active={isRunning} />
        <MetricBox value={bot.uptimeSecs != null ? formatUptime(bot.uptimeSecs) : "—"} label="Uptime" active={isRunning} />
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-base border border-border-subtle/50">
        <Folder className="w-3 h-3 text-text-muted shrink-0" />
        <span className="text-[11px] text-text-secondary truncate font-mono">{bot.entryPoint}</span>
      </div>
    </div>
  );
}

function MetricBox({ value, label, active }: { value: string; label: string; active: boolean }) {
  return (
    <div className={`flex flex-col gap-1 px-2.5 py-2 rounded-lg ${active ? "bg-surface-base" : "bg-surface-base/40"}`}>
      <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">{label}</span>
      <span className={`text-[13px] font-semibold font-mono ${active ? "text-text-primary" : "text-text-muted"}`}>{value}</span>
    </div>
  );
}
