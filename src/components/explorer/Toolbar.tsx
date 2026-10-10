import {
  VsArrowLeft,
  VsArrowRight,
  VsArrowUp,
  VsChevronRight,
  VsClose,
  VsCloudUpload,
  VsNewFile,
  VsNewFolder,
  VsRefresh,
  VsSearch,
  VsAdd,
  VsFolderOpened,
} from "solid-icons/vs"
import { For, Show, createEffect, createMemo, createSignal, on } from "solid-js"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { IconButton } from "~/components/ui/tooltip"
import { t } from "~/lib/i18n"
import { normalizePath, pathSegments } from "~/lib/paths"
import { cn } from "~/lib/utils"
import { withTransition } from "~/lib/transition"
import { createFile, createFolder, pickAndUpload } from "~/stores/actions"
import { config } from "~/stores/app"
import { closePanel, panels, type Panel } from "~/stores/panels"
import { ALT, combo, SHIFT } from "./keys"
import { createDropTarget } from "./interactions"

function Crumb(props: { panel: Panel; path: string; label: string; current: boolean }) {
  const drop = createDropTarget(() => props.path)
  return (
    <button
      type="button"
      class={cn(
        "max-w-[14rem] shrink-0 truncate rounded-md px-1.5 py-0.5 text-sm transition-colors duration-150",
        props.current ? "font-medium text-code" : "text-menu hover:bg-hover hover:text-code",
        drop.intent() && "bg-active/20 text-code ring-1 ring-active",
      )}
      onClick={(e) => {
        e.stopPropagation()
        if (!props.current) props.panel.navigate(props.path)
      }}
      {...drop.handlers}
    >
      {props.label}
    </button>
  )
}

function Breadcrumbs(props: { panel: Panel }) {
  const [editing, setEditing] = createSignal(false)
  let input!: HTMLInputElement
  let scroller!: HTMLDivElement

  const crumbs = createMemo(() => {
    const segments = pathSegments(props.panel.state.path)
    const list = [{ path: "/", label: config().rootName }]
    let acc = ""
    for (const s of segments) {
      acc += "/" + s
      list.push({ path: acc, label: s })
    }
    return list
  })

  // Keep the deepest segment in view.
  createEffect(on(crumbs, () => queueMicrotask(() => scroller && (scroller.scrollLeft = scroller.scrollWidth))))

  const commit = () => {
    const value = input.value.trim()
    setEditing(false)
    if (value) props.panel.navigate(normalizePath(value))
  }

  return (
    <div
      class="flex h-8 min-w-0 flex-1 cursor-text items-center rounded-md border border-transparent bg-950/40 px-1 transition-colors duration-150 hover:border-line"
      onClick={() => {
        setEditing(true)
        input?.focus()
        input?.select()
      }}
      title={t("nav.editPath")}
    >
      <Show
        when={editing()}
        fallback={
          <div ref={scroller} class="no-scrollbar flex min-w-0 flex-1 items-center overflow-x-auto [scrollbar-width:none]">
            <For each={crumbs()}>
              {(c, i) => (
                <>
                  <Show when={i() > 0}>
                    <VsChevronRight class="size-3 shrink-0 text-menu/60" />
                  </Show>
                  <Crumb panel={props.panel} path={c.path} label={c.label} current={i() === crumbs().length - 1} />
                </>
              )}
            </For>
          </div>
        }
      >
        <input
          ref={(el) => {
            input = el
            queueMicrotask(() => {
              el.focus()
              el.select()
            })
          }}
          value={props.panel.state.path}
          spellcheck={false}
          class="h-full w-full bg-transparent px-1.5 font-mono text-sm text-code outline-none"
          onKeyDown={(e) => {
            e.stopPropagation()
            if (e.key === "Enter") commit()
            if (e.key === "Escape") setEditing(false)
          }}
          onBlur={() => setEditing(false)}
        />
      </Show>
    </div>
  )
}

function SearchBox(props: { panel: Panel }) {
  const [open, setOpen] = createSignal(false)
  let input!: HTMLInputElement
  const active = () => open() || !!props.panel.state.search

  createEffect(
    on(
      () => props.panel.state.path,
      () => {
        if (input) input.value = ""
        setOpen(false)
      },
      { defer: true },
    ),
  )

  return (
    <div
      class={cn(
        "flex h-8 items-center overflow-hidden rounded-md transition-[width,background-color,border-color] duration-300 ease-[var(--ease-out-quint)]",
        active() ? "w-40 border border-line bg-950/40 @lg:w-56" : "w-8 border border-transparent",
      )}
    >
      <button
        type="button"
        aria-label={t("search.title")}
        class="flex size-8 shrink-0 items-center justify-center text-menu hover:text-code"
        onClick={() => {
          setOpen(true)
          input.focus()
        }}
      >
        <VsSearch class="size-4" />
      </button>
      <input
        ref={input}
        data-search-input={props.panel.id}
        type="search"
        placeholder={t("search.placeholder", props.panel.state.path === "/" ? config().rootName : pathSegments(props.panel.state.path).pop()!)}
        class={cn("h-full min-w-0 flex-1 bg-transparent pr-2 text-sm text-code outline-none placeholder:text-menu/60 [&::-webkit-search-cancel-button]:hidden", !active() && "pointer-events-none")}
        onFocus={() => setOpen(true)}
        onInput={(e) => props.panel.search(e.currentTarget.value)}
        onKeyDown={(e) => {
          e.stopPropagation()
          if (e.key === "Escape") {
            e.currentTarget.value = ""
            props.panel.clearSearch()
            e.currentTarget.blur()
            setOpen(false)
          }
        }}
        onBlur={(e) => !e.currentTarget.value && setOpen(false)}
      />
      <Show when={props.panel.state.search}>
        <button
          type="button"
          aria-label={t("search.clear")}
          class="mr-1 flex size-6 shrink-0 animate-pop-in items-center justify-center rounded text-menu hover:bg-hover hover:text-code"
          onClick={() => {
            input.value = ""
            props.panel.clearSearch()
            setOpen(false)
          }}
        >
          <VsClose class="size-3.5" />
        </button>
      </Show>
    </div>
  )
}

export default function Toolbar(props: { panel: Panel }) {
  const p = props.panel
  return (
    <div class="flex h-12 shrink-0 items-center gap-1 border-b border-line/60 px-2">
      <div class="flex items-center">
        <IconButton label={t("nav.back")} shortcut={combo(ALT, "←")} disabled={!p.canBack()} onClick={() => p.back()}>
          <VsArrowLeft />
        </IconButton>
        <IconButton label={t("nav.forward")} shortcut={combo(ALT, "→")} disabled={!p.canForward()} onClick={() => p.forward()} class="hidden @md:inline-flex">
          <VsArrowRight />
        </IconButton>
        <IconButton label={t("nav.up")} shortcut={combo(ALT, "↑")} disabled={p.state.path === "/"} onClick={() => p.up()}>
          <VsArrowUp />
        </IconButton>
        <IconButton label={t("nav.refresh")} shortcut={combo(ALT, "R")} onClick={() => p.refresh(false)} class="hidden @sm:inline-flex">
          <VsRefresh class={cn(p.state.busy && "animate-spin [animation-duration:900ms]")} />
        </IconButton>
      </div>

      <Breadcrumbs panel={p} />

      <SearchBox panel={p} />

      <Show when={!config().readOnly}>
        <DropdownMenu gutter={6} placement="bottom-end">
          <DropdownMenuTrigger
            class="btn btn-primary h-8 shrink-0 gap-1.5 px-2.5 @md:px-3"
            aria-label={t("controls.create")}
          >
            <VsAdd class="size-4" />
            <span class="hidden @md:inline">{t("controls.create")}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => createFolder(p)}>
              <VsNewFolder />
              {t("controls.newFolder")}
              <DropdownMenuShortcut>{combo(ALT, "N")}</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => createFile(p)}>
              <VsNewFile />
              {t("controls.newFile")}
              <DropdownMenuShortcut>{combo(ALT, SHIFT, "N")}</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => pickAndUpload(false, p)}>
              <VsCloudUpload />
              {t("controls.upload")}
              <DropdownMenuShortcut>{combo(ALT, "U")}</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => pickAndUpload(true, p)}>
              <VsFolderOpened />
              {t("controls.uploadFolder")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Show>

      <Show when={panels().length > 1}>
        <IconButton label={t("nav.closePanel")} shortcut={combo(ALT, "W")} onClick={() => withTransition(() => closePanel(p.id))}>
          <VsClose />
        </IconButton>
      </Show>
    </div>
  )
}

