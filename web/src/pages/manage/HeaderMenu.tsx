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
import MenuSpacer from '../../components/MenuSpacer'

const HeaderMenu: Component = () => {
  const [t] = useI18n()

  return (
    <div class="z-10 bg-gray-800 text-white uk-padding-small w-full">
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
          <MenuSpacer />
          <MenuLabel>{t('header.view.display')}</MenuLabel>
          <Flex>
            <IconLabel icon={<FaSolidFolderTree />} label={t('header.view.navigation')} />
            <Spacer />
            <Switch variant="outline"></Switch>
          </Flex>
          <Flex>
            <IconLabel icon={<FaSolidMagnifyingGlass />} label={t('header.view.preview')} />
            <Spacer />
            <Switch variant="outline"></Switch>
          </Flex>
          <Flex>
            <IconLabel icon={<FaSolidFileCode />} label={t('header.view.extension')} />
            <Spacer />
            <Switch variant="outline"></Switch>
          </Flex>
        </MenuTrigger>
      </HStack>
    </div>
  )
}

export default HeaderMenu

// {/* Select */}
// <Menu>
//   <MenuTrigger as={Button} variant="solid" colorScheme="accent" rightIcon={<IconCaretDown boxSize="$6" />}>
//     <IconLabel icon={<FaSolidObjectGroup />} label={t('header.select.title')} />
//   </MenuTrigger>
//   <MenuContent>
//     <MenuItem>
//       <IconLabel icon={<FaSolidBorderAll />} label={t('header.select.all')} />
//     </MenuItem>
//     <MenuItem>
//       <IconLabel icon={<FaSolidBorderNone />} label={t('header.select.all')} />
//     </MenuItem>
//     <MenuItem>
//       <IconLabel icon={<FaSolidBorderTopLeft />} label={t('header.select.invert')} />
//     </MenuItem>
//   </MenuContent>
// </Menu>

// {/* Setting */}
// <Menu>
//   <MenuTrigger as={Button} variant="solid" colorScheme="accent" rightIcon={<IconCaretDown boxSize="$6" />}>
//     <IconLabel icon={<FaSolidGear />} label={t('header.setting.title')} />
//   </MenuTrigger>
//   <MenuContent>
//     <MenuItem>
//       <IconLabel icon={<FaSolidLanguage />} label={t('header.setting.language')} />
//     </MenuItem>
//     <MenuItem>
//       <IconLabel icon={<FaSolidGear />} label={t('header.setting.title')} />
//     </MenuItem>
//   </MenuContent>
// </Menu>

// {/* About */}
// <Menu>
//   <MenuTrigger as={Button} variant="solid" colorScheme="accent" rightIcon={<IconCaretDown boxSize="$6" />}>
//     <IconLabel icon={<FaSolidInfo />} label={t('header.about.title')} />
//   </MenuTrigger>
//   <MenuContent>
//     <MenuItem>
//       <IconLabel icon={<FaSolidKeyboard />} label={t('header.about.shortcuts')} />
//     </MenuItem>
//     <MenuItem>
//       <IconLabel icon={<FaSolidBookOpen />} label={t('header.about.documentation')} />
//     </MenuItem>
//     <Divider />
//     <MenuItem>
//       <IconLabel icon={<FaSolidWrench />} label={t('header.about.update')} />
//     </MenuItem>
//   </MenuContent>
// </Menu>
//  */}
