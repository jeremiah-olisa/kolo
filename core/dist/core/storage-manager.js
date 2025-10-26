"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageManager = void 0;
const exceptions_1 = require("../exceptions");
class StorageManager {
    constructor(config) {
        this.adapters = new Map();
        this.factories = new Map();
        this.adapterConfigs = new Map();
        this.enableFallback = false;
        if (config) {
            this.defaultAdapter = config.defaultAdapter;
            this.enableFallback = config.enableFallback ?? false;
            config.adapters.forEach((adapterConfig) => {
                this.adapterConfigs.set(adapterConfig.name, adapterConfig);
            });
        }
    }
    registerFactory(name, factory) {
        this.factories.set(name.toLowerCase(), factory);
        const config = this.adapterConfigs.get(name.toLowerCase());
        if (config && config.enabled !== false) {
            try {
                const adapter = factory(config.config);
                this.adapters.set(name.toLowerCase(), adapter);
            }
            catch (error) {
                console.error(`Failed to initialize adapter '${name}':`, error);
            }
        }
        return this;
    }
    registerAdapter(name, adapter) {
        this.adapters.set(name.toLowerCase(), adapter);
        return this;
    }
    getAdapter(name) {
        const adapter = this.adapters.get(name.toLowerCase());
        if (!adapter) {
            throw new exceptions_1.StorageConfigurationException(`Storage adapter '${name}' is not registered or enabled`, {
                adapterName: name,
                availableAdapters: Array.from(this.adapters.keys()),
            });
        }
        if (!adapter.isReady()) {
            throw new exceptions_1.StorageConfigurationException(`Storage adapter '${name}' is not ready. Please check configuration.`, {
                adapterName: name,
            });
        }
        return adapter;
    }
    getDefaultAdapter() {
        if (!this.defaultAdapter) {
            const firstAdapter = this.adapters.values().next().value;
            if (firstAdapter) {
                return firstAdapter;
            }
            throw new exceptions_1.StorageConfigurationException('No default adapter configured and no adapters available', {
                availableAdapters: Array.from(this.adapters.keys()),
            });
        }
        return this.getAdapter(this.defaultAdapter);
    }
    getAdapterWithFallback(preferredAdapter) {
        if (preferredAdapter) {
            try {
                const adapter = this.getAdapter(preferredAdapter);
                if (adapter.isReady()) {
                    return adapter;
                }
            }
            catch (error) {
                if (!this.enableFallback) {
                    throw error;
                }
                console.warn(`Preferred adapter '${preferredAdapter}' not available, trying fallback`);
            }
        }
        if (this.defaultAdapter && (!preferredAdapter || preferredAdapter !== this.defaultAdapter)) {
            try {
                const adapter = this.getAdapter(this.defaultAdapter);
                if (adapter.isReady()) {
                    return adapter;
                }
            }
            catch (error) {
                if (!this.enableFallback) {
                    throw error;
                }
                console.warn(`Default adapter '${this.defaultAdapter}' not available, trying fallback`);
            }
        }
        if (this.enableFallback) {
            const sortedAdapters = this.getSortedAdapters();
            for (const [name, adapter] of sortedAdapters) {
                if (adapter.isReady() && name !== preferredAdapter && name !== this.defaultAdapter) {
                    console.warn(`Using fallback adapter: ${name}`);
                    return adapter;
                }
            }
        }
        return null;
    }
    getAvailableAdapters() {
        return Array.from(this.adapters.keys());
    }
    getReadyAdapters() {
        return Array.from(this.adapters.entries())
            .filter(([, adapter]) => adapter.isReady())
            .map(([name]) => name);
    }
    hasAdapter(name) {
        return this.adapters.has(name.toLowerCase());
    }
    isAdapterReady(name) {
        const adapter = this.adapters.get(name.toLowerCase());
        return adapter ? adapter.isReady() : false;
    }
    setDefaultAdapter(name) {
        if (!this.hasAdapter(name)) {
            throw new exceptions_1.StorageConfigurationException(`Cannot set '${name}' as default adapter. Adapter not registered.`, {
                adapterName: name,
                availableAdapters: this.getAvailableAdapters(),
            });
        }
        this.defaultAdapter = name.toLowerCase();
        return this;
    }
    setFallbackEnabled(enabled) {
        this.enableFallback = enabled;
        return this;
    }
    removeAdapter(name) {
        this.adapters.delete(name.toLowerCase());
        this.factories.delete(name.toLowerCase());
        this.adapterConfigs.delete(name.toLowerCase());
        if (this.defaultAdapter === name.toLowerCase()) {
            this.defaultAdapter = undefined;
        }
        return this;
    }
    clear() {
        this.adapters.clear();
        this.factories.clear();
        this.adapterConfigs.clear();
        this.defaultAdapter = undefined;
        return this;
    }
    getSortedAdapters() {
        return Array.from(this.adapters.entries()).sort((a, b) => {
            const configA = this.adapterConfigs.get(a[0]);
            const configB = this.adapterConfigs.get(b[0]);
            const priorityA = configA?.priority ?? 0;
            const priorityB = configB?.priority ?? 0;
            return priorityB - priorityA;
        });
    }
}
exports.StorageManager = StorageManager;
//# sourceMappingURL=storage-manager.js.map