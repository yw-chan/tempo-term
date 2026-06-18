import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import "@/i18n";
import { AboutSettingsSection } from "./AboutSettingsSection";

// The version is read from the Tauri runtime; stub it so the section can mount
// outside a real app window.
vi.mock("@tauri-apps/api/app", () => ({
  getVersion: vi.fn().mockResolvedValue("0.0.1"),
}));

describe("AboutSettingsSection", () => {
  it("shows the app version reported by the Tauri runtime", async () => {
    render(<AboutSettingsSection />);
    // Version appears in both the identity card and the build line.
    const matches = await screen.findAllByText(/v0\.0\.1/);
    expect(matches.length).toBeGreaterThan(0);
  });

  it("shows the bundle id and a source-code link", () => {
    render(<AboutSettingsSection />);
    expect(screen.getByText("com.tempoterm.desktop")).toBeInTheDocument();
    expect(screen.getByText("mukiwu/tempo-term")).toBeInTheDocument();
  });
});
