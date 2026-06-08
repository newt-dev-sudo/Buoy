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
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-sm font-semibold text-text-primary">Bot folder</label>
        {hasPath ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/5">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
              <Check className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{data.path}</p>
              <p className="text-xs text-text-secondary">Folder selected</p>
            </div>
            <button
              onClick={pickFolder}
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-surface-base text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
            >
              Change
            </button>
          </div>
        ) : (
          <button
            onClick={pickFolder}
            className="flex items-center gap-3 w-full p-5 rounded-xl bg-surface-base text-text-secondary hover:text-accent hover:bg-accent-subtle transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-surface-raised flex items-center justify-center group-hover:bg-accent/10 transition-colors">
              <Monitor className="w-6 h-6 text-text-muted group-hover:text-accent" />
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-semibold">Choose a folder</p>
              <p className="text-xs text-text-muted mt-0.5">Browse your machine to find your bot folder</p>
            </div>
            <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors" />
          </button>
        )}
      </div>
    </div>
  );
}
