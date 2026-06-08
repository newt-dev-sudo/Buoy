import { useEffect, useState } from "react";
import { Loader2, FileCode, AlertCircle, Braces, Terminal, Settings2, Lightbulb } from "lucide-react";
import { detectRuntime } from "../../../lib/ipc";
import type { Runtime } from "../../../lib/ipc";
import type { WizardData } from "../WizardShell";

interface Props {
  data: WizardData;
  update: <K extends keyof WizardData>(key: K, value: WizardData[K]) => void;
}

const runtimes: { value: Runtime; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { value: "node", label: "Node.js", Icon: Braces },
  { value: "python", label: "Python", Icon: Terminal },
  { value: "custom", label: "Custom executable", Icon: Settings2 },
];

function depsHint(runtime: Runtime): string | null {
  switch (runtime) {
    case "node":
      return "A package.json was found. Buoy can run npm install for you on the Config step.";
    case "python":
      return "A requirements.txt was found. Buoy can run pip install for you on the Config step.";
    default:
      return null;
  }
}

export function DetectStep({ data, update }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!data.path) return;
    setLoading(true);
    detectRuntime(data.path)
      .then((result) => {
        update("runtime", result.runtime);
        update("entryPoint", result.entryPoint);
        update("provenance", result.provenance);
        setError("");
      })
      .catch((e) => {
        setError(String(e));
      })
      .finally(() => setLoading(false));
  }, [data.path]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="w-7 h-7 text-accent animate-spin" />
        <p className="text-[13px] text-text-secondary">Detecting runtime...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <AlertCircle className="w-7 h-7 text-status-crashed" />
        <p className="text-[13px] text-text-secondary">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-card border border-border-subtle">
        <FileCode className="w-4 h-4 text-accent mt-0.5" />
        <div>
          <p className="text-[13px] font-medium text-text-primary">
            Detected {data.runtime === "node" ? "Node.js" : data.runtime === "python" ? "Python" : "Custom"}
          </p>
          <p className="text-[11px] text-text-secondary mt-1">{data.provenance}</p>
          <p className="text-[11px] text-text-muted mt-1">Entry point: {data.entryPoint}</p>
        </div>
      </div>

      {depsHint(data.runtime) && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-accent-subtle border border-border-subtle">
          <Lightbulb className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <p className="text-[13px] text-text-secondary leading-relaxed">{depsHint(data.runtime)}</p>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-text-primary">Override runtime</label>
        <div className="grid grid-cols-3 gap-2">
          {runtimes.map((rt) => (
            <button
              key={rt.value}
              onClick={() => update("runtime", rt.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-colors ${
                data.runtime === rt.value
                  ? "bg-accent-subtle text-accent"
                  : "bg-surface-base border border-border-subtle text-text-secondary hover:bg-surface-hover/50"
              }`}
            >
              <rt.Icon className="w-3.5 h-3.5" />
              {rt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-text-primary">Entry point</label>
        <input
          type="text"
          value={data.entryPoint}
          onChange={(e) => update("entryPoint", e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-surface-base border border-border-subtle text-[13px] text-text-primary focus:outline-none focus:border-accent transition-colors"
        />
      </div>
    </div>
  );
}
