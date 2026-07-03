import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NotifyToast } from "./NotifyToast";
import { useNotifyStore } from "@/stores/notifyStore";

describe("NotifyToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useNotifyStore.setState({ notice: null });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders nothing until a notice is posted", () => {
    render(<NotifyToast />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows the posted message", () => {
    render(<NotifyToast />);

    act(() => {
      useNotifyStore.getState().notify("檔案總管已更新");
    });

    expect(screen.getByRole("status")).toHaveTextContent("檔案總管已更新");
  });

  it("auto-dismisses after a few seconds", () => {
    render(<NotifyToast />);
    act(() => {
      useNotifyStore.getState().notify("done");
    });

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("restarts the timer when the same message is posted again", () => {
    render(<NotifyToast />);
    act(() => {
      useNotifyStore.getState().notify("done");
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    act(() => {
      useNotifyStore.getState().notify("done");
    });
    act(() => {
      vi.advanceTimersByTime(2500);
    });

    // 2.5s after the second post: still visible (a fresh notice, fresh timer).
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
