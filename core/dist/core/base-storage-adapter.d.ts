import { IStorageAdapter } from '../interfaces/storage-adapter.interface';
import { StorageConfig } from '../interfaces/storage-config.interface';
import { StorageFile, UploadOptions, UploadResponse, DownloadOptions, DownloadResponse, DeleteOptions, DeleteResponse, GetResponse, ListOptions, ListResponse, ExistsResponse } from '../interfaces';
export declare abstract class BaseStorageAdapter implements IStorageAdapter {
    protected config: StorageConfig;
    protected providerName: string;
    constructor(config: StorageConfig, providerName: string);
    protected validateConfig(): void;
    getProviderName(): string;
    isReady(): boolean;
    abstract upload(file: StorageFile, options?: UploadOptions): Promise<UploadResponse>;
    abstract download(key: string, options?: DownloadOptions): Promise<DownloadResponse>;
    abstract delete(key: string, options?: DeleteOptions): Promise<DeleteResponse>;
    abstract get(key: string): Promise<GetResponse>;
    abstract list(options?: ListOptions): Promise<ListResponse>;
    abstract exists(key: string): Promise<ExistsResponse>;
}
//# sourceMappingURL=base-storage-adapter.d.ts.map