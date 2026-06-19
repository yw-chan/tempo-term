import { create } from "zustand";
import { createNormalizer, type Normalizer } from "./normalize";
import { emptyProgressState, reduceProgress, type ProgressState } from "./progressState";

interface ProgressStoreState {
  progress: ProgressState;
  /** Whether the floating progress panel is expanded. */
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
  togglePanel: () => void;
  /** Feed raw transcript lines (from the backend watcher) through the pipeline. */
  pushLines: (lines: string[]) => void;
  /** Drop all accumulated progress (e.g. when switching to another session). */
  reset: () => void;
}

// The normalizer is stateful (it pairs tool calls with their results), so it
// lives alongside the store and is recreated on reset.
let normalizer: Normalizer = createNormalizer();

export const useProgressStore = create<ProgressStoreState>((set) => ({
  progress: emptyProgressState(),
  panelOpen: false,

  setPanelOpen: (panelOpen) => set({ panelOpen }),
  togglePanel: () => set((state) => ({ panelOpen: !state.panelOpen })),

  pushLines: (lines) =>
    set((state) => {
      let next = state.progress;
      for (const line of lines) {
        for (const event of normalizer.push(line)) {
          next = reduceProgress(next, event);
        }
      }
      return next === state.progress ? {} : { progress: next };
    }),

  reset: () => {
    normalizer = createNormalizer();
    set({ progress: emptyProgressState() });
  },
}));

/** Count of currently in-flight work, used to badge the status-bar icon. */
export function activeCount(progress: ProgressState): number {
  const runningSubagents = progress.subagents.filter((s) => s.status === "running").length;
  return progress.runningTools.length + runningSubagents;
}
