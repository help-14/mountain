import { Component } from 'solid-js'
import { t } from '../../utils/language'

const ShortcutDrawer: Component = () => {
  return (
    <div
      id="drawer-shortcut"
      class="fixed top-0 right-0 z-40 h-screen p-4 overflow-y-auto transition-transform translate-x-full w-80 bg-500"
      tabindex="-1"
      aria-labelledby="drawer-right-label">
      <h5 class="inline-flex items-center mb-4 text-base font-semibold text-code">{t('header.about.shortcuts')}</h5>
      <div class="grid grid-cols-1">
        <table class="table text-code mt-5">
          <thead>
            <tr>
              <th scope="col" colspan="2" class="text-left my-3">
                {t('header.select.title')}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <span class="bg-500 text-xs font-medium mr-2 px-2.5 py-0.5 rounded border border-code">Ctrl</span>
                <span class="bg-500 text-xs font-medium mr-2 px-2.5 py-0.5 rounded border border-code">A</span>
              </td>
              <td>{t('header.select.all')}</td>
            </tr>
            <tr>
              <td>
                <span class="bg-500 text-xs font-medium mr-2 px-2.5 py-0.5 rounded border border-code">Ctrl</span>
                <span class="bg-500 text-xs font-medium mr-2 px-2.5 py-0.5 rounded border border-code">I</span>
              </td>
              <td>{t('header.select.invert')}</td>
            </tr>
            <tr>
              <td>
                <span class="bg-500 text-xs font-medium mr-2 px-2.5 py-0.5 rounded border border-code">Esc</span>
              </td>
              <td>{t('header.select.none')}</td>
            </tr>
            <tr x-show="false">
              <td>
                <span class="bg-500 text-xs font-medium mr-2 px-2.5 py-0.5 rounded border border-code">Ctrl</span>
                <span class="bg-500 text-xs font-medium mr-2 px-2.5 py-0.5 rounded border border-code">P</span>
              </td>
              <td>{t('search.title')}</td>
            </tr>
          </tbody>
        </table>

        <table class="table text-code mt-5">
          <thead>
            <tr>
              <th scope="col" colspan="2" class="text-left my-3">
                {t('modals.shortcuts.operations')}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <span class="bg-500 text-xs font-medium mr-2 px-2.5 py-0.5 rounded border border-code">Ctrl</span>
                <span class="bg-500 text-xs font-medium mr-2 px-2.5 py-0.5 rounded border border-code">R</span>
              </td>
              <td>{t('modals.rename.title')}</td>
            </tr>
            <tr>
              <td>
                <span class="bg-500 text-xs font-medium mr-2 px-2.5 py-0.5 rounded border border-code">Ctrl</span>
                <span class="bg-500 text-xs font-medium mr-2 px-2.5 py-0.5 rounded border border-code">X</span>
              </td>
              <td>{t('modals.selectDestination.move')}</td>
            </tr>
            <tr>
              <td>
                <span class="bg-500 text-xs font-medium mr-2 px-2.5 py-0.5 rounded border border-code">Ctrl</span>
                <span class="bg-500 text-xs font-medium mr-2 px-2.5 py-0.5 rounded border border-code">C</span>
              </td>
              <td>{t('modals.selectDestination.copy')}</td>
            </tr>
            <tr>
              <td>
                <span class="bg-500 text-xs font-medium mr-2 px-2.5 py-0.5 rounded border border-code">Backspace</span>/
                <span class="bg-500 text-xs font-medium ml-2 mr-2 px-2.5 py-0.5 rounded border border-code">
                  Delete
                </span>
              </td>
              <td>{t('modals.delete.title')}</td>
            </tr>
            <tr>
              <td>
                <span class="bg-500 text-xs font-medium mr-2 px-2.5 py-0.5 rounded border border-code">Ctrl</span>
                <span class="bg-500 text-xs font-medium mr-2 px-2.5 py-0.5 rounded border border-code">D</span>
              </td>
              <td>{t('controls.download')}</td>
            </tr>
            <tr>
              <td>
                <span class="bg-500 text-xs font-medium mr-2 px-2.5 py-0.5 rounded border border-code">Ctrl</span>
                <span class="bg-500 text-xs font-medium mr-2 px-2.5 py-0.5 rounded border border-code">U</span>
              </td>
              <td>{t('controls.upload')}</td>
            </tr>
            <tr>
              <td>
                <span class="bg-500 text-xs font-medium mr-2 px-2.5 py-0.5 rounded border border-code">Ctrl</span>
                <span class="bg-500 text-xs font-medium mr-2 px-2.5 py-0.5 rounded border border-code">N</span>
              </td>
              <td>{t('modals.newFolder.title')}</td>
            </tr>
            <tr>
              <td>
                <span class="bg-500 text-xs font-medium mr-2 px-2.5 py-0.5 rounded border border-code">Ctrl</span>
                <span class="bg-500 text-xs font-medium mr-2 px-2.5 py-0.5 rounded border border-code">Shift</span>
                <span class="bg-500 text-xs font-medium mr-2 px-2.5 py-0.5 rounded border border-code">N</span>
              </td>
              <td>{t('modals.newFile.title')}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ShortcutDrawer
