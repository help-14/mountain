import * as ContextMenuPrimitive from "@kobalte/core/context-menu"
import { createMenuParts } from "./menu-parts"

const parts = createMenuParts(ContextMenuPrimitive)

export const ContextMenu = ContextMenuPrimitive.Root
export const ContextMenuTrigger = ContextMenuPrimitive.Trigger
export const ContextMenuContent = parts.Content
export const ContextMenuItem = parts.Item
export const ContextMenuSeparator = parts.Separator
export const ContextMenuLabel = parts.Label
export const ContextMenuShortcut = parts.Shortcut
