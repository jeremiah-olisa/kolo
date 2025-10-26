import { BaseStorageAdapter } from '../core/base-storage-adapter';
import { StorageConfig } from '../interfaces/storage-config.interface';
import { StorageFile, UploadOptions, UploadResponse, DownloadOptions, DownloadResponse, DeleteOptions, DeleteResponse, GetResponse, ListOptions, ListResponse, ExistsResponse } from '../interfaces';
export interface AzureConfig extends StorageConfig {
    accountName: string;
    accountKey?: string;
    containerName: string;
    connectionString?: string;
    basePath?: string;
}
export declare class AzureStorageAdapter extends BaseStorageAdapter {
    private readonly containerName;
    constructor(config: AzureConfig);
    upload(file: StorageFile, options?: UploadOptions): Promise<UploadResponse>;
    download(key: string, options?: DownloadOptions): Promise<DownloadResponse>;
    delete(key: string, options?: DeleteOptions): Promise<DeleteResponse>;
    get(key: string): Promise<GetResponse>;
    list(options?: ListOptions): Promise<ListResponse>;
    exists(key: string): Promise<ExistsResponse>;
    isReady(): boolean;
}
//# sourceMappingURL=azure.d.ts.map