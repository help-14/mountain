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
