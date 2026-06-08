import { QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { queryClient } from "./queryClient";
import type { StatusEvent, CloneProgress } from "../lib/ipc";

const ThemeContext = createContext<{ isDark: boolean }>({ isDark: true });
export const useTheme = () => useContext(ThemeContext);

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const unlistenStatus = listen<StatusEvent>("bot:status", (e) => {
      queryClient.setQueryData<StatusEvent | undefined>(["bot", e.payload.botId], (old) => ({
        ...old,
        ...e.payload,
      }));
      queryClient.invalidateQueries({ queryKey: ["bots"] });
    });

    const unlistenClone = listen<CloneProgress>("clone:progress", (e) => {
      queryClient.setQueryData<CloneProgress>(["clone", e.payload.botId], e.payload);
    });

    return () => {
      unlistenStatus.then((f) => f());
      unlistenClone.then((f) => f());
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContext.Provider value={{ isDark: true }}>
        {children}
      </ThemeContext.Provider>
    </QueryClientProvider>
  );
}
