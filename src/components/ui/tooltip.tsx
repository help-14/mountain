import * as TooltipPrimitive from "@kobalte/core/tooltip"
import type { JSX } from "solid-js"
import { splitProps } from "solid-js"
import { cn } from "~/lib/utils"

/** Icon button with an accessible label and a delayed tooltip. */
export function IconButton(
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; shortcut?: string; children: JSX.Element },
) {
  const [local, others] = splitProps(props, ["label", "shortcut", "children", "class"])
  return (
    <TooltipPrimitive.Root openDelay={450} closeDelay={0} gutter={6}>
      <TooltipPrimitive.Trigger as="button" type="button" aria-label={local.label} class={cn("icon-btn", local.class)} {...others}>
        {local.children}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content class="z-[60] flex items-center gap-2 rounded-md border border-line bg-950 px-2 py-1 text-xs text-code shadow-lg data-[expanded]:animate-pop-in data-[closed]:animate-pop-out">
          {local.label}
          {local.shortcut && <kbd class="font-mono text-[10px] text-menu">{local.shortcut}</kbd>}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}
