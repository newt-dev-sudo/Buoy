import { Cpu, MemoryStick, Clock, Activity, Hash } from "lucide-react";
import { useBot } from "../../hooks/useBot";
import { formatUptime, formatMemory, formatCpu } from "../../lib/format";

export function MetricsPanel({ botId }: { botId: string }) {
  const { data: bot } = useBot(botId);
  const isRunning = bot?.status === "running";

  const metrics = [
    {
      label: "CPU Usage",
      value: bot?.cpuPct != null ? formatCpu(bot.cpuPct) : "—",
      icon: Cpu,
      color: isRunning ? "text-accent" : "text-text-muted",
      bg: isRunning ? "bg-accent/10" : "bg-surface-base",
      title: "Percentage of CPU consumed by the bot process",
    },
    {
      label: "Memory",
      value: bot?.memMb != null ? formatMemory(bot.memMb) : "—",
      icon: MemoryStick,
      color: isRunning ? "text-emerald-400" : "text-text-muted",
      bg: isRunning ? "bg-emerald-500/10" : "bg-surface-base",
      title: "RAM allocated to the bot process",
    },
    {
      label: "Uptime",
      value: bot?.uptimeSecs != null ? formatUptime(bot.uptimeSecs) : "—",
      icon: Clock,
      color: isRunning ? "text-amber-400" : "text-text-muted",
      bg: isRunning ? "bg-amber-500/10" : "bg-surface-base",
      title: "How long the bot has been running continuously",
    },
    {
      label: "Status",
      value: bot?.status ? bot.status.charAt(0).toUpperCase() + bot.status.slice(1) : "—",
      icon: Activity,
      color: isRunning ? "text-emerald-400" : "text-text-muted",
      bg: isRunning ? "bg-emerald-500/10" : "bg-surface-base",
      title: "Current lifecycle state of the bot",
    },
  ];

  return (
    <div className="p-6 space-y-5 max-w-2xl">
      {/* Live indicator */}
      {isRunning && (
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-medium text-emerald-400 uppercase tracking-wide">Live</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="flex flex-col p-4 rounded-xl bg-surface-card border border-border-subtle transition-all"
            title={m.title}
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg ${m.bg} flex items-center justify-center`}>
                <m.icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <span className="text-[10px] font-medium text-text-muted uppercase tracking-wide">
                {m.label}
              </span>
            </div>
            <span className="text-2xl font-bold mt-3 text-text-primary">
              {m.value}
            </span>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-surface-card border border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface-base flex items-center justify-center">
            <Hash className="w-4 h-4 text-text-muted" />
          </div>
          <div>
            <span className="text-[10px] font-medium text-text-muted uppercase tracking-wide block">Process ID</span>
            <p className="text-[15px] text-text-primary font-mono mt-0.5">{bot?.pid || "Not running"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
