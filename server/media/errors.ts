export class StorageError extends Error {
  code:
    | "STORAGE_AUTH"
    | "STORAGE_UNAVAILABLE"
    | "STORAGE_TIMEOUT"
    | "STORAGE_NOT_FOUND"
    | "STORAGE_UPLOAD_FAILED"
    | "STORAGE_DELETE_FAILED"
    | "STORAGE_METADATA_FAILED"
    | "STORAGE_INVALID_FILE";
  retryable: boolean;

  constructor(code: StorageError["code"], message: string, retryable = true) {
    super(message);
    this.name = "StorageError";
    this.code = code;
    this.retryable = retryable;
  }
}
