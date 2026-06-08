import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { setSetting, listSettings } from "../lib/ipc";

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: listSettings,
  });
}

export function useSetting(key: string) {
  const { data: settings } = useSettings();
  return settings?.find((s) => s.key === key)?.value ?? null;
}

export function useSetSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => setSetting(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}
