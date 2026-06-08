import { useState } from "react";
import { Palette, FolderCog, ScrollText, Database, Moon, Sun, Monitor, Check } from "lucide-react";
import { useSettings, useSetSetting } from "../../hooks/useSettings";

const sections = [
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "runtime", label: "Runtime Paths", icon: FolderCog },
  { id: "logs", label: "Logs", icon: ScrollText },
  { id: "data", label: "Data", icon: Database },
];

export function SettingsShell() {
  const [active, setActive] = useState("appearance");

  return (
    <div className="flex h-full">
      <aside className="w-56 p-4 space-y-1">
        <h2 className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wide">Settings</h2>
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={`flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm transition-colors ${
              active === s.id
                ? "bg-surface-active text-text-primary"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
            }`}
          >
            <s.icon className="w-4 h-4" />
            {s.label}
          </button>
        ))}
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        {active === "appearance" && <AppearanceSection />}
        {active === "runtime" && <RuntimeSection />}
        {active === "logs" && <LogsSection />}
        {active === "data" && <DataSection />}
      </main>
    </div>
  );
}

function useSettingValue(key: string, defaultValue: string) {
  const { data: settings } = useSettings();
  const set = useSetSetting();
  const val = settings?.find((s) => s.key === key)?.value ?? defaultValue;
  const update = (v: string) => set.mutate({ key, value: v });
  return [val, update] as const;
}

function AppearanceSection() {
  const [theme, setTheme] = useSettingValue("theme", "dark");
  const [launchAtLogin, setLaunchAtLogin] = useSettingValue("launchAtLogin", "false");
  const isLaunchAtLogin = launchAtLogin === "true";

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text-primary">Appearance</h3>
        <p className="text-sm text-text-secondary mt-1">Customize how Buoy looks and behaves</p>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-text-primary">Theme</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "dark", label: "Dark", icon: Moon },
            { value: "light", label: "Light", icon: Sun },
            { value: "system", label: "System", icon: Monitor },
          ].map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                theme === t.value
                  ? "bg-accent-subtle text-accent"
                  : "bg-surface-base text-text-secondary hover:bg-surface-hover"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
              {theme === t.value && <Check className="w-3.5 h-3.5 ml-auto" />}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between p-4 rounded-xl bg-surface-raised">
        <div>
          <p className="text-sm font-medium text-text-primary">Launch at login</p>
          <p className="text-xs text-text-secondary mt-0.5">Start Buoy automatically when you log in</p>
        </div>
        <button
          onClick={() => setLaunchAtLogin(isLaunchAtLogin ? "false" : "true")}
          className={`relative w-12 h-7 rounded-full transition-colors ${
            isLaunchAtLogin ? "bg-accent" : "bg-surface-hover"
          }`}
        >
          <span
            className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-surface-base shadow-sm transition-transform ${
              isLaunchAtLogin ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

function RuntimeSection() {
  const [nodePath, setNodePath] = useSettingValue("nodePath", "node");
  const [pythonPath, setPythonPath] = useSettingValue("pythonPath", "python");

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text-primary">Runtime Paths</h3>
        <p className="text-sm text-text-secondary mt-1">Custom paths for bot runtimes</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-text-primary">Node.js executable</label>
        <input
          type="text"
          value={nodePath}
          onChange={(e) => setNodePath(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg bg-surface-base text-sm text-text-primary focus:outline-none focus:border-accent transition-colors font-mono"
        />
        <p className="text-xs text-text-muted">Leave as "node" to use system PATH</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-text-primary">Python executable</label>
        <input
          type="text"
          value={pythonPath}
          onChange={(e) => setPythonPath(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg bg-surface-base text-sm text-text-primary focus:outline-none focus:border-accent transition-colors font-mono"
        />
        <p className="text-xs text-text-muted">Leave as "python" to use system PATH</p>
      </div>
    </div>
  );
}

function LogsSection() {
  const [retention, setRetention] = useSettingValue("logRetention", "30");
  const days = Number(retention) || 30;

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text-primary">Log Retention</h3>
        <p className="text-sm text-text-secondary mt-1">How long to keep bot logs before rotating</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-text-primary">Keep logs for {days} days</label>
        <input
          type="range"
          min={1}
          max={90}
          value={days}
          onChange={(e) => setRetention(String(e.target.value))}
          className="w-full accent-accent"
        />
        <div className="flex justify-between text-xs text-text-muted">
          <span>1 day</span>
          <span>90 days</span>
        </div>
      </div>
    </div>
  );
}

function DataSection() {
  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text-primary">Data Management</h3>
        <p className="text-sm text-text-secondary mt-1">Export or reset your Buoy data</p>
      </div>

      <div className="space-y-3">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-surface-raised text-sm font-medium text-text-primary hover:bg-surface-hover transition-colors">
          Export database backup
        </button>
        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/5 text-sm font-medium text-status-crashed hover:bg-red-500/10 transition-colors">
          Reset all data
        </button>
      </div>
    </div>
  );
}
