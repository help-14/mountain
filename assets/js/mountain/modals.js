
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

function showToast(message, title) {
    const toastContainer = document.querySelector('.toast-container')
    if (toastContainer) {
        const id = Date.now().toString()
        toastContainer.innerHTML += `
        <div id="t${id}" class="toast fade show" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <strong class="me-auto">${title ?? AlpineI18n.t('toast.title')}</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
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

function updateUploadToast() {
    const toastContainer = document.querySelector('.toast-container')
    if (!toastContainer) return

    var uploadToast = toastContainer.querySelector('#upload')
    if (!uploadToast) {
        toastContainer.innerHTML += `
            <div id="upload" class="toast fade show" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header">
                    <strong class="me-auto" x-text="$t('upload.uploading')"></strong>
                    <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
                </div>
                <div class="toast-body">
                    <div class="progress">
                        <div class="progress-bar progress-bar-striped bg-success" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                </div>
            </div>`
        uploadToast = toastContainer.querySelector('#upload')
    }

    if (pendingUploads.length === 0) {
        uploadToast?.remove()
        return
    }

    //const title = uploadToast.querySelector('strong')
    const progressBar = uploadToast.querySelector('.progress .progress-bar')

    const completed = pendingUploads.filter(u => u.complete).length
    const val = Math.round(completed * 100 / pendingUploads.length)

    //title.innerText = `${completed}/${pendingUploads.length}`
    progressBar.style.width = `${val}%`
    progressBar.setAttribute('aria-valuenow', val)
}

function modalGoTo(path = '/') {
    get(`/api/get?directory=true&path=${utf8_to_b64(path)}`)
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

function preview(file) {
    const ext = file.ext.replace('.', '').toLowerCase()
    const title = document.querySelector('#previewModal h5')
    if (title) title.innerText = file.name
    const body = document.querySelector('#previewModalBody')
    if (!body || modalOpened()) return

    body.innerHTML = ''
    const fileServePath = combinePath('/serve', file.path)
    if (imageFormats.includes(ext)) {
        body.innerHTML = `<img src='${fileServePath}'>`
    }
    else if (videoFormats.includes(ext)) {
        body.innerHTML = `<video controls><source src="${fileServePath}" type="video/mp4">Your browser does not support the video tag.</video>`
    }
    else if (audioFormats.includes(ext)) {
        body.innerHTML = `<audio controls><source src="${fileServePath}" type="audio/mp4">Your browser does not support the audio tag.</audio>`
    }
    else if (textFormats.includes(ext)) {
        fetch(fileServePath).then((response) => response.text().then(text => {
            body.innerHTML = `<textarea disabled>${text}</textarea>`
        }));
    }
    else {
        window.open(fileServePath, '_blank')
        return
    }

    const dom = document.querySelector('#previewModal')
    if (dom) new bootstrap.Modal(dom).show()
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