import { useQuery } from "@tanstack/react-query";
import { getMetrics } from "../lib/ipc";

export function useMetrics() {
  return useQuery({
    queryKey: ["metrics"],
    queryFn: getMetrics,
    refetchInterval: 3000,
  });
}
