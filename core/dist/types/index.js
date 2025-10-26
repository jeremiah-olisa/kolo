"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageProvider = exports.StorageStatus = void 0;
var StorageStatus;
(function (StorageStatus) {
    StorageStatus["SUCCESS"] = "success";
    StorageStatus["FAILED"] = "failed";
    StorageStatus["PENDING"] = "pending";
})(StorageStatus || (exports.StorageStatus = StorageStatus = {}));
var StorageProvider;
(function (StorageProvider) {
    StorageProvider["S3"] = "s3";
    StorageProvider["CLOUDINARY"] = "cloudinary";
    StorageProvider["LOCAL"] = "local";
    StorageProvider["AZURE"] = "azure";
})(StorageProvider || (exports.StorageProvider = StorageProvider = {}));
//# sourceMappingURL=index.js.map