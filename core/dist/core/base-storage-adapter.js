"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseStorageAdapter = void 0;
const exceptions_1 = require("../exceptions");
class BaseStorageAdapter {
    constructor(config, providerName) {
        this.config = config;
        this.providerName = providerName;
        this.validateConfig();
    }
    validateConfig() {
        if (!this.config) {
            throw new exceptions_1.StorageConfigurationException(`${this.providerName}: Configuration is required`, {
                providerName: this.providerName,
            });
        }
    }
    getProviderName() {
        return this.providerName;
    }
    isReady() {
        return !!this.config;
    }
}
exports.BaseStorageAdapter = BaseStorageAdapter;
//# sourceMappingURL=base-storage-adapter.js.map