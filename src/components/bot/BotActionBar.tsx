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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-40 transition-colors"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          {isStarting ? "Starting" : "Start"}
        </button>
      ) : (
        <button
          onClick={handleStop}
          disabled={isStopping}
          title={isStopping ? "Stopping..." : "Stop bot"}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-hover text-text-secondary hover:text-text-primary hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40 transition-colors"
        >
          <Square className="w-3.5 h-3.5" />
          {isStopping ? "Stopping" : "Stop"}
        </button>
      )}
      <button
        onClick={handleRestart}
        disabled={isStarting || isStopping}
        title="Restart bot"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-hover text-text-secondary hover:text-text-primary disabled:opacity-40 transition-colors"
      >
        <RotateCw className="w-3.5 h-3.5" />
        Restart
      </button>
    </div>
  );
}
