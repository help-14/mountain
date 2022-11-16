var currentPath = ''

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

function showToast(message) {
    const toastContainer = document.querySelector('.toast-container')
    if (toastContainer) {
        const id = Date.now().toString()
        toastContainer.innerHTML += `
        <div id="t${id}" class="toast fade show" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <strong class="me-auto">Something went wrong</strong>
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

function getStartUrl() {
    if (parent.location.hash.length <= 2)
        return '/'
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

function goto(path = '/') {
    hideToast()
    fetch(`/api/get?path=${path}`)
        .then(async response => {
            const data = await response.json()
            if (response.ok) {
                return data
            } else {
                showToast(data.error)
            }
        })
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

            let breadcrumbs = [{
                name: '<i class="fa fa-solid fa-home"></i>',
                path: '/'
            }]
            let splitted = path.split('/')
            for (let i = 1; i < splitted.length; i++) {
                const name = splitted[i]
                if (name.length === 0) continue

                breadcrumbs.push({
                    name: splitted[i],
                    path: splitted.slice(0, i + 1).join('/')
                })
            }
            this.breadcrumbs = breadcrumbs
        })
        .catch(err => {
            if (err) {
                console.error(err)
                showToast(err.message)
            }
        })
}

function modalGoTo(path = '/') {
    fetch(`/api/get?directory=true&path=${path}`)
        .then(async response => {
            const data = await response.json()
            if (response.ok) {
                return data
            } else {
                showToast(data.error)
            }
        })
        .then(data => {
            this.modalSelectFolder.files = sort(data, this.config.sort)
            this.modalSelectFolder.path = path

            let breadcrumbs = [{
                name: '<i class="fa fa-solid fa-home"></i>',
                path: '/'
            }]
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
        .catch(err => {
            if (err) {
                console.error(err)
                showToast(err.message)
            }
        })
}

function showOps() {
    this.opsToolbar = this.files.some(f => f.selected)
}

function select(type) {
    if (modalOpened()) return
    switch (type) {
        case 'all':
            this.files.forEach(element => element.selected = true)
            break
        case 'none':
            this.files.forEach(element => element.selected = false)
            break
        case 'invert':
            this.files.forEach(element => element.selected = !element.selected)
            break
    }
    this.showOps()
}

function download() {
    const selected = this.files.filter(f => f.selected)
    if (selected.length === 0)
        return

    if (selected.length === 1 && !selected.directory) {
        fetchFile(selected[0].path)
        return
    }

    fetch(`/api/zip?path=${path}`, {
        method: 'POST', cache: 'no-cache', headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        }, body: JSON.stringify(data)
    })
        .then(async response => {
            const data = await response.json()
            if (response.ok) {
                return data
            } else {
                showToast(data.error)
            }
        })
        .then(data => {
            console.log(this.config)
        })
        .catch(err => {
            if (err) {
                console.error(err)
                showToast(err.message)
            }
        })
}

function upload() {
    const formData = new FormData();
    const photos = document.querySelector('input[type="file"][multiple]');

    formData.append('title', 'My Vegas Vacation');
    let i = 0;
    for (const photo of photos.files) {
        formData.append(`photos_${i}`, photo);
        i++;
    }

    fetch('https://example.com/posts', {
        method: 'POST',
        body: formData,
    })
        .then((response) => response.json())
        .then((result) => {
            console.log('Success:', result);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
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

    fetch(`/api/create`, {
        method: 'POST', cache: 'no-cache', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            path: this.path,
            name: newFileName.value.trim(),
            directory: false,
            content: newFileContent.value.trim()
        })
    })
        .then(async response => {
            const data = await response.json()
            if (response.ok) {
                return data
            } else {
                showToast(data.error)
            }
        })
        .then(data => {
            this.goto(currentPath)
            newFileName.value = ''
            newFileContent.value = ''
            document.querySelector('.modal.show button.btn-close')?.click()
        })
        .catch(err => {
            showToast(err.message)
        })
}

function createFolder() {
    const newFolderInput = document.querySelector('#newFolderInput')
    if (!newFolderInput) return
    const text = newFolderInput.value
    if (text.length <= 0) {
        showToast("Folder name can't be empty")
        return
    }

    fetch(`/api/create`, {
        method: 'POST', cache: 'no-cache', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            path: this.path,
            name: text,
            directory: true,
            content: ''
        })
    })
        .then(async response => {
            const data = await response.json()
            if (response.ok) {
                return data
            } else {
                showToast(data.error)
            }
        })
        .then(data => {
            this.goto(currentPath)
            newFolderInput.value = ''
            document.querySelector('.modal.show button.btn-close')?.click()
        })
        .catch(err => {
            showToast(err.message)
        })
}

function startInstance() {
    return {
        files: [],
        breadcrumbs: [],
        path: '',
        multipleSelect: false,
        emptyFolder: false,
        opsToolbar: false,
        modalSelectFolder: {
            ops: '',
            files: [],
            breadcrumbs: [],
            path: '',
        },
        getStartUrl, goto, modalGoTo, showOps, select,
        download, upload, modalOpened,
        showSearch, showDeleteModal, showRenameModal, showOpsModal,
        createFolder, createFile
    }
}

// Reload page on go back
window.onhashchange = () => {
    if (getHashPath() !== currentPath) window.location.reload();
};
