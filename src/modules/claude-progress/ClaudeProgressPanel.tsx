import { Check, CircleDot, Loader2, Square, X } from "lucide-react";
import { useProgressStore } from "./lib/progressStore";
import type { SubagentProgress } from "./lib/progressState";
import type { TodoItem } from "./lib/normalize";

function Subagent({ sub }: { sub: SubagentProgress }) {
  const running = sub.status === "running";
  const secs = sub.durationMs != null ? (sub.durationMs / 1000).toFixed(1) : null;
  return (
    <div className="flex items-start gap-2 rounded-lg border border-border bg-bg-inset px-2.5 py-2">
      {running ? (
        <Loader2 size={13} className="mt-0.5 shrink-0 animate-spin text-accent" />
      ) : (
        <Check size={13} className="mt-0.5 shrink-0 text-success" />
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium text-fg">{sub.agentType}</div>
        {sub.description && (
          <div className="truncate text-fg-subtle">{sub.description}</div>
        )}
        {!running && secs && (
          <div className="mt-0.5 text-fg-subtle">
            {secs}s · {sub.tokens?.toLocaleString()} tok · {sub.toolUseCount} tools
          </div>
        )}
      </div>
    </div>
  );
}

function TodoRow({ item }: { item: TodoItem }) {
  const icon =
    item.status === "completed" ? (
      <Check size={12} className="mt-0.5 shrink-0 text-success" />
    ) : item.status === "in_progress" ? (
      <CircleDot size={12} className="mt-0.5 shrink-0 animate-pulse text-accent" />
    ) : (
      <Square size={12} className="mt-0.5 shrink-0 text-fg-subtle" />
    );
  return (
    <div className="flex items-start gap-2">
      {icon}
      <span
        className={
          item.status === "completed" ? "text-fg-subtle line-through" : "text-fg-muted"
        }
      >
        {item.text}
      </span>
    </div>
  );
}

export function ClaudeProgressPanel() {
  const progress = useProgressStore((s) => s.progress);
  const open = useProgressStore((s) => s.panelOpen);
  const setPanelOpen = useProgressStore((s) => s.setPanelOpen);

  if (!open) {
    return null;
  }

  const { runningTools, subagents, todos, idle } = progress;
  const isEmpty =
    runningTools.length === 0 && subagents.length === 0 && todos.length === 0;

  return (
    <div className="fixed bottom-9 right-2 z-40 flex max-h-[70vh] w-80 flex-col overflow-hidden rounded-xl border border-border-strong bg-bg-elevated shadow-2xl">
      <header className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-xs font-semibold text-fg">Claude 進度</span>
        <button
          type="button"
          onClick={() => setPanelOpen(false)}
          aria-label="關閉"
          className="flex h-5 w-5 items-center justify-center rounded text-fg-subtle transition-colors hover:text-fg"
        >
          <X size={14} />
        </button>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-3 text-xs">
        {isEmpty && (
          <p className="py-6 text-center text-fg-subtle">
            {idle ? "閒置中，等待輸入" : "目前沒有 Claude 活動"}
          </p>
        )}

        {subagents.length > 0 && (
          <section className="space-y-1.5">
            <h4 className="text-[11px] font-medium uppercase tracking-wide text-fg-subtle">
              Subagents
            </h4>
            {subagents.map((sub) => (
              <Subagent key={sub.id} sub={sub} />
            ))}
          </section>
        )}

        {runningTools.length > 0 && (
          <section className="space-y-1">
            <h4 className="text-[11px] font-medium uppercase tracking-wide text-fg-subtle">
              進行中的工具
            </h4>
            {runningTools.map((tool) => (
              <div key={tool.id} className="flex items-center gap-2 text-fg-muted">
                <Loader2 size={12} className="shrink-0 animate-spin text-accent" />
                <span className="truncate">{tool.name}</span>
              </div>
            ))}
          </section>
        )}

        {todos.length > 0 && (
          <section className="space-y-1">
            <h4 className="text-[11px] font-medium uppercase tracking-wide text-fg-subtle">
              Todo（{todos.filter((t) => t.status === "completed").length}/{todos.length}）
            </h4>
            {todos.map((item, index) => (
              <TodoRow key={index} item={item} />
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
