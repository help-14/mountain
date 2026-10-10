import * as MenubarPrimitive from "@kobalte/core/menubar"
import type { Component, ComponentProps } from "solid-js"
import { splitProps } from "solid-js"
import { cn } from "~/lib/utils"
import { createMenuParts } from "./menu-parts"

const parts = createMenuParts(MenubarPrimitive)

export const Menubar: Component<ComponentProps<"div">> = (props) => {
  const [local, others] = splitProps(props, ["class"])
  return <MenubarPrimitive.Root class={cn("flex items-center gap-0.5", local.class)} {...(others as any)} />
}

export const MenubarMenu: Component<MenubarPrimitive.MenubarMenuProps> = (props) => (
  <MenubarPrimitive.Menu gutter={6} {...props} />
)

export const MenubarTrigger: Component<ComponentProps<"button">> = (props) => {
  const [local, others] = splitProps(props, ["class"])
  return (
    <MenubarPrimitive.Trigger
      class={cn(
        "flex h-8 items-center gap-2 rounded-md px-2.5 text-sm font-medium text-menu outline-none transition-colors duration-150 select-none hover:bg-hover hover:text-code data-[expanded]:bg-hover data-[expanded]:text-code [&>svg]:size-3.5",
        local.class,
      )}
      {...(others as any)}
    />
  )
}

export const MenubarRadioGroup = MenubarPrimitive.RadioGroup
export const MenubarContent = parts.Content
export const MenubarItem = parts.Item
export const MenubarCheckboxItem = parts.CheckboxItem
export const MenubarRadioItem = parts.RadioItem
export const MenubarSeparator = parts.Separator
export const MenubarLabel = parts.Label
export const MenubarShortcut = parts.Shortcut
