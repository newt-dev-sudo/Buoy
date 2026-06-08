import { useQuery } from "@tanstack/react-query";
import { getBot } from "../lib/ipc";

export function useBot(botId: string) {
  return useQuery({
    queryKey: ["bots", botId],
    queryFn: () => getBot(botId),
    refetchInterval: 3000,
  });
}
