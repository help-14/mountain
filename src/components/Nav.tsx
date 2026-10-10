import {
  FaSolidBookOpen,
  FaSolidBorderAll,
  FaSolidBorderNone,
  FaSolidBorderTopLeft,
  FaSolidCalendar,
  FaSolidEye,
  FaSolidFileCode,
  FaSolidFolderTree,
  FaSolidFont,
  FaSolidGear,
  FaSolidGrip,
  FaSolidImage,
  FaSolidInfo,
  FaSolidKeyboard,
  FaSolidList,
  FaSolidMagnifyingGlass,
  FaSolidObjectGroup,
  FaSolidSort,
  FaSolidWrench,
  FaSolidWeightHanging,
  FaSolidFileSignature,
  FaSolidFolder,
  FaSolidEyeSlash,
  FaSolidLanguage,
  FaSolidCircleInfo,
  FaSolidBars,
} from "solid-icons/fa"
import { AiOutlineSortAscending, AiOutlineSortDescending } from "solid-icons/ai"
import { VsSplitHorizontal } from "solid-icons/vs"
import { For, Show } from "solid-js"
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "~/components/ui/menubar"
import { IconButton } from "~/components/ui/tooltip"
import { locales, t } from "~/lib/i18n"
import { withTransition } from "~/lib/transition"
import { setDrawerOpen } from "~/stores/app"
import { openInfoDialog } from "~/stores/dialogs"
import { MAX_PANELS, activePanel, addPanel, panels } from "~/stores/panels"
import { setSettings, settings, type SortBy, type ViewMode } from "~/stores/settings"
import type { Locale } from "~/languages"
import { ALT, MOD, combo } from "./explorer/keys"
import TaskIndicator from "./TaskIndicator"

function Logo() {
  return (
    <div class="mr-1 flex items-center gap-2 pl-1 select-none">
      <svg viewBox="0 0 32 32" class="size-7" aria-hidden="true">
        <defs>
          <linearGradient id="mtn" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stop-color="#a7c080" />
            <stop offset="1" stop-color="#83c092" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="8" fill="#2c3337" />
        <path d="M5 24 L13 11 L17.5 17.5 L20.5 13.5 L27 24 Z" fill="url(#mtn)" />
        <path d="M13 11 L15.4 14.9 L13.9 14.2 L12.4 15.6 L11.2 13.9 Z" fill="#d3c6aa" />
      </svg>
      <span class="hidden text-sm font-semibold tracking-tight text-code lg:inline">Mountain</span>
    </div>
  )
}

export default function Nav() {
  const sortBy = (by: string) => setSettings("sort", "by", by as SortBy)
  const panel = () => activePanel()

  return (
    <header class="flex h-12 shrink-0 items-center gap-1 border-b border-line/60 bg-900 px-2">
      <button
        type="button"
        class="icon-btn lg:hidden"
        aria-label={t("nav.toggleSidebar")}
        onClick={() => setDrawerOpen((v) => !v)}
      >
        <FaSolidBars />
      </button>
      <Logo />

      <Menubar class="min-w-0 overflow-x-auto [scrollbar-width:none]">
        {/* Sort */}
        <MenubarMenu>
          <MenubarTrigger>
            <FaSolidSort />
            <span class="hidden sm:inline">{t("header.sort.title")}</span>
          </MenubarTrigger>
          <MenubarContent>
            <MenubarLabel>{t("header.sort.by")}</MenubarLabel>
            <MenubarRadioGroup value={settings.sort.by} onChange={sortBy}>
              <MenubarRadioItem value="name">
                <FaSolidFont />
                {t("header.sort.name")}
              </MenubarRadioItem>
              <MenubarRadioItem value="date">
                <FaSolidCalendar />
                {t("header.sort.date")}
              </MenubarRadioItem>
              <MenubarRadioItem value="size">
                <FaSolidWeightHanging />
                {t("header.sort.size")}
              </MenubarRadioItem>
              <MenubarRadioItem value="type">
                <FaSolidFileSignature />
                {t("header.sort.type")}
              </MenubarRadioItem>
            </MenubarRadioGroup>
            <MenubarSeparator />
            <MenubarLabel>{t("header.sort.on")}</MenubarLabel>
            <MenubarRadioGroup value={settings.sort.order} onChange={(v: string) => setSettings("sort", "order", v as "asc" | "desc")}>
              <MenubarRadioItem value="asc">
                <AiOutlineSortAscending />
                {t("header.sort.asc")}
              </MenubarRadioItem>
              <MenubarRadioItem value="desc">
                <AiOutlineSortDescending />
                {t("header.sort.des")}
              </MenubarRadioItem>
            </MenubarRadioGroup>
            <MenubarSeparator />
            <MenubarCheckboxItem checked={settings.sort.foldersFirst} onChange={(v: boolean) => setSettings("sort", "foldersFirst", v)}>
              <FaSolidFolder />
              {t("header.sort.group")}
            </MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>

        {/* View */}
        <MenubarMenu>
          <MenubarTrigger>
            <FaSolidEye />
            <span class="hidden sm:inline">{t("header.view.title")}</span>
          </MenubarTrigger>
          <MenubarContent>
            <MenubarLabel>{t("header.view.as")}</MenubarLabel>
            <MenubarRadioGroup value={settings.view.as} onChange={(v: string) => setSettings("view", "as", v as ViewMode)}>
              <MenubarRadioItem value="list">
                <FaSolidList />
                {t("header.view.list")}
              </MenubarRadioItem>
              <MenubarRadioItem value="tile">
                <FaSolidGrip />
                {t("header.view.tiles")}
              </MenubarRadioItem>
            </MenubarRadioGroup>
            <MenubarSeparator />
            <MenubarLabel>{t("header.view.display")}</MenubarLabel>
            <MenubarCheckboxItem
              checked={settings.view.navigation}
              onChange={(v: boolean) => withTransition(() => setSettings("view", "navigation", v))}
              class="max-lg:hidden"
            >
              <FaSolidFolderTree />
              {t("header.view.navigation")}
            </MenubarCheckboxItem>
            <MenubarCheckboxItem
              checked={settings.view.preview}
              onChange={(v: boolean) => withTransition(() => setSettings("view", "preview", v))}
              class="max-xl:hidden"
            >
              <FaSolidMagnifyingGlass />
              {t("header.view.preview")}
            </MenubarCheckboxItem>
            <MenubarCheckboxItem checked={settings.view.extension} onChange={(v: boolean) => setSettings("view", "extension", v)}>
              <FaSolidFileCode />
              {t("header.view.extension")}
            </MenubarCheckboxItem>
            <MenubarCheckboxItem checked={settings.view.hidden} onChange={(v: boolean) => setSettings("view", "hidden", v)}>
              <FaSolidEyeSlash />
              {t("header.view.hidden")}
            </MenubarCheckboxItem>
            <MenubarCheckboxItem checked={settings.view.thumbnails} onChange={(v: boolean) => setSettings("view", "thumbnails", v)}>
              <FaSolidImage />
              {t("header.view.thumbnails")}
            </MenubarCheckboxItem>
            <MenubarSeparator />
            <MenubarItem disabled={panels().length >= MAX_PANELS} onSelect={() => withTransition(() => addPanel())} class="max-md:hidden">
              <VsSplitHorizontal />
              {t("header.view.split")}
              <MenubarShortcut>{combo(ALT, "T")}</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* Select */}
        <MenubarMenu>
          <MenubarTrigger>
            <FaSolidObjectGroup />
            <span class="hidden sm:inline">{t("header.select.title")}</span>
          </MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem checked={!!panel()?.state.selectionMode} onChange={(v: boolean) => panel()?.setSelectionMode(v)}>
              <FaSolidObjectGroup />
              {t("header.select.mode")}
            </MenubarCheckboxItem>
            <MenubarSeparator />
            <MenubarLabel>{t("header.select.tools")}</MenubarLabel>
            <MenubarItem onSelect={() => panel()?.selectAll()}>
              <FaSolidBorderAll />
              {t("header.select.all")}
              <MenubarShortcut>{combo(MOD, "A")}</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onSelect={() => panel()?.selectNone()}>
              <FaSolidBorderNone />
              {t("header.select.none")}
              <MenubarShortcut>Esc</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onSelect={() => panel()?.invert()}>
              <FaSolidBorderTopLeft />
              {t("header.select.invert")}
              <MenubarShortcut>{combo(MOD, "I")}</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* Settings */}
        <MenubarMenu>
          <MenubarTrigger>
            <FaSolidGear />
            <span class="hidden sm:inline">{t("header.setting.title")}</span>
          </MenubarTrigger>
          <MenubarContent>
            <MenubarLabel>
              <span class="flex items-center gap-1.5">
                <FaSolidLanguage class="size-3" />
                {t("header.setting.language")}
              </span>
            </MenubarLabel>
            <MenubarRadioGroup value={settings.prefs.language} onChange={(v: string) => setSettings("prefs", "language", v as Locale)}>
              <For each={locales}>
                {(l) => (
                  <MenubarRadioItem value={l.id}>
                    <span class="w-4 text-center">{l.flag}</span>
                    {l.name}
                  </MenubarRadioItem>
                )}
              </For>
            </MenubarRadioGroup>
            <MenubarSeparator />
            <MenubarItem onSelect={() => openInfoDialog("preferences")}>
              <FaSolidWrench />
              {t("header.setting.preferences")}
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* Help */}
        <MenubarMenu>
          <MenubarTrigger>
            <FaSolidInfo />
            <span class="hidden sm:inline">{t("header.about.title")}</span>
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem onSelect={() => openInfoDialog("shortcuts")}>
              <FaSolidKeyboard />
              {t("header.about.shortcuts")}
              <MenubarShortcut>?</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onSelect={() => window.open("https://github.com/help-14/mountain", "_blank", "noopener")}>
              <FaSolidBookOpen />
              {t("header.about.documentation")}
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onSelect={() => openInfoDialog("about")}>
              <FaSolidCircleInfo />
              {t("header.about.about")}
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <div class="flex-1" />

      <TaskIndicator />

      <Show when={panels().length < MAX_PANELS}>
        <IconButton
          label={t("nav.addPanel")}
          shortcut={combo(ALT, "T")}
          class="max-md:hidden"
          onClick={() => withTransition(() => addPanel())}
        >
          <VsSplitHorizontal />
        </IconButton>
      </Show>
    </header>
  )
}
