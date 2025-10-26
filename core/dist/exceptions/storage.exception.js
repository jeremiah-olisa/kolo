"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageAccessDeniedException = exports.InvalidKeyException = exports.StorageValidationException = exports.StorageProviderTimeoutException = exports.StorageProviderException = exports.FileTooLargeException = exports.InvalidFileTypeException = exports.FileAlreadyExistsException = exports.FileNotFoundException = exports.StorageListException = exports.StorageDeleteException = exports.StorageDownloadException = exports.StorageUploadException = exports.StorageConfigurationException = exports.StorageException = void 0;
const utils_1 = require("../utils");
const storage_error_codes_1 = require("./storage-error-codes");
class StorageException extends Error {
    constructor(message, code = storage_error_codes_1.StorageErrorCode.STORAGE_ERROR, details) {
        super(message);
        this.details = details;
        this._code = code;
        this.name = (0, utils_1.nameof)(StorageException);
        Object.setPrototypeOf(this, StorageException.prototype);
    }
    get code() {
        return this._code;
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            details: this.details,
        };
    }
}
exports.StorageException = StorageException;
class StorageConfigurationException extends StorageException {
    constructor(message, details) {
        super(message, storage_error_codes_1.StorageErrorCode.STORAGE_CONFIGURATION_ERROR, details);
        this.name = (0, utils_1.nameof)(StorageConfigurationException);
        Object.setPrototypeOf(this, StorageConfigurationException.prototype);
    }
}
exports.StorageConfigurationException = StorageConfigurationException;
class StorageUploadException extends StorageException {
    constructor(message, details) {
        super(message, storage_error_codes_1.StorageErrorCode.STORAGE_UPLOAD_ERROR, details);
        this.name = (0, utils_1.nameof)(StorageUploadException);
        Object.setPrototypeOf(this, StorageUploadException.prototype);
    }
}
exports.StorageUploadException = StorageUploadException;
class StorageDownloadException extends StorageException {
    constructor(message, details) {
        super(message, storage_error_codes_1.StorageErrorCode.STORAGE_DOWNLOAD_ERROR, details);
        this.name = (0, utils_1.nameof)(StorageDownloadException);
        Object.setPrototypeOf(this, StorageDownloadException.prototype);
    }
}
exports.StorageDownloadException = StorageDownloadException;
class StorageDeleteException extends StorageException {
    constructor(message, details) {
        super(message, storage_error_codes_1.StorageErrorCode.STORAGE_DELETE_ERROR, details);
        this.name = (0, utils_1.nameof)(StorageDeleteException);
        Object.setPrototypeOf(this, StorageDeleteException.prototype);
    }
}
exports.StorageDeleteException = StorageDeleteException;
class StorageListException extends StorageException {
    constructor(message, details) {
        super(message, storage_error_codes_1.StorageErrorCode.STORAGE_LIST_ERROR, details);
        this.name = (0, utils_1.nameof)(StorageListException);
        Object.setPrototypeOf(this, StorageListException.prototype);
    }
}
exports.StorageListException = StorageListException;
class FileNotFoundException extends StorageException {
    constructor(key, details) {
        super(`File with key '${key}' not found`, storage_error_codes_1.StorageErrorCode.FILE_NOT_FOUND, details);
        this.name = (0, utils_1.nameof)(FileNotFoundException);
        Object.setPrototypeOf(this, FileNotFoundException.prototype);
    }
}
exports.FileNotFoundException = FileNotFoundException;
class FileAlreadyExistsException extends StorageException {
    constructor(key, details) {
        super(`File with key '${key}' already exists`, storage_error_codes_1.StorageErrorCode.FILE_ALREADY_EXISTS, details);
        this.name = (0, utils_1.nameof)(FileAlreadyExistsException);
        Object.setPrototypeOf(this, FileAlreadyExistsException.prototype);
    }
}
exports.FileAlreadyExistsException = FileAlreadyExistsException;
class InvalidFileTypeException extends StorageException {
    constructor(fileType, allowedTypes, details) {
        const message = allowedTypes
            ? `File type '${fileType}' is not allowed. Allowed types: ${allowedTypes.join(', ')}`
            : `File type '${fileType}' is not allowed`;
        super(message, storage_error_codes_1.StorageErrorCode.INVALID_FILE_TYPE, { fileType, allowedTypes, ...details });
        this.name = (0, utils_1.nameof)(InvalidFileTypeException);
        Object.setPrototypeOf(this, InvalidFileTypeException.prototype);
    }
}
exports.InvalidFileTypeException = InvalidFileTypeException;
class FileTooLargeException extends StorageException {
    constructor(size, maxSize, details) {
        super(`File size ${size} bytes exceeds maximum allowed size of ${maxSize} bytes`, storage_error_codes_1.StorageErrorCode.FILE_TOO_LARGE, { size, maxSize, ...details });
        this.name = (0, utils_1.nameof)(FileTooLargeException);
        Object.setPrototypeOf(this, FileTooLargeException.prototype);
    }
}
exports.FileTooLargeException = FileTooLargeException;
class StorageProviderException extends StorageException {
    constructor(message, statusCode, details) {
        super(message, storage_error_codes_1.StorageErrorCode.STORAGE_PROVIDER_ERROR, details);
        this.statusCode = statusCode;
        this.name = (0, utils_1.nameof)(StorageProviderException);
        Object.setPrototypeOf(this, StorageProviderException.prototype);
    }
    toJSON() {
        return {
            ...super.toJSON(),
            statusCode: this.statusCode,
        };
    }
}
exports.StorageProviderException = StorageProviderException;
class StorageProviderTimeoutException extends StorageProviderException {
    constructor(message = 'Storage provider request timed out', details) {
        super(message, 408, details);
        this.name = (0, utils_1.nameof)(StorageProviderTimeoutException);
        Object.setPrototypeOf(this, StorageProviderTimeoutException.prototype);
    }
    get code() {
        return storage_error_codes_1.StorageErrorCode.STORAGE_PROVIDER_TIMEOUT;
    }
}
exports.StorageProviderTimeoutException = StorageProviderTimeoutException;
class StorageValidationException extends StorageException {
    constructor(message, field, details) {
        super(message, storage_error_codes_1.StorageErrorCode.STORAGE_VALIDATION_ERROR, { field, ...details });
        this.field = field;
        this.name = (0, utils_1.nameof)(StorageValidationException);
        Object.setPrototypeOf(this, StorageValidationException.prototype);
    }
}
exports.StorageValidationException = StorageValidationException;
class InvalidKeyException extends StorageException {
    constructor(key, reason, details) {
        const message = reason ? `Invalid storage key '${key}': ${reason}` : `Invalid storage key '${key}'`;
        super(message, storage_error_codes_1.StorageErrorCode.INVALID_KEY, { key, reason, ...details });
        this.name = (0, utils_1.nameof)(InvalidKeyException);
        Object.setPrototypeOf(this, InvalidKeyException.prototype);
    }
}
exports.InvalidKeyException = InvalidKeyException;
class StorageAccessDeniedException extends StorageException {
    constructor(message = 'Storage access denied', details) {
        super(message, storage_error_codes_1.StorageErrorCode.STORAGE_ACCESS_DENIED, details);
        this.name = (0, utils_1.nameof)(StorageAccessDeniedException);
        Object.setPrototypeOf(this, StorageAccessDeniedException.prototype);
    }
}
exports.StorageAccessDeniedException = StorageAccessDeniedException;
//# sourceMappingURL=storage.exception.js.map