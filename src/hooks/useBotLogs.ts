import { useQuery } from "@tanstack/react-query";
import { getBotLogs } from "../lib/ipc";

export function useBotLogs(botId: string, limit = 100) {
  return useQuery({
    queryKey: ["logs", botId],
    queryFn: () => getBotLogs(botId, limit),
    refetchInterval: 2000,
  });
}
