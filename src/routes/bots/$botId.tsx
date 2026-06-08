import { createFileRoute, Outlet, Link, useLocation } from "@tanstack/react-router";
import { ArrowLeft, Activity, FileText, Variable, BarChart3 } from "lucide-react";
import { useBot } from "../../hooks/useBot";
import { useBotEvents } from "../../hooks/useBotEvents";
import { BotStatusBadge } from "../../components/bot/BotStatusBadge";
import { BotActionBar } from "../../components/bot/BotActionBar";
import { OverviewPanel } from "../../components/bot-detail/OverviewPanel";

export const Route = createFileRoute("/bots/$botId")({
  component: BotDetail,
});

const tabs = [
  { to: "/bots/$botId" as const, label: "Overview", icon: Activity },
  { to: "/bots/$botId/logs" as const, label: "Logs", icon: FileText },
  { to: "/bots/$botId/env" as const, label: "Environment", icon: Variable },
  { to: "/bots/$botId/metrics" as const, label: "Metrics", icon: BarChart3 },
];

function BotDetail() {
  const { botId } = Route.useParams();
  const { data: bot } = useBot(botId);
  const location = useLocation();
  const path = location.pathname;
  useBotEvents();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-surface-raised/50">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-surface-hover text-text-secondary hover:text-text-primary hover:bg-surface-active transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold ${
              bot?.status === "running" ? "bg-emerald-500/15 text-emerald-400" : "bg-surface-base text-text-muted"
            }`}>
              {bot?.name ? bot.name.slice(0, 1).toUpperCase() : "?"}
            </div>
            <div>
              <h1 className="text-base font-semibold text-text-primary">{bot?.name || botId}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                {bot && <BotStatusBadge status={bot.status} />}
                <span className="text-xs text-text-muted font-mono">{bot?.entryPoint}</span>
              </div>
            </div>
          </div>
        </div>
        {bot && <BotActionBar botId={bot.id} status={bot.status} />}
      </div>

      {/* Tabs */}
      <nav className="flex px-6 bg-surface-raised/30">
        {tabs.map((tab) => {
          const isActive = path === tab.to.replace("$botId", botId) || (tab.to === "/bots/$botId" && path === `/bots/${botId}`);
          return (
            <Link
              key={tab.label}
              to={tab.to}
              params={{ botId }}
              className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "text-accent"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <tab.icon className={`w-4 h-4 ${isActive ? "text-accent" : "text-text-muted"}`} />
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t-full" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1 overflow-hidden bg-surface-base">
        {path === `/bots/${botId}` ? <OverviewPanel botId={botId} /> : <Outlet />}
      </div>
    </div>
  );
}
