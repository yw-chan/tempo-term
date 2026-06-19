import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useTabsStore } from "@/stores/tabsStore";
import { useProgressStore } from "./progressStore";
import { collectSessionCwds } from "./collectSessionCwds";

/**
 * Streams Claude progress for every open terminal pane's directory. Whenever the
 * set of pane cwds changes we drop progress for directories that are gone and
 * ask the backend to watch the current set; the backend follows each directory's
 * latest session and emits `claude-progress:lines` tagged with its cwd.
 *
 * The set comes from each pane's live cwd (see `collectSessionCwds`), so a
 * session started after `cd`-ing inside a pane is still found.
 */
export function useWatchSessions(): void {
  // A stable string key so the effect only re-runs when the cwd set changes.
  const cwdKey = useTabsStore((s) => collectSessionCwds(s.tabs).sort().join("\n"));

  useEffect(() => {
    const cwds = cwdKey ? cwdKey.split("\n") : [];
    useProgressStore.getState().syncSessions(cwds);
    void invoke("claude_progress_watch", { cwds }).catch(() => {});
  }, [cwdKey]);
}
