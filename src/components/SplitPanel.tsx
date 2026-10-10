import { VsAdd } from "solid-icons/vs"
import { For, Show, createSignal } from "solid-js"
import FilePanel from "~/components/explorer/FilePanel"
import { t } from "~/lib/i18n"
import { withTransition } from "~/lib/transition"
import { cn } from "~/lib/utils"
import { addPanel, panels } from "~/stores/panels"

const EDGE = 28

/**
 * Up to four file panels laid out 1 → 2 columns → 2×2.
 * Hovering the right (1 panel) or bottom (2 panels) edge reveals an "add panel" affordance.
 */
export default function SplitPanel() {
  const [edge, setEdge] = createSignal(false)
  let root!: HTMLDivElement

  const count = () => panels().length
  const add = () => withTransition(() => addPanel())

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" || count() >= 3 || window.innerWidth < 768) return setEdge(false)
    const r = root.getBoundingClientRect()
    setEdge(count() === 1 ? r.right - e.clientX < EDGE : r.bottom - e.clientY < EDGE)
  }

  return (
    <div
      ref={root}
      class={cn(
        "relative grid h-full min-h-0 gap-2 transition-[padding] duration-300 ease-[var(--ease-out-quint)]",
        count() === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2",
        count() > 2 ? "grid-rows-2" : "grid-rows-1",
        count() === 2 && "max-md:grid-rows-2",
        edge() && count() === 1 && "pr-12",
        edge() && count() === 2 && "pb-12",
      )}
      onPointerMove={onMove}
      onPointerLeave={() => setEdge(false)}
    >
      <For each={panels()}>{(panel) => <FilePanel panel={panel} />}</For>

      <Show when={count() === 3}>
        <button
          type="button"
          onClick={add}
          class="group hidden flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line/80 text-menu transition-colors duration-200 hover:border-active/60 hover:bg-active/5 hover:text-active md:flex"
        >
          <VsAdd class="size-7 transition-transform duration-300 ease-[var(--ease-spring)] group-hover:scale-110 group-hover:rotate-90" />
          <span class="text-sm font-medium">{t("nav.addPanel")}</span>
        </button>
      </Show>

      <Show when={count() < 3}>
        <button
          type="button"
          aria-label={t("nav.addPanel")}
          onClick={add}
          class={cn(
            "absolute z-10 hidden items-center justify-center rounded-xl border-2 border-dashed text-active transition-all duration-300 ease-[var(--ease-out-quint)] md:flex",
            count() === 1 ? "top-0 right-0 bottom-0 w-10" : "right-0 bottom-0 left-0 h-10",
            edge() ? "border-active/60 bg-active/10 opacity-100" : "pointer-events-none border-transparent opacity-0",
          )}
          tabIndex={edge() ? 0 : -1}
        >
          <VsAdd class={cn("size-5 transition-transform duration-300", edge() ? "scale-100" : "scale-50")} />
        </button>
      </Show>
    </div>
  )
}

