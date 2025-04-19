import {
  Accessor,
  Component,
  For,
  JSX,
  Setter,
  Show,
  createSignal,
  onMount,
} from "solid-js";
import compactModeBus from "~/signals/compactMode";
import listingSignal from "~/signals/listingPanel";
import { RiDesignDragDropLine } from "solid-icons/ri";
import { VsClose } from "solid-icons/vs";
import { IoAdd } from "solid-icons/io";

type PanelItem = {
  id: string;
  path: string;
  element: JSX.Element;
  selected: Accessor<boolean>;
  setSelected: Setter<boolean>;
  dropTimeout: number;
  showDragBackdrop: Accessor<boolean>;
  setDragBackdrop: Setter<boolean>;
};

const SplitPanel: Component<{ createNew: Function }> = ({ createNew }) => {
  let spitRoot: HTMLDivElement | undefined = undefined;
  const [items, setItems] = createSignal<PanelItem[]>([]);
  const [roomAvailable, setRoomAvailable] = listingSignal.roomAvailable;
  const [mousePosition, setMousePosition] = createSignal({ x: 0, y: 0 });
  const [showAddButton, setShowAddButton] = createSignal(false);
  const [compressionAmount, setCompressionAmount] = createSignal(0);

  // Detection proximity in pixels
  const DETECTION_PROXIMITY = 50;

  function addPanel() {
    if (!spitRoot || items().length >= 4) return;

    const [selected, setSelected] = createSignal(false);
    const [showDragBackdrop, setDragBackdrop] = createSignal(false);

    const randomId = () => (Math.floor(Math.random() * 1000) + 1).toString();

    const panel: PanelItem = {
      id: randomId(),
      path: "/",
      element: createNew(),
      selected,
      setSelected,
      dropTimeout: 0,
      showDragBackdrop,
      setDragBackdrop,
    };

    if (!items().find((i) => i.selected() === true)) panel.setSelected(true);

    setItems([...items(), panel]);
    updateLayout();
  }

  function removeSelected() {
    items().forEach((item) => item.setSelected(false));
  }

  function updateLayout() {
    if (!spitRoot) return;

    if (items().length === 0) {
      addPanel();
      return;
    }

    setRoomAvailable(items().length < 4);

    if (items().length > 1) {
      setTimeout(() => compactModeBus.emit(true), 1);
    }
  }

  const isGrid = () => items().length > 1;

  listingSignal.newPanel.listen(() => {
    addPanel();
  });

  const handleMouseMove = (e: MouseEvent) => {
    if (items().length >= 4) return;

    if (!spitRoot) return;
    const rect = spitRoot.getBoundingClientRect();

    const { clientX, clientY } = e;
    setMousePosition({ x: clientX, y: clientY });

    const panelCount = items().length;

    if (panelCount === 1) {
      // For single panel, check right edge proximity
      const distanceFromRight = rect.right - clientX;
      if (
        distanceFromRight <= DETECTION_PROXIMITY &&
        clientX >= rect.left &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        setCompressionAmount(DETECTION_PROXIMITY);
        setShowAddButton(true);
      } else {
        setShowAddButton(false);
        setCompressionAmount(0);
      }
    } else if (panelCount === 2) {
      // For two panels, check bottom edge proximity
      const distanceFromBottom = rect.bottom - clientY;
      if (
        distanceFromBottom <= DETECTION_PROXIMITY &&
        clientY >= rect.top &&
        clientX >= rect.left &&
        clientX <= rect.right
      ) {
        setCompressionAmount(DETECTION_PROXIMITY);
        setShowAddButton(true);
      } else {
        setShowAddButton(false);
        setCompressionAmount(0);
      }
    }
    // For 3 panels, the fourth panel space is handled differently
  };

  onMount(async () => {
    updateLayout();
    window.addEventListener("mousemove", handleMouseMove);
  });

  return (
    <div
      id="splitPanel"
      ref={(el) => {
        spitRoot = el;
      }}
      classList={{
        grow: true,
        grid: true,
        "grid-cols-1": items().length === 1,
        "grid-cols-2": items().length > 1,
        "grid-rows-1": items().length <= 2,
        "grid-rows-2": items().length > 2,
        relative: true,
        "h-full": true,
      }}
      onMouseMove={handleMouseMove}
    >
      <For each={items()}>
        {(item) => (
          <div
            classList={{
              "flex flex-col rounded relative": true,
              "h-full": true,
              "border-2": isGrid(),
              "border-dotted border-menu": (() => !item.selected())(),
              "border-code": item.selected(),
            }}
            style={{
              // Removed compression logic for padding-right and padding-bottom
              transition: "padding 0.2s ease-out",
            }}
            onmousedown={() => {
              removeSelected();
              item.setSelected(true);
            }}
            onDrop={async (ev) => {
              item.setDragBackdrop(false);
              ev.preventDefault();
              if (!ev.dataTransfer) return;
              // if (ev.dataTransfer.items) {
              //   // Use DataTransferItemList interface to access the file(s)
              //   ;[...ev.dataTransfer.items].forEach((item, i) => {
              //     // If dropped items aren't files, reject them
              //     if (item.kind === 'file') {
              //       const file = item.getAsFile()
              //       if (!file) return
              //       console.log(`… file[${i}].name = ${file.name}`)
              //     }
              //   })
              // } else {
              //   // Use DataTransfer interface to access the file(s)
              //   ;[...ev.dataTransfer.files].forEach((file, i) => {
              //     console.log(`… file[${i}].name = ${file.name}`)
              //   })
              //}
            }}
            onDragEnter={() => {
              item.dropTimeout = new Date().getTime() + 300;
              if (!item.showDragBackdrop()) item.setDragBackdrop(true);
            }}
            onDragLeave={() => {
              setTimeout(() => {
                if (
                  new Date().getTime() > item.dropTimeout &&
                  item.showDragBackdrop()
                ) {
                  item.setDragBackdrop(false);
                }
              }, 200);
            }}
            onDragOver={(ev) => {
              ev.preventDefault();
            }}
            onDragEnd={() => {
              item.setDragBackdrop(false);
            }}
            onpointerleave={() => {
              item.setDragBackdrop(false);
            }}
          >
            <Show when={isGrid()}>
              <div class="border-0 bg-900 flex text-menu">
                <span class="grow p-2">{item.path}</span>
                <button
                  onclick={() => {
                    setItems(items().filter((x) => x.id !== item.id));
                  }}
                  type="button"
                  class="hover:bg-hover focus:ring-0 font-medium rounded-lg text-sm p-2 focus:outline-none"
                >
                  <VsClose font-size="18" />
                </button>
              </div>
            </Show>
            <div class="grow overflow-auto">{item.element}</div>
            <div
              classList={{
                hidden: !item.showDragBackdrop(),
                "absolute left-0 right-0 top-0 bottom-0 bg-900 opacity-80":
                  true,
              }}
              onClick={() => item.setDragBackdrop(false)}
            >
              <div class="flex text-code text-center text-lg w-full h-full">
                <div class="flex flex-col mx-auto my-auto">
                  <div class="mx-auto">
                    <RiDesignDragDropLine font-size="100" />
                  </div>
                  <span class="font-extrabold mt-2">
                    Drop files here to upload
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </For>

      {/* Add button for 1 panel (right side) */}
      <Show when={items().length === 1}>
        <div
          classList={{
            "absolute right-0 top-0 z-10 cursor-pointer flex items-center justify-center h-full bg-code transition-all duration-500":
              true,
            "opacity-30": !showAddButton(),
            "opacity-100": showAddButton(),
          }}
          style={{
            width: showAddButton() ? `${compressionAmount()}px` : "5px",
          }}
          onClick={addPanel}
        >
          <IoAdd
            size={36}
            class="text-900 transition-all duration-500"
            style={{
              opacity: showAddButton() ? 1 : 0,
            }}
          />
        </div>
      </Show>

      {/* Add button for 2 panels (bottom) */}
      <Show when={items().length === 2}>
        <div
          classList={{
            "fixed left-0 right-0 z-10 cursor-pointer flex items-center justify-center w-full bg-code transition-all duration-500":
              true,
            "opacity-30": !showAddButton(),
            "opacity-100": showAddButton(),
          }}
          style={{
            height: showAddButton() ? `${compressionAmount()}px` : "5px",
            bottom: "0",
            transform: "translateY(0)",
          }}
          onClick={addPanel}
        >
          <IoAdd
            class="text-900 transition-all duration-500"
            size={36}
            style={{
              opacity: showAddButton() ? 1 : 0,
              transform: "translateY(0)",
            }}
          />
        </div>
      </Show>

      {/* Empty fourth panel as add button when there are 3 panels */}
      <Show when={items().length === 3}>
        <div
          class="flex flex-col rounded relative border-2 border-dotted border-menu h-full cursor-pointer bg-hover hover:opacity-90 transition-colors duration-200"
          onClick={addPanel}
        >
          <div class="flex items-center justify-center h-full">
            <IoAdd size={36} class="text-code" />
          </div>
        </div>
      </Show>
    </div>
  );
};

export default SplitPanel;
