var currentPath = ''
var ds = null
var newItemSelected = null

const imageFormats = ['gif', 'jpg', 'jpeg', 'png', 'apng', 'avif', 'webp', 'svg', 'jfif', 'pjpeg', 'pjp', 'bmp', 'ico', 'cur', 'tif', 'tiff']
const videoFormats = ['mp4', 'ogg', 'webm', 'ogv', 'ogm']
const audioFormats = ['wav', 'mp3', 'aac', 'aacp', 'flac']
const textFormats = ['txt', 'md', 'json', 'html', 'htm', 'js', 'jsx', 'ejs', 'css', 'scss', 'pem']

function isTouchDevice() {
    return (navigator.maxTouchPoints || 'ontouchstart' in document.documentElement);
}

function isSmallScreen() {
    var vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    return vw < 768
}

function utf8_to_b64(str) {
    return window.btoa(encodeURIComponent(str));
}

function b64_to_utf8(str) {
    return decodeURIComponent(window.atob(str));
}

function getHashPath() {
    return decodeURI(parent.location.hash.substring(1))
}

function combinePath(...paths) {
    return paths.map(function (i) {
        return i.replace(/(^\/|\/$)/, '');
    }).join('/');
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
