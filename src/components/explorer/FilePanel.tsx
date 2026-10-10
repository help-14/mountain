import {
  VsArrowDown,
  VsArrowUp,
  VsClose,
  VsCloudDownload,
  VsCloudUpload,
  VsCopy,
  VsEdit,
  VsFileZip,
  VsFolderOpened,
  VsInfo,
  VsLinkExternal,
  VsListSelection,
  VsMove,
  VsNewFile,
  VsNewFolder,
  VsRefresh,
  VsSearch,
  VsSplitHorizontal,
  VsTrash,
  VsWarning,
  VsClippy,
  VsChecklist,
} from "solid-icons/vs"
import { FaSolidScissors, FaRegularFolderOpen } from "solid-icons/fa"
import { For, Match, Show, Switch, createEffect, createMemo, on } from "solid-js"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuTrigger } from "~/components/ui/context-menu"
import { humanFileSize } from "~/lib/format"
import { previewKind } from "~/lib/fileTypes"
import { fileUrl, triggerDownload } from "~/lib/api"
import { t } from "~/lib/i18n"
import { baseName } from "~/lib/paths"
import { cn } from "~/lib/utils"
import {
  compressSelection,
  copyPath,
  copyToClipboard,
  createFile,
  createFolder,
  deleteSelection,
  downloadSelection,
  openItem,
  paste,
  pickAndUpload,
  renameSelection,
  transferTo,
} from "~/stores/actions"
import { clipboard, config } from "~/stores/app"
import { MAX_PANELS, activate, activeId, addPanel, panels, type Panel } from "~/stores/panels"
import { setSettings, settings, type SortBy } from "~/stores/settings"
import { ListRow, TileItem } from "./FileItem"
import { createDropTarget } from "./interactions"
import { ALT, MOD, SHIFT, combo } from "./keys"
import Toolbar from "./Toolbar"
import { withTransition } from "~/lib/transition"

function SortHeader(props: { by: SortBy; label: string; class?: string; align?: "right" }) {
  const active = () => settings.sort.by === props.by
  return (
    <button
      type="button"
      class={cn(
        "flex items-center gap-1 truncate text-xs font-medium uppercase tracking-wider transition-colors hover:text-code",
        active() ? "text-code" : "text-menu",
        props.align === "right" && "justify-end",
        props.class,
      )}
      onClick={() =>
        active()
          ? setSettings("sort", "order", (o) => (o === "asc" ? "desc" : "asc"))
          : setSettings("sort", { by: props.by, order: props.by === "date" || props.by === "size" ? "desc" : "asc" })
      }
    >
      {props.label}
      <Show when={active()}>
        <span class="animate-pop-in">{settings.sort.order === "asc" ? <VsArrowUp class="size-3" /> : <VsArrowDown class="size-3" />}</span>
      </Show>
    </button>
  )
}

function LoadingSkeleton() {
  return (
    <div class="p-4">
      <Show
        when={settings.view.as === "tile"}
        fallback={
          <div class="space-y-1.5">
            <For each={Array(10).fill(0)}>{(_, i) => <div class="skeleton h-9 rounded-md" style={{ opacity: 1 - i() * 0.08 }} />}</For>
          </div>
        }
      >
        <div class="grid grid-cols-[repeat(auto-fill,minmax(13.5rem,1fr))] gap-2">
          <For each={Array(12).fill(0)}>{(_, i) => <div class="skeleton h-16 rounded-lg" style={{ opacity: 1 - i() * 0.06 }} />}</For>
        </div>
      </Show>
    </div>
  )
}

function EmptyState(props: { icon: any; title: string; hint?: string; action?: { label: string; run: () => void } }) {
  return (
    <div class="flex h-full min-h-64 animate-fade-in flex-col items-center justify-center gap-3 p-8 text-center">
      <div class="flex size-16 items-center justify-center rounded-2xl bg-hover/70 text-menu [&>svg]:size-7">{props.icon}</div>
      <div>
        <p class="text-sm font-medium text-code">{props.title}</p>
        <Show when={props.hint}>
          <p class="mt-1 max-w-xs text-xs text-menu">{props.hint}</p>
        </Show>
      </div>
      <Show when={props.action}>
        <button type="button" class="btn btn-outline mt-1 h-8" onClick={props.action!.run}>
          {props.action!.label}
        </button>
      </Show>
    </div>
  )
}

function SelectionBar(props: { panel: Panel }) {
  const p = props.panel
  const ro = () => config().readOnly
  const Action = (a: { label: string; icon: any; run: () => void; danger?: boolean; hide?: boolean }) => (
    <Show when={!a.hide}>
      <button
        type="button"
        title={a.label}
        aria-label={a.label}
        class={cn(
          "flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors duration-150 [&>svg]:size-4",
          a.danger ? "text-danger hover:bg-danger/15" : "text-code hover:bg-hover",
        )}
        onClick={a.run}
      >
        {a.icon}
        <span class="hidden @3xl:inline">{a.label}</span>
      </button>
    </Show>
  )
  return (
    <div class="pointer-events-none absolute inset-x-0 bottom-9 z-20 flex justify-center px-3">
      <div class="pointer-events-auto flex max-w-full animate-slide-up items-center gap-0.5 overflow-x-auto rounded-xl border border-line bg-900/95 p-1 shadow-2xl shadow-black/40 backdrop-blur-md [scrollbar-width:none]">
        <span class="px-2.5 text-xs font-semibold whitespace-nowrap text-active tabular-nums">{t("controls.selected", p.selectionCount())}</span>
        <div class="mx-0.5 h-5 w-px bg-line" />
        <Action label={t("controls.download")} icon={<VsCloudDownload />} run={() => downloadSelection(p)} />
        <Action label={t("controls.copy")} icon={<VsCopy />} run={() => copyToClipboard("copy", p)} />
        <Action label={t("controls.cut")} icon={<FaSolidScissors />} run={() => copyToClipboard("cut", p)} hide={ro()} />
        <Action label={t("controls.moveTo")} icon={<VsMove />} run={() => transferTo("move", p)} hide={ro()} />
        <Action label={t("controls.rename")} icon={<VsEdit />} run={() => renameSelection(p)} hide={ro() || p.selectionCount() !== 1} />
        <Action label={t("controls.compress")} icon={<VsFileZip />} run={() => compressSelection(p)} hide={ro()} />
        <Action label={t("controls.delete")} icon={<VsTrash />} run={() => deleteSelection(p)} danger hide={ro()} />
        <div class="mx-0.5 h-5 w-px bg-line" />
        <button
          type="button"
          aria-label={t("controls.clearSelection")}
          title={t("controls.clearSelection")}
          class="icon-btn"
          onClick={() => {
            p.selectNone()
            p.setSelectionMode(false)
          }}
        >
          <VsClose />
        </button>
      </div>
    </div>
  )
}

function StatusBar(props: { panel: Panel }) {
  const p = props.panel
  const selectedSize = createMemo(() => p.selectedItems().reduce((s, i) => s + (i.directory ? 0 : i.size), 0))
  return (
    <div class="flex h-8 shrink-0 items-center gap-3 border-t border-line/60 px-3 text-[11px] text-menu tabular-nums">
      <Show
        when={p.state.search}
        fallback={<span>{t("files.items", p.view().length)}</span>}
      >
        {(s) => (
          <span class="flex items-center gap-1.5">
            <VsSearch class="size-3" />
            {s().loading ? t("search.searching") : s().truncated ? t("search.truncated", s().items.length) : t("search.results", p.view().length)}
          </span>
        )}
      </Show>
      <Show when={p.selectionCount() > 0}>
        <span class="animate-fade-in text-code">
          {t("controls.selected", p.selectionCount())}
          <Show when={selectedSize() > 0}> · {humanFileSize(selectedSize())}</Show>
        </span>
      </Show>
      <span class="flex-1" />
      <Show when={config().readOnly}>
        <span class="rounded bg-warn/15 px-1.5 py-0.5 text-warn">{t("files.readOnly")}</span>
      </Show>
      <Show when={clipboard()}>
        {(c) => (
          <span class="hidden items-center gap-1 @md:flex" title={c().paths.join("\n")}>
            {c().mode === "cut" ? <FaSolidScissors class="size-3" /> : <VsClippy class="size-3" />}
            {c().paths.length}
          </span>
        )}
      </Show>
    </div>
  )
}

export default function FilePanel(props: { panel: Panel }) {
  const p = props.panel
  let scroller!: HTMLDivElement
  const isActive = () => activeId() === p.id
  const drop = createDropTarget(() => p.state.path)
  const ro = () => config().readOnly
  const sel = () => p.selectedItems()
  const single = () => (sel().length === 1 ? sel()[0] : undefined)

  // Scroll to top when entering a folder; keep the focused item in view while navigating with the keyboard.
  createEffect(on(() => p.state.path, () => scroller && (scroller.scrollTop = 0), { defer: true }))
  createEffect(
    on(
      () => p.state.focus,
      (focus) => {
        if (!focus || !scroller) return
        queueMicrotask(() => {
          const el = scroller.querySelector(`[data-path="${CSS.escape(focus)}"]`) as HTMLElement | null
          el?.scrollIntoView({ block: "nearest" })
        })
      },
    ),
  )

  const dropLabel = () => {
    const name = baseName(p.state.path) || config().rootName
    const i = drop.intent()
    return i === "upload" ? t("files.dropUpload", name) : i === "copy" ? t("files.dropCopy", name) : t("files.dropMove", name)
  }

  return (
    <section
      aria-label={p.state.path}
      data-panel={p.id}
      class={cn(
        "@container relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl border bg-500 transition-[border-color,box-shadow] duration-200",
        isActive() && panels().length > 1 ? "border-active/40 shadow-[0_0_0_1px] shadow-active/15" : "border-line/70",
      )}
      style={{ "view-transition-name": `panel-${p.id}` }}
      onPointerDown={() => activate(p.id)}
      onFocusIn={() => activate(p.id)}
    >
      <Toolbar panel={p} />

      {/* thin progress bar while loading */}
      <div class="relative h-0.5 shrink-0 overflow-hidden">
        <Show when={p.state.busy && p.state.status !== "loading"}>
          <div class="absolute inset-0 animate-[fade-in_200ms_ease-out_200ms_backwards]">
            <div class="h-full w-full origin-left animate-progress bg-active/70" />
          </div>
        </Show>
      </div>

      <ContextMenu
        onOpenChange={(open) => {
          if (open) activate(p.id)
        }}
      >
        <ContextMenuTrigger
          as="div"
          ref={scroller}
          role="listbox"
          aria-multiselectable="true"
          tabIndex={-1}
          class="scroll-area relative min-h-0 flex-1 overflow-auto outline-none"
          onClick={(e: MouseEvent) => {
            if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.background !== undefined) {
              p.selectNone()
            }
          }}
          onContextMenu={(e: MouseEvent) => {
            const onItem = (e.target as HTMLElement).closest("[data-path]")
            if (!onItem) p.selectNone()
          }}
          {...drop.handlers}
        >
          <Switch>
            <Match when={p.state.status === "loading" && !p.state.items.length}>
              <LoadingSkeleton />
            </Match>
            <Match when={p.state.status === "error"}>
              <EmptyState
                icon={<VsWarning class="text-danger" />}
                title={t("files.loadError")}
                hint={p.state.error}
                action={
                  p.state.path === "/"
                    ? { label: t("files.retry"), run: () => p.refresh(false) }
                    : { label: t("files.goHome"), run: () => p.navigate("/") }
                }
              />
            </Match>
            <Match when={p.state.search && !p.view().length}>
              <EmptyState
                icon={<VsSearch />}
                title={p.state.search!.loading ? t("search.searching") : p.state.search!.query.trim().length < 2 ? t("search.title") : t("search.none", p.state.search!.query)}
                hint={p.state.search!.error}
              />
            </Match>
            <Match when={!p.view().length && p.hiddenCount() > 0}>
              <EmptyState icon={<FaRegularFolderOpen />} title={t("files.filteredEmpty")} hint={t("files.filteredHint")} />
            </Match>
            <Match when={!p.view().length}>
              <EmptyState
                icon={<FaRegularFolderOpen />}
                title={t("files.empty")}
                hint={ro() ? undefined : t("files.emptyHint")}
                action={ro() ? undefined : { label: t("controls.upload"), run: () => pickAndUpload(false, p) }}
              />
            </Match>
            <Match when={settings.view.as === "list"}>
              <div class="sticky top-0 z-10 grid h-9 grid-cols-[minmax(0,1fr)_5.5rem] items-center gap-3 border-b border-line/60 bg-500/95 px-6 backdrop-blur @lg:grid-cols-[minmax(0,1fr)_5.5rem_7rem] @3xl:grid-cols-[minmax(0,1fr)_6rem_8rem_12rem]">
                <SortHeader by="name" label={t("files.columns.name")} />
                <SortHeader by="size" label={t("files.columns.size")} align="right" />
                <SortHeader by="type" label={t("files.columns.type")} class="hidden @lg:flex" />
                <SortHeader by="date" label={t("files.columns.modified")} class="hidden @3xl:flex" />
              </div>
              <div class="space-y-px px-3 pt-1 pb-24" data-background>
                <For each={p.view()}>{(item, i) => <ListRow panel={p} item={item} index={i()} />}</For>
              </div>
            </Match>
            <Match when={settings.view.as === "tile"}>
              <div class="grid grid-cols-[repeat(auto-fill,minmax(13.5rem,1fr))] content-start gap-1.5 p-3 pb-24" data-background>
                <For each={p.view()}>{(item, i) => <TileItem panel={p} item={item} index={i()} />}</For>
              </div>
            </Match>
          </Switch>

          {/* drop overlay */}
          <Show when={drop.intent()}>
            <div class="pointer-events-none absolute inset-2 z-30 flex animate-fade-in items-center justify-center rounded-xl border-2 border-dashed border-active/70 bg-active/10 backdrop-blur-[1px]">
              <div class="flex animate-pop-in flex-col items-center gap-2 rounded-xl bg-900/90 px-6 py-4 text-active shadow-xl">
                {drop.intent() === "upload" ? <VsCloudUpload class="size-8" /> : drop.intent() === "copy" ? <VsCopy class="size-8" /> : <VsMove class="size-8" />}
                <span class="text-sm font-semibold">{dropLabel()}</span>
              </div>
            </div>
          </Show>
        </ContextMenuTrigger>

        <ContextMenuContent>
          <Show
            when={sel().length > 0}
            fallback={
              <>
                <Show when={!ro()}>
                  <ContextMenuItem onSelect={() => createFolder(p)}>
                    <VsNewFolder />
                    {t("controls.newFolder")}
                    <ContextMenuShortcut>{combo(ALT, "N")}</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuItem onSelect={() => createFile(p)}>
                    <VsNewFile />
                    {t("controls.newFile")}
                    <ContextMenuShortcut>{combo(ALT, SHIFT, "N")}</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuItem onSelect={() => pickAndUpload(false, p)}>
                    <VsCloudUpload />
                    {t("controls.upload")}
                    <ContextMenuShortcut>{combo(ALT, "U")}</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem disabled={!clipboard()} onSelect={() => paste(p)}>
                    <VsClippy />
                    {clipboard() ? t("controls.pasteCount", clipboard()!.paths.length) : t("controls.paste")}
                    <ContextMenuShortcut>{combo(MOD, "V")}</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                </Show>
                <ContextMenuItem onSelect={() => p.selectAll()}>
                  <VsListSelection />
                  {t("header.select.all")}
                  <ContextMenuShortcut>{combo(MOD, "A")}</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem onSelect={() => p.setSelectionMode(!p.state.selectionMode)}>
                  <VsChecklist />
                  {t("header.select.mode")}
                </ContextMenuItem>
                <ContextMenuItem onSelect={() => p.refresh(false)}>
                  <VsRefresh />
                  {t("nav.refresh")}
                  <ContextMenuShortcut>{combo(ALT, "R")}</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem onSelect={() => triggerDownload([p.state.path])}>
                  <VsCloudDownload />
                  {t("controls.download")} (.zip)
                </ContextMenuItem>
              </>
            }
          >
            <Show when={single()}>
              {(item) => (
                <>
                  <ContextMenuItem onSelect={() => openItem(p, item())}>
                    {item().directory ? <VsFolderOpened /> : <VsLinkExternal />}
                    {item().directory || previewKind(item().ext) !== "none" ? t("controls.open") : t("controls.download")}
                    <ContextMenuShortcut>↵</ContextMenuShortcut>
                  </ContextMenuItem>
                  <Show when={item().directory && panels().length < MAX_PANELS}>
                    <ContextMenuItem onSelect={() => withTransition(() => addPanel(item().path))}>
                      <VsSplitHorizontal />
                      {t("controls.openNewPanel")}
                    </ContextMenuItem>
                  </Show>
                  <Show when={!item().directory && previewKind(item().ext) !== "none"}>
                    <ContextMenuItem onSelect={() => window.open(fileUrl(item().path, true), "_blank", "noopener")}>
                      <VsLinkExternal />
                      {t("controls.openNewTab")}
                    </ContextMenuItem>
                  </Show>
                  <ContextMenuSeparator />
                </>
              )}
            </Show>
            <ContextMenuItem onSelect={() => downloadSelection(p)}>
              <VsCloudDownload />
              {t("controls.download")}
              {sel().length > 1 || single()?.directory ? " (.zip)" : ""}
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => copyToClipboard("copy", p)}>
              <VsCopy />
              {t("controls.copy")}
              <ContextMenuShortcut>{combo(MOD, "C")}</ContextMenuShortcut>
            </ContextMenuItem>
            <Show when={!ro()}>
              <ContextMenuItem onSelect={() => copyToClipboard("cut", p)}>
                <FaSolidScissors />
                {t("controls.cut")}
                <ContextMenuShortcut>{combo(MOD, "X")}</ContextMenuShortcut>
              </ContextMenuItem>
              <Show when={single()?.directory && clipboard()}>
                <ContextMenuItem
                  onSelect={async () => {
                    const target = single()!
                    await p.navigate(target.path)
                    paste(p)
                  }}
                >
                  <VsClippy />
                  {t("controls.pasteCount", clipboard()!.paths.length)}
                </ContextMenuItem>
              </Show>
              <ContextMenuItem onSelect={() => transferTo("copy", p)}>
                <VsCopy />
                {t("controls.copyTo")}
              </ContextMenuItem>
              <ContextMenuItem onSelect={() => transferTo("move", p)}>
                <VsMove />
                {t("controls.moveTo")}
              </ContextMenuItem>
              <ContextMenuSeparator />
              <Show when={single()}>
                <ContextMenuItem onSelect={() => renameSelection(p)}>
                  <VsEdit />
                  {t("controls.rename")}
                  <ContextMenuShortcut>F2</ContextMenuShortcut>
                </ContextMenuItem>
              </Show>
              <ContextMenuItem onSelect={() => compressSelection(p)}>
                <VsFileZip />
                {t("controls.compress")}
              </ContextMenuItem>
            </Show>
            <Show when={single()}>
              <ContextMenuItem onSelect={() => copyPath(single()!.path)}>
                <VsInfo />
                {t("controls.copyPath")}
              </ContextMenuItem>
            </Show>
            <Show when={!ro()}>
              <ContextMenuSeparator />
              <ContextMenuItem danger onSelect={() => deleteSelection(p)}>
                <VsTrash />
                {t("controls.delete")}
                <ContextMenuShortcut>{isMacDelete()}</ContextMenuShortcut>
              </ContextMenuItem>
            </Show>
          </Show>
        </ContextMenuContent>
      </ContextMenu>

      <Show when={p.selectionCount() > 0 || p.state.selectionMode}>
        <SelectionBar panel={p} />
      </Show>

      <StatusBar panel={p} />
    </section>
  )
}

const isMacDelete = () => (MOD === "⌘" ? "⌘⌫" : "Del")
