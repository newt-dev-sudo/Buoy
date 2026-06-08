import { useQuery } from "@tanstack/react-query";
import { getBots } from "../lib/ipc";

export function useBots() {
  return useQuery({
    queryKey: ["bots"],
    queryFn: getBots,
    refetchInterval: 3000,
  });
}
