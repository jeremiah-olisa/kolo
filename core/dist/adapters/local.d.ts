import { BaseStorageAdapter } from '../core/base-storage-adapter';
import { LocalConfig } from '../interfaces/storage-config.interface';
import { StorageFile, UploadOptions, UploadResponse, DownloadOptions, DownloadResponse, DeleteOptions, DeleteResponse, GetResponse, ListOptions, ListResponse, ExistsResponse } from '../interfaces';
export declare class LocalStorageAdapter extends BaseStorageAdapter {
    private readonly rootPath;
    private readonly baseUrl?;
    constructor(config: LocalConfig);
    upload(file: StorageFile, options?: UploadOptions): Promise<UploadResponse>;
    download(key: string, options?: DownloadOptions): Promise<DownloadResponse>;
    delete(key: string, options?: DeleteOptions): Promise<DeleteResponse>;
    get(key: string): Promise<GetResponse>;
    list(options?: ListOptions): Promise<ListResponse>;
    exists(key: string): Promise<ExistsResponse>;
    private ensureDirectoryExists;
    private listFilesRecursive;
    private getFilePath;
    private getFileUrl;
    private generateFileKey;
    private handleError;
}
//# sourceMappingURL=local.d.ts.map