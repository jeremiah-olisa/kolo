import { IStorageAdapter } from './storage-adapter.interface';
export interface AdapterConfig<TConfig = AdapterEnvConfig> {
    name: string;
    config: TConfig;
    enabled?: boolean;
    priority?: number;
}
export interface StorageManagerConfig {
    adapters: AdapterConfig[];
    defaultAdapter?: string;
    enableFallback?: boolean;
}
export type AdapterFactory<T = AdapterEnvConfig> = (config: T) => IStorageAdapter;
export type AdapterEnvConfig = Record<string, string | number | boolean | undefined | object | null>;
//# sourceMappingURL=storage-factory-config.interface.d.ts.map