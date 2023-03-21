async function handleFetch(response) {
    const data = await response.json()
    if (response.ok) {
        return data
    } else {
        const errText = data?.error || await response.text()
        setTimeout(() => showToast(errText), 10); //something prevent toast to show up, setTimeout fixed it
        throw new Error(errText)
    }
}

const get = (url) => fetch(url).then(handleFetch)
const post = (url, data) => fetch(url, { method: 'POST', cache: 'no-cache', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleFetch)

const doGetLanguage = (lang) => get(`/assets/languages/${lang}.json`)
const doGetIoTasks = () => get("/api/queue/io")

const goGetDirectoriesFromPath = (path) => get(`/api/get?directory=true&path=${utf8_to_b64(path)}`)
const doGetFilesFromPath = (path) => get(`/api/get?path=${utf8_to_b64(path)}`)

const doCreateFile = (path, name, content) => post(`/api/create`, { path, name, content, directory: false })
const doCreateFolder = (path, name) => post(`/api/create`, { path, name, content: '', directory: true })

const doDeleteFiles = (paths) => post(`/api/delete`, paths)
const doRenameFiles = (data) => post(`/api/rename`, data)
const doCopyFiles = (data) => post(`/api/copy`, data)
const doMoveFiles = (data) => post(`/api/move`, data)

const doCompressFiles = (name, path, type, files) => post(`/api/compress`, { name, path, type, files })

function fetchFile(url) {
    try {
        var a = document.createElement("a");
        a.href = url;
        a.target = '_blank'
        fileName = url.split("/").pop();
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    } catch (err) {
        showToast(err.message)
    }
}

function download() {
    let selected = this.files.filter(f => f.selected).map(f => f.name)
    if (selected.length === 0)
        return
    let data = selected.map(n => joinPath(currentPath, n))
    data.forEach(url => fetchFile(`/api/download?path=${utf8_to_b64(url)}`))
}

var pendingUploads = []

function upload() {
    let input = document.createElement('input');
    input.type = "file"
    input.setAttribute('multiple', 'multiple')
    input.onchange = _ => {
        let files = Array.from(input.files);
        files.forEach(f => pendingUploads.push({ path: currentPath, file: f, complete: false }))
        doUpload()
    };
    input.click();
}

function doUpload() {
    updateUploadToast()
    const task = pendingUploads.find(u => u.complete === false);
    if (!task) {
        showToast(AlpineI18n.t('upload.completedMessage').replace('{0}', pendingUploads.length), AlpineI18n.t('upload.completed'))
        pendingUploads = []
        updateUploadToast()
        return
    }

    const formData = new FormData();
    formData.append('path', task.path)
    formData.append('files', task.file)
    fetch(`/api/upload`, { method: "POST", body: formData })
        .then(async (result) => {
            if (result.ok) {
                task.complete = true
            }
            else {
                pendingUploads.push({ ...task })
                task.complete = true
                setTimeout(() => showToast(AlpineI18n.t('toast.error.upload') + `: ${task.file}`), 10);
            }

            if (currentPath === this.path)
                this.goto(this.path)

            doUpload()
        })
}
