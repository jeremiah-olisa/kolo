"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3StorageAdapter = void 0;
const base_storage_adapter_1 = require("../core/base-storage-adapter");
const exceptions_1 = require("../exceptions");
const utils_1 = require("../utils");
class S3StorageAdapter extends base_storage_adapter_1.BaseStorageAdapter {
    constructor(config) {
        super(config, 'S3');
        if (!config.bucket) {
            throw new exceptions_1.StorageConfigurationException('Bucket name is required for S3 storage', {
                provider: 'S3',
            });
        }
        if (!config.region) {
            throw new exceptions_1.StorageConfigurationException('Region is required for S3 storage', {
                provider: 'S3',
            });
        }
        this.bucket = config.bucket;
        this.region = config.region;
        this.basePath = config.basePath;
    }
    async upload(file, options) {
        try {
            const key = this.getFullKey(options?.key || this.generateFileKey(file.filename));
            const url = this.getObjectUrl(key);
            return {
                success: true,
                key,
                url,
                publicUrl: options?.public ? url : undefined,
                size: file.size,
                metadata: {
                    ...options?.metadata,
                    filename: file.filename,
                    mimeType: file.mimeType,
                },
            };
        }
        catch (error) {
            return this.handleError(error, 'Failed to upload file to S3');
        }
    }
    async download(key, options) {
        try {
            const fullKey = this.getFullKey(key);
            const url = this.getObjectUrl(fullKey);
            return {
                success: true,
                url,
                signedUrl: url,
            };
        }
        catch (error) {
            return this.handleError(error, 'Failed to download file from S3');
        }
    }
    async delete(key, options) {
        try {
            const fullKey = this.getFullKey(key);
            return {
                success: true,
                key: fullKey,
            };
        }
        catch (error) {
            return this.handleError(error, 'Failed to delete file from S3');
        }
    }
    async get(key) {
        try {
            const fullKey = this.getFullKey(key);
            const object = {
                key: fullKey,
                url: this.getObjectUrl(fullKey),
            };
            return {
                success: true,
                object,
            };
        }
        catch (error) {
            return this.handleError(error, 'Failed to get file metadata from S3');
        }
    }
    async list(options) {
        try {
            const prefix = this.getFullKey(options?.prefix || '');
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
            return this.handleError(error, 'Failed to list files from S3');
        }
    }
    async exists(key) {
        try {
            const fullKey = this.getFullKey(key);
            return {
                success: true,
                exists: false,
            };
        }
        catch (error) {
            return this.handleError(error, 'Failed to check file existence in S3');
        }
    }
    isReady() {
        return !!this.config.bucket && !!this.config.region;
    }
    getFullKey(key) {
        if (this.basePath) {
            return `${this.basePath}/${key}`.replace(/\/+/g, '/');
        }
        return key;
    }
    getObjectUrl(key) {
        const config = this.config;
        if (config.endpoint) {
            return `${config.endpoint}/${this.bucket}/${key}`;
        }
        return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
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
                    code: 'S3_ERROR',
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
exports.S3StorageAdapter = S3StorageAdapter;
//# sourceMappingURL=s3.js.map