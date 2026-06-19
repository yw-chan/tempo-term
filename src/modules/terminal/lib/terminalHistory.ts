import { invoke } from "@tauri-apps/api/core";
import type { Terminal } from "@xterm/xterm";

/** Cap on retained scrollback lines per pane (bounds file size + restore time). */
export const MAX_SCROLLBACK_LINES = 1000;

/**
 * The line written between restored history and the live session. Doubles as the
 * boundary marker for {@link dropRestoredPrefix}, so it is treated as a unique
 * sentinel: written once on restore above the live output, and not expected to
 * be emitted verbatim as its own line by a shell.
 */
export const SESSION_SEPARATOR = "── previous session ──";

/**
 * Read the terminal buffer as plain logical lines (soft-wrapped rows joined back
 * into one line). Unlike a cell-exact serialization this carries no colour, but
 * it reflows cleanly when restored into a pane of any width, so resizing never
 * truncates the history. Lines are separated by "\n".
 */
export function serializeBufferText(term: Terminal, maxLines?: number): string {
  const buffer = term.buffer.active;
  const lines: string[] = [];
  let current = "";
  // Start near the end when capped, then back up to a non-wrapped row so the
  // first kept logical line is whole — avoids scanning thousands of rows only
  // to trim them away.
  let startY = 0;
  if (maxLines !== undefined) {
    startY = Math.max(0, buffer.length - maxLines);
    while (startY > 0) {
      const line = buffer.getLine(startY);
      if (line && !line.isWrapped) {
        break;
      }
      startY--;
    }
  }
  for (let y = startY; y < buffer.length; y++) {
    const line = buffer.getLine(y);
    if (!line) {
      continue;
    }
    current += line.translateToString(false);
    const next = buffer.getLine(y + 1);
    if (!next || !next.isWrapped) {
      lines.push(current.replace(/\s+$/u, ""));
      current = "";
    }
  }
  while (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }
  return lines.join("\n");
}

/**
 * Strip the restored read-only history from a freshly serialized buffer so a
 * snapshot only persists what the live shell produced this session.
 *
 * On pane open we prepend the previously saved scrollback (greyed) plus the
 * {@link SESSION_SEPARATOR} line. Serializing the whole buffer would re-save that
 * restored block, so each reopen would stack another duplicated copy. We anchor
 * on the separator (the FIRST occurrence — the real boundary always sits above
 * the live output) and keep only what follows it.
 *
 * Anchoring on the marker rather than a fixed line count is robust to xterm
 * evicting the oldest rows once a long single session overflows its scrollback:
 * if some restored rows scrolled out, the separator still marks the boundary and
 * no live line is dropped; if the separator itself scrolled out, the buffer is
 * already pure live output and is returned unchanged. When the separator is
 * absent (first session, or fully evicted) the text is returned as-is.
 */
export function dropRestoredPrefix(text: string, separator: string): string {
  const lines = text.split("\n");
  const boundary = lines.indexOf(separator);
  if (boundary === -1) {
    return text;
  }
  return lines.slice(boundary + 1).join("\n");
}

/**
 * Keep only the last `maxLines` lines of a serialized terminal buffer, so a
 * persisted scrollback file stays bounded in size and quick to restore.
 */
export function trimScrollback(text: string, maxLines: number): string {
  const lines = text.split("\n");
  if (lines.length <= maxLines) {
    return text;
  }
  return lines.slice(lines.length - maxLines).join("\n");
}

/** Overwrite a pane's saved scrollback (keyed by its stable leaf id). */
export function saveTerminalHistory(leafId: string, contents: string): Promise<void> {
  return invoke("terminal_history_save", { leafId, contents });
}

/** Load a pane's saved scrollback, or null if none was saved. */
export function loadTerminalHistory(leafId: string): Promise<string | null> {
  return invoke<string | null>("terminal_history_load", { leafId });
}

/** Drop a pane's saved scrollback (shell exited or pane closed). */
export function deleteTerminalHistory(leafId: string): Promise<void> {
  return invoke("terminal_history_delete", { leafId });
}

/** Remove every saved scrollback file (manual clear in settings). */
export function clearTerminalHistory(): Promise<void> {
  return invoke("terminal_history_clear");
}

/** Delete saved files for panes no longer present, keeping `keep` leaf ids. */
export function pruneTerminalHistory(keep: string[]): Promise<void> {
  return invoke("terminal_history_prune", { keep });
}
