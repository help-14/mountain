import {
  Button,
  HStack,
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  Text,
  Box,
  MenuGroup,
  MenuLabel,
  Divider,
} from '@hope-ui/solid'
import { useI18n } from '@solid-primitives/i18n'
import { Component } from 'solid-js'
import { IconCaretDown } from './icons/IconCaretDown'
import {
  faSort,
  faGear,
  faLanguage,
  faFont,
  faCalendar,
  faFileSignature,
  faArrowDownAZ,
  faArrowUpAZ,
  faEye,
  faList,
  faGrip,
  faFolderTree,
  faMagnifyingGlass,
  faFileCode,
  faObjectGroup,
  faBorderTopLeft,
  faBorderNone,
  faBorderAll,
  faInfo,
  faBookOpen,
  faKeyboard,
  faWrench,
} from '@fortawesome/free-solid-svg-icons'
import IconLabel from './IconLabel'

const HeaderMenu: Component = () => {
  const [t, { add, locale, dict }] = useI18n()

  return (
    <Box pos="fixed" w="100%" zIndex={2}>
      <HStack spacing="$4">
        {/* Sort */}
        <Menu>
          <MenuTrigger as={Button} variant="subtle" colorScheme="neutral" rightIcon={<IconCaretDown boxSize="$6" />}>
            <IconLabel icon={faSort} label={t('header.sort.title')} />
          </MenuTrigger>
          <MenuContent>
            <MenuGroup>
              <MenuLabel>{t('header.sort.by')}</MenuLabel>
              <MenuItem>
                <IconLabel icon={faFont} label={t('header.sort.name')} />
              </MenuItem>
              <MenuItem>
                <IconLabel icon={faCalendar} label={t('header.sort.date')} />
              </MenuItem>
              <MenuItem>
                <IconLabel icon={faFileSignature} label={t('header.sort.type')} />
              </MenuItem>
            </MenuGroup>
            <Divider />
            <MenuGroup>
              <MenuLabel>{t('header.sort.on')}</MenuLabel>
              <MenuItem>
                <IconLabel icon={faArrowDownAZ} label={t('header.sort.asc')} />
              </MenuItem>
              <MenuItem>
                <IconLabel icon={faArrowUpAZ} label={t('header.sort.des')} />
              </MenuItem>
            </MenuGroup>
          </MenuContent>
        </Menu>

        {/* View */}
        <Menu>
          <MenuTrigger as={Button} variant="subtle" colorScheme="neutral" rightIcon={<IconCaretDown boxSize="$6" />}>
            <IconLabel icon={faEye} label={t('header.view.title')} />
          </MenuTrigger>
          <MenuContent>
            <MenuGroup>
              <MenuLabel>{t('header.view.as')}</MenuLabel>
              <MenuItem>
                <IconLabel icon={faList} label={t('header.view.list')} />
              </MenuItem>
              <MenuItem>
                <IconLabel icon={faGrip} label={t('header.view.tiles')} />
              </MenuItem>
            </MenuGroup>
            <Divider />
            <MenuGroup>
              <MenuLabel>{t('header.view.display')}</MenuLabel>
              <MenuItem>
                <IconLabel icon={faFolderTree} label={t('header.view.navigation')} />
              </MenuItem>
              <MenuItem>
                <IconLabel icon={faMagnifyingGlass} label={t('header.view.preview')} />
              </MenuItem>
              <MenuItem>
                <IconLabel icon={faFileCode} label={t('header.view.extension')} />
              </MenuItem>
            </MenuGroup>
          </MenuContent>
        </Menu>

        {/* Select */}
        <Menu>
          <MenuTrigger as={Button} variant="subtle" colorScheme="neutral" rightIcon={<IconCaretDown boxSize="$6" />}>
            <IconLabel icon={faObjectGroup} label={t('header.select.title')} />
          </MenuTrigger>
          <MenuContent>
            <MenuItem>
              <IconLabel icon={faBorderAll} label={t('header.select.all')} />
            </MenuItem>
            <MenuItem>
              <IconLabel icon={faBorderNone} label={t('header.select.all')} />
            </MenuItem>
            <MenuItem>
              <IconLabel icon={faBorderTopLeft} label={t('header.select.invert')} />
            </MenuItem>
          </MenuContent>
        </Menu>

        {/* Setting */}
        <Menu>
          <MenuTrigger as={Button} variant="subtle" colorScheme="neutral" rightIcon={<IconCaretDown boxSize="$6" />}>
            <IconLabel icon={faGear} label={t('header.setting.title')} />
          </MenuTrigger>
          <MenuContent>
            <MenuItem>
              <IconLabel icon={faLanguage} label={t('header.setting.language')} />
            </MenuItem>
            <MenuItem>
              <IconLabel icon={faGear} label={t('header.setting.title')} />
            </MenuItem>
          </MenuContent>
        </Menu>

        {/* About */}
        <Menu>
          <MenuTrigger as={Button} variant="subtle" colorScheme="neutral" rightIcon={<IconCaretDown boxSize="$6" />}>
            <IconLabel icon={faInfo} label={t('header.about.title')} />
          </MenuTrigger>
          <MenuContent>
            <MenuItem>
              <IconLabel icon={faKeyboard} label={t('header.about.shortcuts')} />
            </MenuItem>
            <MenuItem>
              <IconLabel icon={faBookOpen} label={t('header.about.documentation')} />
            </MenuItem>
            <Divider />
            <MenuItem>
              <IconLabel icon={faWrench} label={t('header.about.update')} />
            </MenuItem>
          </MenuContent>
        </Menu>
      </HStack>
    </Box>
  )
}

export default HeaderMenu
