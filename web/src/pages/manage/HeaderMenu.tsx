import { useI18n } from '@solid-primitives/i18n'
import { Component } from 'solid-js'
import IconLabel from '../../components/IconLabel'
import {
  FaSolidSort,
  FaSolidFont,
  FaSolidCalendar,
  FaSolidFileSignature,
  FaSolidEye,
  FaSolidList,
  FaSolidGrip,
  FaSolidFolderTree,
  FaSolidMagnifyingGlass,
  FaSolidFileCode,
  FaSolidObjectGroup,
  FaSolidBorderAll,
  FaSolidBorderNone,
  FaSolidBorderTopLeft,
  FaSolidGear,
  FaSolidLanguage,
  FaSolidInfo,
  FaSolidKeyboard,
  FaSolidBookOpen,
  FaSolidWrench,
  FaRegularSquareCheck,
} from 'solid-icons/fa'
import HStack from '../../components/HStack'
import MenuTrigger from '../../components/MenuTrigger'
import MenuLabel from '../../components/MenuLabel'
import MenuSwitch from '../../components/MenuSwitch'
import { CgMenuLeftAlt } from 'solid-icons/cg'
import { sortSettings, viewSettings } from '../../utils/settings'
import viewModeSignal from '../../signals/viewMode'

const HeaderMenu: Component = () => {
  const [t] = useI18n()
  const [sort, setSort] = sortSettings()
  const [view, setView] = viewSettings()

  const [_, signalViewMode] = viewModeSignal
  signalViewMode(view.as)

  const setViewAs = (value: string) => {
    setView({ ...view, as: value })
    signalViewMode(value)
  }

  const setSortBy = (value: string) => {
    setSort({ ...sort, by: value })
  }

  return (
    <div class="z-10 p-1 uk-padding-small w-full">
      <HStack>
        <button
          data-drawer-target="sidebar"
          data-drawer-toggle="sidebar"
          aria-controls="sidebar"
          class="text-menu bg-900 hover:bg-hover focus:outline-none font-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center sm:hidden"
          type="button">
          <CgMenuLeftAlt size="1.5em" />
        </button>

        {/* Sort */}
        <MenuTrigger title={<IconLabel icon={<FaSolidSort fill="#849289" />} label={t('header.sort.title')} />}>
          <MenuLabel>{t('header.sort.by')}</MenuLabel>
          <IconLabel
            icon={<FaSolidFont fill="#849289" />}
            label={t('header.sort.name')}
            handleClick={() => setSortBy('name')}
          />
          <IconLabel
            icon={<FaSolidCalendar fill="#849289" />}
            label={t('header.sort.date')}
            handleClick={() => setSortBy('date')}
          />
          <IconLabel
            icon={<FaSolidFileSignature fill="#849289" />}
            label={t('header.sort.type')}
            handleClick={() => setSortBy('type')}
          />
        </MenuTrigger>

        {/* View */}
        <MenuTrigger title={<IconLabel icon={<FaSolidEye fill="#849289" />} label={t('header.view.title')} />}>
          <MenuLabel>{t('header.view.as')}</MenuLabel>
          <IconLabel
            icon={<FaSolidList fill="#849289" />}
            label={t('header.view.list')}
            handleClick={() => setViewAs('list')}
          />
          <IconLabel
            icon={<FaSolidGrip fill="#849289" />}
            label={t('header.view.tiles')}
            handleClick={() => setViewAs('tile')}
          />
          <MenuLabel>{t('header.view.display')}</MenuLabel>
          <MenuSwitch icon={<FaSolidFolderTree fill="#849289" />} label={t('header.view.navigation')} />
          <MenuSwitch icon={<FaSolidMagnifyingGlass fill="#849289" />} label={t('header.view.preview')} />
          <MenuSwitch icon={<FaSolidFileCode fill="#849289" />} label={t('header.view.extension')} />
        </MenuTrigger>

        {/* Select */}
        <MenuTrigger
          title={<IconLabel icon={<FaSolidObjectGroup fill="#849289" />} label={t('header.select.title')} />}>
          <MenuSwitch icon={<FaRegularSquareCheck fill="#849289" />} label={t('header.select.mode')} />
          <MenuLabel>{t('header.select.tools')}</MenuLabel>
          <IconLabel icon={<FaSolidBorderAll fill="#849289" />} label={t('header.select.all')} />
          <IconLabel icon={<FaSolidBorderNone fill="#849289" />} label={t('header.select.none')} />
          <IconLabel icon={<FaSolidBorderTopLeft fill="#849289" />} label={t('header.select.invert')} />
        </MenuTrigger>

        {/* Setting */}
        <MenuTrigger title={<IconLabel icon={<FaSolidGear fill="#849289" />} label={t('header.setting.title')} />}>
          <li>
            <a
              data-drawer-target="drawer-language"
              data-drawer-show="drawer-language"
              aria-controls="drawer-language"
              data-drawer-placement="right"
              href="#"
              class="block px-4 py-2 hover:bg-hover">
              <IconLabel icon={<FaSolidLanguage fill="#849289" />} label={t('header.setting.language')} />
            </a>
          </li>
          <IconLabel icon={<FaSolidGear fill="#849289" />} label={t('header.setting.title')} />
        </MenuTrigger>

        {/* About */}
        <MenuTrigger title={<IconLabel icon={<FaSolidInfo fill="#849289" />} label={t('header.about.title')} />}>
          <IconLabel icon={<FaSolidKeyboard fill="#849289" />} label={t('header.about.shortcuts')} />
          <IconLabel icon={<FaSolidBookOpen fill="#849289" />} label={t('header.about.documentation')} />
          <IconLabel icon={<FaSolidWrench fill="#849289" />} label={t('header.about.update')} />
        </MenuTrigger>
      </HStack>
    </div>
  )
}

export default HeaderMenu
