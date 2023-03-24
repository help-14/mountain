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
} from '@fortawesome/free-solid-svg-icons'
import IconLabel from './IconLabel'

const HeaderMenu: Component = () => {
  const [t, { add, locale, dict }] = useI18n()

  return (
    <Box pos="fixed" w="100%" zIndex={2}>
      <HStack spacing="$4">
        <Menu>
          <MenuTrigger as={Button} variant="subtle" colorScheme="neutral" rightIcon={<IconCaretDown boxSize="$6" />}>
            <IconLabel icon={faSort} label={t('header.sort.title')} />
          </MenuTrigger>
          <MenuContent>
            <MenuGroup>
              <MenuLabel>{t('header.sort.title')}</MenuLabel>
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
            <MenuGroup>
              <MenuLabel>Profile</MenuLabel>
              <MenuItem>
                <IconLabel icon={faArrowDownAZ} label={t('header.sort.asc')} />
              </MenuItem>
              <MenuItem>
                <IconLabel icon={faArrowUpAZ} label={t('header.sort.des')} />
              </MenuItem>
            </MenuGroup>
          </MenuContent>
        </Menu>

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
      </HStack>
    </Box>
  )
}

export default HeaderMenu
