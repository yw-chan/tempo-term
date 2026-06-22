import { getCurrentWindow } from "@tauri-apps/api/window";
import { isMainWindow } from "@/lib/window";
import { closeLocalSessions } from "@/modules/terminal/lib/pty-bridge";

/**
 * In a secondary window, intercept the close: shut down this window's PTY
 * sessions, then destroy the window. The main window keeps its default close
 * behavior (its sessions die with the process on quit). Returns an unlisten
 * function, or null when nothing was registered.
 */
export async function registerSecondaryWindowCleanup(): Promise<(() => void) | null> {
  if (isMainWindow()) {
    return null;
  }
  const win = getCurrentWindow();
  let cleaning = false;
  return win.onCloseRequested(async (event) => {
    if (cleaning) {
      return;
    }
    cleaning = true;
    event.preventDefault();
    await closeLocalSessions();
    await win.destroy();
  });
}
