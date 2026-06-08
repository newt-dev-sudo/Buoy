import { Minus, Square, X } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

export function Titlebar() {
  const minimize = () => invoke("minimize_window");
  const maximize = () => invoke("maximize_window");
  const close = () => invoke("hide_window");

  return (
    <div className="flex bg-surface-raised select-none" style={{ height: "var(--titlebar-height)" }}>
      <div data-tauri-drag-region className="flex-1" />
      <div className="flex items-center h-full">
        <button
          onClick={minimize}
          className="flex items-center justify-center w-10 h-full text-text-muted hover:text-text-secondary hover:bg-surface-hover/60 transition-colors"
          aria-label="Minimize"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={maximize}
          className="flex items-center justify-center w-10 h-full text-text-muted hover:text-text-secondary hover:bg-surface-hover/60 transition-colors"
          aria-label="Maximize"
        >
          <Square className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={close}
          className="flex items-center justify-center w-10 h-full text-text-muted hover:text-red-300 hover:bg-red-500/20 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
