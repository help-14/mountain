var currentPath = ''

function getHashPath() {
    return decodeURI(parent.location.hash.substring(1))
}

function hideToast() {
    const toastContainer = document.querySelector('.toast-container')
    if (toastContainer) toastContainer.innerHTML = ''
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

function getStartUrl() {
    if (parent.location.hash.length <= 2)
        return '/'
    return getHashPath()
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
            this.files = data.map(a => {
                return {
                    selected: false,
                    ...a
                }
            })
            currentPath = path
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

function showOps() {
    this.opsToolbar = this.files.some(f => f.selected)
}

function startInstance() {
    return {
        config: {
            sort: {
                by: 'name',
                order: 0,
                group: true,
            },
            view: {
                as: 'tiles',
                navigation: false,
                preview: false,
                ext: true
            }
        },
        files: [],
        breadcrumbs: [],
        path: '',
        emptyFolder: false,
        opsToolbar: false,
        getStartUrl,
        goto,
        showOps
    }
}

// Reload page on go back
window.onhashchange = () => {
    if (getHashPath() !== currentPath) window.location.reload();
};