import { VsCheck, VsClose, VsError, VsInfo } from "solid-icons/vs"
import { For, Show } from "solid-js"
import { Portal } from "solid-js/web"
import { t } from "~/lib/i18n"
import { cn } from "~/lib/utils"
import { activeTasks } from "~/stores/tasks"
import { dismissToast, pauseToast, resumeToast, toasts } from "~/stores/toasts"
import { TaskRow } from "./TaskIndicator"

/** Bottom-right stack: long-running uploads on top, transient notifications below. */
export default function Toaster() {
  const uploads = () => activeTasks().filter((t) => t.kind === "upload")
  return (
    <Portal>
      <div
        class="pointer-events-none fixed right-0 bottom-0 z-[70] flex w-full flex-col items-end gap-2 p-3 sm:w-96 sm:p-4"
        aria-live="polite"
        role="status"
      >
        <Show when={uploads().length}>
          <div class="pointer-events-auto w-full animate-toast-in overflow-hidden rounded-xl border border-line bg-900/95 shadow-2xl shadow-black/40 backdrop-blur-md">
            <For each={uploads()}>{(task) => <TaskRow task={task} />}</For>
          </div>
        </Show>
        <For each={toasts}>
          {(toast) => (
            <div
              class={cn(
                "pointer-events-auto flex w-full items-start gap-3 rounded-xl border bg-900/95 p-3 pr-2 shadow-2xl shadow-black/40 backdrop-blur-md",
                toast.leaving ? "animate-toast-out" : "animate-toast-in",
                toast.kind === "error" ? "border-danger/40" : "border-line",
              )}
              onMouseEnter={() => pauseToast(toast.id)}
              onMouseLeave={() => resumeToast(toast.id)}
            >
              <span
                class={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                  toast.kind === "success" && "bg-active/15 text-active",
                  toast.kind === "error" && "bg-danger/15 text-danger",
                  toast.kind === "info" && "bg-info/15 text-info",
                )}
              >
                {toast.kind === "success" ? <VsCheck class="size-3.5" /> : toast.kind === "error" ? <VsError class="size-3.5" /> : <VsInfo class="size-3.5" />}
              </span>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium break-words text-code">{toast.title}</p>
                <Show when={toast.message}>
                  <p class="mt-0.5 line-clamp-3 text-xs break-words text-menu">{toast.message}</p>
                </Show>
                <Show when={toast.action}>
                  <button
                    type="button"
                    class="mt-1.5 text-xs font-semibold text-active hover:underline"
                    onClick={() => {
                      toast.action!.run()
                      dismissToast(toast.id)
                    }}
                  >
                    {toast.action!.label}
                  </button>
                </Show>
              </div>
              <button
                type="button"
                class="flex size-6 shrink-0 items-center justify-center rounded text-menu transition-colors hover:bg-hover hover:text-code"
                aria-label={t("modals.close")}
                onClick={() => dismissToast(toast.id)}
              >
                <VsClose class="size-3.5" />
              </button>
            </div>
          )}
        </For>
      </div>
    </Portal>
  )
}
