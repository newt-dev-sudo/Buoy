import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Activity, PlayCircle, PauseCircle, AlertTriangle, Ship } from "lucide-react";
import { useBots } from "../hooks/useBots";
import { useBotEvents } from "../hooks/useBotEvents";
import { BotCard } from "../components/bot/BotCard";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { data: bots, isLoading } = useBots();
  useBotEvents();

  const running = bots?.filter((b) => b.status === "running").length || 0;
  const stopped = bots?.filter((b) => b.status === "stopped").length || 0;
  const crashed = bots?.filter((b) => b.status === "crashed").length || 0;
  const total = bots?.length || 0;

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-surface-raised rounded" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-surface-raised rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!bots || bots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="flex flex-col items-center gap-6 text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-accent-subtle flex items-center justify-center">
            <Ship className="w-10 h-10 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-text-primary">No bots yet</h2>
            <p className="text-sm text-text-secondary mt-2 leading-relaxed">
              Add your first bot to start managing it with Buoy.
            </p>
          </div>
          <Link
            to="/bots/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-accent-fg text-sm font-semibold hover:bg-accent-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add your first bot
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">Manage your bots in one place</p>
        </div>
        <Link
          to="/bots/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-fg text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add bot
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total" value={total} icon={Activity} color="text-text-primary" bg="bg-surface-raised" title="All bots registered in Buoy" />
        <StatCard label="Running" value={running} icon={PlayCircle} color="text-status-running" bg="bg-emerald-500/10" title="Bots currently active and processing" />
        <StatCard label="Stopped" value={stopped} icon={PauseCircle} color="text-status-stopped" bg="bg-surface-raised" title="Bots manually stopped or never started" />
        <StatCard label="Crashed" value={crashed} icon={AlertTriangle} color="text-status-crashed" bg="bg-red-500/10" title="Bots that exited unexpectedly" />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4">Your bots</h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {bots.map((bot) => (
            <BotCard key={bot.id} bot={bot} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg, title }: { label: string; value: number; icon: React.FC<{ className?: string }>; color: string; bg: string; title?: string }) {
  return (
    <div className={`flex items-center gap-4 p-5 rounded-xl ${bg}`} title={title}>
      <div className={`p-2.5 rounded-lg bg-surface-base ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <span className="text-xs font-medium text-text-muted uppercase tracking-wide">{label}</span>
        <span className={`block text-2xl font-bold mt-0.5 ${color}`}>{value}</span>
      </div>
    </div>
  );
}
