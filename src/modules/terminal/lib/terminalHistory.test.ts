import { describe, expect, it } from "vitest";
import { SESSION_SEPARATOR, dropRestoredPrefix, trimScrollback } from "./terminalHistory";

describe("trimScrollback", () => {
  it("keeps only the last N lines when the text is longer", () => {
    const text = ["a", "b", "c", "d", "e"].join("\n");
    expect(trimScrollback(text, 3)).toBe("c\nd\ne");
  });

  it("returns the text unchanged when it has at most N lines", () => {
    expect(trimScrollback("a\nb", 5)).toBe("a\nb");
    expect(trimScrollback("", 5)).toBe("");
  });
});

describe("dropRestoredPrefix", () => {
  it("drops the restored read-only block and keeps only this session's output", () => {
    const buffer = ["old line 1", "old line 2", SESSION_SEPARATOR, "live 1", "live 2"].join("\n");
    expect(dropRestoredPrefix(buffer, SESSION_SEPARATOR)).toBe("live 1\nlive 2");
  });

  it("returns the text unchanged when nothing was restored (no separator)", () => {
    expect(dropRestoredPrefix("live 1\nlive 2", SESSION_SEPARATOR)).toBe("live 1\nlive 2");
  });

  it("returns empty when the live shell has produced no output yet", () => {
    const buffer = ["old line 1", SESSION_SEPARATOR].join("\n");
    expect(dropRestoredPrefix(buffer, SESSION_SEPARATOR)).toBe("");
  });

  it("keeps all live output when the restored block was partially evicted by the buffer cap", () => {
    // xterm evicts oldest rows first once a long single session overflows its
    // scrollback. Some restored history rows are gone, but the separator still
    // marks the boundary, so every live line must survive. A count-based strip
    // would slice off live lines here; anchoring on the separator does not.
    const buffer = ["surviving old line", SESSION_SEPARATOR, "live 1", "live 2", "live 3"].join(
      "\n",
    );
    expect(dropRestoredPrefix(buffer, SESSION_SEPARATOR)).toBe("live 1\nlive 2\nlive 3");
  });

  it("returns the text unchanged when the whole restored block (and separator) was evicted", () => {
    // Massive single-session overflow scrolls the separator out entirely; the
    // buffer is then pure live output and must not be truncated.
    const buffer = ["live 1", "live 2", "live 3"].join("\n");
    expect(dropRestoredPrefix(buffer, SESSION_SEPARATOR)).toBe("live 1\nlive 2\nlive 3");
  });

  it("anchors on the first separator so live output that echoes it is never dropped", () => {
    const buffer = ["old 1", SESSION_SEPARATOR, "live 1", SESSION_SEPARATOR, "live 2"].join("\n");
    expect(dropRestoredPrefix(buffer, SESSION_SEPARATOR)).toBe(
      ["live 1", SESSION_SEPARATOR, "live 2"].join("\n"),
    );
  });

  it("does not multiply restored history across repeated reopen cycles", () => {
    // Simulate reopening a pane N times. Each cycle:
    //   1. restore: prepend the saved history + a "previous session" separator
    //   2. shell prints one fresh live line
    //   3. snapshot: serialize the whole buffer, then strip the restored prefix
    // The persisted file must stay a single session's worth of output, never an
    // ever-growing stack of duplicated history.
    let saved = "";
    for (let i = 0; i < 5; i += 1) {
      const restoredLines = saved === "" ? [] : [...saved.split("\n"), SESSION_SEPARATOR];
      const liveLine = `live ${i}`;
      const fullBuffer = [...restoredLines, liveLine].join("\n");
      saved = dropRestoredPrefix(fullBuffer, SESSION_SEPARATOR);
    }
    expect(saved).toBe("live 4");
    expect(saved.split("\n").filter((line) => line === SESSION_SEPARATOR)).toHaveLength(0);
  });
});
