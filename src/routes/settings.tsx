import { createFileRoute } from "@tanstack/react-router";
import { SettingsShell } from "../components/settings/SettingsShell";

export const Route = createFileRoute("/settings")({
  component: Settings,
});

function Settings() {
  return <SettingsShell />;
}
