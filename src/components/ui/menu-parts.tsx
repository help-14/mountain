import type { JSX } from "solid-js"
import { splitProps } from "solid-js"
import { cn } from "~/lib/utils"

/**
 * Kobalte's menubar, context menu and dropdown share the same menu anatomy.
 * These helpers style any of them consistently.
 */
type Primitive = {
  Item: any
  CheckboxItem: any
  RadioItem: any
  ItemIndicator: any
  Separator: any
  GroupLabel: any
  Portal: any
  Content: any
}

const Check = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="size-3.5">
    <path d="M5 12l5 5l10 -10" />
  </svg>
)

const Dot = () => (
  <svg viewBox="0 0 24 24" class="size-2 fill-current">
    <circle cx="12" cy="12" r="9" />
  </svg>
)

export function createMenuParts(P: Primitive) {
  const Content = (props: { class?: string; children?: JSX.Element; [k: string]: any }) => {
    const [local, others] = splitProps(props, ["class"])
    return (
      <P.Portal>
        <P.Content class={cn("menu-surface", local.class)} {...others} />
      </P.Portal>
    )
  }

  const Item = (props: { class?: string; danger?: boolean; children?: JSX.Element; [k: string]: any }) => {
    const [local, others] = splitProps(props, ["class", "danger"])
    return <P.Item class={cn("menu-item", local.danger && "danger", local.class)} {...others} />
  }

  const CheckboxItem = (props: { class?: string; children?: JSX.Element; [k: string]: any }) => {
    const [local, others] = splitProps(props, ["class", "children"])
    return (
      <P.CheckboxItem class={cn("menu-item pr-8", local.class)} {...others}>
        {local.children}
        <span class="absolute right-2 flex size-4 items-center justify-center rounded border border-line text-active transition-colors data-[checked]:border-active/60">
          <P.ItemIndicator>
            <Check />
          </P.ItemIndicator>
        </span>
      </P.CheckboxItem>
    )
  }

  const RadioItem = (props: { class?: string; children?: JSX.Element; [k: string]: any }) => {
    const [local, others] = splitProps(props, ["class", "children"])
    return (
      <P.RadioItem class={cn("menu-item pr-8", local.class)} {...others}>
        {local.children}
        <span class="absolute right-2 flex size-4 items-center justify-center text-active">
          <P.ItemIndicator>
            <Dot />
          </P.ItemIndicator>
        </span>
      </P.RadioItem>
    )
  }

  const Separator = (props: { class?: string }) => <P.Separator class={cn("menu-sep", props.class)} />
  const Label = (props: { children: JSX.Element }) => <div class="menu-label">{props.children}</div>
  const Shortcut = (props: { children: JSX.Element }) => <span class="menu-shortcut">{props.children}</span>

  return { Content, Item, CheckboxItem, RadioItem, Separator, Label, Shortcut }
}
