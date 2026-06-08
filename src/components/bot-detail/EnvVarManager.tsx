import { useState } from "react";
import { Plus, Trash2, Lock, AlertCircle, Variable, Shield } from "lucide-react";
import { useBotEnvVars } from "../../hooks/useBotEnvVars";
import { setEnvVar, deleteEnvVar } from "../../lib/ipc";
import { isValidEnvKey } from "../../lib/validate";
import { queryClient } from "../../app/queryClient";

export function EnvVarManager({ botId }: { botId: string }) {
  const { data: envs } = useBotEnvVars(botId);
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const add = async () => {
    if (!key.trim() || !value.trim()) return;
    if (!isValidEnvKey(key.trim())) {
      setError("Keys must be uppercase letters, numbers, and underscores only.");
      return;
    }
    await setEnvVar(botId, key.trim(), value);
    setKey("");
    setValue("");
    setError("");
    queryClient.invalidateQueries({ queryKey: ["envVars", botId] });
  };

  const remove = async (k: string) => {
    await deleteEnvVar(botId, k);
    queryClient.invalidateQueries({ queryKey: ["envVars", botId] });
  };

  const entries = envs || [];

  return (
    <div className="p-8 space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-start gap-4 p-4 rounded-xl bg-accent-subtle">
        <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5 text-accent" />
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary">Environment variables</p>
          <p className="text-xs text-text-secondary mt-1 leading-relaxed">
            These values are encrypted at rest and injected into the bot process on startup. Restart the bot after making changes.
          </p>
        </div>
      </div>

      {/* Add form */}
      <div className="flex gap-2">
        <div className="flex-1 space-y-1">
          <label className="text-[11px] font-medium text-text-muted uppercase tracking-wide">Key</label>
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="DISCORD_TOKEN"
            className="w-full px-3 py-2 rounded-lg bg-surface-base text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors font-mono"
          />
        </div>
        <div className="flex-[2] space-y-1">
          <label className="text-[11px] font-medium text-text-muted uppercase tracking-wide">Value</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="your-token-here"
              className="flex-1 px-3 py-2 rounded-lg bg-surface-base text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors font-mono"
            />
            <button
              onClick={add}
              className="px-4 py-2 rounded-lg bg-accent text-accent-fg hover:bg-accent-hover transition-colors font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/5 border border-status-crashed/20 text-xs text-status-crashed">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* List */}
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-text-muted">
          <div className="w-14 h-14 rounded-2xl bg-surface-raised flex items-center justify-center">
            <Variable className="w-7 h-7 text-text-muted" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-text-secondary">No environment variables</p>
            <p className="text-xs text-text-muted mt-1">Add API keys, tokens, or config values above</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((env) => (
            <div
              key={env.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-raised hover:bg-surface-hover/50 transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 text-accent" />
              </div>
              <code className="text-sm font-mono text-accent w-48 truncate">{env.key}</code>
              <span className="flex-1 text-sm text-text-muted font-mono truncate">
                {"*".repeat(Math.min(env.valueEnc.length, 24))}
              </span>
              <button
                onClick={() => remove(env.key)}
                className="p-2 rounded-lg text-text-muted opacity-0 group-hover:opacity-100 hover:text-status-crashed hover:bg-red-500/10 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
