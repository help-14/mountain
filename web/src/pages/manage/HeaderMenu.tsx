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
} from 'solid-icons/fa'
import HStack from '../../components/HStack'
import MenuTrigger from '../../components/MenuTrigger'
import MenuLabel from '../../components/MenuLabel'
import MenuSwitch from '../../components/MenuSwitch'

const HeaderMenu: Component = () => {
  const [t] = useI18n()

  return (
    <div class="z-10 p-1 uk-padding-small w-full">
      <HStack>
        {/* Sort */}
        <MenuTrigger title={<IconLabel icon={<FaSolidSort fill="#849289" />} label={t('header.sort.title')} />}>
          <MenuLabel>{t('header.sort.by')}</MenuLabel>
          <IconLabel icon={<FaSolidFont fill="#849289" />} label={t('header.sort.name')} />
          <IconLabel icon={<FaSolidCalendar fill="#849289" />} label={t('header.sort.date')} />
          <IconLabel icon={<FaSolidFileSignature fill="#849289" />} label={t('header.sort.type')} />
        </MenuTrigger>

        {/* View */}
        <MenuTrigger title={<IconLabel icon={<FaSolidEye fill="#849289" />} label={t('header.view.title')} />}>
          <MenuLabel>{t('header.view.as')}</MenuLabel>
          <IconLabel icon={<FaSolidList fill="#849289" />} label={t('header.view.list')} />
          <IconLabel icon={<FaSolidGrip fill="#849289" />} label={t('header.view.tiles')} />
          <MenuLabel>{t('header.view.display')}</MenuLabel>
          <MenuSwitch icon={<FaSolidFolderTree fill="#849289" />} label={t('header.view.navigation')} />
          <MenuSwitch icon={<FaSolidMagnifyingGlass fill="#849289" />} label={t('header.view.preview')} />
          <MenuSwitch icon={<FaSolidFileCode fill="#849289" />} label={t('header.view.extension')} />
        </MenuTrigger>

        {/* Select */}
        <MenuTrigger
          title={<IconLabel icon={<FaSolidObjectGroup fill="#849289" />} label={t('header.select.title')} />}>
          <IconLabel icon={<FaSolidBorderAll fill="#849289" />} label={t('header.select.all')} />
          <IconLabel icon={<FaSolidBorderNone fill="#849289" />} label={t('header.select.all')} />
          <IconLabel icon={<FaSolidBorderTopLeft fill="#849289" />} label={t('header.select.invert')} />
        </MenuTrigger>

        {/* Setting */}
        <MenuTrigger title={<IconLabel icon={<FaSolidGear fill="#849289" />} label={t('header.setting.title')} />}>
          <IconLabel icon={<FaSolidLanguage fill="#849289" />} label={t('header.setting.language')} />
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
