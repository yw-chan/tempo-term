import type { Tab } from "@/stores/tabsStore";
import { findPaneContent, leafIds } from "@/modules/terminal/lib/terminalLayout";

/**
 * Every distinct directory a Claude session could be running in, one per open
 * terminal pane.
 *
 * A pane's live cwd (saved to `pane.cwd` as the shell `cd`s around) wins, so the
 * panel follows the directory the user actually ran `claude` in — not just the
 * tab's starting directory. A pane that hasn't reported its cwd yet (freshly
 * spawned, or an inactive split that never polled) falls back to the tab's
 * initial cwd so its session is still found. Empty results are skipped.
 */
export function collectSessionCwds(tabs: Tab[]): string[] {
  const cwds = new Set<string>();
  for (const tab of tabs) {
    for (const id of leafIds(tab.paneTree)) {
      const pane = findPaneContent(tab.paneTree, id);
      if (pane?.kind !== "terminal") {
        continue;
      }
      const cwd = pane.cwd || tab.cwd;
      if (cwd) {
        cwds.add(cwd);
      }
    }
  }
  return [...cwds];
}
