function joinPath(...segments) {
    const parts = segments.reduce((parts, segment) => {
        // Remove leading slashes from non-first part.
        if (parts.length > 0) {
            segment = segment.replace(/^\//, '')
        }
        // Remove trailing slashes.
        segment = segment.replace(/\/$/, '')
        return parts.concat(segment.split('/'))
    }, [])
    const resultParts = []
    for (const part of parts) {
        if (part === '.') {
            continue
        }
        if (part === '..') {
            resultParts.pop()
            continue
        }
        resultParts.push(part)
    }
    return resultParts.join('/')
}