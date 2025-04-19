import { createSignal } from "solid-js";
import { t } from "~/lib";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "~/components/ui/menubar";
import {
  FaSolidCalendar,
  FaSolidEye,
  FaSolidFileCode,
  FaSolidFileSignature,
  FaSolidFolderTree,
  FaSolidFont,
  FaSolidList,
  FaSolidMagnifyingGlass,
  FaSolidSort,
  FaSolidObjectGroup,
  FaSolidGear,
  FaSolidLanguage,
  FaSolidInfo,
  FaSolidKeyboard,
  FaSolidBookOpen,
  FaSolidWrench,
  FaSolidBorderAll,
  FaSolidBorderNone,
  FaSolidBorderTopLeft,
  FaSolidGrip,
} from "solid-icons/fa";
import { RiArrowsArrowDownSLine } from "solid-icons/ri";
import {
  AiOutlineSortAscending,
  AiOutlineSortDescending,
} from "solid-icons/ai";
import { TbRefresh } from "solid-icons/tb";

export default function Nav() {
  const menuBarClassList = {
    "bg-transparent focus:outline-none rounded-lg": true,
    "text-menu font-medium text-sm text-center": true,
    "space-x-2 inline-flex items-center": true,
  };
  const menuTriggerClass =
    "hover:bg-hover px-4 py-2.5 space-x-2 transition-colors duration-200";
  const menubarContentClass =
    "bg-900 outline-none text-menu border-2 border-500 shadow";
  const menubarItemClass = "focus:bg-hover focus:text-code";
  const menubarTitleClass = "text-xs font-light italic";
  const menubarSeparatorClass = "border-hover";

  const [selectionMode, setSelectionMode] = createSignal(false);
  const selectionToolBus = {
    emit: (action: string) => {
      // Implementation will be needed here
      console.log("Selection tool action:", action);
    },
  };

  const openDrawer = (id: string) => {
    // Implementation will be needed here
    console.log("Opening drawer:", id);
  };

  return (
    <nav class="bg-900 p-1 fixed top-0 left-0 right-0 z-50">
      <Menubar classList={menuBarClassList}>
        {/* Sort */}
        <MenubarMenu>
          <MenubarTrigger class={menuTriggerClass}>
            <FaSolidSort />
            {t("header.sort.title")}
            <RiArrowsArrowDownSLine />
          </MenubarTrigger>
          <MenubarContent class={menubarContentClass}>
            <MenubarCheckboxItem class={menubarItemClass}>
              <FaSolidFileCode class="mr-2" />
              {t("header.sort.group")}
            </MenubarCheckboxItem>
            <MenubarSeparator class={menubarSeparatorClass} />
            <MenubarItem class={menubarTitleClass}>
              {t("header.sort.by")}
            </MenubarItem>
            <MenubarRadioGroup>
              <MenubarRadioItem
                value="header.sort.name"
                class={menubarItemClass}
              >
                <FaSolidFont class="mr-2" />
                {t("header.sort.name")}
              </MenubarRadioItem>
              <MenubarRadioItem
                value="header.sort.date"
                class={menubarItemClass}
              >
                <FaSolidCalendar class="mr-2" />
                {t("header.sort.date")}
              </MenubarRadioItem>
              <MenubarRadioItem
                value="header.sort.type"
                class={menubarItemClass}
              >
                <FaSolidFileSignature class="mr-2" />
                {t("header.sort.type")}
              </MenubarRadioItem>
            </MenubarRadioGroup>
            <MenubarSeparator class={menubarSeparatorClass} />
            <MenubarItem class={menubarTitleClass}>
              {t("header.sort.on")}
            </MenubarItem>
            <MenubarRadioGroup>
              <MenubarRadioItem
                value="header.sort.asc"
                class={menubarItemClass}
              >
                <AiOutlineSortAscending class="mr-2" />
                {t("header.sort.asc")}
              </MenubarRadioItem>
              <MenubarRadioItem
                value="header.sort.des"
                class={menubarItemClass}
              >
                <AiOutlineSortDescending class="mr-2" />
                {t("header.sort.des")}
              </MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>

        {/* View */}
        <MenubarMenu>
          <MenubarTrigger class={menuTriggerClass}>
            <FaSolidEye />
            {t("header.view.title")}
            <RiArrowsArrowDownSLine />
          </MenubarTrigger>
          <MenubarContent class={menubarContentClass}>
            <MenubarItem class={menubarTitleClass}>
              {t("header.view.as")}
            </MenubarItem>
            <MenubarRadioGroup>
              <MenubarRadioItem
                value="header.view.list"
                class={menubarItemClass}
              >
                <FaSolidList class="mr-2" />
                {t("header.view.list")}
              </MenubarRadioItem>
              <MenubarRadioItem
                value="header.view.tiles"
                class={menubarItemClass}
              >
                <FaSolidGrip class="mr-2" />
                {t("header.view.tiles")}
              </MenubarRadioItem>
            </MenubarRadioGroup>
            <MenubarSeparator class={menubarSeparatorClass} />
            <MenubarItem class={menubarTitleClass}>
              {t("header.view.display")}
            </MenubarItem>
            <MenubarCheckboxItem class={menubarItemClass}>
              <FaSolidFolderTree class="mr-2" />
              {t("header.view.navigation")}
            </MenubarCheckboxItem>
            <MenubarCheckboxItem class={menubarItemClass}>
              <FaSolidMagnifyingGlass class="mr-2" />
              {t("header.view.preview")}
            </MenubarCheckboxItem>
            <MenubarCheckboxItem class={menubarItemClass}>
              <FaSolidFileCode class="mr-2" />
              {t("header.view.extension")}
            </MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>

        {/* Select */}
        <MenubarMenu>
          <MenubarTrigger class={menuTriggerClass}>
            <FaSolidObjectGroup />
            {t("header.select.title")}
            <RiArrowsArrowDownSLine />
          </MenubarTrigger>
          <MenubarContent class={menubarContentClass}>
            <MenubarCheckboxItem
              class={menubarItemClass}
              checked={selectionMode()}
            >
              <FaSolidFileCode class="mr-2" />
              {t("header.select.mode")}
            </MenubarCheckboxItem>
            <MenubarSeparator class={menubarSeparatorClass} />
            <MenubarItem class={menubarTitleClass}>
              {t("header.select.tools")}
            </MenubarItem>
            <MenubarItem class={menubarItemClass}>
              <FaSolidBorderAll class="mr-2" />
              {t("header.select.all")}
              <MenubarShortcut>⌃A</MenubarShortcut>
            </MenubarItem>
            <MenubarItem class={menubarItemClass}>
              <FaSolidBorderNone class="mr-2" />
              {t("header.select.none")}
              <MenubarShortcut>esc</MenubarShortcut>
            </MenubarItem>
            <MenubarItem class={menubarItemClass}>
              <FaSolidBorderTopLeft class="mr-2" />
              {t("header.select.invert")}
              <MenubarShortcut>⌃I</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* Setting */}
        <MenubarMenu>
          <MenubarTrigger class={menuTriggerClass}>
            <FaSolidGear />
            {t("header.setting.title")}
            <RiArrowsArrowDownSLine />
          </MenubarTrigger>
          <MenubarContent class={menubarContentClass}>
            <MenubarItem class={menubarItemClass}>
              <FaSolidLanguage class="mr-2" />
              {t("header.setting.language")}
            </MenubarItem>
            <MenubarItem class={menubarItemClass}>
              <FaSolidWrench class="mr-2" />
              {t("header.setting.preferences")}
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* About */}
        <MenubarMenu>
          <MenubarTrigger class={menuTriggerClass}>
            <FaSolidInfo />
            {t("header.about.title")}
            <RiArrowsArrowDownSLine />
          </MenubarTrigger>
          <MenubarContent class={menubarContentClass}>
            <MenubarItem class={menubarItemClass}>
              <FaSolidKeyboard class="mr-2" />
              {t("header.about.shortcuts")}
            </MenubarItem>
            <MenubarItem class={menubarItemClass}>
              <FaSolidBookOpen class="mr-2" />
              {t("header.about.documentation")}
            </MenubarItem>
            <MenubarItem class={menubarItemClass}>
              <TbRefresh class="mr-2" />
              {t("header.about.update")}
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </nav>
  );
}
