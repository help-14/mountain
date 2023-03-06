function startInstance() {
    return {
        files: [],
        breadcrumbs: [],
        path: '',
        emptyFolder: false,
        opsToolbar: false,
        modalSelectFolder: {
            ops: '',
            files: [],
            breadcrumbs: [],
            path: '',
        },
        getStartUrl, goto, modalGoTo, showOps, select, clickMode,
        download, upload, modalOpened, generateCompressName, preview,
        showSearch, showDeleteModal, showRenameModal, showOpsModal,
        createFolder, createFile, deleteSelected, renameSelected, copyOrMove, compressSelected
    }
}

// AlpineJS i18n
document.addEventListener('alpine-i18n:ready', async function () {
    const en = await get('/assets/languages/en.json')
    let selected = document.querySelector('#language')?.value
    if (!selected || selected.length !== 2) {
        window.AlpineI18n.create('en', en);
    } else {
        const choosen = await get(`/assets/languages/${selected}.json`)
        window.AlpineI18n.create(selected, { ...en, ...choosen });
        window.AlpineI18n.fallbackLocale = 'en';
    }
});