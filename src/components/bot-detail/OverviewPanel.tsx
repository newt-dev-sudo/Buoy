import {
  Folder, FileCode, RotateCw, Hash, Trash2, AlertTriangle,
  Ship, Braces, Terminal, Settings2, Play, Square,
  Activity, Cpu, MemoryStick, Clock, Zap, Lightbulb, Package
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
  const statusColor = isRunning ? "border-l-emerald-500" : bot.status === "crashed" ? "border-l-red-500" : "border-l-amber-500";
  const statusBg = isRunning ? "bg-emerald-500/8" : bot.status === "crashed" ? "bg-red-500/8" : "bg-amber-500/8";
  const statusIconColor = isRunning ? "text-emerald-400" : bot.status === "crashed" ? "text-red-400" : "text-amber-400";

  return (
    <div className="p-8 space-y-6 max-w-3xl overflow-auto">
      {/* Status Banner */}
      <div className={`rounded-xl ${statusBg} ${statusColor} border-l-[4px] p-5`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-surface-base flex items-center justify-center ${statusIconColor}`}>
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">{bot.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className={`text-xs font-semibold uppercase tracking-wide ${statusIconColor}`}>
                  {bot.status}
                </span>
                {bot.pid && (
                  <span className="text-xs text-text-muted font-mono">PID {bot.pid}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isRunning ? (
              <button
                onClick={() => startBot(botId)}
                disabled={isStarting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-40 transition-colors"
              >
                <Play className="w-4 h-4 fill-current" />
                {isStarting ? "Starting..." : "Start"}
              </button>
            ) : (
              <button
                onClick={() => stopBot(botId)}
                disabled={isStopping}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-surface-hover text-text-secondary hover:text-red-300 hover:bg-red-500/10 disabled:opacity-40 transition-colors"
              >
                <Square className="w-4 h-4" />
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
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-surface-hover text-text-secondary hover:text-text-primary disabled:opacity-40 transition-colors"
            >
              <Package className="w-4 h-4" />
              {installing ? "Installing..." : "Install"}
            </button>
            <button
              onClick={() => restartBot(botId)}
              disabled={isStarting || isStopping}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-surface-hover text-text-secondary hover:text-text-primary disabled:opacity-40 transition-colors"
            >
              <Zap className="w-4 h-4" />
              Restart
            </button>
          </div>
        </div>

        {/* Live metrics strip */}
        {isRunning && (
          <div className="grid grid-cols-3 gap-4 mt-5 pt-4 border-t border-border-default/50">
            <MetricStrip icon={Cpu} label="CPU" value={bot.cpuPct != null ? formatCpu(bot.cpuPct) : "—"} color="text-accent" />
            <MetricStrip icon={MemoryStick} label="Memory" value={bot.memMb != null ? formatMemory(bot.memMb) : "—"} color="text-emerald-400" />
            <MetricStrip icon={Clock} label="Uptime" value={bot.uptimeSecs != null ? formatUptime(bot.uptimeSecs) : "—"} color="text-amber-400" />
          </div>
        )}
      </div>

      {/* Configuration */}
      <div>
        <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Configuration</h2>
        <div className="grid grid-cols-2 gap-3">
          <InfoBox icon={Ship} label="Name" value={bot.name} color="text-accent" bg="bg-accent/10" title="Bot display name" />
          <InfoBox icon={rtIcon} label="Runtime" value={rtLabel} color="text-amber-400" bg="bg-amber-500/10" title="Detected language runtime" />
          <InfoBox icon={FileCode} label="Entry Point" value={bot.entryPoint || "—"} mono color="text-emerald-400" bg="bg-emerald-500/10" title="Main file executed on start" />
          <InfoBox icon={Folder} label="Path" value={bot.path} mono color="text-text-muted" bg="bg-surface-base" title="Absolute path to bot folder" />
          <InfoBox icon={RotateCw} label="Auto Restart" value={bot.autoRestart.replace("_", " ")} color="text-text-muted" bg="bg-surface-base" title="Restart behaviour when the bot exits" />
          <InfoBox icon={Hash} label="Crash Count" value={String(bot.crashCount)} color={bot.crashCount > 0 ? "text-red-400" : "text-text-muted"} bg={bot.crashCount > 0 ? "bg-red-500/10" : "bg-surface-base"} title="Number of unexpected exits since creation" />
        </div>
      </div>

      {/* Dependencies reminder */}
      {(bot.runtime === "node" || bot.runtime === "python") && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-accent-subtle">
          <Lightbulb className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <p className="text-sm text-text-secondary leading-relaxed">
            {bot.runtime === "node"
              ? "Use the Install dependencies button above if you haven't run npm install yet."
              : "Use the Install dependencies button above if you haven't run pip install yet."}
          </p>
        </div>
      )}

      {/* Danger zone */}
      <div>
        <h2 className="text-xs font-semibold text-status-crashed uppercase tracking-wide mb-3">Danger Zone</h2>
        {!confirming ? (
          <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-500/15 flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-status-crashed" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">Delete bot</p>
                <p className="text-xs text-text-secondary mt-0.5">Permanently remove this bot and all associated data</p>
              </div>
            </div>
            <button
              onClick={() => setConfirming(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-status-crashed bg-red-500/10 hover:bg-red-500/20 transition-colors"
            >
              Delete
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-5 rounded-xl bg-red-500/5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-status-crashed" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">Are you absolutely sure?</p>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  This will permanently delete <strong className="text-text-primary">{bot.name}</strong>, all logs, environment variables, and crash history. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirming(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-status-crashed text-red-50 hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Yes, delete bot
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricStrip({ icon: Icon, label, value, color }: { icon: React.FC<{ className?: string }>; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className={`w-4 h-4 ${color}`} />
      <div>
        <p className="text-[10px] font-medium text-text-muted uppercase tracking-wide">{label}</p>
        <p className={`text-sm font-semibold font-mono ${color}`}>{value}</p>
      </div>
    </div>
  );
}

function InfoBox({ icon: Icon, label, value, mono, color, bg, title }: { icon: React.FC<{ className?: string }>; label: string; value: string; mono?: boolean; color: string; bg: string; title?: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-raised" title={title}>
      <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-medium text-text-muted uppercase tracking-wide">{label}</p>
        <p className={`text-sm text-text-primary mt-1 break-all ${mono ? "font-mono" : ""}`}>{value}</p>
      </div>
    </div>
  );
}
