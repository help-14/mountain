import * as DropdownPrimitive from "@kobalte/core/dropdown-menu"
import { createMenuParts } from "./menu-parts"

const parts = createMenuParts(DropdownPrimitive)

export const DropdownMenu = DropdownPrimitive.Root
export const DropdownMenuTrigger = DropdownPrimitive.Trigger
export const DropdownMenuContent = parts.Content
export const DropdownMenuItem = parts.Item
export const DropdownMenuSeparator = parts.Separator
export const DropdownMenuShortcut = parts.Shortcut
