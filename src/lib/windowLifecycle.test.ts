import { afterEach, describe, expect, it, vi } from "vitest";

const { getCurrentWindow } = vi.hoisted(() => ({ getCurrentWindow: vi.fn() }));
const { closeLocalSessions } = vi.hoisted(() => ({ closeLocalSessions: vi.fn() }));
vi.mock("@tauri-apps/api/window", () => ({ getCurrentWindow }));
vi.mock("@/modules/terminal/lib/pty-bridge", () => ({ closeLocalSessions }));

import { registerSecondaryWindowCleanup } from "./windowLifecycle";

afterEach(() => {
  getCurrentWindow.mockReset();
  closeLocalSessions.mockReset();
});

describe("registerSecondaryWindowCleanup", () => {
  it("registers nothing in the main window", async () => {
    const onCloseRequested = vi.fn();
    getCurrentWindow.mockReturnValue({ label: "main", onCloseRequested });
    const unlisten = await registerSecondaryWindowCleanup();
    expect(unlisten).toBeNull();
    expect(onCloseRequested).not.toHaveBeenCalled();
  });

  it("closes local sessions then destroys the window on close", async () => {
    let handler: (e: { preventDefault: () => void }) => Promise<void> = async () => {};
    const onCloseRequested = vi.fn(async (h) => {
      handler = h;
      return () => {};
    });
    const destroy = vi.fn().mockResolvedValue(undefined);
    closeLocalSessions.mockResolvedValue(undefined);
    getCurrentWindow.mockReturnValue({ label: "win-1", onCloseRequested, destroy });

    await registerSecondaryWindowCleanup();
    expect(onCloseRequested).toHaveBeenCalledTimes(1);

    const preventDefault = vi.fn();
    await handler({ preventDefault });

    expect(preventDefault).toHaveBeenCalled();
    expect(closeLocalSessions).toHaveBeenCalled();
    expect(destroy).toHaveBeenCalled();
  });
});
