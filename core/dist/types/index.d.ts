export declare enum StorageStatus {
    SUCCESS = "success",
    FAILED = "failed",
    PENDING = "pending"
}
export declare enum StorageProvider {
    S3 = "s3",
    CLOUDINARY = "cloudinary",
    LOCAL = "local",
    AZURE = "azure"
}
export interface StorageMetadata {
    [key: string]: any;
}
export interface StorageFile {
    filename: string;
    size: number;
    mimeType: string;
    content: Buffer | any;
    metadata?: StorageMetadata;
}
export interface StorageObject {
    key: string;
    url?: string;
    publicUrl?: string;
    size?: number;
    contentType?: string;
    lastModified?: Date;
    etag?: string;
    metadata?: StorageMetadata;
}
export interface StorageError {
    code: string;
    message: string;
    details?: any;
}
export interface UploadOptions {
    key?: string;
    public?: boolean;
    contentType?: string;
    metadata?: StorageMetadata;
    expiresIn?: number;
}
export interface DownloadOptions {
    expiresIn?: number;
    forceDownload?: boolean;
    filename?: string;
}
export interface DeleteOptions {
    allVersions?: boolean;
}
export interface ListOptions {
    prefix?: string;
    maxKeys?: number;
    continuationToken?: string;
}
export interface ListResult {
    objects: StorageObject[];
    nextContinuationToken?: string;
    hasMore: boolean;
}
//# sourceMappingURL=index.d.ts.map