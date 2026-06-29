import { useEffect, useRef, useState } from "react";
import type { DiffLine } from "./types";

const LINE_STYLES: Record<DiffLine["kind"], string> = {
  add: "bg-success/10 text-success",
  del: "bg-danger/10 text-danger",
  hunk: "text-accent",
  file: "text-fg-muted",
  meta: "text-fg-subtle",
  context: "text-fg-muted",
};

// Each diff row is a fixed height so the visible window can be derived from
// scrollTop alone (matches the windowing approach in GitGraph). The line-height
// utility on the rows must equal this value.
const ROW_HEIGHT = 20;
// Extra rows rendered above/below the viewport so fast scrolling never reveals
// blank space before the next render lands.
const OVERSCAN = 20;

interface DiffViewProps {
  lines: DiffLine[];
  emptyLabel: string;
}

/**
 * Renders parsed unified-diff lines with per-kind semantic colours. Only the
 * rows inside the scroll viewport (plus an overscan margin) are mounted, so a
 * multi-thousand-line diff no longer pushes thousands of DOM nodes at once.
 */
export function DiffView({ lines, emptyLabel }: DiffViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ scrollTop: 0, height: 360 });

  // Track the real container height so the window covers the full visible area
  // even before the first scroll.
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }
    const sync = () =>
      setViewport((prev) => ({ ...prev, height: element.clientHeight }));
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // A new file/commit replaces `lines`; jump back to the top so the viewport is
  // not left scrolled past the (possibly shorter) new content.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
    setViewport((prev) => ({ ...prev, scrollTop: 0 }));
  }, [lines]);

  if (lines.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-fg-subtle">
        {emptyLabel}
      </div>
    );
  }

  const visibleStart = Math.max(
    0,
    Math.floor(viewport.scrollTop / ROW_HEIGHT) - OVERSCAN,
  );
  const visibleEnd = Math.min(
    lines.length,
    Math.ceil((viewport.scrollTop + viewport.height) / ROW_HEIGHT) + OVERSCAN,
  );
  const visibleLines = lines.slice(visibleStart, visibleEnd);

  return (
    <div
      ref={scrollRef}
      className="h-full overflow-auto font-mono text-[12px]"
      onScroll={(event) => {
        const target = event.currentTarget;
        setViewport({ scrollTop: target.scrollTop, height: target.clientHeight });
      }}
    >
      <div style={{ height: `${lines.length * ROW_HEIGHT}px` }} className="relative">
        <div style={{ transform: `translateY(${visibleStart * ROW_HEIGHT}px)` }}>
          {visibleLines.map((line, i) => (
            <div
              key={visibleStart + i}
              style={{ height: `${ROW_HEIGHT}px` }}
              className={`whitespace-pre px-3 leading-5 ${LINE_STYLES[line.kind]}`}
            >
              {line.text === "" ? " " : line.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
