import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import "@/i18n";
import { WorkspacePanel } from "./WorkspacePanel";
import { useTabsStore } from "@/stores/tabsStore";
import { leaf } from "@/modules/terminal/lib/terminalLayout";

beforeEach(() => {
  useTabsStore.setState({
    spaces: [{ id: "s1", name: "Salon" }],
    activeSpaceId: "s1",
    activeId: "t1",
    tabs: [
      {
        id: "t1",
        spaceId: "s1",
        title: "alpha",
        kind: "terminal",
        paneTree: leaf("p1", { kind: "terminal", cwd: "/a" }),
        activeLeafId: "p1",
      },
      {
        id: "t2",
        spaceId: "s1",
        title: "beta",
        kind: "terminal",
        paneTree: leaf("p2", { kind: "terminal", cwd: "/b" }),
        activeLeafId: "p2",
      },
    ],
  });
});

describe("WorkspacePanel", () => {
  it("renders the workspace group and its tab cards", () => {
    render(<WorkspacePanel />);
    expect(screen.getByRole("button", { name: /Salon/ })).toBeInTheDocument();
    expect(screen.getByText("alpha")).toBeInTheDocument();
    expect(screen.getByText("beta")).toBeInTheDocument();
  });

  it("activates a tab when its card is clicked", () => {
    render(<WorkspacePanel />);
    fireEvent.click(screen.getByText("beta"));
    expect(useTabsStore.getState().activeId).toBe("t2");
  });

  it("collapses a workspace group to hide its cards", () => {
    render(<WorkspacePanel />);
    fireEvent.click(screen.getByRole("button", { name: /Salon/ }));
    expect(screen.queryByText("alpha")).not.toBeInTheDocument();
    expect(screen.queryByText("beta")).not.toBeInTheDocument();
  });
});
