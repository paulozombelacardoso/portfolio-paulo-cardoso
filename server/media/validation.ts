import path from "node:path";
import { fileTypeFromBuffer } from "file-type";
import { config } from "../config.js";
import { ApiError } from "../lib/http.js";
import type { MediaFolder, MediaKind, UploadFileInput, ValidatedFile } from "./types.js";

const allowed = new Map<
  string,
  { kind: MediaKind; extension: string }
>([
  ["image/png", { kind: "image", extension: "png" }],
  ["image/jpeg", { kind: "image", extension: "jpg" }],
  ["image/webp", { kind: "image", extension: "webp" }],
  ["video/mp4", { kind: "video", extension: "mp4" }],
  ["video/webm", { kind: "video", extension: "webm" }],
  ["application/pdf", { kind: "document", extension: "pdf" }]
]);

const extensionAliases: Record<string, string> = {
  ".jpg": "jpg",
  ".jpeg": "jpg",
  ".png": "png",
  ".webp": "webp",
  ".mp4": "mp4",
  ".webm": "webm",
  ".pdf": "pdf"
};

const declaredAliases: Record<string, string> = {
  "image/jpg": "image/jpeg",
  "image/pjpeg": "image/jpeg",
  "application/x-pdf": "application/pdf",
  "video/x-m4v": "video/mp4"
};

export const mediaFolders: MediaFolder[] = [
  "profile",
  "projects",
  "certifications",
  "experiences",
  "education",
  "documents",
  "publications"
];

export function isMediaFolder(value: unknown): value is MediaFolder {
  return typeof value === "string" && mediaFolders.includes(value as MediaFolder);
}

export function assertMediaFolder(value: unknown): MediaFolder {
  if (!isMediaFolder(value)) {
    throw new ApiError(
      400,
      "Pasta de destino inválida. Use profile, projects, certifications, experiences, education, documents ou publications.",
      "INVALID_FOLDER"
    );
  }
  return value;
}

function sanitizeOriginalName(name: string) {
  return path
    .basename(name || "file")
    .replace(/[\u0000-\u001f<>:"/\\|?*]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180) || "file";
}

function limitFor(kind: MediaKind) {
  if (kind === "image") return config.storage.limits.imageBytes;
  if (kind === "video") return config.storage.limits.videoBytes;
  return config.storage.limits.documentBytes;
}

function limitLabel(kind: MediaKind) {
  const bytes = limitFor(kind);
  return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MB`;
}

export async function validateUpload(input: UploadFileInput): Promise<ValidatedFile> {
  if (!input.buffer || input.buffer.length === 0) {
    throw new ApiError(400, "O ficheiro está vazio.", "EMPTY_FILE");
  }

  const declared = declaredAliases[input.declaredMimeType.toLowerCase()] || input.declaredMimeType.toLowerCase();
  if (!allowed.has(declared)) {
    throw new ApiError(
      415,
      "Formato não permitido. Formatos aceites: JPG, PNG, WebP, MP4, WebM e PDF.",
      "UNSUPPORTED_FILE"
    );
  }

  const detected = await fileTypeFromBuffer(input.buffer);
  if (!detected) {
    throw new ApiError(415, "Não foi possível identificar o formato real do ficheiro.", "UNVERIFIABLE_FILE");
  }

  const detectedMime = declaredAliases[detected.mime] || detected.mime;
  if (!allowed.has(detectedMime)) {
    throw new ApiError(415, "O conteúdo real do ficheiro não é um formato permitido.", "UNSUPPORTED_FILE");
  }
  if (declared !== detectedMime) {
    throw new ApiError(415, "O tipo MIME declarado não corresponde ao conteúdo do ficheiro.", "MIME_MISMATCH");
  }

  const originalExtension = path.extname(input.originalName || "").toLowerCase();
  const expectedExtension = allowed.get(detectedMime)!.extension;
  const normalizedExtension = extensionAliases[originalExtension];
  if (!normalizedExtension || normalizedExtension !== expectedExtension) {
    throw new ApiError(
      415,
      "A extensão do ficheiro não corresponde ao formato detectado.",
      "EXTENSION_MISMATCH"
    );
  }

  const kind = allowed.get(detectedMime)!.kind;
  if (input.buffer.length > limitFor(kind)) {
    throw new ApiError(
      413,
      `O ficheiro excede o limite de ${limitLabel(kind)} para ${kind === "image" ? "imagens" : kind === "video" ? "vídeos" : "documentos"}.`,
      "FILE_TOO_LARGE"
    );
  }

  return {
    buffer: input.buffer,
    originalName: sanitizeOriginalName(input.originalName),
    mimeType: detectedMime,
    extension: expectedExtension,
    kind,
    size: input.buffer.length
  };
}
