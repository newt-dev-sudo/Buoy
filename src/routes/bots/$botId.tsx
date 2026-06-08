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
      <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="flex items-center justify-center w-8 h-8 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-hover/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
              bot?.status === "running" ? "bg-emerald-500/10 text-emerald-400" : "bg-surface-base text-text-muted"
            }`}>
              {bot?.name ? bot.name.slice(0, 1).toUpperCase() : "?"}
            </div>
            <div>
              <h1 className="text-[13px] font-semibold text-text-primary">{bot?.name || botId}</h1>
              <div className="flex items-center gap-2 mt-px">
                {bot && <BotStatusBadge status={bot.status} />}
                <span className="text-[11px] text-text-muted font-mono">{bot?.entryPoint}</span>
              </div>
            </div>
          </div>
        </div>
        {bot && <BotActionBar botId={bot.id} status={bot.status} />}
      </div>

      {/* Tabs */}
      <nav className="flex px-5 gap-1 border-b border-border-subtle">
        {tabs.map((tab) => {
          const isActive = path === tab.to.replace("$botId", botId) || (tab.to === "/bots/$botId" && path === `/bots/${botId}`);
          return (
            <Link
              key={tab.label}
              to={tab.to}
              params={{ botId }}
              className={`relative flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium rounded-md transition-colors ${
                isActive
                  ? "text-accent bg-accent-subtle"
                  : "text-text-muted hover:text-text-secondary hover:bg-surface-hover/30"
              }`}
            >
              <tab.icon className={`w-3.5 h-3.5 ${isActive ? "text-accent" : "text-text-muted"}`} />
              {tab.label}
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
