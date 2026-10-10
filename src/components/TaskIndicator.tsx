import * as PopoverPrimitive from "@kobalte/core/popover"
import { VsCheck, VsClose, VsError, VsLoading } from "solid-icons/vs"
import { For, Show, createMemo } from "solid-js"
import { t } from "~/lib/i18n"
import { cn } from "~/lib/utils"
import { activeTasks, tasks, type Task } from "~/stores/tasks"

export function TaskRow(props: { task: Task }) {
  const pct = () => (props.task.progress == null ? null : Math.round(props.task.progress * 100))
  return (
    <div class="animate-fade-in px-3 py-2.5">
      <div class="flex items-center gap-2 text-xs">
        <span
          class={cn(
            "flex size-4 shrink-0 items-center justify-center",
            props.task.status === "done" && "text-active",
            props.task.status === "error" && "text-danger",
          )}
        >
          <Show when={props.task.status === "running"}>
            <VsLoading class="size-3.5 animate-spin text-active" />
          </Show>
          <Show when={props.task.status === "done"}>
            <VsCheck class="size-4 animate-pop-in" />
          </Show>
          <Show when={props.task.status === "error" || props.task.status === "cancelled"}>
            <VsError class="size-3.5 animate-pop-in" />
          </Show>
        </span>
        <span class="min-w-0 flex-1 truncate">
          <span class="text-menu">{t(`tasks.${props.task.kind}` as any)} </span>
          <span class="text-code">{props.task.label}</span>
        </span>
        <Show when={pct() != null && props.task.status === "running"}>
          <span class="text-menu tabular-nums">{pct()}%</span>
        </Show>
        <Show when={props.task.cancel}>
          <button
            type="button"
            class="flex size-5 items-center justify-center rounded text-menu hover:bg-hover hover:text-danger"
            aria-label={t("upload.cancel")}
            onClick={() => props.task.cancel?.()}
          >
            <VsClose class="size-3.5" />
          </button>
        </Show>
      </div>
      <div class="mt-2 h-1 overflow-hidden rounded-full bg-line/70">
        <Show
          when={pct() != null}
          fallback={<div class="h-full w-full origin-left animate-progress rounded-full bg-active/80" />}
        >
          <div
            class={cn(
              "h-full rounded-full transition-[width] duration-300 ease-out",
              props.task.status === "error" ? "bg-danger" : "bg-active",
            )}
            style={{ width: `${pct()}%` }}
          />
        </Show>
      </div>
      <Show when={props.task.error || props.task.detail}>
        <p class={cn("mt-1 truncate text-[11px]", props.task.error ? "text-danger" : "text-menu tabular-nums")}>
          {props.task.error ?? props.task.detail}
        </p>
      </Show>
    </div>
  )
}

/** Header button summarising running tasks, with a popover listing them. */
export default function TaskIndicator() {
  const running = createMemo(() => activeTasks().length)
  const overall = createMemo(() => {
    const withProgress = activeTasks().filter((t) => t.progress != null)
    if (!withProgress.length) return null
    return withProgress.reduce((s, t) => s + t.progress!, 0) / withProgress.length
  })

  return (
    <Show when={tasks.length > 0}>
      <PopoverPrimitive.Root gutter={8} placement="bottom-end">
        <PopoverPrimitive.Trigger
          class="flex h-8 animate-pop-in items-center gap-2 rounded-md px-2.5 text-xs font-medium text-code transition-colors hover:bg-hover"
          aria-label={t("header.tasks.title")}
        >
          <Show when={running() > 0} fallback={<VsCheck class="size-4 text-active" />}>
            <svg viewBox="0 0 20 20" class="size-4 -rotate-90">
              <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="2.5" class="text-line" />
              <Show
                when={overall() != null}
                fallback={
                  <circle cx="10" cy="10" r="8" fill="none" stroke-width="2.5" stroke-dasharray="12 50" stroke-linecap="round" class="origin-center animate-spin stroke-active" />
                }
              >
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  fill="none"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  class="stroke-active transition-[stroke-dashoffset] duration-300"
                  stroke-dasharray="50.27"
                  stroke-dashoffset={50.27 * (1 - overall()!)}
                />
              </Show>
            </svg>
          </Show>
          <span class="tabular-nums">{running() || tasks.length}</span>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content class="menu-surface z-50 w-80 p-0">
            <div class="border-b border-line/60 px-3 py-2 text-[11px] font-semibold tracking-wider text-menu uppercase">
              {t("header.tasks.title")}
            </div>
            <div class="scroll-area max-h-80 divide-y divide-line/40 overflow-auto">
              <For each={tasks} fallback={<p class="p-4 text-center text-xs text-menu">{t("tasks.none")}</p>}>
                {(task) => <TaskRow task={task} />}
              </For>
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </Show>
  )
}
