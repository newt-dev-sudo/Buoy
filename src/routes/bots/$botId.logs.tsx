import { createFileRoute } from "@tanstack/react-router";
import { LogViewer } from "../../components/bot-detail/LogViewer";

export const Route = createFileRoute("/bots/$botId/logs")({
  component: BotLogs,
});

function BotLogs() {
  const { botId } = Route.useParams();
  return <LogViewer botId={botId} />;
}
