import { IStorageAdapter } from '../interfaces/storage-adapter.interface';
import { AdapterEnvConfig, AdapterFactory, StorageManagerConfig } from '../interfaces';
export declare class StorageManager {
    private readonly adapters;
    private readonly factories;
    private readonly adapterConfigs;
    private defaultAdapter?;
    private enableFallback;
    constructor(config?: StorageManagerConfig);
    registerFactory<T = AdapterEnvConfig>(name: string, factory: AdapterFactory<T>): this;
    registerAdapter(name: string, adapter: IStorageAdapter): this;
    getAdapter(name: string): IStorageAdapter;
    getDefaultAdapter(): IStorageAdapter;
    getAdapterWithFallback(preferredAdapter?: string): IStorageAdapter | null;
    getAvailableAdapters(): string[];
    getReadyAdapters(): string[];
    hasAdapter(name: string): boolean;
    isAdapterReady(name: string): boolean;
    setDefaultAdapter(name: string): this;
    setFallbackEnabled(enabled: boolean): this;
    removeAdapter(name: string): this;
    clear(): this;
    private getSortedAdapters;
}
//# sourceMappingURL=storage-manager.d.ts.map