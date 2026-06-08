import { Play, Square, RotateCw } from "lucide-react";
import { startBot, stopBot, restartBot } from "../../lib/ipc";
import type { BotStatus } from "../../lib/ipc";

export function BotActionBar({ botId, status }: { botId: string; status: BotStatus }) {
  const isRunning = status === "running";
  const isStarting = status === "starting";
  const isStopping = status === "stopping";

  const handleStart = () => startBot(botId);
  const handleStop = () => stopBot(botId);
  const handleRestart = () => restartBot(botId);

  return (
    <div className="flex items-center gap-1">
      {!isRunning ? (
        <button
          onClick={handleStart}
          disabled={isStarting}
          title={isStarting ? "Starting..." : "Start bot"}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-40 transition-colors"
        >
          <Play className="w-3 h-3 fill-current" />
          {isStarting ? "Starting" : "Start"}
        </button>
      ) : (
        <button
          onClick={handleStop}
          disabled={isStopping}
          title={isStopping ? "Stopping..." : "Stop bot"}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-semibold bg-surface-hover text-text-secondary hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40 transition-colors"
        >
          <Square className="w-3 h-3" />
          {isStopping ? "Stopping" : "Stop"}
        </button>
      )}
      <button
        onClick={handleRestart}
        disabled={isStarting || isStopping}
        title="Restart bot"
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-surface-hover text-text-muted hover:text-text-primary disabled:opacity-40 transition-colors"
      >
        <RotateCw className="w-3 h-3" />
        Restart
      </button>
    </div>
  );
}
