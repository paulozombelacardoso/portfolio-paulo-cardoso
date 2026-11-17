import { randomUUID } from "node:crypto";
import { StorageError } from "./errors.js";
import type { MediaStorageService, StoredAsset, StorageUploadInput } from "./types.js";

export class MemoryStorageService implements MediaStorageService {
  readonly assets = new Map<string, StoredAsset>();
  readonly deleted: Array<{ publicId: string; resourceType: string }> = [];
  failUpload = false;
  failDelete = false;

  async upload(input: StorageUploadInput): Promise<StoredAsset> {
    if (this.failUpload) {
      throw new StorageError("STORAGE_UNAVAILABLE", "Armazenamento indisponível (teste).");
    }
    const publicId = `portfolio/${input.folder}/${randomUUID()}`;
    const resourceType =
      input.kind === "video" ? "video" : input.kind === "document" ? "raw" : "image";
    const asset: StoredAsset = {
      publicId,
      secureUrl: `https://res.cloudinary.test/${publicId}.${input.extension}`,
      resourceType,
      format: input.extension,
      bytes: input.size,
      width: input.kind === "image" ? 1200 : null,
      height: input.kind === "image" ? 800 : null,
      duration: input.kind === "video" ? 12 : null,
      folder: input.folder,
      createdAt: new Date().toISOString(),
      transformations: this.generateTransformations(publicId, resourceType, input.extension)
    };
    this.assets.set(publicId, asset);
    return asset;
  }

  async delete(publicId: string): Promise<void> {
    if (this.failDelete) {
      throw new StorageError("STORAGE_DELETE_FAILED", "Falha ao eliminar (teste).");
    }
    this.assets.delete(publicId);
    this.deleted.push({ publicId, resourceType: "image" });
  }

  async getMetadata(publicId: string): Promise<StoredAsset | null> {
    return this.assets.get(publicId) || null;
  }

  generateTransformations(publicId: string, resourceType: string, format: string): Record<string, string> {
    const base = `https://res.cloudinary.test/${publicId}`;
    if (resourceType === "video") {
      return {
        thumbnail: `${base}.jpg`,
        preview: `${base}.mp4`,
        full: `${base}.mp4`
      };
    }
    if (format === "pdf") {
      return {
        thumbnail: `${base}.jpg`,
        preview: `${base}.jpg`,
        full: `${base}.pdf`,
        download: `${base}.pdf`
      };
    }
    return {
      thumbnail: `${base}.jpg`,
      card: `${base}.jpg`,
      preview: `${base}.jpg`,
      full: `${base}.${format}`
    };
  }
}
