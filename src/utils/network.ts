import { combinePath, utf8_to_b64 } from './data'
import { DEV } from 'solid-js'
import { isServer } from 'solid-js/web'

const handleFetch = async (response: Response): Promise<any> => {
  const data = await response.json()
  if (response.ok) {
    return data
  } else {
    const errText = data?.error || (await response.text())
    console.error(errText)
    throw new Error(errText)
  }
}

const getServerUrl = (url: string): string => {
  if (DEV && !isServer) {
    return combinePath('http://localhost:8080', url)
  }
  return url
}

const commonHeaders = (): Partial<RequestInit> => ({
  cache: 'no-cache',
  headers: { 'Content-Type': 'application/json' },
})

export const get = (url: string): Promise<any> => fetch(getServerUrl(url), commonHeaders()).then(handleFetch)

export const post = (url: string, data: any): Promise<any> =>
  fetch(getServerUrl(url), {
    method: 'POST',
    ...commonHeaders(),
    body: JSON.stringify(data),
  }).then(handleFetch)

export const doGetLanguage = (lang: string) => get(`/assets/languages/${lang}.json`)
export const doGetIoTasks = () => get('/api/queue/io')

export const goGetDirectoriesFromPath = (path: string) => get(`/api/get?directory=true&path=${utf8_to_b64(path)}`)
export const doGetFilesFromPath = (path: string) => get(`/api/get?path=${utf8_to_b64(path)}`)

export const doCreateFile = (path: string, name: string, content: any) =>
  post(`/api/create`, { path, name, content, directory: false })
export const doCreateFolder = (path: string, name: string) =>
  post(`/api/create`, { path, name, content: '', directory: true })

export const doDeleteFiles = (paths: string) => post(`/api/delete`, paths)
export const doRenameFiles = (data: string) => post(`/api/rename`, data)
export const doCopyFiles = (data: string) => post(`/api/copy`, data)
export const doMoveFiles = (data: string) => post(`/api/move`, data)

export const doCompressFiles = (name: string, path: string, type: string, files: string[]) =>
  post(`/api/compress`, { name, path, type, files })

// function fetchFile(url: string) {
//   try {
//     var a = document.createElement('a')
//     a.href = url
//     a.target = '_blank'
//     fileName = url.split('/').pop()
//     a.download = fileName
//     document.body.appendChild(a)
//     a.click()
//     window.URL.revokeObjectURL(url)
//     a.remove()
//   } catch (err) {
//     showToast(err.message)
//   }
// }

// function download() {
//   let selected = this.files.filter(f => f.selected).map(f => f.name)
//   if (selected.length === 0) return
//   let data = selected.map(n => joinPath(currentPath, n))
//   data.forEach(url => fetchFile(`/api/download?path=${utf8_to_b64(url)}`))
// }

// var pendingUploads = []

// function upload() {
//   let input = document.createElement('input')
//   input.type = 'file'
//   input.setAttribute('multiple', 'multiple')
//   input.onchange = _ => {
//     let files = Array.from(input.files)
//     files.forEach(f => pendingUploads.push({ path: currentPath, file: f, complete: false }))
//     doUpload()
//   }
//   input.click()
// }

// function doUpload() {
//   updateUploadToast()
//   const task = pendingUploads.find(u => u.complete === false)
//   if (!task) {
//     showToast(
//       AlpineI18n.t('upload.completedMessage').replace('{0}', pendingUploads.length),
//       AlpineI18n.t('upload.completed')
//     )
//     pendingUploads = []
//     updateUploadToast()
//     return
//   }

//   const formData = new FormData()
//   formData.append('path', task.path)
//   formData.append('files', task.file)
//   fetch(`/api/upload`, { method: 'POST', body: formData }).then(async result => {
//     if (result.ok) {
//       task.complete = true
//     } else {
//       pendingUploads.push({ ...task })
//       task.complete = true
//       setTimeout(() => showToast(AlpineI18n.t('toast.error.upload') + `: ${task.file}`), 10)
//     }

//     if (currentPath === this.path) this.goto(this.path)

//     doUpload()
//   })
// }
