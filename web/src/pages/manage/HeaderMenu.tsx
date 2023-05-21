import {
  Button,
  HStack,
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  Switch,
  Flex,
  Box,
  MenuGroup,
  MenuLabel,
  Divider,
  Spacer,
} from '@hope-ui/solid'
import { useI18n } from '@solid-primitives/i18n'
import { Component } from 'solid-js'
import { IconCaretDown } from '../../components/icons/IconCaretDown'
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

const HeaderMenu: Component = () => {
  const [t] = useI18n()

  return (
    <Box w="100%" zIndex={10} bg="$accent9" color="white" padding="$2">
      <HStack spacing="$4">
        {/* Sort */}
        <Menu>
          <MenuTrigger as={Button} variant="solid" colorScheme="accent" rightIcon={<IconCaretDown boxSize="$6" />}>
            <IconLabel icon={<FaSolidSort />} label={t('header.sort.title')} />
          </MenuTrigger>
          <MenuContent>
            <MenuGroup>
              <MenuLabel>{t('header.sort.by')}</MenuLabel>
              <MenuItem>
                <IconLabel icon={<FaSolidFont />} label={t('header.sort.name')} />
              </MenuItem>
              <MenuItem>
                <IconLabel icon={<FaSolidCalendar />} label={t('header.sort.date')} />
              </MenuItem>
              <MenuItem>
                <IconLabel icon={<FaSolidFileSignature />} label={t('header.sort.type')} />
              </MenuItem>
            </MenuGroup>
            <Divider />
            <MenuGroup>
              <MenuLabel>{t('header.sort.on')}</MenuLabel>
              <MenuItem>
                <IconLabel icon={<FaSolidArrowDownAZ />} label={t('header.sort.asc')} />
              </MenuItem>
              <MenuItem>
                <IconLabel icon={<FaSolidArrowUpAZ />} label={t('header.sort.des')} />
              </MenuItem>
            </MenuGroup>
          </MenuContent>
        </Menu>

        {/* View */}
        <Menu>
          <MenuTrigger as={Button} variant="solid" colorScheme="accent" rightIcon={<IconCaretDown boxSize="$6" />}>
            <IconLabel icon={<FaSolidEye />} label={t('header.view.title')} />
          </MenuTrigger>
          <MenuContent>
            <MenuGroup>
              <MenuLabel>{t('header.view.as')}</MenuLabel>
              <MenuItem>
                <IconLabel icon={<FaSolidList />} label={t('header.view.list')} />
              </MenuItem>
              <MenuItem>
                <IconLabel icon={<FaSolidGrip />} label={t('header.view.tiles')} />
              </MenuItem>
            </MenuGroup>
            <Divider />
            <MenuGroup>
              <MenuLabel>{t('header.view.display')}</MenuLabel>
              <MenuItem>
                <Flex>
                  <IconLabel icon={<FaSolidFolderTree />} label={t('header.view.navigation')} />
                  <Spacer />
                  <Switch variant="outline"></Switch>
                </Flex>
              </MenuItem>
              <MenuItem>
                <Flex>
                  <IconLabel icon={<FaSolidMagnifyingGlass />} label={t('header.view.preview')} />
                  <Spacer />
                  <Switch variant="outline"></Switch>
                </Flex>
              </MenuItem>
              <MenuItem>
                <Flex>
                  <IconLabel icon={<FaSolidFileCode />} label={t('header.view.extension')} />
                  <Spacer />
                  <Switch variant="outline"></Switch>
                </Flex>
              </MenuItem>
            </MenuGroup>
          </MenuContent>
        </Menu>

        {/* Select */}
        <Menu>
          <MenuTrigger as={Button} variant="solid" colorScheme="accent" rightIcon={<IconCaretDown boxSize="$6" />}>
            <IconLabel icon={<FaSolidObjectGroup />} label={t('header.select.title')} />
          </MenuTrigger>
          <MenuContent>
            <MenuItem>
              <IconLabel icon={<FaSolidBorderAll />} label={t('header.select.all')} />
            </MenuItem>
            <MenuItem>
              <IconLabel icon={<FaSolidBorderNone />} label={t('header.select.all')} />
            </MenuItem>
            <MenuItem>
              <IconLabel icon={<FaSolidBorderTopLeft />} label={t('header.select.invert')} />
            </MenuItem>
          </MenuContent>
        </Menu>

        {/* Setting */}
        <Menu>
          <MenuTrigger as={Button} variant="solid" colorScheme="accent" rightIcon={<IconCaretDown boxSize="$6" />}>
            <IconLabel icon={<FaSolidGear />} label={t('header.setting.title')} />
          </MenuTrigger>
          <MenuContent>
            <MenuItem>
              <IconLabel icon={<FaSolidLanguage />} label={t('header.setting.language')} />
            </MenuItem>
            <MenuItem>
              <IconLabel icon={<FaSolidGear />} label={t('header.setting.title')} />
            </MenuItem>
          </MenuContent>
        </Menu>

        {/* About */}
        <Menu>
          <MenuTrigger as={Button} variant="solid" colorScheme="accent" rightIcon={<IconCaretDown boxSize="$6" />}>
            <IconLabel icon={<FaSolidInfo />} label={t('header.about.title')} />
          </MenuTrigger>
          <MenuContent>
            <MenuItem>
              <IconLabel icon={<FaSolidKeyboard />} label={t('header.about.shortcuts')} />
            </MenuItem>
            <MenuItem>
              <IconLabel icon={<FaSolidBookOpen />} label={t('header.about.documentation')} />
            </MenuItem>
            <Divider />
            <MenuItem>
              <IconLabel icon={<FaSolidWrench />} label={t('header.about.update')} />
            </MenuItem>
          </MenuContent>
        </Menu>
      </HStack>
    </Box>
  )
}

export default HeaderMenu
