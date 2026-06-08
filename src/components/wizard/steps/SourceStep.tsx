import { Monitor, ChevronRight, Check } from "lucide-react";
import { open } from "@tauri-apps/plugin-dialog";
import type { WizardData } from "../WizardShell";

interface Props {
  data: WizardData;
  update: <K extends keyof WizardData>(key: K, value: WizardData[K]) => void;
}

export function SourceStep({ data, update }: Props) {
  const pickFolder = async () => {
    const selected = await open({ directory: true });
    if (selected) {
      update("path", selected);
    }
  };

  const hasPath = !!data.path;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-[13px] font-semibold text-text-primary">Bot folder</label>
        {hasPath ? (
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-500/5 border border-border-subtle">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-text-primary truncate">{data.path}</p>
              <p className="text-[11px] text-text-secondary">Folder selected</p>
            </div>
            <button
              onClick={pickFolder}
              className="px-3 py-1.5 rounded-md text-[11px] font-medium bg-surface-base border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-surface-hover/50 transition-colors"
            >
              Change
            </button>
          </div>
        ) : (
          <button
            onClick={pickFolder}
            className="flex items-center gap-3 w-full p-4 rounded-xl bg-surface-base border border-border-subtle text-text-secondary hover:text-accent hover:bg-accent-subtle hover:border-accent/20 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-surface-card border border-border-subtle flex items-center justify-center group-hover:bg-accent-subtle group-hover:border-accent/20 transition-colors">
              <Monitor className="w-5 h-5 text-text-muted group-hover:text-accent" />
            </div>
            <div className="text-left flex-1">
              <p className="text-[13px] font-semibold">Choose a folder</p>
              <p className="text-[11px] text-text-muted mt-px">Browse your machine to find your bot folder</p>
            </div>
            <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors" />
          </button>
        )}
      </div>
    </div>
  );
}
