import { VsArrowUp, VsChevronRight, VsTrash, VsFolder, VsCopy, VsMove } from "solid-icons/vs"
import { For, Match, Show, Switch, createResource, createSignal, onMount } from "solid-js"
import FileExtensionIcon from "~/components/FileExtensionIcon"
import { Dialog } from "~/components/ui/dialog"
import { Switch as Toggle } from "~/components/ui/switch"
import { api } from "~/lib/api"
import { locales, t, type TranslationKey } from "~/lib/i18n"
import { parentPath, pathSegments } from "~/lib/paths"
import { cn } from "~/lib/utils"
import { config } from "~/stores/app"
import { closeDialog, dialog, type DialogSpec, type PromptOptions } from "~/stores/dialogs"
import { setSettings, settings } from "~/stores/settings"
import type { Locale } from "~/languages"
import { ALT, MOD, SHIFT, combo } from "./explorer/keys"

/** Kobalte animates the close; keep the content mounted with `open` toggled off. */
function useClosable<T>(resolve: (v: T) => void, fallback: NoInfer<T>) {
  const [open, setOpen] = createSignal(true)
  const spec = dialog()
  let done = false
  const finish = (value: T) => {
    if (done) return
    done = true
    resolve(value)
    setOpen(false)
    setTimeout(() => closeDialog(spec), 160)
  }
  return { open, finish, cancel: () => finish(fallback) }
}

function PromptDialog(props: { options: PromptOptions; resolve: (v: { value: string; content?: string } | null) => void }) {
  const { open, finish, cancel } = useClosable(props.resolve, null)
  const [value, setValue] = createSignal(props.options.initial ?? "")
  const [content, setContent] = createSignal("")
  const [touched, setTouched] = createSignal(false)
  const error = () => (touched() ? props.options.validate?.(value()) : undefined)
  let input!: HTMLInputElement

  onMount(() =>
    setTimeout(() => {
      input.focus()
      const v = input.value
      const dot = props.options.selectBaseName ? v.lastIndexOf(".") : -1
      input.setSelectionRange(0, dot > 0 ? dot : v.length)
    }, 30),
  )

  const submit = (e?: Event) => {
    e?.preventDefault()
    setTouched(true)
    if (props.options.validate?.(value())) return
    finish({ value: value(), content: content() })
  }

  return (
    <Dialog
      open={open()}
      onClose={cancel}
      title={props.options.title}
      footer={
        <>
          <button type="button" class="btn btn-ghost" onClick={cancel}>
            {t("modals.cancel")}
          </button>
          <button type="submit" form="prompt-form" class="btn btn-primary" disabled={!!error()}>
            {props.options.submit}
          </button>
        </>
      }
    >
      <form id="prompt-form" class="space-y-4 pt-1 pb-3" onSubmit={submit}>
        <label class="block">
          <span class="mb-1.5 block text-xs font-medium text-menu">{props.options.label}</span>
          <input
            ref={input}
            class={cn("field", error() && "border-danger/70 focus:border-danger focus:ring-danger/20")}
            value={value()}
            placeholder={props.options.placeholder}
            spellcheck={false}
            autocomplete="off"
            onInput={(e) => {
              setValue(e.currentTarget.value)
              setTouched(true)
            }}
          />
          <Show when={error()}>
            <span class="mt-1.5 block animate-fade-in text-xs text-danger">{error()}</span>
          </Show>
        </label>
        <Show when={props.options.multiline}>
          <label class="block">
            <span class="mb-1.5 block text-xs font-medium text-menu">{props.options.multiline!.label}</span>
            <textarea
              class="field h-36 resize-y py-2 font-mono text-xs"
              placeholder={props.options.multiline!.placeholder}
              value={content()}
              onInput={(e) => setContent(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(e)
              }}
            />
          </label>
        </Show>
      </form>
    </Dialog>
  )
}

function ConfirmDialog(props: {
  options: { title: string; description: string; submit: string; danger?: boolean }
  resolve: (v: boolean) => void
}) {
  const { open, finish, cancel } = useClosable(props.resolve, false)
  let submitBtn!: HTMLButtonElement
  onMount(() => setTimeout(() => submitBtn?.focus(), 30))
  return (
    <Dialog
      open={open()}
      onClose={cancel}
      title={props.options.title}
      description={props.options.description}
      icon={props.options.danger ? <VsTrash class="size-4.5 text-danger" /> : undefined}
      footer={
        <>
          <button type="button" class="btn btn-ghost" onClick={cancel}>
            {t("modals.cancel")}
          </button>
          <button ref={submitBtn} type="button" class={props.options.danger ? "btn btn-danger" : "btn btn-primary"} onClick={() => finish(true)}>
            {props.options.submit}
          </button>
        </>
      }
    />
  )
}

function DestinationDialog(props: {
  options: { title: string; start: string; mode: "copy" | "move" }
  resolve: (v: string | null) => void
}) {
  const { open, finish, cancel } = useClosable<string | null>(props.resolve, null)
  const [path, setPath] = createSignal(props.options.start)
  const [folders] = createResource(path, async (p) => (await api.list(p, true)).items.filter((i) => settings.view.hidden || !i.hidden))

  return (
    <Dialog
      open={open()}
      onClose={cancel}
      title={props.options.title}
      class="sm:max-w-lg"
      footer={
        <>
          <button type="button" class="btn btn-ghost" onClick={cancel}>
            {t("modals.cancel")}
          </button>
          <button type="button" class="btn btn-primary" onClick={() => finish(path())}>
            {props.options.mode === "copy" ? <VsCopy class="size-4" /> : <VsMove class="size-4" />}
            {props.options.mode === "copy" ? t("modals.selectDestination.copy") : t("modals.selectDestination.move")}
          </button>
        </>
      }
    >
      <div class="pb-3">
        <div class="mb-2 flex items-center gap-1">
          <button type="button" class="icon-btn" disabled={path() === "/"} aria-label={t("nav.up")} onClick={() => setPath(parentPath(path()))}>
            <VsArrowUp />
          </button>
          <div class="flex min-w-0 flex-1 items-center overflow-x-auto rounded-md bg-950/40 px-2 py-1.5 text-sm [scrollbar-width:none]">
            <button type="button" class="shrink-0 text-menu hover:text-code" onClick={() => setPath("/")}>
              {config().rootName}
            </button>
            <For each={pathSegments(path())}>
              {(seg, i) => (
                <>
                  <VsChevronRight class="mx-0.5 size-3 shrink-0 text-menu/60" />
                  <button
                    type="button"
                    class="shrink-0 text-menu hover:text-code"
                    onClick={() => setPath("/" + pathSegments(path()).slice(0, i() + 1).join("/"))}
                  >
                    {seg}
                  </button>
                </>
              )}
            </For>
          </div>
        </div>
        <div class="scroll-area h-72 overflow-auto rounded-lg border border-line/60 bg-950/30 p-1">
          <Switch>
            <Match when={folders.loading}>
              <div class="space-y-1 p-1">
                <For each={Array(6).fill(0)}>{() => <div class="skeleton h-8 rounded-md" />}</For>
              </div>
            </Match>
            <Match when={folders.error}>
              <p class="p-4 text-center text-xs text-danger">{(folders.error as Error).message}</p>
            </Match>
            <Match when={folders()?.length === 0}>
              <div class="flex h-full flex-col items-center justify-center gap-2 text-menu">
                <VsFolder class="size-6" />
                <p class="text-xs">{t("files.empty")}</p>
              </div>
            </Match>
            <Match when={folders()}>
              <For each={folders()}>
                {(f) => (
                  <button
                    type="button"
                    class="flex h-8 w-full animate-fade-in items-center gap-2.5 rounded-md px-2 text-left text-sm transition-colors hover:bg-hover"
                    onClick={() => setPath(f.path)}
                  >
                    <FileExtensionIcon directory ext="" fileSize="1em" />
                    <span class="truncate">{f.name}</span>
                    <VsChevronRight class="ml-auto size-3.5 shrink-0 text-menu" />
                  </button>
                )}
              </For>
            </Match>
          </Switch>
        </div>
        <p class="mt-2 truncate text-xs text-menu">
          {t("modals.selectDestination.current")}: <span class="font-mono text-code">{path() === "/" ? `/${config().rootName}` : path()}</span>
        </p>
      </div>
    </Dialog>
  )
}

function Kbd(props: { keys: string }) {
  return (
    <kbd class="inline-flex h-6 min-w-6 items-center justify-center rounded border border-line bg-950/60 px-1.5 font-mono text-[11px] text-code shadow-[inset_0_-1px_0] shadow-line">
      {props.keys}
    </kbd>
  )
}

function ShortcutsDialog() {
  const { open, cancel } = useClosable(() => {}, undefined)
  const groups: { title: TranslationKey; rows: [TranslationKey, string[]][] }[] = [
    {
      title: "modals.shortcuts.navigation",
      rows: [
        ["modals.shortcuts.open", ["↵"]],
        ["modals.shortcuts.up", ["⌫", combo(ALT, "↑")]],
        ["modals.shortcuts.history", [combo(ALT, "←"), combo(ALT, "→")]],
        ["modals.shortcuts.focus", ["↑", "↓", "←", "→"]],
        ["modals.shortcuts.search", ["/", combo(MOD, "F")]],
        ["modals.shortcuts.refresh", [combo(ALT, "R")]],
        ["modals.shortcuts.panel", [combo(ALT, "T"), combo(ALT, "W")]],
      ],
    },
    {
      title: "modals.shortcuts.selection",
      rows: [
        ["modals.shortcuts.all", [combo(MOD, "A")]],
        ["modals.shortcuts.none", ["Esc"]],
        ["modals.shortcuts.invert", [combo(MOD, "I")]],
        ["modals.shortcuts.range", [combo(SHIFT, "Click"), combo(SHIFT, "↑↓")]],
        ["modals.shortcuts.toggle", [combo(MOD, "Click"), "Space"]],
      ],
    },
    {
      title: "modals.shortcuts.operations",
      rows: [
        ["modals.shortcuts.rename", ["F2"]],
        ["modals.shortcuts.delete", [MOD === "⌘" ? "⌘⌫" : "Del"]],
        ["modals.shortcuts.clipboard", [combo(MOD, "C"), combo(MOD, "X"), combo(MOD, "V")]],
        ["modals.shortcuts.newFolder", [combo(ALT, "N")]],
        ["modals.shortcuts.upload", [combo(ALT, "U")]],
      ],
    },
  ]
  return (
    <Dialog open={open()} onClose={cancel} title={t("modals.shortcuts.title")} class="sm:max-w-2xl">
      <div class="grid gap-x-8 gap-y-5 pt-1 pb-4 sm:grid-cols-2">
        <For each={groups}>
          {(g) => (
            <section>
              <h3 class="mb-2 text-[11px] font-semibold tracking-wider text-menu uppercase">{t(g.title)}</h3>
              <ul class="space-y-1.5">
                <For each={g.rows}>
                  {([label, keys]) => (
                    <li class="flex items-center justify-between gap-3 text-sm">
                      <span class="text-code/90">{t(label)}</span>
                      <span class="flex shrink-0 gap-1">
                        <For each={keys}>{(k) => <Kbd keys={k} />}</For>
                      </span>
                    </li>
                  )}
                </For>
              </ul>
            </section>
          )}
        </For>
      </div>
    </Dialog>
  )
}

function PreferencesDialog() {
  const { open, cancel } = useClosable(() => {}, undefined)
  return (
    <Dialog open={open()} onClose={cancel} title={t("modals.preferences.title")}>
      <div class="divide-y divide-line/50 pb-3">
        <Toggle
          checked={settings.prefs.confirmDelete}
          onChange={(v) => setSettings("prefs", "confirmDelete", v)}
          label={t("modals.preferences.confirmDelete")}
          description={t("modals.preferences.confirmDeleteHint")}
        />
        <Toggle
          checked={settings.prefs.relativeDates}
          onChange={(v) => setSettings("prefs", "relativeDates", v)}
          label={t("modals.preferences.relativeDates")}
          description={t("modals.preferences.relativeDatesHint")}
        />
        <Toggle checked={settings.view.hidden} onChange={(v) => setSettings("view", "hidden", v)} label={t("header.view.hidden")} />
        <Toggle checked={settings.view.thumbnails} onChange={(v) => setSettings("view", "thumbnails", v)} label={t("header.view.thumbnails")} />
        <div class="flex items-center justify-between gap-4 px-1 py-3">
          <span class="text-sm font-medium">{t("modals.preferences.language")}</span>
          <select
            class="field h-8 w-auto pr-8"
            value={settings.prefs.language}
            onChange={(e) => setSettings("prefs", "language", e.currentTarget.value as Locale)}
          >
            <For each={locales}>{(l) => <option value={l.id}>{`${l.flag}  ${l.name}`}</option>}</For>
          </select>
        </div>
      </div>
    </Dialog>
  )
}

function AboutDialog() {
  const { open, cancel } = useClosable(() => {}, undefined)
  return (
    <Dialog open={open()} onClose={cancel} title={t("modals.about.title")} description={t("modals.about.description")}>
      <dl class="mb-4 divide-y divide-line/50 rounded-lg border border-line/60 text-sm">
        <div class="flex justify-between gap-4 px-3 py-2">
          <dt class="text-menu">{t("modals.about.root")}</dt>
          <dd class="font-mono">{config().rootName}</dd>
        </div>
        <div class="flex justify-between gap-4 px-3 py-2">
          <dt class="text-menu">{t("modals.about.mode")}</dt>
          <dd>{config().readOnly ? t("modals.about.readOnly") : t("modals.about.readWrite")}</dd>
        </div>
        <div class="flex justify-between gap-4 px-3 py-2">
          <dt class="text-menu">{t("modals.about.source")}</dt>
          <dd>
            <a href="https://github.com/help-14/mountain" target="_blank" rel="noopener" class="text-active hover:underline">
              github.com/help-14/mountain
            </a>
          </dd>
        </div>
      </dl>
    </Dialog>
  )
}

export default function Dialogs() {
  return (
    <Show when={dialog()} keyed>
      {(d: DialogSpec) => (
        <Switch>
          <Match when={d.type === "prompt" && d}>{(p) => <PromptDialog options={(p() as any).options} resolve={(p() as any).resolve} />}</Match>
          <Match when={d.type === "confirm" && d}>{(p) => <ConfirmDialog options={(p() as any).options} resolve={(p() as any).resolve} />}</Match>
          <Match when={d.type === "destination" && d}>
            {(p) => <DestinationDialog options={(p() as any).options} resolve={(p() as any).resolve} />}
          </Match>
          <Match when={d.type === "shortcuts"}>
            <ShortcutsDialog />
          </Match>
          <Match when={d.type === "preferences"}>
            <PreferencesDialog />
          </Match>
          <Match when={d.type === "about"}>
            <AboutDialog />
          </Match>
        </Switch>
      )}
    </Show>
  )
}

