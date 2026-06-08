import {
  Folder, FileCode, RotateCw, Hash, Trash2, AlertTriangle,
  Ship, Braces, Terminal, Settings2, Play, Square,
  Activity, Zap, Lightbulb, Package
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useBot } from "../../hooks/useBot";
import { deleteBot, startBot, stopBot, restartBot, installDeps } from "../../lib/ipc";
import { queryClient } from "../../app/queryClient";
import { useState } from "react";
import { formatUptime, formatMemory, formatCpu } from "../../lib/format";

export function OverviewPanel({ botId }: { botId: string }) {
  const { data: bot } = useBot(botId);
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [installing, setInstalling] = useState(false);

  if (!bot) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-text-muted">Loading...</p>
      </div>
    );
  }

  const isRunning = bot.status === "running";
  const isStarting = bot.status === "starting";
  const isStopping = bot.status === "stopping";

  const handleDelete = async () => {
    await deleteBot(botId);
    queryClient.invalidateQueries({ queryKey: ["bots"] });
    navigate({ to: "/dashboard" });
  };

  const rtLabel = bot.runtime === "node" ? "Node.js" : bot.runtime === "python" ? "Python" : "Custom";
  const rtIcon = bot.runtime === "node" ? Braces : bot.runtime === "python" ? Terminal : Settings2;
  const statusBg = isRunning ? "bg-emerald-500/8" : bot.status === "crashed" ? "bg-red-500/8" : "bg-amber-500/8";
  const statusIconColor = isRunning ? "text-emerald-400" : bot.status === "crashed" ? "text-red-400" : "text-amber-400";

  return (
    <div className="p-6 space-y-5 max-w-3xl overflow-auto">
      {/* Status Banner */}
      <div className={`rounded-xl ${statusBg} border border-border-subtle p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg bg-surface-base flex items-center justify-center ${statusIconColor}`}>
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-text-primary">{bot.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[11px] font-medium uppercase tracking-wide ${statusIconColor}`}>
                  {bot.status}
                </span>
                {bot.pid && (
                  <span className="text-[11px] text-text-muted font-mono">PID {bot.pid}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {!isRunning ? (
              <button
                onClick={() => startBot(botId)}
                disabled={isStarting}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-40 transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {isStarting ? "Starting..." : "Start"}
              </button>
            ) : (
              <button
                onClick={() => stopBot(botId)}
                disabled={isStopping}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-semibold bg-surface-hover text-text-secondary hover:text-red-300 hover:bg-red-500/10 disabled:opacity-40 transition-colors"
              >
                <Square className="w-3.5 h-3.5" />
                {isStopping ? "Stopping..." : "Stop"}
              </button>
            )}
            <button
              onClick={async () => {
                setInstalling(true);
                try {
                  await installDeps(botId);
                } finally {
                  setInstalling(false);
                }
              }}
              disabled={isStarting || isStopping || installing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-medium bg-surface-hover text-text-secondary hover:text-text-primary disabled:opacity-40 transition-colors"
            >
              <Package className="w-3.5 h-3.5" />
              {installing ? "Installing..." : "Install"}
            </button>
            <button
              onClick={() => restartBot(botId)}
              disabled={isStarting || isStopping}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-medium bg-surface-hover text-text-secondary hover:text-text-primary disabled:opacity-40 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              Restart
            </button>
          </div>
        </div>

        {/* Live metrics strip */}
        {isRunning && (
          <div className="grid grid-cols-3 gap-4 mt-4 pt-3 border-t border-border-subtle/50">
            <MetricStrip label="CPU" value={bot.cpuPct != null ? formatCpu(bot.cpuPct) : "—"} color="text-accent" />
            <MetricStrip label="Memory" value={bot.memMb != null ? formatMemory(bot.memMb) : "—"} color="text-emerald-400" />
            <MetricStrip label="Uptime" value={bot.uptimeSecs != null ? formatUptime(bot.uptimeSecs) : "—"} color="text-amber-400" />
          </div>
        )}
      </div>

      {/* Configuration */}
      <div>
        <h2 className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-2">Configuration</h2>
        <div className="grid grid-cols-2 gap-2">
          <InfoBox icon={Ship} label="Name" value={bot.name} color="text-accent" bg="bg-accent-subtle" />
          <InfoBox icon={rtIcon} label="Runtime" value={rtLabel} color="text-amber-400" bg="bg-amber-500/10" />
          <InfoBox icon={FileCode} label="Entry Point" value={bot.entryPoint || "—"} mono color="text-emerald-400" bg="bg-emerald-500/10" />
          <InfoBox icon={Folder} label="Path" value={bot.path} mono color="text-text-muted" bg="bg-surface-base" />
          <InfoBox icon={RotateCw} label="Auto Restart" value={bot.autoRestart.replace("_", " ")} color="text-text-muted" bg="bg-surface-base" />
          <InfoBox icon={Hash} label="Crash Count" value={String(bot.crashCount)} color={bot.crashCount > 0 ? "text-red-400" : "text-text-muted"} bg={bot.crashCount > 0 ? "bg-red-500/10" : "bg-surface-base"} />
        </div>
      </div>

      {/* Dependencies reminder */}
      {(bot.runtime === "node" || bot.runtime === "python") && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-accent-subtle border border-border-subtle">
          <Lightbulb className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <p className="text-[13px] text-text-secondary leading-relaxed">
            {bot.runtime === "node"
              ? "Use the Install dependencies button above if you haven't run npm install yet."
              : "Use the Install dependencies button above if you haven't run pip install yet."}
          </p>
        </div>
      )}

      {/* Danger zone */}
      <div>
        <h2 className="text-[11px] font-semibold text-status-crashed uppercase tracking-wide mb-2">Danger Zone</h2>
        {!confirming ? (
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-red-500/5 border border-border-subtle">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-status-crashed" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-text-primary">Delete bot</p>
                <p className="text-[11px] text-text-secondary mt-px">Permanently remove this bot and all associated data</p>
              </div>
            </div>
            <button
              onClick={() => setConfirming(true)}
              className="px-3.5 py-1.5 rounded-lg text-[13px] font-medium text-status-crashed bg-red-500/10 hover:bg-red-500/20 transition-colors"
            >
              Delete
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 p-4 rounded-xl bg-red-500/5 border border-border-subtle">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-status-crashed" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-text-primary">Are you absolutely sure?</p>
                <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">
                  This will permanently delete <strong className="text-text-primary">{bot.name}</strong>, all logs, environment variables, and crash history. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirming(false)}
                className="px-3.5 py-1.5 rounded-lg text-[13px] font-medium text-text-secondary hover:bg-surface-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-medium bg-status-crashed text-red-50 hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Yes, delete bot
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricStrip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[10px] font-medium text-text-muted uppercase tracking-wide">{label}</p>
      <p className={`text-[13px] font-semibold font-mono ${color}`}>{value}</p>
    </div>
  );
}

function InfoBox({ icon: Icon, label, value, mono, color, bg }: { icon: React.FC<{ className?: string }>; label: string; value: string; mono?: boolean; color: string; bg: string }) {
  return (
    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-card border border-border-subtle">
      <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-3.5 h-3.5 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-medium text-text-muted uppercase tracking-wide">{label}</p>
        <p className={`text-[13px] text-text-primary mt-0.5 break-all ${mono ? "font-mono" : ""}`}>{value}</p>
      </div>
    </div>
  );
}
