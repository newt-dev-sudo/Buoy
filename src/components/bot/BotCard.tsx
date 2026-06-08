import { Link } from "@tanstack/react-router";
import { Cpu, MemoryStick, Clock, Folder, ArrowUpRight, Braces, Terminal, Settings2 } from "lucide-react";
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

  return (
    <div className={`group relative flex flex-col gap-4 p-5 rounded-xl bg-surface-raised hover:bg-surface-hover/60 transition-all ${
      isRunning ? "running-glow" : ""
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold ${
            isRunning ? "bg-emerald-500/15 text-emerald-400" : "bg-surface-base text-text-muted"
          }`}>
            {bot.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-text-primary text-sm truncate">{bot.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <BotStatusBadge status={bot.status} />
              <span className="text-xs text-text-muted flex items-center gap-1">
                <RtIcon className="w-3 h-3" />
                {rt.label}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <BotActionBar botId={bot.id} status={bot.status} />
          <Link
            to="/bots/$botId"
            params={{ botId: bot.id }}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-hover transition-all"
          >
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2">
        <MetricBox icon={Cpu} value={bot.cpuPct != null ? formatCpu(bot.cpuPct) : "—"} label="CPU" active={isRunning} title="Process CPU usage percentage" />
        <MetricBox icon={MemoryStick} value={bot.memMb != null ? formatMemory(bot.memMb) : "—"} label="RAM" active={isRunning} title="Process memory consumption" />
        <MetricBox icon={Clock} value={bot.uptimeSecs != null ? formatUptime(bot.uptimeSecs) : "—"} label="Uptime" active={isRunning} title="Time since bot started" />
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-base">
        <Folder className="w-3.5 h-3.5 text-text-muted shrink-0" />
        <span className="text-xs text-text-secondary truncate font-mono">{bot.entryPoint}</span>
      </div>
    </div>
  );
}

function MetricBox({ icon: Icon, value, label, active, title }: { icon: React.FC<{ className?: string }>; value: string; label: string; active: boolean; title?: string }) {
  return (
    <div className={`flex flex-col gap-1 px-3 py-2.5 rounded-lg ${
      active ? "bg-surface-base" : "bg-surface-base/50"
    }`} title={title}>
      <div className="flex items-center gap-1.5">
        <Icon className={`w-3.5 h-3.5 ${active ? "text-text-secondary" : "text-text-muted"}`} />
        <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">{label}</span>
      </div>
      <span className={`text-sm font-semibold ${active ? "text-text-primary" : "text-text-muted"}`}>{value}</span>
    </div>
  );
}
