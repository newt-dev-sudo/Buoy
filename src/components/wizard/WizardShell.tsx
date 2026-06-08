import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { createBot, setEnvVar } from "../../lib/ipc";
import { SourceStep } from "./steps/SourceStep";
import { DetectStep } from "./steps/DetectStep";
import { ConfigStep } from "./steps/ConfigStep";
import { EnvStep } from "./steps/EnvStep";
import type { Runtime } from "../../lib/ipc";

export interface WizardData {
  sourceType: "local" | "git";
  path: string;
  gitUrl: string;
  runtime: Runtime;
  entryPoint: string;
  provenance: string;
  name: string;
  args: string[];
  autoRestart: "never" | "on_crash" | "always";
  envVars: Record<string, string>;
  installDeps: boolean;
}

const steps = [
  { id: "source", label: "Source", desc: "Choose a local folder or Git repo" },
  { id: "detect", label: "Detect", desc: "We scan your project files to find the runtime" },
  { id: "config", label: "Config", desc: "Name, entry point, and restart rules" },
  { id: "env", label: "Environment", desc: "API keys, tokens, and secrets" },
];

export function WizardShell() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isInstalling, setIsInstalling] = useState(false);
  const [data, setData] = useState<WizardData>({
    sourceType: "local",
    path: "",
    gitUrl: "",
    runtime: "node",
    entryPoint: "index.js",
    provenance: "",
    name: "",
    args: [],
    autoRestart: "never",
    envVars: {},
    installDeps: true,
  });

  const update = <K extends keyof WizardData>(key: K, value: WizardData[K]) => {
    setData((prev) => ({ ...prev, [key]: value } as WizardData));
  };

  const canProceed = () => {
    if (step === 0) return data.sourceType === "local" ? !!data.path : !!data.gitUrl;
    if (step === 1) return !!data.runtime && !!data.entryPoint;
    if (step === 2) return !!data.name && !!data.entryPoint;
    return true;
  };

  const handleSubmit = async () => {
    const botPath = data.sourceType === "local" ? data.path : data.gitUrl;
    const bot = await createBot({
      name: data.name,
      path: botPath,
      runtime: data.runtime,
      entryPoint: data.entryPoint,
      args: data.args,
      autoRestart: data.autoRestart,
    });
    if (data.installDeps) {
      setIsInstalling(true);
      try {
        await import("../../lib/ipc").then((m) => m.installDeps(bot.id));
      } finally {
        setIsInstalling(false);
      }
    }
    for (const [key, value] of Object.entries(data.envVars)) {
      await setEnvVar(bot.id, key, value);
    }
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-text-primary">Add a new bot</h1>
        <p className="text-[13px] text-text-muted mt-0.5">Point Buoy to your project folder and we'll handle the rest</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center mb-6 relative">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1 relative">
            <div className="flex flex-col items-center z-10">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-[13px] font-semibold transition-all duration-300 ${
                  i < step
                    ? "bg-accent text-accent-fg"
                    : i === step
                    ? "bg-accent-subtle text-accent"
                    : "bg-surface-base text-text-muted"
                }`}
              >
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span
                className={`text-[10px] font-medium mt-1.5 uppercase tracking-wide ${
                  i <= step ? "text-text-primary" : "text-text-muted"
                }`}
                title={s.desc}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-px mx-3 -mt-4 relative">
                <div className="absolute inset-0 bg-border-subtle rounded-full" />
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                    i < step ? "bg-accent w-full" : "w-0"
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-surface-card border border-border-subtle rounded-xl p-6">
        {step === 0 && <SourceStep data={data} update={update} />}
        {step === 1 && <DetectStep data={data} update={update} />}
        {step === 2 && <ConfigStep data={data} update={update} />}
        {step === 3 && <EnvStep data={data} update={update} />}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-5">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        {step < steps.length - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold bg-accent text-accent-fg hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold bg-accent text-accent-fg hover:bg-accent-hover transition-colors"
          >
            <Check className="w-4 h-4" />
            Create bot
          </button>
        )}
      </div>

      {isInstalling && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface-base/80 backdrop-blur-sm">
          <Loader2 className="w-8 h-8 text-accent animate-spin mb-3" />
          <p className="text-[15px] font-semibold text-text-primary">Installing dependencies</p>
          <p className="text-[13px] text-text-secondary mt-1">
            {data.runtime === "node" ? "npm install" : "pip install -r requirements.txt"}
          </p>
          <p className="text-[11px] text-text-muted mt-3">This may take a minute...</p>
        </div>
      )}
    </div>
  );
}
