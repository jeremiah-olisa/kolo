import { BaseStorageAdapter } from '../core/base-storage-adapter';
import { CloudinaryConfig } from '../interfaces/storage-config.interface';
import { StorageFile, UploadOptions, UploadResponse, DownloadOptions, DownloadResponse, DeleteOptions, DeleteResponse, GetResponse, ListOptions, ListResponse, ExistsResponse } from '../interfaces';
export declare class CloudinaryStorageAdapter extends BaseStorageAdapter {
    private readonly cloudName;
    private readonly apiKey;
    private readonly folder?;
    private readonly secure;
    constructor(config: CloudinaryConfig);
    upload(file: StorageFile, options?: UploadOptions): Promise<UploadResponse>;
    download(key: string, options?: DownloadOptions): Promise<DownloadResponse>;
    delete(key: string, options?: DeleteOptions): Promise<DeleteResponse>;
    get(key: string): Promise<GetResponse>;
    list(options?: ListOptions): Promise<ListResponse>;
    exists(key: string): Promise<ExistsResponse>;
    isReady(): boolean;
    private getResourceType;
    private getResourceUrl;
    private generateFileKey;
    private handleError;
}
//# sourceMappingURL=cloudinary.d.ts.map