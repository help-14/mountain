import { VsChevronRight, VsClose } from "solid-icons/vs"
import { FaSolidHardDrive } from "solid-icons/fa"
import { For, Show, createEffect, on } from "solid-js"
import FileExtensionIcon from "~/components/FileExtensionIcon"
import { t } from "~/lib/i18n"
import { isWithin } from "~/lib/paths"
import { cn } from "~/lib/utils"
import { config, setDrawerOpen } from "~/stores/app"
import { activePanel } from "~/stores/panels"
import { settings } from "~/stores/settings"
import { nodes, revealPath, toggleNode } from "~/stores/tree"
import { createDropTarget } from "./interactions"

function TreeNode(props: { path: string; name: string; depth: number; hidden?: boolean; onNavigate: (p: string) => void }) {
  const node = () => nodes[props.path]
  const expanded = () => !!node()?.expanded
  const current = () => activePanel()?.state.path === props.path
  const onTrail = () => !current() && isWithin(props.path, activePanel()?.state.path ?? "/")
  const children = () => (node()?.children ?? []).filter((c) => settings.view.hidden || !c.hidden)
  const drop = createDropTarget(() => props.path)

  return (
    <li role="treeitem" aria-expanded={expanded()} aria-selected={current()}>
      <div
        class={cn(
          "group flex h-8 cursor-pointer items-center gap-1 rounded-md pr-2 text-sm transition-colors duration-150 select-none",
          current() ? "bg-active/15 text-code" : onTrail() ? "text-code hover:bg-hover" : "text-menu hover:bg-hover hover:text-code",
          drop.intent() && "bg-active/20 ring-1 ring-active",
          props.hidden && "opacity-70",
        )}
        style={{ "padding-left": `${props.depth * 14 + 4}px` }}
        onClick={() => props.onNavigate(props.path)}
        title={props.path}
        {...drop.handlers}
      >
        <button
          type="button"
          aria-label={expanded() ? "Collapse" : "Expand"}
          class="flex size-5 shrink-0 items-center justify-center rounded text-menu hover:bg-line/60 hover:text-code"
          onClick={(e) => {
            e.stopPropagation()
            toggleNode(props.path)
          }}
        >
          <Show when={node()?.loading} fallback={<VsChevronRight class={cn("size-3.5 transition-transform duration-200 ease-[var(--ease-out-quint)]", expanded() && "rotate-90")} />}>
            <span class="size-3 animate-spin rounded-full border-2 border-menu/40 border-t-active" />
          </Show>
        </button>
        <Show when={props.depth > 0} fallback={<FaSolidHardDrive class="size-3.5 shrink-0 text-info" />}>
          <span class="shrink-0">
            <FileExtensionIcon directory ext="" fileSize="0.95em" open={expanded() && children().length > 0} />
          </span>
        </Show>
        <span class={cn("ml-1 truncate", current() && "font-medium")}>{props.name}</span>
      </div>
      <Show when={expanded() && children().length}>
        <ul role="group" class="animate-fade-in">
          <For each={children()}>
            {(child) => (
              <TreeNode path={child.path} name={child.name} depth={props.depth + 1} hidden={child.hidden} onNavigate={props.onNavigate} />
            )}
          </For>
        </ul>
      </Show>
    </li>
  )
}

export default function Sidebar(props: { mobile?: boolean }) {
  // Expand the tree to wherever the active panel is.
  createEffect(on(() => activePanel()?.state.path, (p) => p && revealPath(p)))

  const navigate = (path: string) => {
    activePanel()?.navigate(path)
    if (props.mobile) setDrawerOpen(false)
  }

  return (
    <nav aria-label={t("header.view.navigation")} class="flex h-full min-h-0 flex-col">
      <div class="flex h-12 shrink-0 items-center justify-between px-3">
        <span class="text-[11px] font-semibold tracking-wider text-menu uppercase">{t("header.view.navigation")}</span>
        <Show when={props.mobile}>
          <button type="button" class="icon-btn" aria-label={t("modals.close")} onClick={() => setDrawerOpen(false)}>
            <VsClose />
          </button>
        </Show>
      </div>
      <ul role="tree" class="scroll-area min-h-0 flex-1 overflow-auto px-2 pb-4">
        <TreeNode path="/" name={config().rootName} depth={0} onNavigate={navigate} />
      </ul>
    </nav>
  )
}
