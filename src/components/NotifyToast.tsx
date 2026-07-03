import { useEffect } from "react";
import { useNotifyStore } from "@/stores/notifyStore";

const FADE_MS = 4000;

/**
 * Transient bottom-right notice for app-wide feedback (e.g. "檔案總管已更新"
 * after a worktree switch). Post via useNotifyStore.getState().notify(text).
 * Auto-fades and never blocks input, mirroring UpdateToast's placement.
 */
export function NotifyToast() {
  const notice = useNotifyStore((s) => s.notice);
  const clear = useNotifyStore((s) => s.clear);

  useEffect(() => {
    if (!notice) {
      return;
    }
    const timer = setTimeout(clear, FADE_MS);
    return () => clearTimeout(timer);
  }, [notice, clear]);

  if (!notice) {
    return null;
  }

  return (
    <div
      role="status"
      className="fixed bottom-10 right-4 z-[90] rounded-lg border border-border bg-bg-elevated px-3.5 py-2.5 text-xs text-fg shadow-2xl"
    >
      {notice.text}
    </div>
  );
}
