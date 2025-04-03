export function refreshPage() {
  location.reload()
}

export const drawerOptions = {
  placement: 'right',
  backdrop: true,
  bodyScrolling: false,
  edge: false,
  edgeOffset: '',
  backdropClasses: 'bg-900 bg-opacity-70 fixed inset-0 z-30',
  // onHide: () => {
  //   console.log('drawer is hidden')
  // },
  // onShow: () => {
  //   console.log('drawer is shown')
  // },
  // onToggle: () => {
  //   console.log('drawer has been toggled')
  // },
}
