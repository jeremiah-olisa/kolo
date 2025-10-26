import { BaseStorageAdapter } from '../core/base-storage-adapter';
import { S3Config } from '../interfaces/storage-config.interface';
import { StorageFile, UploadOptions, UploadResponse, DownloadOptions, DownloadResponse, DeleteOptions, DeleteResponse, GetResponse, ListOptions, ListResponse, ExistsResponse } from '../interfaces';
export declare class S3StorageAdapter extends BaseStorageAdapter {
    private readonly bucket;
    private readonly region;
    private readonly basePath?;
    constructor(config: S3Config);
    upload(file: StorageFile, options?: UploadOptions): Promise<UploadResponse>;
    download(key: string, options?: DownloadOptions): Promise<DownloadResponse>;
    delete(key: string, options?: DeleteOptions): Promise<DeleteResponse>;
    get(key: string): Promise<GetResponse>;
    list(options?: ListOptions): Promise<ListResponse>;
    exists(key: string): Promise<ExistsResponse>;
    isReady(): boolean;
    private getFullKey;
    private getObjectUrl;
    private generateFileKey;
    private handleError;
}
//# sourceMappingURL=s3.d.ts.map