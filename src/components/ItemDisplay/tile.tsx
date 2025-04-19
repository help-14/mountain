import "./style.css";
import { Component, Show, createEffect, createSignal } from "solid-js";
import { FileInfo } from "~/types";
import FileExtensionIcon from "~/components/FileExtensionIcon";
import selectionModeSignal from "~/signals/selectionMode";
import { humanFileSize } from "~/lib";
import selectionToolBus from "~/signals/selectionTool";

const ItemTileDisplay: Component<{
  info: FileInfo;
  handleClick?: Function;
}> = ({ info, handleClick }) => {
  let additionalInfo = info.directory ? "" : humanFileSize(info.size);
  let selectBox!: HTMLInputElement;

  const [selectionMode, setSelectionMode] = selectionModeSignal;
  const [selected, setSelected] = createSignal(false);

  createEffect(() => (info.selected = selected()));

  selectionToolBus.listen((tool) => {
    switch (tool) {
      case "all":
        setSelected(true);
        break;
      case "none":
        setSelected(false);
        break;
      case "invert":
        setSelected(!selected());
        break;
    }
  });

  return (
    <div
      classList={{
        "item flex flex-row hover:bg-500 cursor-pointer p-4 rounded-lg box-border w-[270px] transition-colors duration-200":
          true,
        "border-2 border-active": selected(),
        "m-0 mr-1": selected(),
        "m-0.5": !selected(),
      }}
      onClick={(e) => handleClick?.(e.currentTarget, info)}
    >
      <Show when={selectionMode()}>
        <input
          ref={selectBox!}
          type="checkbox"
          onclick={() => setSelected(selectBox.checked)}
          checked={selected()}
          class="w-4 h-4 mr-3 my-auto text-menu bg-900 border-menu focus:ring-menu rounded"
        />
      </Show>
      <div class="self-center">
        <FileExtensionIcon directory={info.directory} ext={info.ext} />
      </div>
      <div class="flex flex-col content-center items-start self-center mx-3 max-w-[180px]">
        <p class="text-code break-words line-clamp-2 w-full">{info.name}</p>
        <p class="text-menu italic text-sm">{additionalInfo}</p>
      </div>
    </div>
  );
};

export default ItemTileDisplay;
