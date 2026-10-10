import { onMount } from "solid-js"
import { commitRename } from "~/stores/actions"
import type { Panel } from "~/stores/panels"
import type { FileInfo } from "~/types"
import { cn } from "~/lib/utils"

export default function RenameInput(props: { panel: Panel; item: FileInfo; class?: string }) {
  let input!: HTMLInputElement
  let busy = false

  onMount(() => {
    input.focus()
    const dot = props.item.directory ? -1 : props.item.name.lastIndexOf(".")
    input.setSelectionRange(0, dot > 0 ? dot : props.item.name.length)
  })

  const commit = async () => {
    if (busy) return
    busy = true
    const ok = await commitRename(props.panel, props.item, input.value)
    busy = false
    if (!ok) input.focus()
  }

  return (
    <input
      ref={input}
      value={props.item.name}
      spellcheck={false}
      class={cn(
        "w-full min-w-0 rounded border border-active/70 bg-950 px-1.5 py-0.5 text-sm text-code outline-none ring-2 ring-active/20",
        props.class,
      )}
      onClick={(e) => e.stopPropagation()}
      onDblClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        e.stopPropagation()
        if (e.key === "Enter") commit()
        if (e.key === "Escape") props.panel.stopRename()
      }}
      onBlur={() => {
        if (props.panel.state.renaming === props.item.path) commit()
      }}
    />
  )
}
