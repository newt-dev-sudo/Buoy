import { createFileRoute } from "@tanstack/react-router";
import { EnvVarManager } from "../../components/bot-detail/EnvVarManager";

export const Route = createFileRoute("/bots/$botId/env")({
  component: BotEnv,
});

function BotEnv() {
  const { botId } = Route.useParams();
  return <EnvVarManager botId={botId} />;
}
