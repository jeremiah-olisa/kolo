"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorageAdapter = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const util_1 = require("util");
const base_storage_adapter_1 = require("../core/base-storage-adapter");
const exceptions_1 = require("../exceptions");
const utils_1 = require("../utils");
const mkdir = (0, util_1.promisify)(fs.mkdir);
const writeFile = (0, util_1.promisify)(fs.writeFile);
const readFile = (0, util_1.promisify)(fs.readFile);
const unlink = (0, util_1.promisify)(fs.unlink);
const stat = (0, util_1.promisify)(fs.stat);
const readdir = (0, util_1.promisify)(fs.readdir);
const access = (0, util_1.promisify)(fs.access);
class LocalStorageAdapter extends base_storage_adapter_1.BaseStorageAdapter {
    constructor(config) {
        super(config, 'Local');
        if (!config.rootPath) {
            throw new exceptions_1.StorageConfigurationException('Root path is required for local storage', {
                provider: 'Local',
            });
        }
        this.rootPath = path.resolve(config.rootPath);
        this.baseUrl = config.baseUrl;
        if (config.createDirectory !== false) {
            this.ensureDirectoryExists(this.rootPath).catch((error) => {
                console.error('Failed to create root directory:', error);
            });
        }
    }
    async upload(file, options) {
        try {
            const key = options?.key || this.generateFileKey(file.filename);
            const filePath = this.getFilePath(key);
            await this.ensureDirectoryExists(path.dirname(filePath));
            await writeFile(filePath, file.content);
            const localConfig = this.config;
            if (localConfig.filePermissions) {
                await (0, util_1.promisify)(fs.chmod)(filePath, localConfig.filePermissions);
            }
            const url = this.getFileUrl(key);
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
            return this.handleError(error, 'Failed to upload file');
        }
    }
    async download(key, options) {
        try {
            const filePath = this.getFilePath(key);
            await access(filePath, fs.constants.R_OK);
            const content = await readFile(filePath);
            const url = this.getFileUrl(key);
            return {
                success: true,
                url,
                content,
            };
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                throw new exceptions_1.FileNotFoundException(key);
            }
            return this.handleError(error, 'Failed to download file');
        }
    }
    async delete(key, options) {
        try {
            const filePath = this.getFilePath(key);
            await access(filePath, fs.constants.F_OK);
            await unlink(filePath);
            return {
                success: true,
                key,
            };
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                throw new exceptions_1.FileNotFoundException(key);
            }
            return this.handleError(error, 'Failed to delete file');
        }
    }
    async get(key) {
        try {
            const filePath = this.getFilePath(key);
            const stats = await stat(filePath);
            const object = {
                key,
                url: this.getFileUrl(key),
                size: stats.size,
                lastModified: stats.mtime,
            };
            return {
                success: true,
                object,
            };
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                throw new exceptions_1.FileNotFoundException(key);
            }
            return this.handleError(error, 'Failed to get file metadata');
        }
    }
    async list(options) {
        try {
            const prefix = options?.prefix || '';
            const searchPath = path.join(this.rootPath, prefix);
            const files = await this.listFilesRecursive(searchPath, prefix);
            const maxKeys = options?.maxKeys || files.length;
            const limitedFiles = files.slice(0, maxKeys);
            return {
                success: true,
                result: {
                    objects: limitedFiles,
                    hasMore: files.length > maxKeys,
                },
            };
        }
        catch (error) {
            return this.handleError(error, 'Failed to list files');
        }
    }
    async exists(key) {
        try {
            const filePath = this.getFilePath(key);
            await access(filePath, fs.constants.F_OK);
            return {
                success: true,
                exists: true,
            };
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                return {
                    success: true,
                    exists: false,
                };
            }
            return this.handleError(error, 'Failed to check file existence');
        }
    }
    async ensureDirectoryExists(dirPath) {
        try {
            await access(dirPath, fs.constants.F_OK);
        }
        catch (error) {
            const localConfig = this.config;
            const options = { recursive: true };
            if (localConfig.directoryPermissions) {
                options.mode = localConfig.directoryPermissions;
            }
            await mkdir(dirPath, options);
        }
    }
    async listFilesRecursive(dir, prefix) {
        const files = [];
        try {
            const entries = await readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                const relativePath = (0, utils_1.normalizePath)(path.relative(this.rootPath, fullPath));
                if (entry.isDirectory()) {
                    const subFiles = await this.listFilesRecursive(fullPath, prefix);
                    files.push(...subFiles);
                }
                else if (entry.isFile()) {
                    const stats = await stat(fullPath);
                    files.push({
                        key: relativePath,
                        url: this.getFileUrl(relativePath),
                        size: stats.size,
                        lastModified: stats.mtime,
                    });
                }
            }
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                return [];
            }
            throw error;
        }
        return files;
    }
    getFilePath(key) {
        const normalized = (0, utils_1.normalizePath)(key);
        return path.join(this.rootPath, normalized);
    }
    getFileUrl(key) {
        if (this.baseUrl) {
            return `${this.baseUrl}/${key}`;
        }
        return `file://${this.getFilePath(key)}`;
    }
    generateFileKey(filename) {
        const sanitized = (0, utils_1.sanitizeFilename)(filename);
        const ext = path.extname(sanitized);
        const base = path.basename(sanitized, ext);
        return (0, utils_1.generateKey)(base, ext.slice(1));
    }
    handleError(error, defaultMessage) {
        if (error instanceof Error) {
            return {
                success: false,
                error: {
                    code: 'STORAGE_ERROR',
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
exports.LocalStorageAdapter = LocalStorageAdapter;
//# sourceMappingURL=local.js.map