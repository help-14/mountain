var currentPath = ''

function getHashPath() {
    return decodeURI(parent.location.hash.substring(1))
}

function startInstance() {
    return {
        files: [],
        breadcrumbs: [],
        path: '',
        emptyFolder: false,
        getStartUrl() {
            if (parent.location.hash.length <= 2)
                return '/'
            return getHashPath()
        },
        hideContextMenu() {
            this.files.forEach(element => {
                if (element.showContextMenu)
                    element.showContextMenu = false
            });
        },
        goto(path = '/') {
            fetch(`/api/get?path=${path}`)
                .then(async response => {
                    const data = await response.json()
                    if (response.ok) {
                        return data
                    } else {
                        alert(data.error)
                    }
                })
                .then(data => {
                    this.emptyFolder = data.length === 0
                    this.files = data.map(a => { return { showContextMenu: false, ...a } })
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
        }
    }
}

// Reload page on go back
window.onhashchange = () => {
    if (getHashPath() !== currentPath) window.location.reload();
};