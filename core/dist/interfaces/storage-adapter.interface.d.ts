import { StorageFile, UploadOptions, DownloadOptions, DeleteOptions, ListOptions } from '../types';
import { UploadResponse, DownloadResponse, DeleteResponse, GetResponse, ListResponse, ExistsResponse } from './storage-response.interface';
export interface IStorageAdapter {
    upload(file: StorageFile, options?: UploadOptions): Promise<UploadResponse>;
    download(key: string, options?: DownloadOptions): Promise<DownloadResponse>;
    delete(key: string, options?: DeleteOptions): Promise<DeleteResponse>;
    get(key: string): Promise<GetResponse>;
    list(options?: ListOptions): Promise<ListResponse>;
    exists(key: string): Promise<ExistsResponse>;
    getProviderName(): string;
    isReady(): boolean;
}
//# sourceMappingURL=storage-adapter.interface.d.ts.map