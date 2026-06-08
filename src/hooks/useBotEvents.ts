import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { queryClient } from "../app/queryClient";
import type { StatusEvent, LogEntry } from "../lib/ipc";

export function useBotEvents() {
  useEffect(() => {
    const unlistenStatus = listen<StatusEvent>("bot:status", () => {
      queryClient.invalidateQueries({ queryKey: ["bots"] });
    });

    const unlistenLog = listen<LogEntry>("bot:log", (e) => {
      queryClient.invalidateQueries({ queryKey: ["logs", e.payload.botId] });
    });

    return () => {
      unlistenStatus.then((f) => f());
      unlistenLog.then((f) => f());
    };
  }, []);
}
