import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronDown,
  ChevronRight,
  FileCode,
  FileText,
  Folder,
  GitBranch,
  Globe,
  LayoutGrid,
  Plus,
  SquareTerminal,
  type LucideIcon,
} from "lucide-react";
import { useTabsStore, type Tab, type TabKind } from "@/stores/tabsStore";
import { deriveTabCwd } from "./lib/tabCwd";

function tabIcon(kind: TabKind): LucideIcon {
  switch (kind) {
    case "terminal":
      return SquareTerminal;
    case "editor":
      return FileCode;
    case "note":
      return FileText;
    case "preview":
      return Globe;
    case "git-graph":
      return GitBranch;
    case "launcher":
      return LayoutGrid;
  }
}

function TabCard({ tab }: { tab: Tab }) {
  const activeId = useTabsStore((s) => s.activeId);
  const setActive = useTabsStore((s) => s.setActive);
  const active = tab.id === activeId;
  const cwd = deriveTabCwd(tab);
  const Icon = tabIcon(tab.kind);

  return (
    <button
      type="button"
      onClick={() => setActive(tab.id)}
      className={`flex w-full items-start gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors ${
        active
          ? "border-accent bg-accent/10 text-fg"
          : "border-border bg-bg-inset text-fg-muted hover:bg-bg-elevated"
      }`}
    >
      <Icon size={14} className="mt-0.5 shrink-0 text-fg-subtle" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-medium text-fg">{tab.title}</span>
        {cwd && <span className="block truncate text-[11px] text-fg-subtle">{cwd}</span>}
      </span>
    </button>
  );
}

function SpaceGroup({ id, name }: { id: string; name: string }) {
  const tabs = useTabsStore((s) => s.tabs).filter((t) => t.spaceId === id);
  const setActiveSpace = useTabsStore((s) => s.setActiveSpace);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <section className="space-y-1.5">
      <button
        type="button"
        onClick={() => {
          setActiveSpace(id);
          setCollapsed((c) => !c);
        }}
        className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left hover:bg-bg-elevated"
      >
        {collapsed ? (
          <ChevronRight size={13} className="shrink-0 text-fg-subtle" />
        ) : (
          <ChevronDown size={13} className="shrink-0 text-fg-subtle" />
        )}
        <Folder size={14} className="shrink-0 text-fg-subtle" />
        <span className="min-w-0 flex-1 truncate text-xs font-semibold text-fg">{name}</span>
        <span className="shrink-0 text-[11px] text-fg-subtle">{tabs.length}</span>
      </button>

      {!collapsed && (
        <div className="space-y-1.5 pl-2">
          {tabs.map((tab) => (
            <TabCard key={tab.id} tab={tab} />
          ))}
        </div>
      )}
    </section>
  );
}

export function WorkspacePanel() {
  const { t } = useTranslation();
  const spaces = useTabsStore((s) => s.spaces);
  const newSpace = useTabsStore((s) => s.newSpace);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-2">
        {spaces.map((space) => (
          <SpaceGroup key={space.id} id={space.id} name={space.name} />
        ))}
      </div>
      <div className="shrink-0 border-t border-border p-2">
        <button
          type="button"
          onClick={() => newSpace()}
          className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs text-fg-muted hover:bg-bg-elevated hover:text-fg"
        >
          <Plus size={14} className="shrink-0" />
          {t("workspace.newSpace")}
        </button>
      </div>
    </div>
  );
}
