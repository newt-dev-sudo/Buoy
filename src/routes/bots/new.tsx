import { createFileRoute } from "@tanstack/react-router";
import { WizardShell } from "../../components/wizard/WizardShell";

export const Route = createFileRoute("/bots/new")({
  component: NewBot,
});

function NewBot() {
  return <WizardShell />;
}
