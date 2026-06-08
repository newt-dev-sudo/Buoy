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
    <div className="p-8 space-y-6 max-w-2xl">
      {/* Live indicator */}
      {isRunning && (
        <div className="flex items-center gap-2 mb-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-medium text-emerald-400 uppercase tracking-wide">Live</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className={`flex flex-col p-6 rounded-xl bg-surface-raised transition-all`}
            title={m.title}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${m.bg} flex items-center justify-center`}>
                <m.icon className={`w-5 h-5 ${m.color}`} />
              </div>
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">
                {m.label}
              </span>
            </div>
            <span className={`text-3xl font-bold mt-4 ${m.color === "text-text-muted" ? "text-text-primary" : "text-text-primary"}`}>
              {m.value}
            </span>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-xl bg-surface-raised">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-surface-base flex items-center justify-center">
            <Hash className="w-5 h-5 text-text-muted" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wide block">Process ID</span>
            <p className="text-lg text-text-primary font-mono mt-1">{bot?.pid || "Not running"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
