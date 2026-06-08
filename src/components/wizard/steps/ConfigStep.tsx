import { useState } from "react";
import { Terminal, RotateCw, Package } from "lucide-react";
import type { WizardData } from "../WizardShell";

interface Props {
  data: WizardData;
  update: <K extends keyof WizardData>(key: K, value: WizardData[K]) => void;
}

const restartOptions: { value: WizardData["autoRestart"]; label: string }[] = [
  { value: "never", label: "Never" },
  { value: "on_crash", label: "On crash" },
  { value: "always", label: "Always" },
];

export function ConfigStep({ data, update }: Props) {
  const [argInput, setArgInput] = useState("");

  const addArg = () => {
    if (!argInput.trim()) return;
    update("args", [...data.args, argInput.trim()]);
    setArgInput("");
  };

  const removeArg = (i: number) => {
    update("args", data.args.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-text-primary">Bot name</label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="My Discord bot"
          className="w-full px-3 py-2 rounded-lg bg-surface-base border border-border-subtle text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-text-primary">Entry point</label>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-base border border-border-subtle">
          <Terminal className="w-3.5 h-3.5 text-text-muted" />
          <input
            type="text"
            value={data.entryPoint}
            onChange={(e) => update("entryPoint", e.target.value)}
            className="flex-1 bg-transparent text-[13px] text-text-primary focus:outline-none"
          />
        </div>
        <p className="text-[11px] text-text-muted">Path relative to the bot folder</p>
      </div>

      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-text-primary">Arguments</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={argInput}
            onChange={(e) => setArgInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addArg()}
            placeholder="--port 3000"
            className="flex-1 px-3 py-2 rounded-lg bg-surface-base border border-border-subtle text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
          />
          <button
            onClick={addArg}
            className="px-3 py-2 rounded-lg bg-surface-hover text-[13px] text-text-secondary hover:text-text-primary hover:bg-surface-active transition-colors"
          >
            Add
          </button>
        </div>
        {data.args.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {data.args.map((arg, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-surface-base border border-border-subtle text-[11px] text-text-secondary"
              >
                {arg}
                <button
                  onClick={() => removeArg(i)}
                  className="text-text-muted hover:text-status-crashed"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-text-primary flex items-center gap-2">
          <RotateCw className="w-3.5 h-3.5" />
          Auto-restart
        </label>
        <div className="grid grid-cols-3 gap-2">
          {restartOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => update("autoRestart", opt.value)}
              className={`px-3 py-2 rounded-lg text-[13px] transition-colors ${
                data.autoRestart === opt.value
                  ? "bg-accent-subtle text-accent"
                  : "bg-surface-base border border-border-subtle text-text-secondary hover:bg-surface-hover/50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-3 p-3 rounded-lg bg-surface-base border border-border-subtle cursor-pointer">
        <input
          type="checkbox"
          checked={data.installDeps}
          onChange={(e) => update("installDeps", e.target.checked)}
          className="w-4 h-4 rounded accent-accent"
        />
        <Package className="w-3.5 h-3.5 text-text-muted" />
        <span className="text-[13px] text-text-secondary">Install dependencies after creation</span>
      </label>
    </div>
  );
}
