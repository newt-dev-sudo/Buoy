import { Link, useLocation } from "@tanstack/react-router";
import { Settings, Plus, Ship, Container, HelpCircle } from "lucide-react";

export function Sidebar() {
  const location = useLocation();
  const path = location.pathname;

  const isActive = (to: string) => path === to || path.startsWith(to + "/");

  return (
    <aside className="flex flex-col w-sidebar items-center py-4 border-r border-border-subtle bg-surface-base">
      {/* App logo */}
      <div className="mb-8">
        <div className="w-9 h-9 rounded-lg bg-accent-subtle flex items-center justify-center">
          <Ship className="w-[18px] h-[18px] text-accent" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-2 w-full px-2">
        <NavButton to="/dashboard" active={isActive("/dashboard")} icon={Container} label="Fleet" />
        <NavButton to="/bots/new" active={isActive("/bots/new")} icon={Plus} label="Add" />
      </nav>

      <div className="flex flex-col gap-2 w-full px-2 mb-2">
        <NavButton to="/help" active={isActive("/help")} icon={HelpCircle} label="Help" />
      </div>

      <div className="flex flex-col gap-2 w-full px-2">
        <NavButton to="/settings" active={isActive("/settings")} icon={Settings} label="Settings" />
      </div>
    </aside>
  );
}

function NavButton({ to, active, icon: Icon, label }: { to: string; active: boolean; icon: React.FC<{ className?: string }>; label: string }) {
  return (
    <Link
      to={to}
      className={`relative flex items-center justify-center w-full h-9 rounded-lg transition-all ${
        active
          ? "text-accent bg-surface-active"
          : "text-text-muted hover:text-text-secondary hover:bg-surface-hover/60"
      }`}
      title={label}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-accent rounded-r-full" />
      )}
      <Icon className="w-[18px] h-[18px]" />
    </Link>
  );
}
