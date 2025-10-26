"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureStorageAdapter = void 0;
const base_storage_adapter_1 = require("../core/base-storage-adapter");
const exceptions_1 = require("../exceptions");
class AzureStorageAdapter extends base_storage_adapter_1.BaseStorageAdapter {
    constructor(config) {
        super(config, 'Azure');
        if (!config.containerName) {
            throw new exceptions_1.StorageConfigurationException('Container name is required for Azure storage', {
                provider: 'Azure',
            });
        }
        if (!config.connectionString && (!config.accountName || !config.accountKey)) {
            throw new exceptions_1.StorageConfigurationException('Either connectionString or accountName/accountKey is required for Azure storage', {
                provider: 'Azure',
            });
        }
        this.containerName = config.containerName;
    }
    async upload(file, options) {
        return {
            success: false,
            error: {
                code: 'NOT_IMPLEMENTED',
                message: 'Azure Blob Storage adapter is not yet implemented',
            },
        };
    }
    async download(key, options) {
        return {
            success: false,
            error: {
                code: 'NOT_IMPLEMENTED',
                message: 'Azure Blob Storage adapter is not yet implemented',
            },
        };
    }
    async delete(key, options) {
        return {
            success: false,
            error: {
                code: 'NOT_IMPLEMENTED',
                message: 'Azure Blob Storage adapter is not yet implemented',
            },
        };
    }
    async get(key) {
        return {
            success: false,
            error: {
                code: 'NOT_IMPLEMENTED',
                message: 'Azure Blob Storage adapter is not yet implemented',
            },
        };
    }
    async list(options) {
        return {
            success: false,
            error: {
                code: 'NOT_IMPLEMENTED',
                message: 'Azure Blob Storage adapter is not yet implemented',
            },
        };
    }
    async exists(key) {
        return {
            success: false,
            error: {
                code: 'NOT_IMPLEMENTED',
                message: 'Azure Blob Storage adapter is not yet implemented',
            },
        };
    }
    isReady() {
        const config = this.config;
        return !!(config.containerName && (config.connectionString || (config.accountName && config.accountKey)));
    }
}
exports.AzureStorageAdapter = AzureStorageAdapter;
//# sourceMappingURL=azure.js.map