import { useI18n } from '@solid-primitives/i18n'
import { Component } from 'solid-js'
import IconLabel from '../../components/IconLabel'
import {
  FaSolidSort,
  FaSolidFont,
  FaSolidCalendar,
  FaSolidFileSignature,
  FaSolidArrowUpAZ,
  FaSolidArrowDownAZ,
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
} from 'solid-icons/fa'
import HStack from '../../components/HStack'
import MenuTrigger from '../../components/MenuTrigger'
import MenuLabel from '../../components/MenuLabel'
import MenuSwitch from '../../components/MenuSwitch'

const HeaderMenu: Component = () => {
  const [t] = useI18n()

  return (
    <div class="z-10 text-white uk-padding-small w-full">
      <HStack>
        {/* Sort */}
        <MenuTrigger title={<IconLabel icon={<FaSolidSort />} label={t('header.sort.title')} />}>
          <MenuLabel>{t('header.sort.by')}</MenuLabel>
          <IconLabel icon={<FaSolidFont />} label={t('header.sort.name')} />
          <IconLabel icon={<FaSolidCalendar />} label={t('header.sort.date')} />
          <IconLabel icon={<FaSolidFileSignature />} label={t('header.sort.type')} />
        </MenuTrigger>

        {/* View */}
        <MenuTrigger title={<IconLabel icon={<FaSolidEye />} label={t('header.view.title')} />}>
          <MenuLabel>{t('header.view.as')}</MenuLabel>
          <IconLabel icon={<FaSolidList />} label={t('header.view.list')} />
          <IconLabel icon={<FaSolidGrip />} label={t('header.view.tiles')} />
          <MenuLabel>{t('header.view.display')}</MenuLabel>
          <MenuSwitch icon={<FaSolidFolderTree />} label={t('header.view.navigation')} />
          <MenuSwitch icon={<FaSolidMagnifyingGlass />} label={t('header.view.preview')} />
          <MenuSwitch icon={<FaSolidFileCode />} label={t('header.view.extension')} />
        </MenuTrigger>

        {/* Select */}
        <MenuTrigger title={<IconLabel icon={<FaSolidObjectGroup />} label={t('header.select.title')} />}>
          <IconLabel icon={<FaSolidBorderAll />} label={t('header.select.all')} />
          <IconLabel icon={<FaSolidBorderNone />} label={t('header.select.all')} />
          <IconLabel icon={<FaSolidBorderTopLeft />} label={t('header.select.invert')} />
        </MenuTrigger>

        {/* Setting */}
        <MenuTrigger title={<IconLabel icon={<FaSolidGear />} label={t('header.setting.title')} />}>
          <IconLabel icon={<FaSolidLanguage />} label={t('header.setting.language')} />
          <IconLabel icon={<FaSolidGear />} label={t('header.setting.title')} />
        </MenuTrigger>

        {/* About */}
        <MenuTrigger title={<IconLabel icon={<FaSolidInfo />} label={t('header.about.title')} />}>
          <IconLabel icon={<FaSolidKeyboard />} label={t('header.about.shortcuts')} />
          <IconLabel icon={<FaSolidBookOpen />} label={t('header.about.documentation')} />
          <IconLabel icon={<FaSolidWrench />} label={t('header.about.update')} />
        </MenuTrigger>
      </HStack>
    </div>
  )
}

export default HeaderMenu
