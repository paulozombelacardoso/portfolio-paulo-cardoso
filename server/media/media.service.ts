import { randomUUID } from "node:crypto";
import { all, execute, now, one, transaction } from "../db.js";
import { ApiError } from "../lib/http.js";
import { logger } from "../lib/logger.js";
import { StorageError } from "./errors.js";
import type {
  MediaFolder,
  MediaRecord,
  MediaStorageService,
  StoredAsset,
  ValidatedFile
} from "./types.js";

interface Actor {
  id?: string;
  name?: string;
}

type MediaRow = {
  id: string;
  public_id: string;
  secure_url: string;
  resource_type: string;
  format: string;
  bytes: string | number;
  width: number | null;
  height: number | null;
  duration: number | null;
  folder: string;
  original_name: string;
  mime_type: string;
  kind: MediaRecord["kind"];
  alt_text: string;
  transformations: Record<string, string>;
  created_at: string;
  updated_at: string;
};

const textReferences = [
  { label: "Perfil", table: "profile", column: "photo_url", updatedAt: true },
  { label: "Projectos", table: "projects", column: "cover_url", updatedAt: true },
  { label: "Projectos", table: "projects", column: "video_url", updatedAt: true },
  { label: "Experiências", table: "experiences", column: "company_logo_url", updatedAt: true },
  { label: "Experiências", table: "experiences", column: "certificate_file", updatedAt: true },
  { label: "Certificações", table: "certifications", column: "file_url", updatedAt: true },
  { label: "Certificações", table: "certifications", column: "thumbnail_url", updatedAt: true },
  { label: "Formação", table: "education", column: "logo_url", updatedAt: true },
  { label: "Cursos", table: "courses", column: "file_url", updatedAt: true },
  { label: "Publicações", table: "publications", column: "cover_url", updatedAt: true },
  { label: "CVs", table: "cvs", column: "file_url", updatedAt: false }
] as const;

const jsonReferences = [
  { label: "Projectos", table: "projects", column: "gallery" },
  { label: "Experiências", table: "experiences", column: "photos" },
  { label: "Configurações", table: "settings", column: "data" }
] as const;

export function serializeMedia(row: MediaRow) {
  return {
    id: row.id,
    publicId: row.public_id,
    secureUrl: row.secure_url,
    resourceType: row.resource_type,
    format: row.format,
    bytes: Number(row.bytes),
    width: row.width,
    height: row.height,
    duration: row.duration,
    folder: row.folder,
    originalName: row.original_name,
    mimeType: row.mime_type,
    kind: row.kind,
    altText: row.alt_text,
    transformations:
      typeof row.transformations === "string"
        ? JSON.parse(row.transformations)
        : row.transformations || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function translateStorageError(error: unknown): never {
  if (error instanceof StorageError) {
    const status =
      error.code === "STORAGE_INVALID_FILE"
        ? 422
        : error.code === "STORAGE_AUTH"
          ? 503
          : error.code === "STORAGE_TIMEOUT"
            ? 504
            : 502;
    throw new ApiError(status, error.message, error.code);
  }
  throw error;
}

export class MediaService {
  constructor(private readonly storage: MediaStorageService) {}

  async findById(id: string) {
    const row = await one<MediaRow>("SELECT * FROM media WHERE id = $1", [id]);
    return row ? serializeMedia(row) : null;
  }

  async findUsage(url: string): Promise<string[]> {
    const labels = new Set<string>();
    for (const reference of textReferences) {
      const row = await one(
        `SELECT 1 FROM ${reference.table} WHERE ${reference.column} = $1 LIMIT 1`,
        [url]
      );
      if (row) labels.add(reference.label);
    }
    for (const reference of jsonReferences) {
      const row = await one(
        `SELECT 1 FROM ${reference.table} WHERE POSITION($1 IN ${reference.column}::text) > 0 LIMIT 1`,
        [url]
      );
      if (row) labels.add(reference.label);
    }
    return Array.from(labels);
  }

  private async enqueueCleanup(
    asset: Pick<StoredAsset, "publicId" | "resourceType">,
    reason: string
  ) {
    try {
      await execute(
        `INSERT INTO media_cleanup_jobs
         (id, public_id, resource_type, reason, attempts, last_error, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 0, NULL, $5, $5)`,
        [randomUUID(), asset.publicId, asset.resourceType, reason, now()]
      );
      logger.warn("Recurso adicionado à fila de reconciliação.", {
        publicId: asset.publicId,
        reason
      });
    } catch (error) {
      logger.error("Não foi possível criar trabalho de reconciliação.", { error, publicId: asset.publicId });
    }
  }

  private async deleteStorageOrEnqueue(asset: Pick<StoredAsset, "publicId" | "resourceType">, reason: string) {
    try {
      await this.storage.delete(asset.publicId, asset.resourceType);
    } catch (error) {
      if (error instanceof StorageError && error.code === "STORAGE_NOT_FOUND") return;
      logger.error("Falha ao eliminar recurso no Cloudinary.", {
        publicId: asset.publicId,
        reason,
        code: error instanceof StorageError ? error.code : "UNKNOWN"
      });
      await this.enqueueCleanup(asset, reason);
    }
  }

  private async updateReferences(oldUrl: string, newUrl: string) {
    await transaction(async (client) => {
      for (const reference of textReferences) {
        await client.query(
          `UPDATE ${reference.table}
           SET ${reference.column} = $1${reference.updatedAt ? ", updated_at = NOW()" : ""}
           WHERE ${reference.column} = $2`,
          [newUrl, oldUrl]
        );
      }
      for (const reference of jsonReferences) {
        await client.query(
          `UPDATE ${reference.table}
           SET ${reference.column} = REPLACE(${reference.column}::text, $1, $2)::jsonb
           ${reference.table === "settings" ? ", updated_at = NOW()" : ", updated_at = NOW()"}
           WHERE POSITION($1 IN ${reference.column}::text) > 0`,
          [oldUrl, newUrl]
        );
      }
    });
  }

  async upload(input: ValidatedFile, folder: MediaFolder, altText: string, actor: Actor) {
    let asset: StoredAsset;
    try {
      asset = await this.storage.upload({ ...input, folder });
    } catch (error) {
      translateStorageError(error);
    }

    const id = randomUUID();
    try {
      const row = await one<MediaRow>(
        `INSERT INTO media
         (id, public_id, secure_url, resource_type, format, bytes, width, height, duration, folder,
          original_name, mime_type, kind, alt_text, transformations, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $16)
         RETURNING *`,
        [
          id,
          asset!.publicId,
          asset!.secureUrl,
          asset!.resourceType,
          asset!.format,
          asset!.bytes,
          asset!.width,
          asset!.height,
          asset!.duration,
          folder,
          input.originalName,
          input.mimeType,
          input.kind,
          altText.slice(0, 300),
          JSON.stringify(asset!.transformations),
          now()
        ]
      );

      await execute(
        `INSERT INTO activity_log (id, user_id, user_name, action, resource_type, resource_id, title, created_at)
         VALUES ($1, $2, $3, 'upload', 'media', $4, $5, $6)`,
        [randomUUID(), actor.id || null, actor.name || "", id, input.originalName, now()]
      );

      logger.info("Upload concluído.", {
        mediaId: id,
        folder,
        kind: input.kind,
        bytes: input.size
      });
      return serializeMedia(row!);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error("Falha ao persistir metadados do upload; a compensar.", { error, folder });
      await this.deleteStorageOrEnqueue(asset!, "compensação após falha de persistência");
      throw new ApiError(
        500,
        "O ficheiro foi carregado, mas não foi possível guardar os metadados. O upload foi revertido.",
        "MEDIA_PERSISTENCE_FAILED"
      );
    }
  }

  async replace(id: string, input: ValidatedFile, folder: MediaFolder, altText: string, actor: Actor) {
    const existing = await one<MediaRow>("SELECT * FROM media WHERE id = $1", [id]);
    if (!existing) throw new ApiError(404, "Ficheiro não encontrado.", "NOT_FOUND");

    let asset: StoredAsset;
    try {
      asset = await this.storage.upload({ ...input, folder });
    } catch (error) {
      translateStorageError(error);
    }

    try {
      await transaction(async (client) => {
        await client.query(
          `UPDATE media SET
             public_id = $1, secure_url = $2, resource_type = $3, format = $4, bytes = $5,
             width = $6, height = $7, duration = $8, folder = $9, original_name = $10,
             mime_type = $11, kind = $12, alt_text = $13, transformations = $14, updated_at = $15
           WHERE id = $16`,
          [
            asset!.publicId,
            asset!.secureUrl,
            asset!.resourceType,
            asset!.format,
            asset!.bytes,
            asset!.width,
            asset!.height,
            asset!.duration,
            folder,
            input.originalName,
            input.mimeType,
            input.kind,
            altText.slice(0, 300),
            JSON.stringify(asset!.transformations),
            now(),
            id
          ]
        );

        for (const reference of textReferences) {
          await client.query(
            `UPDATE ${reference.table}
             SET ${reference.column} = $1${reference.updatedAt ? ", updated_at = NOW()" : ""}
             WHERE ${reference.column} = $2`,
            [asset!.secureUrl, existing.secure_url]
          );
        }
        for (const reference of jsonReferences) {
          await client.query(
            `UPDATE ${reference.table}
             SET ${reference.column} = REPLACE(${reference.column}::text, $1, $2)::jsonb,
                 updated_at = NOW()
             WHERE POSITION($1 IN ${reference.column}::text) > 0`,
            [existing.secure_url, asset!.secureUrl]
          );
        }
      });
    } catch (error) {
      logger.error("Falha ao substituir ficheiro; a compensar o novo upload.", { error, mediaId: id });
      await this.deleteStorageOrEnqueue(asset!, "compensação após falha na substituição");
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        500,
        "Não foi possível substituir o ficheiro. A referência anterior foi mantida.",
        "MEDIA_REPLACE_FAILED"
      );
    }

    await this.deleteStorageOrEnqueue(
      { publicId: existing.public_id, resourceType: existing.resource_type },
      "ficheiro substituído"
    );

    await execute(
      `INSERT INTO activity_log (id, user_id, user_name, action, resource_type, resource_id, title, created_at)
       VALUES ($1, $2, $3, 'replace', 'media', $4, $5, $6)`,
      [randomUUID(), actor.id || null, actor.name || "", id, input.originalName, now()]
    );

    const row = await one<MediaRow>("SELECT * FROM media WHERE id = $1", [id]);
    logger.info("Ficheiro substituído.", { mediaId: id, oldPublicId: existing.public_id, newPublicId: asset!.publicId });
    return serializeMedia(row!);
  }

  async delete(id: string, actor: Actor) {
    const existing = await one<MediaRow>("SELECT * FROM media WHERE id = $1", [id]);
    if (!existing) throw new ApiError(404, "Ficheiro não encontrado.", "NOT_FOUND");

    const usages = await this.findUsage(existing.secure_url);
    if (usages.length > 0) {
      throw new ApiError(409, "O ficheiro está a ser utilizado e não pode ser eliminado.", "FILE_IN_USE");
    }

    const deleted = await execute("DELETE FROM media WHERE id = $1", [id]);
    if (deleted.rowCount !== 1) {
      throw new ApiError(404, "Ficheiro não encontrado.", "NOT_FOUND");
    }

    await this.deleteStorageOrEnqueue(
      { publicId: existing.public_id, resourceType: existing.resource_type },
      "eliminação de ficheiro"
    );

    await execute(
      `INSERT INTO activity_log (id, user_id, user_name, action, resource_type, resource_id, title, created_at)
       VALUES ($1, $2, $3, 'delete', 'media', $4, $5, $6)`,
      [randomUUID(), actor.id || null, actor.name || "", id, existing.original_name, now()]
    );

    logger.info("Ficheiro eliminado.", { mediaId: id, publicId: existing.public_id });
  }

  async updateAltText(id: string, altText: string) {
    const row = await one<MediaRow>(
      "UPDATE media SET alt_text = $1, updated_at = $2 WHERE id = $3 RETURNING *",
      [altText.slice(0, 300), now(), id]
    );
    if (!row) throw new ApiError(404, "Ficheiro não encontrado.", "NOT_FOUND");
    return serializeMedia(row);
  }

  async processCleanupJobs() {
    const jobs = await all<{
      id: string;
      public_id: string;
      resource_type: string;
      attempts: number;
    }>("SELECT * FROM media_cleanup_jobs ORDER BY created_at ASC LIMIT 50");

    for (const job of jobs) {
      try {
        await this.storage.delete(job.public_id, job.resource_type);
        await execute("DELETE FROM media_cleanup_jobs WHERE id = $1", [job.id]);
        logger.info("Trabalho de reconciliação concluído.", { publicId: job.public_id });
      } catch (error) {
        if (error instanceof StorageError && error.code === "STORAGE_NOT_FOUND") {
          await execute("DELETE FROM media_cleanup_jobs WHERE id = $1", [job.id]);
          continue;
        }
        await execute(
          `UPDATE media_cleanup_jobs SET attempts = attempts + 1, last_error = $1, updated_at = $2 WHERE id = $3`,
          [error instanceof Error ? error.message.slice(0, 500) : "Erro desconhecido", now(), job.id]
        );
        logger.warn("Trabalho de reconciliação falhou; será repetido.", {
          publicId: job.public_id,
          attempts: job.attempts + 1
        });
      }
    }
  }
}