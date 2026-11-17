import cloudinaryPkg from "cloudinary";
import { config } from "../config.js";
import { logger } from "../lib/logger.js";
import { StorageError } from "./errors.js";
import type {
  MediaStorageService,
  StoredAsset,
  StorageUploadInput
} from "./types.js";

const cloudinary = cloudinaryPkg.v2;

type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, operation: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new StorageError("STORAGE_TIMEOUT", `A operação ${operation} excedeu o tempo limite.`, true));
    }, timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

function mapCloudinaryError(error: unknown, operation: "upload" | "delete" | "metadata"): StorageError {
  const value = error as { http_code?: number; name?: string; message?: string; error?: { http_code?: number } };
  const status = value?.http_code || value?.error?.http_code;
  const message = String(value?.message || "");

  if (/timeout|timed out|ETIMEDOUT/i.test(message) || value?.name === "TimeoutError") {
    return new StorageError("STORAGE_TIMEOUT", "O serviço de armazenamento não respondeu a tempo.");
  }
  if (status === 401 || status === 403) {
    return new StorageError(
      "STORAGE_AUTH",
      "As credenciais do serviço de armazenamento estão inválidas.",
      false
    );
  }
  if (status === 400 && operation === "upload") {
    return new StorageError(
      "STORAGE_INVALID_FILE",
      "O ficheiro foi recusado pelo armazenamento (conteúdo inválido ou corrompido).",
      false
    );
  }
  if (status === 404) {
    return new StorageError("STORAGE_NOT_FOUND", "O recurso não existe no armazenamento.", false);
  }
  if (status === 420 || status === 429 || (status && status >= 500)) {
    return new StorageError("STORAGE_UNAVAILABLE", "O serviço de armazenamento está indisponível.");
  }
  if (operation === "delete") {
    return new StorageError("STORAGE_DELETE_FAILED", "Não foi possível eliminar o recurso no armazenamento.");
  }
  if (operation === "metadata") {
    return new StorageError("STORAGE_METADATA_FAILED", "Não foi possível obter os metadados do recurso.");
  }
  return new StorageError("STORAGE_UPLOAD_FAILED", "Não foi possível carregar o ficheiro para o armazenamento.");
}

export class CloudinaryStorageService implements MediaStorageService {
  private readonly timeoutMs: number;
  private readonly folderPrefix: string;
  private readonly configured: boolean;

  constructor(input?: { timeoutMs?: number; folderPrefix?: string; credentials?: CloudinaryConfig }) {
    const credentials = input?.credentials || config.storage.cloudinary;
    if (!credentials) {
      throw new Error(
        "Cloudinary não está configurado. Defina CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET."
      );
    }
    cloudinary.config({
      cloud_name: credentials.cloudName,
      api_key: credentials.apiKey,
      api_secret: credentials.apiSecret,
      secure: true
    });
    this.timeoutMs = input?.timeoutMs ?? config.storage.uploadTimeoutMs;
    this.folderPrefix = input?.folderPrefix ?? config.storage.folderPrefix;
    this.configured = true;
  }

  async upload(input: StorageUploadInput): Promise<StoredAsset> {
    if (!this.configured) {
      throw new StorageError("STORAGE_AUTH", "Serviço de armazenamento não configurado.", false);
    }

    const folder = `${this.folderPrefix}/${input.folder}`;
    const result = await withTimeout(
      new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: "auto",
            use_filename: true,
            unique_filename: true,
            overwrite: false,
            filename_override: input.originalName,
            quality_analysis: false
          },
          (error, uploadResult) => {
            if (error) reject(error);
            else resolve(uploadResult);
          }
        );
        stream.on("error", reject);
        stream.end(input.buffer);
      }),
      this.timeoutMs,
      "upload"
    ).catch((error) => {
      if (error instanceof StorageError) throw error;
      const mapped = mapCloudinaryError(error, "upload");
      logger.error("Falha no upload para Cloudinary.", { code: mapped.code });
      throw mapped;
    });

    const publicId = String(result.public_id);
    const resourceType = String(result.resource_type || "image");
    const format = String(result.format || input.extension);
    return {
      publicId,
      secureUrl: String(result.secure_url),
      resourceType,
      format,
      bytes: Number(result.bytes || input.size),
      width: typeof result.width === "number" ? result.width : null,
      height: typeof result.height === "number" ? result.height : null,
      duration: typeof result.duration === "number" ? result.duration : null,
      folder,
      createdAt: result.created_at || new Date().toISOString(),
      transformations: this.generateTransformations(publicId, resourceType, format)
    };
  }

  async delete(publicId: string, resourceType: string): Promise<void> {
    try {
      const result = await withTimeout(
        cloudinary.uploader.destroy(publicId, {
          resource_type: resourceType || "image",
          invalidate: true
        }),
        this.timeoutMs,
        "delete"
      );
      const outcome = String((result as any)?.result || "");
      if (outcome && outcome !== "ok" && outcome !== "not found") {
        throw new StorageError("STORAGE_DELETE_FAILED", "O armazenamento recusou a eliminação.");
      }
    } catch (error) {
      if (error instanceof StorageError) throw error;
      const mapped = mapCloudinaryError(error, "delete");
      logger.error("Falha ao eliminar recurso no Cloudinary.", { code: mapped.code });
      throw mapped;
    }
  }

  async getMetadata(publicId: string, resourceType: string): Promise<StoredAsset | null> {
    try {
      const result: any = await withTimeout(
        cloudinary.api.resource(publicId, { resource_type: resourceType || "image" }),
        this.timeoutMs,
        "metadata"
      );
      const format = String(result.format || "");
      return {
        publicId: String(result.public_id),
        secureUrl: String(result.secure_url),
        resourceType: String(result.resource_type || resourceType || "image"),
        format,
        bytes: Number(result.bytes || 0),
        width: typeof result.width === "number" ? result.width : null,
        height: typeof result.height === "number" ? result.height : null,
        duration: typeof result.duration === "number" ? result.duration : null,
        folder: String(result.folder || ""),
        createdAt: result.created_at || "",
        transformations: this.generateTransformations(result.public_id, result.resource_type, format)
      };
    } catch (error) {
      if ((error as any)?.http_code === 404 || (error as any)?.error?.http_code === 404) {
        return null;
      }
      if (error instanceof StorageError) throw error;
      logger.error("Falha ao obter metadados do Cloudinary.", {
        code: mapCloudinaryError(error, "metadata").code
      });
      throw mapCloudinaryError(error, "metadata");
    }
  }

  generateTransformations(publicId: string, resourceType: string, format: string): Record<string, string> {
    const base = { secure: true, resource_type: resourceType || "image" } as any;
    if (resourceType === "video") {
      return {
        thumbnail: cloudinary.url(publicId, {
          ...base,
          format: "jpg",
          transformation: "so_0,c_fill,w_640,h_360,q_auto"
        }),
        preview: cloudinary.url(publicId, {
          ...base,
          transformation: "q_auto"
        }),
        full: cloudinary.url(publicId, { ...base, transformation: "q_auto" })
      };
    }
    if (format === "pdf") {
      return {
        thumbnail: cloudinary.url(publicId, {
          ...base,
          transformation: "pg_1,c_fill,w_320,h_240,q_auto,f_auto"
        }),
        preview: cloudinary.url(publicId, {
          ...base,
          transformation: "pg_1,c_limit,w_900,q_auto,f_auto"
        }),
        full: cloudinary.url(publicId, { ...base, transformation: "q_auto" }),
        download: cloudinary.url(publicId, { ...base, flags: "attachment" } as any)
      };
    }
    return {
      thumbnail: cloudinary.url(publicId, {
        ...base,
        transformation: "c_fill,w_320,h_240,q_auto,f_auto"
      }),
      card: cloudinary.url(publicId, {
        ...base,
        transformation: "c_limit,w_900,q_auto,f_auto"
      }),
      preview: cloudinary.url(publicId, {
        ...base,
        transformation: "c_limit,w_640,q_auto,f_auto"
      }),
      full: cloudinary.url(publicId, { ...base, transformation: "q_auto,f_auto" })
    };
  }
}
