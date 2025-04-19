import {
  Component,
  Match,
  Switch,
  Show,
  createEffect,
  createSignal,
} from "solid-js";
import { FileInfo } from "~/types";
import FileExtensionIcon from "~/components/FileExtensionIcon";
import { VsLink } from "solid-icons/vs";
import "./style.css";
import { humanFileSize } from "~/lib";
import selectionModeSignal from "~/signals/selectionMode";
import selectionToolBus from "~/signals/selectionTool";
import compactModeBus from "~/signals/compactMode";

const ItemListDisplay: Component<{
  info: FileInfo;
  bgHighlight?: boolean;
  handleClick?: Function;
  changeSelectionMode?: Function;
}> = ({ info, bgHighlight, handleClick, changeSelectionMode }) => {
  const [selected, setSelected] = createSignal(false);
  const [editMode, setEditMode] = createSignal(false);
  const [fileName, setFileName] = createSignal(info.name);
  const [selectionMode, setSelectionMode] = selectionModeSignal;
  const [compact, setCompact] = createSignal(false);

  let fileNameTb!: HTMLInputElement;
  let selectBox!: HTMLInputElement;

  createEffect(() => (info.selected = selected()));
  createEffect(() => (info.name = fileName()));
  createEffect(() => changeSelectionMode?.(selectionMode()));
  createEffect(() => {
    if (editMode()) fileNameTb?.focus();
  });

  let size = () => (info.directory ? "" : humanFileSize(info.size));
  let modified = () => new Date(info.modified).toLocaleString();
  let isLinked = () => info.symlink;

  const onPress = (
    e: MouseEvent & {
      currentTarget: HTMLDivElement;
      target: Element;
    }
  ) => {
    if (selectionMode()) {
      if (!selected()) setSelected(true);
    } else handleClick?.(e.currentTarget, info);
  };

  let id: any;
  let check = false;

  const onmousedown = () => {
    check = false;
    id = setInterval(() => {
      if (check === false && !selectionMode()) {
        setSelectionMode(true);
        setSelected(true);
      }
    }, 300);
  };

  const onmouseup = () => {
    clearInterval(id);
    id = null;
    check = true;
  };

  compactModeBus.listen((val) => setCompact(val));
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
        "flex flex-row pl-3 pr-3 pt-2 pb-2 item hover:bg-hover cursor-pointer":
          true,
        "bg-900": bgHighlight,
        "bg-hover": selected(),
      }}
      onmouseup={() => onmouseup()}
      onmousedown={() => onmousedown()}
      ondblclick={(e) => handleClick?.(e.currentTarget, info)}
    >
      <div class="basis-10 items-center flex">
        <Show when={selectionMode()}>
          <input
            ref={selectBox!}
            type="checkbox"
            checked={selected()}
            onclick={() => setSelected(selectBox.checked)}
            class="w-4 h-4 mx-auto text-menu bg-900 border-menu focus:ring-menu rounded"
          />
        </Show>
      </div>
      <div
        onClick={(e) => onPress(e)}
        class="basis-10 contents-center self-center"
      >
        <FileExtensionIcon
          directory={info.directory}
          ext={info.ext}
          fileSize="1em"
          iconSize="0"
        />
      </div>
      <div
        onClick={(e) => onPress(e)}
        class="grow px-3 hover:cursor-text"
        ondblclick={() => setEditMode(!editMode())}
      >
        <Switch>
          <Match when={!editMode()}>
            <p class="text-code truncate">{fileName()}</p>
          </Match>
          <Match when={editMode()}>
            <input
              class="border-none ml-1 focus:border-none bg-transparent text-code caret-code w-full"
              ref={fileNameTb!}
              type="textbox"
              value={fileName()}
              oninput={() => setFileName(fileNameTb.value)}
              onfocus={() => fileNameTb.select()}
              onfocusout={() => setEditMode(false)}
            />
          </Match>
        </Switch>
      </div>
      <Show when={!compact()}>
        <div onClick={(e) => onPress(e)} class="xl:inline hidden basis-40">
          <Show when={isLinked()}>
            <VsLink fill="#D3C6AA" class="mx-auto" />
          </Show>
        </div>
      </Show>
      <div onClick={(e) => onPress(e)} class="basis-1/6">
        <p class="text-code pl-5 pr-5">{size()}</p>
      </div>
      <Show when={!compact()}>
        <div onClick={(e) => onPress(e)} class="xl:inline hidden basis-1/6">
          <p class="text-code pl-5 pr-5 truncate">{info.ext}</p>
        </div>
        <div onClick={(e) => onPress(e)} class="basis-1/4">
          <p class="text-code pl-5 pr-5 truncate">{modified()}</p>
        </div>
      </Show>
    </div>
  );
};

export default ItemListDisplay;
