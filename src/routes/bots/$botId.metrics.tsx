import { createFileRoute } from "@tanstack/react-router";
import { MetricsPanel } from "../../components/bot-detail/MetricsPanel";

export const Route = createFileRoute("/bots/$botId/metrics")({
  component: BotMetrics,
});

function BotMetrics() {
  const { botId } = Route.useParams();
  return <MetricsPanel botId={botId} />;
}
