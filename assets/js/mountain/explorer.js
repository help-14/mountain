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
    ds.subscribe('elementselect', ({ items, item }) => {
        newItemSelected = item
    })
    ds.subscribe('callback', ({ items, event, item }) => {
        if (newItemSelected === null) {
            var deselectConfig = document.querySelector('#emptyClickDeselect.active')
            if (deselectConfig) {
                document.querySelector('#selectNone')?.click()
                return
            }
        }
        newItemSelected = null
        if (items.length === 1) {
            var goToEnable = items[0].querySelector('input.goto.enable')
            if (goToEnable) {
                goToEnable.click()
                return
            }
        }
        items.forEach(i => {
            i.querySelector('input.select')?.click()
            i.style.zIndex = "1";
        })
    })
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
    get(`/api/get?path=${utf8_to_b64(path)}`)
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
                breadcrumbs[0].name = "<i class='fa fa-solid fa-home'></i>"
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

function showOps() {
    this.opsToolbar = this.files.some(f => f.selected)
}

function clickMode(type) {
    //browse | select
    this.config.select.click = type
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
            this.files.forEach(f => f.selected = !f.selected)
            break
    }
    this.showOps()
}

function generateCompressName() {
    const selected = this.files.filter(f => f.selected).map(f => f.name)
    const dom = document.querySelector('#compressFileName')
    if (dom)
        dom.value = selected.length === 1 ? selected[0] : this.path.split('/').pop() || new Date().getTime()
}

function createFile() {
    const newFileName = document.querySelector('#newFileName')
    const newFileContent = document.querySelector('#newFileContent')
    if (!newFileName || !newFileContent) return

    if (newFileName.value.trim().length <= 0) {
        showToast($AlpineI18n.t('toast.error.fileNameEmpty'))
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
        showToast($AlpineI18n.t('toast.error.folderNameEmpty'))
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

function compressSelected() {
    const selected = this.files.filter(f => f.selected)
    if (selected.length === 0)
        return
    const name = document.querySelector('#compressFileName')?.value ?? new Date().getTime()
    const type = document.querySelector('#compressTypeSelect')?.value ?? 'zip'
    post(`/api/compress`, {
        name,
        path: this.path,
        type: type,
        files: selected.map(f => f.path)
    }).then(() => this.goto(this.path)).finally(() => hideModal())
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

// Reload page on go back
window.onhashchange = () => {
    if (getHashPath() !== currentPath) window.location.reload();
}
