import { describe, expect, it } from "vitest";
import { osLabel } from "./buildInfo";

describe("osLabel", () => {
  it("maps platform ids to friendly names", () => {
    expect(osLabel("macos")).toBe("macOS");
    expect(osLabel("windows")).toBe("Windows");
    expect(osLabel("linux")).toBe("Linux");
  });

  it("falls back to the raw id for anything unknown", () => {
    expect(osLabel("freebsd")).toBe("freebsd");
  });
});
