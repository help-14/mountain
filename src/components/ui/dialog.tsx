import * as DialogPrimitive from "@kobalte/core/dialog"
import { VsClose } from "solid-icons/vs"
import type { JSX } from "solid-js"
import { Show } from "solid-js"
import { t } from "~/lib/i18n"
import { cn } from "~/lib/utils"

export function Dialog(props: {
  open: boolean
  onClose: () => void
  title: JSX.Element
  description?: JSX.Element
  children?: JSX.Element
  footer?: JSX.Element
  class?: string
  icon?: JSX.Element
}) {
  return (
    <DialogPrimitive.Root open={props.open} onOpenChange={(open) => !open && props.onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay class="fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px] data-[expanded]:animate-fade-in data-[closed]:animate-fade-out" />
        <div class="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
          <DialogPrimitive.Content
            class={cn(
              "relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-line bg-900 text-code shadow-2xl shadow-black/50 outline-none sm:max-w-md sm:rounded-xl data-[expanded]:animate-dialog-in data-[closed]:animate-dialog-out",
              props.class,
            )}
          >
            <div class="flex items-start gap-3 px-5 pt-5 pb-3">
              <Show when={props.icon}>
                <div class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-hover">{props.icon}</div>
              </Show>
              <div class="min-w-0 flex-1">
                <DialogPrimitive.Title class="text-base font-semibold break-words">{props.title}</DialogPrimitive.Title>
                <Show when={props.description}>
                  <DialogPrimitive.Description class="mt-1 text-sm text-menu">{props.description}</DialogPrimitive.Description>
                </Show>
              </div>
              <DialogPrimitive.CloseButton class="icon-btn -mt-1 -mr-2" aria-label={t("modals.close")}>
                <VsClose />
              </DialogPrimitive.CloseButton>
            </div>
            <Show when={props.children}>
              <div class="scroll-area min-h-0 flex-1 overflow-auto px-5 pb-2">{props.children}</div>
            </Show>
            <Show when={props.footer}>
              <div class="flex flex-col-reverse gap-2 border-t border-line/60 bg-950/30 px-5 py-3 sm:flex-row sm:justify-end">
                {props.footer}
              </div>
            </Show>
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
