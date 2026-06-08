import { useQuery } from "@tanstack/react-query";
import { listEnvVars } from "../lib/ipc";

export function useBotEnvVars(botId: string) {
  return useQuery({
    queryKey: ["envVars", botId],
    queryFn: () => listEnvVars(botId),
  });
}
