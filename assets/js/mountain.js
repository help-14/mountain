var currentPath = ''
var ds = null

function getHashPath() {
    return decodeURI(parent.location.hash.substring(1))
}

function hideToast() {
    const toastContainer = document.querySelector('.toast-container')
    if (toastContainer) toastContainer.innerHTML = ''
}

function modalOpened() {
    return document.querySelector('.modal.show') ? true : false
}

function hideModal() {
    document.querySelector('.modal.show button.btn-close')?.click()
}

function updateSelected() {
    const files = document.querySelectorAll('button.selectable')
    files.forEach(b => {
        if (b.classList.contains('ds-selected'))
            b.querySelector('.select').click()
        else
            b.querySelector('.deselect').click()
    })
}

function updateDragSelect() {
    ds = new DragSelect({
        selectables: document.querySelectorAll('button.selectable'),
        area: document.getElementById('dragArea'),
        multiSelectMode: true,
        draggability: false,
        multiSelectKeys: ['Shift']
    });
    ds.subscribe('callback', ({ items, event }) => {
        items.forEach(i => {
            i.querySelector('input.select')?.click()
            i.style.zIndex = "1";
        })
    })
}

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

function showToast(message, title) {
    const toastContainer = document.querySelector('.toast-container')
    if (toastContainer) {
        const id = Date.now().toString()
        toastContainer.innerHTML += `
        <div id="t${id}" class="toast fade show" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <strong class="me-auto">${title ?? 'Something went wrong'}</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">${message}</div>
        </div>`
        setTimeout(() => {
            document.querySelector(`.toast-container #t${id}`)?.remove()
        }, 4000);
    } else {
        alert(message)
    }
}

function enabled(element, state) {
    const e = document.querySelector(element)
    if (e) {
        if (state)
            e.removeAttribute("disabled");
        else
            e.setAttribute("disabled", true);
    }
}

function getStartUrl() {
    if (parent.location.hash.length <= 2)
        return document.querySelector('#defaultPath').value
    return getHashPath()
}

function sort(arr, config) {
    if (!arr) return []

    const { by, order, group } = config
    let o = order === 0 ? 1 : -1
    let result = arr

    if (result.length > 0) {
        if (by === 'name') {
            result = arr.sort((a, b) => {
                let x = a.name.toLowerCase()
                let y = b.name.toLowerCase()
                if (x < y) { return -1 * o; }
                if (x > y) { return 1 * o; }
                return 0;
            })
        }
        if (by === 'date') {
            result = arr.sort((a, b) => {
                let x = new Date(a.modified)
                let y = new Date(b.modified)
                if (x < y) { return -1 * o; }
                if (x > y) { return 1 * o; }
                return 0;
            })
        }
        if (by === 'type') {
            result = arr.sort((a, b) => {
                let x = a.ext.toLowerCase()
                let y = b.ext.toLowerCase()
                if (x < y) { return -1 * o; }
                if (x > y) { return 1 * o; }
                return 0;
            })
        }

        if (group) {
            let dirs = []
            let files = []
            for (let i = 0; i < result.length; i++) {
                const test = result[i]
                if (test.directory) {
                    dirs.push({ ...test })
                } else {
                    files.push({ ...test })
                }
            }
            result = o === 1 ? dirs.concat(files) : files.concat(dirs)
        }
    }

    return result
}

function goto(path) {
    hideToast()
    if (ds) {
        ds.removeSelectables(ds.getSelectables(), true)
        ds.stop()
    }
    get(`/api/get?path=${path}`)
        .then(data => {
            this.emptyFolder = data.length === 0
            this.files = sort(data.map(a => {
                return {
                    selected: false,
                    ...a,
                    name: (!this.config.view.ext && a.ext.length > 0 && a.name.length > a.ext.length) ? a.name.substring(0, a.name.length - a.ext.length) : a.name,
                }
            }), this.config.sort)

            currentPath = path
            this.opsToolbar = false
            this.path = path
            parent.location.hash = path

            let breadcrumbs = []
            let splitted = path.split('/')
            for (let i = 1; i < splitted.length; i++) {
                const name = splitted[i]
                if (name.length === 0) continue

                breadcrumbs.push({
                    name: splitted[i],
                    path: splitted.slice(0, i + 1).join('/')
                })
            }
            if (breadcrumbs.length > 0)
                breadcrumbs[0].name = `<i class="fa fa-solid fa-home"></i>  ${breadcrumbs[0].name}`
            this.breadcrumbs = breadcrumbs
        })
        .finally(() => {
            if (ds) {
                setTimeout(() => {
                    const elements = document.querySelectorAll('button.selectable')
                    ds.addSelectables(elements, false)
                    ds.start()
                }, 200)
            }
            else
                setTimeout(updateDragSelect(), 200)
        })
}

function modalGoTo(path = '/') {
    get(`/api/get?directory=true&path=${path}`)
        .then(data => {
            this.modalSelectFolder.files = sort(data, this.config.sort)
            this.modalSelectFolder.path = path

            let breadcrumbs = []
            let splitted = path.split('/')
            for (let i = 1; i < splitted.length; i++) {
                const name = splitted[i]
                if (name.length === 0) continue

                breadcrumbs.push({
                    name: splitted[i],
                    path: splitted.slice(0, i + 1).join('/')
                })
            }
            this.modalSelectFolder.breadcrumbs = breadcrumbs
        })
}

function showOps() {
    this.opsToolbar = this.files.some(f => f.selected)
    this.showDownload = this.opsToolbar && !this.files.some(f => f.selected && f.directory)
}

function select(type) {
    if (modalOpened()) return
    switch (type) {
        case 'all':
            if (ds) ds.getSelectables().forEach(e => ds.addSelection(e, false))
            this.files.forEach(f => f.selected = true)
            break
        case 'none':
            if (ds) ds.clearSelection(false)
            this.files.forEach(f => f.selected = false)
            break
        case 'invert':
            if (ds) ds.getSelectables().forEach(e => ds.toggleSelection(e, false))
            break
    }
    this.showOps()
}

function fetchFile(url) {
    console.log(url)
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
    console.log(selected)
    if (selected.length === 0)
        return
    let data = selected.map(n => joinPath(currentPath, n))
    data.forEach(url => fetchFile(`/api/download?path=${url}`))
}

function upload() {
    let input = document.createElement('input');
    input.type = "file"
    input.setAttribute('multiple', 'multiple')
    input.onchange = _ => {
        let files = Array.from(input.files);
        const formData = new FormData();
        formData.append('path', currentPath)
        files.forEach(f => formData.append('files', f))
        fetch(`/api/upload`, { method: "POST", body: formData })
            .then(async (result) => {
                if (result.ok)
                    setTimeout(async () => showToast(await result.text(), "Upload completed"), 10);
                else
                    setTimeout(() => showToast("Some files were not uploaded."), 10);
                this.goto(this.path)
            })
    };
    input.click();
}

function showDeleteModal() {
    if (modalOpened()) return
    if (this.files.some(f => f.selected)) {
        const dom = document.querySelector('#deleteModal')
        if (dom) new bootstrap.Modal(dom).show()
    }
}

function showRenameModal() {
    if (modalOpened()) return
    if (this.files.some(f => f.selected)) {
        const dom = document.querySelector('#renameModal')
        if (dom) new bootstrap.Modal(dom).show()
    }
}

function showOpsModal(ops) {
    if (modalOpened()) return
    this.modalSelectFolder.ops = ops
    this.modalGoTo(this.path)
    if (this.files.some(f => f.selected)) {
        const dom = document.querySelector('#destinationModal')
        if (dom) new bootstrap.Modal(dom).show()
    }
}

function showSearch() {
    if (!modalOpened())
        document.querySelector('#searchBox')?.focus()
}

function createFile() {
    const newFileName = document.querySelector('#newFileName')
    const newFileContent = document.querySelector('#newFileContent')
    if (!newFileName || !newFileContent) return

    if (newFileName.value.trim().length <= 0) {
        showToast("File name can't be empty")
        return
    }

    enabled('#newFileModal button[type="submit"]', false)
    post(`/api/create`, {
        path: this.path,
        name: newFileName.value.trim(),
        directory: false,
        content: newFileContent.value.trim()
    })
        .then(data => {
            this.goto(currentPath)
            newFileName.value = ''
            newFileContent.value = ''
            hideModal()
        })
        .finally(() => enabled('#newFileModal button[type="submit"]', true))
}

function createFolder() {
    const newFolderInput = document.querySelector('#newFolderInput')
    if (!newFolderInput) return
    const text = newFolderInput.value
    if (text.length <= 0) {
        showToast("Folder name can't be empty")
        return
    }

    enabled('#newFolderModal button[type="submit"]', false)
    post(`/api/create`, {
        path: this.path,
        name: text,
        directory: true,
        content: ''
    })
        .then(data => {
            this.goto(currentPath)
            newFolderInput.value = ''
            hideModal()
        })
        .finally(() => enabled('#newFolderModal button[type="submit"]', true))
}

async function deleteSelected() {
    const selected = this.files.filter(f => f.selected).map(f => f.path)
    hideModal()
    await post(`/api/delete`, selected)
    this.goto(currentPath)
}

function renameSelected() {
    let data = document.querySelectorAll('#renameModal .modal-body input')
    if (data.length === 0) {
        hideModal()
        return
    }
    data = Array.from(data).map(d => {
        return {
            from: joinPath(this.path, d.getAttribute('placeholder')),
            to: joinPath(this.path, d.value)
        }
    })

    enabled('#renameModal button[type="submit"]', false)
    post(`/api/rename`, data)
        .then(data => {
            this.goto(currentPath)
            hideModal()
        })
        .finally(() => enabled('#renameModal button[type="submit"]', true))
}

function copyOrMove(ops) {
    let selected = this.files.filter(f => f.selected).map(f => f.name)
    if (selected.length === 0) {
        hideModal()
        return
    }

    let data = selected.map(fn => {
        return {
            from: joinPath(this.path, fn),
            to: joinPath(this.modalSelectFolder.path, fn)
        }
    })

    enabled('#destinationModal button[type="submit"]', false)
    post(`/api/${ops}`, data)
        .then(data => {
            this.goto(currentPath)
            hideModal()
        })
        .finally(() => enabled('#destinationModal button[type="submit"]', true))
}

function startInstance() {
    return {
        files: [],
        breadcrumbs: [],
        path: '',
        emptyFolder: false,
        opsToolbar: false,
        showDownload: false,
        modalSelectFolder: {
            ops: '',
            files: [],
            breadcrumbs: [],
            path: '',
        },
        getStartUrl, goto, modalGoTo, showOps, select,
        download, upload, modalOpened,
        showSearch, showDeleteModal, showRenameModal, showOpsModal,
        createFolder, createFile, deleteSelected, renameSelected, copyOrMove
    }
}

// Reload page on go back
window.onhashchange = () => {
    if (getHashPath() !== currentPath) window.location.reload();
};
