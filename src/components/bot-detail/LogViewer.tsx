import { useState, useRef } from "react";
import { Search, Trash2, Download, FileText, X } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useBotLogs } from "../../hooks/useBotLogs";
import { clearBotLogs } from "../../lib/ipc";
import { queryClient } from "../../app/queryClient";

export function LogViewer({ botId }: { botId: string }) {
  const { data: logs } = useBotLogs(botId, 500);
  const [query, setQuery] = useState("");
  const parentRef = useRef<HTMLDivElement>(null);

  const filtered = logs?.filter((l) =>
    l.message.toLowerCase().includes(query.toLowerCase())
  ) || [];

  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 24,
    overscan: 20,
  });

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-6 py-3 bg-surface-raised/30">
        <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg bg-surface-base focus-within:border-accent transition-colors">
          <Search className="w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter logs..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-text-muted hover:text-text-primary">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <span className="text-xs text-text-muted font-mono">{filtered.length} lines</span>
        <div className="h-5 w-px bg-border-default" />
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors">
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
        <button
          onClick={async () => {
            await clearBotLogs(botId);
            queryClient.invalidateQueries({ queryKey: ["logs", botId] });
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-text-secondary hover:text-status-crashed hover:bg-red-500/10 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>

      {/* Log content */}
      <div ref={parentRef} className="flex-1 overflow-auto font-mono text-[13px]">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-muted gap-3">
            <div className="w-14 h-14 rounded-2xl bg-surface-base flex items-center justify-center">
              <FileText className="w-7 h-7 text-text-muted" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-text-secondary">No logs yet</p>
              <p className="text-xs text-text-muted mt-1">Start the bot to see real-time logs here</p>
            </div>
          </div>
        ) : (
          <div className="px-4 py-2" style={{ height: `${virtualizer.getTotalSize()}px`, position: "relative" }}>
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const log = filtered[virtualItem.index];
              return (
                <div
                  key={virtualItem.key}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                  className="flex items-start gap-3 py-1.5 px-3 rounded-md hover:bg-surface-hover/30 transition-colors"
                >
                  <span className="text-text-muted/60 shrink-0 w-[68px] tabular-nums text-[11px] mt-0.5">
                    {new Date(log.ts).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                  <span
                    className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      log.stream === "stderr"
                        ? "bg-red-500/12 text-red-400"
                        : "bg-emerald-500/12 text-emerald-400"
                    }`}
                  >
                    {log.stream}
                  </span>
                  <span className="text-text-secondary break-all leading-relaxed text-[13px]">{log.message}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
