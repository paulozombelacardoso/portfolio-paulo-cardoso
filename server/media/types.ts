export type MediaKind = "image" | "video" | "document";

export type MediaFolder =
  | "profile"
  | "projects"
  | "certifications"
  | "experiences"
  | "education"
  | "documents"
  | "publications";

export interface UploadFileInput {
  buffer: Buffer;
  originalName: string;
  declaredMimeType: string;
}

export interface ValidatedFile {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  extension: string;
  kind: MediaKind;
  size: number;
}

export interface StoredAsset {
  publicId: string;
  secureUrl: string;
  resourceType: string;
  format: string;
  bytes: number;
  width: number | null;
  height: number | null;
  duration: number | null;
  folder: string;
  createdAt: string;
  transformations: Record<string, string>;
}

export interface StorageUploadInput extends ValidatedFile {
  folder: MediaFolder;
}

export interface MediaStorageService {
  upload(input: StorageUploadInput): Promise<StoredAsset>;
  delete(publicId: string, resourceType: string): Promise<void>;
  getMetadata(publicId: string, resourceType: string): Promise<StoredAsset | null>;
  generateTransformations(
    publicId: string,
    resourceType: string,
    format: string
  ): Record<string, string>;
}

export interface MediaRecord {
  id: string;
  publicId: string;
  secureUrl: string;
  resourceType: string;
  format: string;
  bytes: number;
  width: number | null;
  height: number | null;
  duration: number | null;
  folder: string;
  originalName: string;
  mimeType: string;
  kind: MediaKind;
  altText: string;
  transformations: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}
