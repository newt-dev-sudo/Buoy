import { Minus, Square, X } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

export function Titlebar() {
  const minimize = () => invoke("minimize_window");
  const maximize = () => invoke("maximize_window");
  const close = () => invoke("hide_window");

  return (
    <div className="flex items-center h-titlebar bg-surface-base border-b border-border-subtle select-none">
      <div data-tauri-drag-region className="flex-1" />
      <div className="flex items-center h-full pr-2">
        <WindowButton onClick={minimize} label="Minimize">
          <Minus className="w-3.5 h-3.5" />
        </WindowButton>
        <WindowButton onClick={maximize} label="Maximize">
          <Square className="w-3 h-3" />
        </WindowButton>
        <WindowButton onClick={close} label="Close" danger>
          <X className="w-3.5 h-3.5" />
        </WindowButton>
      </div>
    </div>
  );
}

function WindowButton({ onClick, label, danger, children }: { onClick: () => void; label: string; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
        danger
          ? "text-text-muted hover:text-red-300 hover:bg-red-500/10"
          : "text-text-muted hover:text-text-secondary hover:bg-surface-hover/50"
      }`}
      aria-label={label}
    >
      {children}
    </button>
  );
}
