import {
  Component,
  For,
  Switch,
  Match,
  createEffect,
  createSignal,
  Show,
} from "solid-js";
import { sortData, doGetFilesFromPath, sortSettings } from "~/lib";
import ItemTileDisplay from "~/components/ItemDisplay/tile";
import ItemListDisplay from "~/components/ItemDisplay/list";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "~/components/ui/context-menu";
import { FileInfo, SortSettings } from "~/types";
//import listingSignal from "~/signals/listingPanel";
import selectionModeSignal from "~/signals/selectionMode";
import viewModeSignal from "~/signals/viewMode";
import selectionToolBus from "~/signals/selectionTool";
import compactModeBus from "~/signals/compactMode";
// import { OcPaste3, OcTabexternal2 } from "solid-icons/oc";
// import { IoCopyOutline, IoCut } from "solid-icons/io";
// import { AiOutlineDelete } from "solid-icons/ai";
// import { BiRegularShare } from "solid-icons/bi";
import { FaSolidXmark } from "solid-icons/fa";

const ListingPanel: Component = () => {
  const [files, setFiles] = createSignal([] as FileInfo[]);
  const [location, setLocation] = createSignal("/Users/nhan/");
  const [compact, setCompact] = createSignal(false);

  const [selectionMode, setSelectionMode] = selectionModeSignal;
  const [viewMode, setViewMode] = viewModeSignal;
  const [sort, setSort] = sortSettings();

  createEffect(() => {
    doGetFilesFromPath(location())
      .then((data) => setFiles(sortData(data, sort)))
      .catch(console.error);
  });

  const tileView = () => viewMode() === "tile";
  const listView = () => viewMode() === "list";

  compactModeBus.listen((val) => setCompact(val));
  selectionToolBus.listen(() => {
    if (!selectionMode()) setSelectionMode(true);
  });

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Switch>
          <Match when={tileView()}>
            <div class="flex flex-wrap gap-2 p-5 justify-left pb-10">
              <For each={files()}>
                {(file) => <ItemTileDisplay info={file} />}
              </For>
            </div>
          </Match>
          <Match when={listView()}>
            <div class="pb-10">
              <div class="flex flex-row p-3 text-lg bg-900">
                <div class="basis-10 items-center flex">
                  <Show when={selectionMode()}>
                    <FaSolidXmark
                      fill="#849289"
                      class="cursor-pointer mx-auto"
                      onclick={() => setSelectionMode(false)}
                    />
                  </Show>
                </div>
                <div class="basis-10 "></div>
                <div class="grow px-3 contents-center self-center">
                  <p class="text-menu font-bold px-5">File name</p>
                </div>
                <Show when={!compact()}>
                  <div class="basis-40 contents-center self-center text-center xl:inline hidden">
                    <p class="text-menu font-bold px-5">Symlink</p>
                  </div>
                </Show>
                <div class="basis-1/6 contents-center self-center">
                  <p class="text-menu font-bold px-5">Size</p>
                </div>
                <Show when={!compact()}>
                  <div class="basis-1/6 contents-center self-center xl:inline hidden">
                    <p class="text-menu font-bold px-5">File extension</p>
                  </div>
                  <div class="basis-1/4 contents-center self-center">
                    <p class="text-menu font-bold px-5">Modified at</p>
                  </div>
                </Show>
              </div>
              <For each={files()}>
                {(file, i) => (
                  <ItemListDisplay info={file} bgHighlight={i() % 2 !== 0} />
                )}
              </For>
            </div>
          </Match>
        </Switch>
      </ContextMenuTrigger>
      <ContextMenuContent class="bg-500 outline-none border-1 border-menu text-menu shadow">
        <ContextMenuItem class="focus:bg-hover focus:text-code">
          Profile
        </ContextMenuItem>
        <ContextMenuItem class="focus:bg-hover focus:text-code">
          Billing
        </ContextMenuItem>
        <ContextMenuItem class="focus:bg-hover focus:text-code">
          Team
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem class="focus:bg-hover focus:text-code">
          Subscription
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default ListingPanel;
