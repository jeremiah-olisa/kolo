export interface StorageConfig {
    provider: string;
    debug?: boolean;
    timeout?: number;
}
export interface S3Config extends StorageConfig {
    region: string;
    bucket: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    endpoint?: string;
    forcePathStyle?: boolean;
    acl?: string;
    basePath?: string;
}
export interface CloudinaryConfig extends StorageConfig {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
    folder?: string;
    secure?: boolean;
    resourceType?: 'image' | 'video' | 'raw' | 'auto';
}
export interface LocalConfig extends StorageConfig {
    rootPath: string;
    baseUrl?: string;
    createDirectory?: boolean;
    filePermissions?: number;
    directoryPermissions?: number;
}
//# sourceMappingURL=storage-config.interface.d.ts.map