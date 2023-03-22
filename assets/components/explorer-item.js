export class ExplorerItem extends HTMLElement {
    constructor() {
        super()
    }

    connectedCallback() {
        document.addEventListener("alpine:initialized", () => {
            Alpine.initTree(this.shadowRoot)
        })
        this.render()
    }

    render() {
        this.attachShadow({ mode: "open" })

        const wrapper = document.createElement("div")
        wrapper.setAttribute("class", "col-xl-3 col-sm-6 d-grid mt-2 mb-2")
        wrapper.setAttribute('x-transition', '')

        const button = wrapper.appendChild(document.createElement("button"))
        button.id = 'btn'
        button.setAttribute("class", "btn btn-light selectable")
        button.setAttribute("type", 'button')
        button.addEventListener("dblclick", () => {
            if (this.isDirectory())
                goto(this.getUrl())
            else
                preview(this.getUrl())
        })
        //button.setAttribute("x-on:dblclick", "if(file.directory){goto(file.path)} else {preview(file)}")

        const content = button.appendChild(document.createElement("div"))
        content.setAttribute("class", "row p-1 d-flex")

        const icon = content.appendChild(document.createElement("div"))
        icon.id = 'icon'
        icon.setAttribute("class", "col-3 align-middle fs-2 align-self-center")
        icon.setAttribute("x-text", "$t(directory ? 'files.icons.folder' : 'files.icons.file')")
        this.updateDirectory(icon)

        const text = content.appendChild(document.createElement("div"))
        text.id = 'text'
        text.setAttribute("class", "col-8 fs-6 text-start text-wrap text-break align-middle align-self-center")
        this.updateText(text)

        this.shadowRoot.append(wrapper);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        console.log(name, oldValue, newValue)
        return
        // switch (name) {
        //     case "text":
        //         this.updateText()
        //         break
        //     case "directory":
        //         this.updateDirectory()
        //         break
        //     case "selected":
        //         this.updateSelected()
        //         break
        //     case "url":
        //         break
        // }
    }

    getText() {
        return this.getAttribute('text')
    }

    setText(val) {
        this.setAttribute('text', val)
    }

    updateText(element) {
        (element ?? document.querySelector('#text')).innerHTML = this.getText()
    }

    getUrl() {
        return this.getAttribute('url')
    }

    isDirectory() {
        return this.getAttribute('directory') === 'true'
    }

    setDirectory(val) {
        this.setAttribute('directory', val)
    }

    updateDirectory(element) {
        (element ?? document.querySelector('#icon')).innerHTML = AlpineI18n.t(this.isDirectory() ? 'files.icons.folder' : 'files.icons.file')
    }

    isSelected() {
        return this.getAttribute('selected') === 'true'
    }

    setSelected(val) {
        this.setAttribute('selected', val)
    }

    updateSelected(element) {
        const button = element ?? this.querySelector('#btn')
        if (this.isSelected()) {
            button.classList.remove('btn-light')
            button.classList.add('btn-primary')
        } else {
            button.classList.add('btn-light')
            button.classList.remove('btn-primary')
        }
    }
}