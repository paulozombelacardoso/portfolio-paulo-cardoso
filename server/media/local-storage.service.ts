import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { config } from "../config.js";
import { StorageError } from "./errors.js";
import type { MediaStorageService, StoredAsset, StorageUploadInput } from "./types.js";

function extensionFor(mimeType: string) {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "video/mp4") return "mp4";
  if (mimeType === "video/webm") return "webm";
  return "pdf";
}

function publicUrl(key: string) {
  return `/uploads/${key}`;
}

export class LocalStorageService implements MediaStorageService {
  constructor(private readonly rootDir = config.storage.localDir) {}

  async upload(input: StorageUploadInput): Promise<StoredAsset> {
    const fileName = `${Date.now()}-${randomUUID().slice(0, 10)}.${extensionFor(input.mimeType)}`;
    const key = `${input.folder}/${fileName}`;
    const destination = path.join(this.rootDir, key);
    try {
      await fs.mkdir(path.dirname(destination), { recursive: true });
      await fs.writeFile(destination, input.buffer, { mode: 0o644 });
    } catch (error) {
      throw new StorageError("STORAGE_UPLOAD_FAILED", "Não foi possível guardar o ficheiro localmente.");
    }
    const url = publicUrl(key);
    const resourceType =
      input.kind === "video" ? "video" : input.kind === "document" ? "raw" : "image";
    return {
      publicId: key,
      secureUrl: url,
      resourceType,
      format: extensionFor(input.mimeType),
      bytes: input.size,
      width: null,
      height: null,
      duration: null,
      folder: input.folder,
      createdAt: new Date().toISOString(),
      transformations: this.generateTransformations(key, resourceType, extensionFor(input.mimeType))
    };
  }

  async delete(publicId: string): Promise<void> {
    const absolute = path.resolve(this.rootDir, publicId);
    const root = path.resolve(this.rootDir) + path.sep;
    if (!absolute.startsWith(root)) {
      throw new StorageError("STORAGE_DELETE_FAILED", "Caminho de ficheiro inválido.", false);
    }
    try {
      await fs.unlink(absolute);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
      throw new StorageError("STORAGE_DELETE_FAILED", "Não foi possível eliminar o ficheiro local.");
    }
  }

  async getMetadata(publicId: string): Promise<StoredAsset | null> {
    const absolute = path.resolve(this.rootDir, publicId);
    const root = path.resolve(this.rootDir) + path.sep;
    if (!absolute.startsWith(root)) return null;
    try {
      const stats = await fs.stat(absolute);
      return {
        publicId,
        secureUrl: publicUrl(publicId),
        resourceType: publicId.endsWith(".mp4") || publicId.endsWith(".webm") ? "video" : "image",
        format: path.extname(publicId).replace(".", ""),
        bytes: stats.size,
        width: null,
        height: null,
        duration: null,
        folder: path.dirname(publicId),
        createdAt: stats.birthtime.toISOString(),
        transformations: this.generateTransformations(publicId, "image", path.extname(publicId).slice(1))
      };
    } catch {
      return null;
    }
  }

  generateTransformations(publicId: string, _resourceType?: string, _format?: string): Record<string, string> {
    const url = publicUrl(publicId);
    return {
      thumbnail: url,
      card: url,
      preview: url,
      full: url,
      download: url
    };
  }
}
