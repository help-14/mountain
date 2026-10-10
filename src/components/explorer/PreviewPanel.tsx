import { VsClose, VsCloudDownload, VsLinkExternal, VsFolderOpened } from "solid-icons/vs"
import { Match, Show, Switch, createMemo, createResource } from "solid-js"
import FileExtensionIcon from "~/components/FileExtensionIcon"
import { api, fileUrl, triggerDownload } from "~/lib/api"
import { previewKind } from "~/lib/fileTypes"
import { formatDate, humanFileSize } from "~/lib/format"
import { locale, t } from "~/lib/i18n"
import { parentPath } from "~/lib/paths"
import { withTransition } from "~/lib/transition"
import { openItem } from "~/stores/actions"
import { config } from "~/stores/app"
import { activePanel } from "~/stores/panels"
import { setSettings } from "~/stores/settings"
import type { FileInfo } from "~/types"
import { typeLabel } from "./FileItem"

function Meta(props: { label: string; value: string; mono?: boolean }) {
  return (
    <div class="grid grid-cols-[5.5rem_1fr] gap-2 py-1.5 text-xs">
      <dt class="text-menu">{props.label}</dt>
      <dd class={props.mono ? "font-mono break-all text-code" : "break-words text-code"}>{props.value}</dd>
    </div>
  )
}

function TextPreview(props: { item: FileInfo }) {
  const [data] = createResource(
    () => props.item.path,
    (path) => api.text(path),
  )
  return (
    <Switch>
      <Match when={data.loading}>
        <div class="space-y-1.5 p-3">
          <div class="skeleton h-3 w-4/5 rounded" />
          <div class="skeleton h-3 w-3/5 rounded" />
          <div class="skeleton h-3 w-2/3 rounded" />
        </div>
      </Match>
      <Match when={data.error}>
        <p class="p-3 text-xs text-danger">{(data.error as Error).message}</p>
      </Match>
      <Match when={data()?.binary}>
        <p class="p-3 text-xs text-menu">{t("preview.binary")}</p>
      </Match>
      <Match when={data()}>
        <pre class="scroll-area max-h-[28rem] animate-fade-in overflow-auto p-3 font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-words text-code/90">
          {data()!.text}
        </pre>
        <Show when={data()!.truncated}>
          <p class="border-t border-line/60 px-3 py-1.5 text-[11px] text-menu">{t("preview.truncated")}</p>
        </Show>
      </Match>
    </Switch>
  )
}

function MediaPreview(props: { item: FileInfo }) {
  const kind = () => previewKind(props.item.ext, props.item.directory)
  const src = () => fileUrl(props.item.path, true)
  return (
    <Switch
      fallback={
        <div class="flex h-40 items-center justify-center">
          <FileExtensionIcon directory={props.item.directory} ext={props.item.ext} fileSize="4.5em" iconSize="1.8em" />
        </div>
      }
    >
      <Match when={kind() === "image"}>
        <div class="flex max-h-80 items-center justify-center bg-[repeating-conic-gradient(#2c3337_0%_25%,#272e32_0%_50%)] bg-[length:16px_16px]">
          <img src={src()} alt={props.item.name} class="max-h-80 w-full animate-fade-in object-contain" />
        </div>
      </Match>
      <Match when={kind() === "video"}>
        <video src={src()} controls preload="metadata" class="max-h-80 w-full bg-black" />
      </Match>
      <Match when={kind() === "audio"}>
        <div class="flex flex-col items-center gap-4 p-4">
          <FileExtensionIcon directory={false} ext={props.item.ext} fileSize="3.5em" iconSize="1.4em" />
          <audio src={src()} controls preload="metadata" class="w-full" />
        </div>
      </Match>
      <Match when={kind() === "pdf"}>
        <iframe src={src()} title={props.item.name} class="h-96 w-full bg-white" />
      </Match>
      <Match when={kind() === "text"}>
        <TextPreview item={props.item} />
      </Match>
    </Switch>
  )
}

export default function PreviewPanel() {
  const panel = () => activePanel()
  const selected = createMemo(() => panel()?.selectedItems() ?? [])
  const item = createMemo(() => {
    const p = panel()
    if (!p) return undefined
    if (selected().length === 1) return selected()[0]
    if (selected().length === 0) return p.view().find((i) => i.path === p.state.focus)
  })
  const total = createMemo(() => selected().reduce((s, i) => s + (i.directory ? 0 : i.size), 0))

  return (
    <aside aria-label={t("preview.title")} class="flex h-full min-h-0 flex-col">
      <div class="flex h-12 shrink-0 items-center justify-between px-3">
        <span class="text-[11px] font-semibold tracking-wider text-menu uppercase">{t("preview.title")}</span>
        <button
          type="button"
          class="icon-btn"
          aria-label={t("modals.close")}
          onClick={() => withTransition(() => setSettings("view", "preview", false))}
        >
          <VsClose />
        </button>
      </div>

      <div class="scroll-area min-h-0 flex-1 overflow-auto px-3 pb-4">
        <Show
          when={item()}
          keyed
          fallback={
            <div class="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
              <Show when={selected().length > 1} fallback={<p class="text-xs text-menu">{t("preview.nothing")}</p>}>
                <p class="text-sm font-medium">{t("preview.multiple", selected().length)}</p>
                <p class="text-xs text-menu">
                  {t("preview.totalSize")}: {humanFileSize(total())}
                </p>
              </Show>
            </div>
          }
        >
          {(it) => (
            <div class="animate-fade-in">
              <div class="overflow-hidden rounded-lg border border-line/60 bg-900">
                <MediaPreview item={it} />
              </div>
              <h3 class="mt-3 text-sm font-semibold break-words">{it.name}</h3>
              <dl class="mt-2 divide-y divide-line/40">
                <Meta label={t("preview.type")} value={typeLabel(it)} />
                <Show when={!it.directory}>
                  <Meta label={t("preview.size")} value={`${humanFileSize(it.size)} (${it.size.toLocaleString(locale())} B)`} />
                </Show>
                <Meta label={t("preview.modified")} value={formatDate(it.modified, locale())} />
                <Meta label={t("preview.location")} value={parentPath(it.path) === "/" ? `/${config().rootName}` : parentPath(it.path)} mono />
                <Show when={it.symlink}>
                  <Meta label={t("preview.symlink")} value="✓" />
                </Show>
              </dl>
              <div class="mt-3 flex gap-2">
                <button type="button" class="btn btn-outline h-8 flex-1 px-3 text-xs" onClick={() => panel() && openItem(panel()!, it)}>
                  {it.directory ? <VsFolderOpened class="size-4" /> : <VsLinkExternal class="size-4" />}
                  {t("controls.open")}
                </button>
                <button type="button" class="btn btn-outline h-8 flex-1 px-3 text-xs" onClick={() => triggerDownload([it.path])}>
                  <VsCloudDownload class="size-4" />
                  {t("controls.download")}
                </button>
              </div>
            </div>
          )}
        </Show>
      </div>
    </aside>
  )
}
