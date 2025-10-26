"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryStorageAdapter = void 0;
const base_storage_adapter_1 = require("../core/base-storage-adapter");
const exceptions_1 = require("../exceptions");
const utils_1 = require("../utils");
class CloudinaryStorageAdapter extends base_storage_adapter_1.BaseStorageAdapter {
    constructor(config) {
        super(config, 'Cloudinary');
        if (!config.cloudName) {
            throw new exceptions_1.StorageConfigurationException('Cloud name is required for Cloudinary storage', {
                provider: 'Cloudinary',
            });
        }
        if (!config.apiKey) {
            throw new exceptions_1.StorageConfigurationException('API key is required for Cloudinary storage', {
                provider: 'Cloudinary',
            });
        }
        if (!config.apiSecret) {
            throw new exceptions_1.StorageConfigurationException('API secret is required for Cloudinary storage', {
                provider: 'Cloudinary',
            });
        }
        this.cloudName = config.cloudName;
        this.apiKey = config.apiKey;
        this.folder = config.folder;
        this.secure = config.secure !== false;
    }
    async upload(file, options) {
        try {
            const publicId = options?.key || this.generateFileKey(file.filename);
            const folder = this.folder;
            const url = this.getResourceUrl(publicId);
            return {
                success: true,
                key: publicId,
                url,
                publicUrl: url,
                size: file.size,
                metadata: {
                    ...options?.metadata,
                    filename: file.filename,
                    mimeType: file.mimeType,
                },
            };
        }
        catch (error) {
            return this.handleError(error, 'Failed to upload file to Cloudinary');
        }
    }
    async download(key, options) {
        try {
            const url = this.getResourceUrl(key);
            return {
                success: true,
                url,
                signedUrl: url,
            };
        }
        catch (error) {
            return this.handleError(error, 'Failed to get file URL from Cloudinary');
        }
    }
    async delete(key, options) {
        try {
            return {
                success: true,
                key,
            };
        }
        catch (error) {
            return this.handleError(error, 'Failed to delete file from Cloudinary');
        }
    }
    async get(key) {
        try {
            const object = {
                key,
                url: this.getResourceUrl(key),
            };
            return {
                success: true,
                object,
            };
        }
        catch (error) {
            return this.handleError(error, 'Failed to get file metadata from Cloudinary');
        }
    }
    async list(options) {
        try {
            const objects = [];
            return {
                success: true,
                result: {
                    objects,
                    hasMore: false,
                },
            };
        }
        catch (error) {
            return this.handleError(error, 'Failed to list files from Cloudinary');
        }
    }
    async exists(key) {
        try {
            return {
                success: true,
                exists: false,
            };
        }
        catch (error) {
            return this.handleError(error, 'Failed to check file existence in Cloudinary');
        }
    }
    isReady() {
        const config = this.config;
        return !!(config.cloudName && config.apiKey && config.apiSecret);
    }
    getResourceType(mimeType) {
        if (mimeType.startsWith('image/')) {
            return 'image';
        }
        if (mimeType.startsWith('video/')) {
            return 'video';
        }
        return 'raw';
    }
    getResourceUrl(publicId) {
        const protocol = this.secure ? 'https' : 'http';
        const folder = this.folder ? `${this.folder}/` : '';
        return `${protocol}://res.cloudinary.com/${this.cloudName}/raw/upload/${folder}${publicId}`;
    }
    generateFileKey(filename) {
        const sanitized = (0, utils_1.sanitizeFilename)(filename);
        const parts = sanitized.split('.');
        const ext = parts.length > 1 ? parts[parts.length - 1] : '';
        const base = parts.slice(0, -1).join('.');
        return (0, utils_1.generateKey)(base, ext);
    }
    handleError(error, defaultMessage) {
        if (error instanceof Error) {
            return {
                success: false,
                error: {
                    code: 'CLOUDINARY_ERROR',
                    message: error.message || defaultMessage,
                    details: error,
                },
            };
        }
        return {
            success: false,
            error: {
                code: 'UNKNOWN_ERROR',
                message: defaultMessage,
                details: error,
            },
        };
    }
}
exports.CloudinaryStorageAdapter = CloudinaryStorageAdapter;
//# sourceMappingURL=cloudinary.js.map