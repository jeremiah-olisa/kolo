import { StorageErrorCode } from './storage-error-codes';
export declare class StorageException<TDetails = unknown> extends Error {
    readonly details?: TDetails | undefined;
    protected readonly _code: StorageErrorCode;
    constructor(message: string, code?: StorageErrorCode, details?: TDetails | undefined);
    get code(): StorageErrorCode;
    toJSON(): {
        name: string;
        message: string;
        code: StorageErrorCode;
        details: TDetails | undefined;
    };
}
export declare class StorageConfigurationException<TDetails = unknown> extends StorageException<TDetails> {
    constructor(message: string, details?: TDetails);
}
export declare class StorageUploadException<TDetails = unknown> extends StorageException<TDetails> {
    constructor(message: string, details?: TDetails);
}
export declare class StorageDownloadException<TDetails = unknown> extends StorageException<TDetails> {
    constructor(message: string, details?: TDetails);
}
export declare class StorageDeleteException<TDetails = unknown> extends StorageException<TDetails> {
    constructor(message: string, details?: TDetails);
}
export declare class StorageListException<TDetails = unknown> extends StorageException<TDetails> {
    constructor(message: string, details?: TDetails);
}
export declare class FileNotFoundException<TDetails = unknown> extends StorageException<TDetails> {
    constructor(key: string, details?: TDetails);
}
export declare class FileAlreadyExistsException<TDetails = unknown> extends StorageException<TDetails> {
    constructor(key: string, details?: TDetails);
}
export declare class InvalidFileTypeException<TDetails = unknown> extends StorageException<TDetails> {
    constructor(fileType: string, allowedTypes?: string[], details?: TDetails);
}
export declare class FileTooLargeException<TDetails = unknown> extends StorageException<TDetails> {
    constructor(size: number, maxSize: number, details?: TDetails);
}
export declare class StorageProviderException<TDetails = unknown> extends StorageException<TDetails> {
    readonly statusCode?: number | undefined;
    constructor(message: string, statusCode?: number | undefined, details?: TDetails);
    toJSON(): {
        statusCode: number | undefined;
        name: string;
        message: string;
        code: StorageErrorCode;
        details: TDetails | undefined;
    };
}
export declare class StorageProviderTimeoutException<TDetails = unknown> extends StorageProviderException<TDetails> {
    constructor(message?: string, details?: TDetails);
    get code(): StorageErrorCode;
}
export declare class StorageValidationException<TDetails = unknown> extends StorageException<TDetails> {
    readonly field?: string | undefined;
    constructor(message: string, field?: string | undefined, details?: TDetails);
}
export declare class InvalidKeyException<TDetails = unknown> extends StorageException<TDetails> {
    constructor(key: string, reason?: string, details?: TDetails);
}
export declare class StorageAccessDeniedException<TDetails = unknown> extends StorageException<TDetails> {
    constructor(message?: string, details?: TDetails);
}
//# sourceMappingURL=storage.exception.d.ts.map