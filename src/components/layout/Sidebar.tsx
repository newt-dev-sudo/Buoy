import { Link, useLocation } from "@tanstack/react-router";
import { Settings, Plus, Ship, Container, HelpCircle } from "lucide-react";

export function Sidebar() {
  const location = useLocation();
  const path = location.pathname;

  const isActive = (to: string) => path === to || path.startsWith(to + "/");

  return (
    <aside className="flex flex-col w-[72px] bg-surface-raised items-center py-3">
      {/* App logo — single branding, no text */}
      <div className="mb-6">
        <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
          <Ship className="w-5 h-5 text-accent" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1 w-full px-2">
        <NavButton to="/dashboard" active={isActive("/dashboard")} icon={Container} label="Fleet" title="View all your bots and their status" />
        <NavButton to="/bots/new" active={isActive("/bots/new")} icon={Plus} label="Add" title="Create a new bot from a folder or Git repo" />
      </nav>

      <div className="flex flex-col gap-1 w-full px-2">
        <NavButton to="/help" active={isActive("/help")} icon={HelpCircle} label="Help" title="Guides, tokens, and troubleshooting" />
      </div>

      {/* Bottom */}
      <div className="flex flex-col gap-1 w-full px-2">
        <NavButton to="/settings" active={isActive("/settings")} icon={Settings} label="Settings" title="Preferences, runtime paths, and data" />
      </div>
    </aside>
  );
}

function NavButton({ to, active, icon: Icon, label, title }: { to: string; active: boolean; icon: React.FC<{ className?: string }>; label: string; title?: string }) {
  return (
    <Link
      to={to}
      className={`relative flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all ${
        active
          ? "bg-surface-active text-accent"
          : "text-text-muted hover:text-text-primary hover:bg-surface-hover"
      }`}
      title={title || label}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent rounded-r-full" />
      )}
      <Icon className="w-5 h-5" />
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
