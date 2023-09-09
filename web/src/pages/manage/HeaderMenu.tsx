import { useI18n } from '@solid-primitives/i18n'
import { Component } from 'solid-js'
import IconLabel from '../../components/IconLabel'
import { IoAddCircle } from 'solid-icons/io'
import {
  FaSolidSort,
  FaSolidFont,
  FaSolidCalendar,
  FaSolidFileSignature,
  FaSolidEye,
  FaSolidList,
  FaSolidGrip,
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
  FaSolidFolderTree,
} from 'solid-icons/fa'
import { AiOutlineSortAscending, AiOutlineSortDescending } from 'solid-icons/ai'
import { Drawer } from 'flowbite'
import HStack from '../../components/HStack'
import MenuTrigger from '../../components/MenuTrigger'
import MenuLabel from '../../components/MenuLabel'
import MenuSwitch from '../../components/MenuSwitch'
import { sortSettings, viewSettings } from '../../utils/settings'
import viewModeSignal from '../../signals/viewMode'
import { drawerOptions, refreshPage } from '../../utils/ui'
import selectionToolBus from '../../signals/selectionTool'
import addPanelBus from '../../signals/addListingPanel'
import selectionModeSignal from '../../signals/selectionMode'
import MenuButton from '../../components/MenuButton'

const HeaderMenu: Component = () => {
  const [t] = useI18n()

  const [sort, setSort] = sortSettings()
  const setSortBy = (value: string) => {
    setSort({ ...sort, by: value })
    refreshPage()
  }
  const setSortOrder = (value: number) => {
    setSort({ ...sort, order: value })
    refreshPage()
  }
  const setSortGroup = (value: boolean) => {
    setSort({ ...sort, group: value })
    refreshPage()
  }

  const [view, setView] = viewSettings()
  const [ViewMode, signalViewMode] = viewModeSignal
  signalViewMode(view.as)
  const setViewAs = (value: string) => {
    setView({ ...view, as: value })
    signalViewMode(value)
  }

  const [selectionMode, setSelectionMode] = selectionModeSignal

  return (
    <div class="z-10 p-1 uk-padding-small w-full flex">
      <HStack grow={true}>
        <button
          class="text-menu bg-900 hover:bg-hover focus:outline-none font-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center sm:hidden"
          onclick={() => new Drawer(document.getElementById('sidebar'), { ...drawerOptions, placement: 'left' }).show()}
          type="button">
          <FaSolidFolderTree fill="#849289" size="1.3em" />
        </button>

        {/* Sort */}
        <MenuTrigger
          title={<IconLabel icon={<FaSolidSort fill="#849289" />} label={t('header.sort.title')} responsive={true} />}>
          <MenuSwitch
            icon={<FaSolidFileCode fill="#849289" />}
            label={t('header.sort.group')}
            value={sort.group}
            valueChanged={(value: boolean) => setSortGroup(value)}
          />
          <MenuLabel>{t('header.sort.by')}</MenuLabel>
          <IconLabel
            padding={true}
            icon={<FaSolidFont fill="#849289" />}
            label={t('header.sort.name')}
            handleClick={() => setSortBy('name')}
          />
          <IconLabel
            padding={true}
            icon={<FaSolidCalendar fill="#849289" />}
            label={t('header.sort.date')}
            handleClick={() => setSortBy('date')}
          />
          <IconLabel
            padding={true}
            icon={<FaSolidFileSignature fill="#849289" />}
            label={t('header.sort.type')}
            handleClick={() => setSortBy('type')}
          />
          <MenuLabel>{t('header.sort.on')}</MenuLabel>
          <IconLabel
            padding={true}
            icon={<AiOutlineSortAscending fill="#849289" />}
            label={t('header.sort.asc')}
            handleClick={() => setSortOrder(0)}
          />
          <IconLabel
            padding={true}
            icon={<AiOutlineSortDescending fill="#849289" />}
            label={t('header.sort.des')}
            handleClick={() => setSortOrder(1)}
          />
        </MenuTrigger>

        {/* View */}
        <MenuTrigger
          title={<IconLabel icon={<FaSolidEye fill="#849289" />} label={t('header.view.title')} responsive={true} />}>
          <MenuLabel>{t('header.view.as')}</MenuLabel>
          <IconLabel
            padding={true}
            icon={<FaSolidList fill="#849289" />}
            label={t('header.view.list')}
            handleClick={() => setViewAs('list')}
          />
          <IconLabel
            padding={true}
            icon={<FaSolidGrip fill="#849289" />}
            label={t('header.view.tiles')}
            handleClick={() => setViewAs('tile')}
          />
          <MenuLabel>{t('header.view.display')}</MenuLabel>
          <MenuSwitch
            icon={<FaSolidFolderTree fill="#849289" />}
            label={t('header.view.navigation')}
            value={view.navigation}
          />
          <MenuSwitch
            icon={<FaSolidMagnifyingGlass fill="#849289" />}
            label={t('header.view.preview')}
            value={view.preview}
          />
          <MenuSwitch
            icon={<FaSolidFileCode fill="#849289" />}
            label={t('header.view.extension')}
            value={view.extension}
          />
        </MenuTrigger>

        {/* Select */}
        <MenuTrigger
          title={
            <IconLabel
              icon={<FaSolidObjectGroup fill="#849289" />}
              label={t('header.select.title')}
              responsive={true}
            />
          }>
          <MenuSwitch
            icon={<FaRegularSquareCheck fill="#849289" />}
            label={t('header.select.mode')}
            value={selectionMode()}
            valueChanged={(value: boolean) => setSelectionMode(value)}
          />
          <MenuLabel>{t('header.select.tools')}</MenuLabel>
          <IconLabel
            padding={true}
            icon={<FaSolidBorderAll fill="#849289" />}
            label={t('header.select.all')}
            handleClick={() => selectionToolBus.emit('all')}
          />
          <IconLabel
            padding={true}
            icon={<FaSolidBorderNone fill="#849289" />}
            label={t('header.select.none')}
            handleClick={() => selectionToolBus.emit('none')}
          />
          <IconLabel
            padding={true}
            icon={<FaSolidBorderTopLeft fill="#849289" />}
            label={t('header.select.invert')}
            handleClick={() => selectionToolBus.emit('invert')}
          />
        </MenuTrigger>

        {/* Setting */}
        <MenuTrigger
          title={
            <IconLabel icon={<FaSolidGear fill="#849289" />} label={t('header.setting.title')} responsive={true} />
          }>
          <IconLabel
            padding={true}
            icon={<FaSolidLanguage fill="#849289" />}
            label={t('header.setting.language')}
            handleClick={() => new Drawer(document.getElementById('drawer-language'), drawerOptions).show()}
          />
          {/* <IconLabel icon={<FaSolidGear fill="#849289" />} label={t('header.setting.title')} /> */}
        </MenuTrigger>

        {/* About */}
        <MenuTrigger
          title={<IconLabel icon={<FaSolidInfo fill="#849289" />} label={t('header.about.title')} responsive={true} />}>
          <IconLabel
            padding={true}
            icon={<FaSolidKeyboard fill="#849289" />}
            label={t('header.about.shortcuts')}
            handleClick={() => new Drawer(document.getElementById('drawer-shortcut'), drawerOptions).show()}
          />
          <IconLabel
            padding={true}
            icon={<FaSolidBookOpen fill="#849289" />}
            label={t('header.about.documentation')}
            handleClick={() => window.open('http://mountain.help14.com', '_blank')}
          />
          <IconLabel
            padding={true}
            icon={<FaSolidWrench fill="#849289" />}
            label={t('header.about.update')}
            handleClick={() => window.open('https://github.com/help-14/mountain/releases', '_blank')}
          />
        </MenuTrigger>
      </HStack>

      <div class="flex-row right-0 hidden sm:inline">
        <MenuButton
          title={
            <IconLabel
              icon={<IoAddCircle fill="#849289" font-size="18" />}
              label={'Add panel'}
              handleClick={() => addPanelBus.emit()}
            />
          }
        />
      </div>
    </div>
  )
}

export default HeaderMenu
