import { useState } from "react";
import { Lock, Plus, Trash2, AlertCircle } from "lucide-react";
import { isValidEnvKey } from "../../../lib/validate";
import type { WizardData } from "../WizardShell";

interface Props {
  data: WizardData;
  update: <K extends keyof WizardData>(key: K, value: WizardData[K]) => void;
}

export function EnvStep({ data, update }: Props) {
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const add = () => {
    if (!key.trim() || !value.trim()) return;
    if (!isValidEnvKey(key.trim())) {
      setError("Keys must be uppercase letters, numbers, and underscores only.");
      return;
    }
    update("envVars", { ...data.envVars, [key.trim()]: value });
    setKey("");
    setValue("");
    setError("");
  };

  const remove = (k: string) => {
    const next = { ...data.envVars };
    delete next[k];
    update("envVars", next);
  };

  const entries = Object.entries(data.envVars);

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 p-3 rounded-lg bg-surface-base">
        <Lock className="w-5 h-5 text-accent mt-0.5" />
        <div>
          <p className="text-sm font-medium text-text-primary">Environment variables</p>
          <p className="text-xs text-text-secondary mt-0.5">
            These are encrypted at rest and injected into the bot process. Optional.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 space-y-1">
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="DISCORD_TOKEN"
            className="w-full px-3 py-2 rounded-md bg-surface-base text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <div className="flex-[2] space-y-1">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="value"
            className="w-full px-3 py-2 rounded-md bg-surface-base text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <button
          onClick={add}
          className="px-3 py-2 rounded-md bg-accent text-accent-fg hover:bg-accent-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-status-crashed">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </div>
      )}

      {entries.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-text-muted">No environment variables yet</p>
        </div>
      ) : (
        <div className="space-y-1">
          {entries.map(([k, v]) => (
            <div
              key={k}
              className="flex items-center gap-3 px-3 py-2 rounded-md bg-surface-base"
            >
              <code className="text-xs font-mono text-accent">{k}</code>
              <span className="flex-1 text-xs text-text-secondary truncate">{v}</span>
              <button
                onClick={() => remove(k)}
                className="text-text-muted hover:text-status-crashed transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
