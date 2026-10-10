import * as SwitchPrimitive from "@kobalte/core/switch"

export function Switch(props: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <SwitchPrimitive.Root
      checked={props.checked}
      onChange={props.onChange}
      class="flex cursor-pointer items-start justify-between gap-4 rounded-lg px-1 py-3"
    >
      <div>
        <SwitchPrimitive.Label class="text-sm font-medium">{props.label}</SwitchPrimitive.Label>
        {props.description && <SwitchPrimitive.Description class="mt-0.5 text-xs text-menu">{props.description}</SwitchPrimitive.Description>}
      </div>
      <SwitchPrimitive.Input class="peer" />
      <SwitchPrimitive.Control class="mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full bg-line p-0.5 transition-colors duration-200 data-[checked]:bg-active peer-focus-visible:ring-2 peer-focus-visible:ring-active/40">
        <SwitchPrimitive.Thumb class="size-4 rounded-full bg-code shadow transition-transform duration-200 ease-[var(--ease-spring)] data-[checked]:translate-x-4 data-[checked]:bg-900" />
      </SwitchPrimitive.Control>
    </SwitchPrimitive.Root>
  )
}
