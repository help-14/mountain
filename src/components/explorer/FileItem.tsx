import { VsLink } from "solid-icons/vs"
import { Show, createSignal, type JSX } from "solid-js"
import FileExtensionIcon from "~/components/FileExtensionIcon"
import { fileUrl } from "~/lib/api"
import { THUMBNAIL_MAX_BYTES, previewKind } from "~/lib/fileTypes"
import { formatDate, humanFileSize, relativeDate } from "~/lib/format"
import { locale, t } from "~/lib/i18n"
import { parentPath, splitExtension } from "~/lib/paths"
import { cn } from "~/lib/utils"
import type { Panel } from "~/stores/panels"
import { settings } from "~/stores/settings"
import { clipboard } from "~/stores/app"
import type { FileInfo } from "~/types"
import RenameInput from "./RenameInput"
import { createDropTarget, itemHandlers } from "./interactions"

type ItemProps = { panel: Panel; item: FileInfo; index: number }

export const displayName = (item: FileInfo) =>
  settings.view.extension || item.directory ? item.name : splitExtension(item.name)[0]

export const displayDate = (ms: number) => (settings.prefs.relativeDates ? relativeDate(ms, locale()) : formatDate(ms, locale()))

export const typeLabel = (item: FileInfo) =>
  item.directory ? t("files.folder") : item.ext ? t("files.file", item.ext.toUpperCase()) : t("files.file", "").trim()

function useItem(props: ItemProps) {
  const handlers = itemHandlers(props.panel, () => props.item)
  const drop = createDropTarget(() => props.item.path, { exclude: () => props.item.path })
  const selected = () => props.panel.isSelected(props.item.path)
  const focused = () => props.panel.state.focus === props.item.path
  const renaming = () => props.panel.state.renaming === props.item.path
  const isCut = () => {
    const clip = clipboard()
    return clip?.mode === "cut" && clip.paths.includes(props.item.path)
  }
  // Stagger the entrance of the first items only so large folders stay snappy.
  const style = (): JSX.CSSProperties => ({ "animation-delay": `${Math.min(props.index, 24) * 14}ms` })
  return { handlers, drop, selected, focused, renaming, isCut, style }
}

function Thumbnail(props: { item: FileInfo; size: string; iconSize?: string }) {
  const [failed, setFailed] = createSignal(false)
  const canThumb = () =>
    settings.view.thumbnails &&
    !failed() &&
    previewKind(props.item.ext, props.item.directory) === "image" &&
    props.item.size <= THUMBNAIL_MAX_BYTES

  return (
    <Show
      when={canThumb()}
      fallback={<FileExtensionIcon directory={props.item.directory} ext={props.item.ext} fileSize={props.size} iconSize={props.iconSize} />}
    >
      <img
        src={fileUrl(props.item.path, true)}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
        onError={() => setFailed(true)}
        class="size-full rounded-md bg-950 object-cover opacity-0 transition-opacity duration-300"
        onLoad={(e) => e.currentTarget.classList.remove("opacity-0")}
      />
    </Show>
  )
}

function Checkbox(props: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      class={cn(
        "flex size-4 shrink-0 animate-pop-in items-center justify-center rounded border transition-colors duration-150",
        props.checked ? "border-active bg-active text-900" : "border-menu/60 bg-950/40",
      )}
    >
      <Show when={props.checked}>
        <svg viewBox="0 0 24 24" class="size-3" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12l5 5l10 -10" />
        </svg>
      </Show>
    </span>
  )
}

export function TileItem(props: ItemProps) {
  const { handlers, drop, selected, focused, renaming, isCut, style } = useItem(props)
  return (
    <div
      role="option"
      aria-selected={selected()}
      data-path={props.item.path}
      draggable={!renaming()}
      style={style()}
      class={cn(
        "group relative flex animate-item-in cursor-default items-center gap-3 rounded-lg border p-2.5 select-none",
        "transition-[background-color,border-color,box-shadow,opacity,transform] duration-150",
        selected() ? "border-active/50 bg-active/12" : "border-transparent hover:bg-hover/80",
        focused() && "ring-1 ring-active/40",
        drop.intent() && "scale-[1.02] border-active bg-active/20",
        isCut() && "opacity-50",
        props.item.hidden && "opacity-70",
      )}
      {...handlers}
      {...(props.item.directory ? drop.handlers : {})}
    >
      <Show when={props.panel.state.selectionMode}>
        <Checkbox checked={selected()} />
      </Show>
      <div class="relative flex size-11 shrink-0 items-center justify-center">
        <Thumbnail item={props.item} size="2.4em" iconSize="0.95em" />
        <Show when={props.item.symlink}>
          <VsLink class="absolute -right-1 -bottom-1 size-3.5 rounded-full bg-900 p-0.5 text-info" />
        </Show>
      </div>
      <div class="min-w-0 flex-1">
        <Show
          when={!renaming()}
          fallback={<RenameInput panel={props.panel} item={props.item} />}
        >
          <p class="line-clamp-2 text-sm leading-snug break-words text-code" title={props.item.name}>
            {displayName(props.item)}
          </p>
        </Show>
        <p class="mt-0.5 truncate text-xs text-menu">
          <Show when={props.panel.state.search} fallback={props.item.directory ? t("files.folder") : humanFileSize(props.item.size)}>
            {parentPath(props.item.path)}
          </Show>
        </p>
      </div>
    </div>
  )
}

export function ListRow(props: ItemProps) {
  const { handlers, drop, selected, focused, renaming, isCut, style } = useItem(props)
  return (
    <div
      role="row"
      aria-selected={selected()}
      data-path={props.item.path}
      draggable={!renaming()}
      style={style()}
      class={cn(
        "group grid h-10 animate-item-in cursor-default items-center gap-3 rounded-md px-3 text-sm select-none",
        "grid-cols-[minmax(0,1fr)_5.5rem] @lg:grid-cols-[minmax(0,1fr)_5.5rem_7rem] @3xl:grid-cols-[minmax(0,1fr)_6rem_8rem_12rem]",
        "transition-[background-color,box-shadow,opacity] duration-150",
        selected() ? "bg-active/12" : props.index % 2 ? "bg-950/25 hover:bg-hover/80" : "hover:bg-hover/80",
        focused() && "ring-1 ring-active/40 ring-inset",
        drop.intent() && "bg-active/20 ring-1 ring-active ring-inset",
        isCut() && "opacity-50",
        props.item.hidden && "opacity-70",
      )}
      {...handlers}
      {...(props.item.directory ? drop.handlers : {})}
    >
      <div class="flex min-w-0 items-center gap-3">
        <Show when={props.panel.state.selectionMode}>
          <Checkbox checked={selected()} />
        </Show>
        <div class="relative flex size-6 shrink-0 items-center justify-center">
          <Thumbnail item={props.item} size="1.25em" iconSize="0" />
          <Show when={props.item.symlink}>
            <VsLink class="absolute -right-1.5 -bottom-1 size-3 rounded-full bg-900 text-info" />
          </Show>
        </div>
        <Show when={!renaming()} fallback={<RenameInput panel={props.panel} item={props.item} />}>
          <div class="min-w-0">
            <p class="truncate text-code" title={props.item.name}>
              {displayName(props.item)}
            </p>
            <Show when={props.panel.state.search}>
              <p class="truncate text-[11px] text-menu">{parentPath(props.item.path)}</p>
            </Show>
          </div>
        </Show>
      </div>
      <span class="truncate text-right text-xs text-menu tabular-nums">
        {props.item.directory ? "—" : humanFileSize(props.item.size)}
      </span>
      <span class="hidden truncate text-xs text-menu @lg:block">{typeLabel(props.item)}</span>
      <span class="hidden truncate text-xs text-menu tabular-nums @3xl:block" title={formatDate(props.item.modified, locale())}>
        {displayDate(props.item.modified)}
      </span>
    </div>
  )
}
