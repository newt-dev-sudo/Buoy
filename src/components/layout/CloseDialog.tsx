import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { getSetting, setSetting } from "../../lib/ipc";
import { X, Minimize2, Power } from "lucide-react";

export function CloseDialog() {
  const [open, setOpen] = useState(false);
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    const unlisten = listen("window:close-requested", async () => {
      // Check saved preference
      const pref = await getSetting("closeAction");
      if (pref === "minimize") {
        await invoke("hide_window");
        return;
      }
      if (pref === "quit") {
        await invoke("quit_app");
        return;
      }
      // No saved preference — show dialog
      setOpen(true);
    });
    return () => { unlisten.then((f) => f()); };
  }, []);

  const chooseMinimize = async () => {
    if (remember) await setSetting("closeAction", "minimize");
    setOpen(false);
    await invoke("hide_window");
  };

  const chooseQuit = async () => {
    if (remember) await setSetting("closeAction", "quit");
    setOpen(false);
    await invoke("quit_app");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm p-5 rounded-xl bg-surface-card border border-border-subtle space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent-subtle flex items-center justify-center">
            <X className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-text-primary">Close Buoy?</h3>
            <p className="text-[13px] text-text-secondary">Your bots will keep running in the system tray.</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <button
            onClick={chooseMinimize}
            className="flex items-center gap-3 w-full p-3 rounded-lg bg-surface-base border border-border-subtle hover:border-accent/30 hover:bg-accent-subtle transition-colors text-left"
          >
            <Minimize2 className="w-4 h-4 text-accent shrink-0" />
            <div>
              <p className="text-[13px] font-medium text-text-primary">Minimize to tray</p>
              <p className="text-[11px] text-text-secondary">Keep your bots running in the background</p>
            </div>
          </button>

          <button
            onClick={chooseQuit}
            className="flex items-center gap-3 w-full p-3 rounded-lg bg-surface-base border border-border-subtle hover:border-red-500/30 hover:bg-red-500/5 transition-colors text-left"
          >
            <Power className="w-4 h-4 text-status-crashed shrink-0" />
            <div>
              <p className="text-[13px] font-medium text-text-primary">Quit Buoy</p>
              <p className="text-[11px] text-text-secondary">Stop all bots and close the app</p>
            </div>
          </button>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 rounded accent-accent"
          />
          <span className="text-[13px] text-text-secondary">Remember my choice</span>
        </label>
      </div>
    </div>
  );
}
