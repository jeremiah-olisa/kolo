"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateKey = generateKey;
exports.formatSize = formatSize;
exports.getFileExtension = getFileExtension;
exports.sanitizeFilename = sanitizeFilename;
exports.isValidKey = isValidKey;
exports.normalizePath = normalizePath;
exports.getMimeType = getMimeType;
exports.nameof = nameof;
function generateKey(prefix = 'FILE', extension) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    const key = `${prefix}_${timestamp}_${random}`;
    return extension ? `${key}.${extension}` : key;
}
function formatSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
}
function getFileExtension(filename) {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1] : '';
}
function sanitizeFilename(filename) {
    return filename
        .replace(/[^a-z0-9._-]/gi, '_')
        .replace(/_{2,}/g, '_')
        .replace(/^_|_$/g, '');
}
function isValidKey(key) {
    return (!!key &&
        key.length > 0 &&
        !key.startsWith('/') &&
        !key.endsWith('/') &&
        !key.includes('//'));
}
function normalizePath(path) {
    return path.replace(/\\/g, '/').replace(/\/+/g, '/');
}
function getMimeType(filename) {
    const ext = getFileExtension(filename).toLowerCase();
    const mimeTypes = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
        svg: 'image/svg+xml',
        bmp: 'image/bmp',
        ico: 'image/x-icon',
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ppt: 'application/vnd.ms-powerpoint',
        pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        txt: 'text/plain',
        csv: 'text/csv',
        zip: 'application/zip',
        rar: 'application/x-rar-compressed',
        '7z': 'application/x-7z-compressed',
        tar: 'application/x-tar',
        gz: 'application/gzip',
        mp4: 'video/mp4',
        avi: 'video/x-msvideo',
        mov: 'video/quicktime',
        wmv: 'video/x-ms-wmv',
        flv: 'video/x-flv',
        mp3: 'audio/mpeg',
        wav: 'audio/wav',
        ogg: 'audio/ogg',
        js: 'application/javascript',
        json: 'application/json',
        xml: 'application/xml',
        html: 'text/html',
        css: 'text/css',
    };
    return mimeTypes[ext] || 'application/octet-stream';
}
function nameof(arg) {
    if (typeof arg === 'string') {
        return arg;
    }
    if (typeof arg === 'function') {
        const fnStr = arg?.toString();
        const bracketMatch = fnStr?.match(/\[['"]([^'"]+)['"]\]/);
        if (bracketMatch) {
            return bracketMatch[1];
        }
        const dotMatch = fnStr?.match(/\.([A-Za-z_$][A-Za-z0-9_$]*)(?:\s*\)|$)/);
        if (dotMatch) {
            return dotMatch[1];
        }
        if (arg?.name) {
            return arg?.name;
        }
        return '';
    }
    if (arg && typeof arg === 'object' && arg?.constructor && arg?.constructor?.name) {
        return arg?.constructor?.name;
    }
    return String(arg ?? '');
}
//# sourceMappingURL=index.js.map