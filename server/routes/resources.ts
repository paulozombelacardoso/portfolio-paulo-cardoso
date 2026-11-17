import { db } from "../db.js";
import { ensureUniqueSlug, parseJson, toDbBool } from "../lib/util.js";
import { createCrudRouter, serializeRow, type CrudConfig } from "./crud.js";
import {
  certificationInput,
  courseInput,
  educationInput,
  experienceInput,
  projectInput,
  publicationInput,
  skillCategoryInput,
  skillInput
} from "../schemas.js";

const json = (value: unknown) => JSON.stringify(value ?? null);

function setIfPresent(
  target: Record<string, unknown>,
  input: Record<string, unknown>,
  inputKey: string,
  column: string,
  transform?: (value: unknown) => unknown
) {
  if (!(inputKey in input)) return;
  const value = input[inputKey];
  target[column] = transform ? transform(value) : value;
}

function localizedName(content: unknown, key = "name") {
  const value = content as { pt?: Record<string, string> };
  return value?.pt?.[key] || "";
}

const projectConfig: CrudConfig = {
  table: "projects",
  key: "projects",
  idPrefix: "prj",
  createSchema: projectInput,
  updateSchema: projectInput.partial(),
  searchColumns: ["content", "category", "technologies", "slug"],
  filters: { category: "category", status: "status" },
  orderBy: "sort_order ASC, created_at DESC",
  async prepare(input, context) {
    const row: Record<string, unknown> = {};
    const existing = context.existing as any;
    const name = input.content?.pt?.name || localizedName(existing?.content) || "projecto";
    if (context.mode === "create" || "slug" in input) {
      row.slug = await ensureUniqueSlug(
        input.slug || name,
        async (candidate) => {
          const found = await db
            .prepare("SELECT id FROM projects WHERE slug = ? AND id != ?")
            .get(candidate, context.id);
          return Boolean(found);
        },
        "project"
      );
    }
    if ("category" in input) row.category = input.category;
    if ("status" in input) row.status = input.status;
    if ("featured" in input) row.featured = toDbBool(input.featured);
    if ("coverUrl" in input) row.cover_url = input.coverUrl;
    if ("videoUrl" in input) row.video_url = input.videoUrl;
    if ("gallery" in input) row.gallery = json(input.gallery);
    if ("technologies" in input) row.technologies = json(input.technologies);
    if ("demoUrl" in input) row.demo_url = input.demoUrl;
    if ("githubUrl" in input) row.github_url = input.githubUrl;
    if ("startedAt" in input) row.started_at = input.startedAt || null;
    if ("completedAt" in input) row.completed_at = input.completedAt || null;
    if ("content" in input) row.content = json(input.content);
    if ("published" in input) row.published = toDbBool(input.published);
    if ("sortOrder" in input) row.sort_order = input.sortOrder;
    return row;
  },
  serialize: (row) =>
    serializeRow(
      row,
      ["gallery", "technologies", "content"],
      ["featured", "published"],
      {
        id: "id",
        slug: "slug",
        category: "category",
        status: "status",
        featured: "featured",
        coverUrl: "cover_url",
        videoUrl: "video_url",
        gallery: "gallery",
        technologies: "technologies",
        demoUrl: "demo_url",
        githubUrl: "github_url",
        startedAt: "started_at",
        completedAt: "completed_at",
        content: "content",
        published: "published",
        sortOrder: "sort_order"
      }
    ),
  label: (row) => localizedName(parseJson(row.content, {}))
};

const experienceConfig: CrudConfig = {
  table: "experiences",
  key: "experiences",
  idPrefix: "exp",
  createSchema: experienceInput,
  updateSchema: experienceInput.partial(),
  searchColumns: ["company", "content", "technologies", "location"],
  filters: { contractType: "contract_type" },
  orderBy: "sort_order ASC, COALESCE(start_date, '9999-12-31') DESC",
  prepare(input, context) {
    const row: Record<string, unknown> = {};
    if ("company" in input) row.company = input.company;
    if ("companyLogoUrl" in input) row.company_logo_url = input.companyLogoUrl;
    if ("contractType" in input) row.contract_type = input.contractType;
    if ("location" in input) row.location = input.location;
    if ("startDate" in input) row.start_date = input.startDate || null;
    if ("endDate" in input) row.end_date = input.endDate || null;
    if ("isCurrent" in input) row.is_current = toDbBool(input.isCurrent);
    if ("content" in input) row.content = json(input.content);
    if ("technologies" in input) row.technologies = json(input.technologies);
    if ("photos" in input) row.photos = json(input.photos);
    if ("certificateFile" in input) row.certificate_file = input.certificateFile;
    if ("certificateLabel" in input) row.certificate_label = input.certificateLabel;
    if ("published" in input) row.published = toDbBool(input.published);
    if ("sortOrder" in input) row.sort_order = input.sortOrder;
    if (context.mode === "create") {
      row.location ??= "";
      row.contract_type ??= "";
    }
    return row;
  },
  serialize: (row) =>
    serializeRow(
      row,
      ["content", "technologies", "photos"],
      ["isCurrent", "published"],
      {
        id: "id",
        company: "company",
        companyLogoUrl: "company_logo_url",
        contractType: "contract_type",
        location: "location",
        startDate: "start_date",
        endDate: "end_date",
        isCurrent: "is_current",
        content: "content",
        technologies: "technologies",
        photos: "photos",
        certificateFile: "certificate_file",
        certificateLabel: "certificate_label",
        published: "published",
        sortOrder: "sort_order"
      }
    ),
  label: (row) => row.company
};

const certificationConfig: CrudConfig = {
  table: "certifications",
  key: "certifications",
  idPrefix: "cert",
  createSchema: certificationInput,
  updateSchema: certificationInput.partial(),
  searchColumns: ["issuer", "content", "skills", "credential_id"],
  orderBy: "sort_order ASC, COALESCE(issue_date, '1900-01-01') DESC",
  prepare(input) {
    const row: Record<string, unknown> = {};
    if ("issuer" in input) row.issuer = input.issuer;
    if ("issueDate" in input) row.issue_date = input.issueDate || null;
    if ("expiryDate" in input) row.expiry_date = input.expiryDate || null;
    if ("credentialId" in input) row.credential_id = input.credentialId;
    if ("verificationUrl" in input) row.verification_url = input.verificationUrl;
    if ("fileUrl" in input) row.file_url = input.fileUrl;
    if ("thumbnailUrl" in input) row.thumbnail_url = input.thumbnailUrl;
    if ("skills" in input) row.skills = json(input.skills);
    if ("content" in input) row.content = json(input.content);
    if ("published" in input) row.published = toDbBool(input.published);
    if ("sortOrder" in input) row.sort_order = input.sortOrder;
    return row;
  },
  serialize: (row) =>
    serializeRow(
      row,
      ["skills", "content"],
      ["published"],
      {
        id: "id",
        issuer: "issuer",
        issueDate: "issue_date",
        expiryDate: "expiry_date",
        credentialId: "credential_id",
        verificationUrl: "verification_url",
        fileUrl: "file_url",
        thumbnailUrl: "thumbnail_url",
        skills: "skills",
        content: "content",
        published: "published",
        sortOrder: "sort_order"
      }
    ),
  label: (row) => localizedName(parseJson(row.content, {}), "title")
};

const educationConfig: CrudConfig = {
  table: "education",
  key: "education",
  idPrefix: "edu",
  createSchema: educationInput,
  updateSchema: educationInput.partial(),
  searchColumns: ["institution", "content", "degree_level"],
  filters: { status: "status" },
  orderBy: "sort_order ASC, COALESCE(start_date, '9999-12-31') DESC",
  prepare(input) {
    const row: Record<string, unknown> = {};
    if ("institution" in input) row.institution = input.institution;
    if ("degreeLevel" in input) row.degree_level = input.degreeLevel;
    if ("status" in input) row.status = input.status;
    if ("startDate" in input) row.start_date = input.startDate || null;
    if ("endDate" in input) row.end_date = input.endDate || null;
    if ("logoUrl" in input) row.logo_url = input.logoUrl;
    if ("content" in input) row.content = json(input.content);
    if ("published" in input) row.published = toDbBool(input.published);
    if ("sortOrder" in input) row.sort_order = input.sortOrder;
    return row;
  },
  serialize: (row) =>
    serializeRow(row, ["content"], ["published"], {
      id: "id",
      institution: "institution",
      degreeLevel: "degree_level",
      status: "status",
      startDate: "start_date",
      endDate: "end_date",
      logoUrl: "logo_url",
      content: "content",
      published: "published",
      sortOrder: "sort_order"
    }),
  label: (row) => row.institution
};

const courseConfig: CrudConfig = {
  table: "courses",
  key: "courses",
  idPrefix: "course",
  createSchema: courseInput,
  updateSchema: courseInput.partial(),
  searchColumns: ["provider", "content", "type"],
  filters: { type: "type" },
  orderBy: "sort_order ASC, COALESCE(completed_at, '1900-01-01') DESC",
  prepare(input) {
    const row: Record<string, unknown> = {};
    if ("provider" in input) row.provider = input.provider;
    if ("type" in input) row.type = input.type;
    if ("completedAt" in input) row.completed_at = input.completedAt || null;
    if ("url" in input) row.url = input.url;
    if ("fileUrl" in input) row.file_url = input.fileUrl;
    if ("content" in input) row.content = json(input.content);
    if ("published" in input) row.published = toDbBool(input.published);
    if ("sortOrder" in input) row.sort_order = input.sortOrder;
    return row;
  },
  serialize: (row) =>
    serializeRow(row, ["content"], ["published"], {
      id: "id",
      provider: "provider",
      type: "type",
      completedAt: "completed_at",
      url: "url",
      fileUrl: "file_url",
      content: "content",
      published: "published",
      sortOrder: "sort_order"
    }),
  label: (row) => localizedName(parseJson(row.content, {}), "title")
};

const publicationConfig: CrudConfig = {
  table: "publications",
  key: "publications",
  idPrefix: "pub",
  createSchema: publicationInput,
  updateSchema: publicationInput.partial(),
  searchColumns: ["publisher", "content", "type"],
  filters: { type: "type" },
  orderBy: "sort_order ASC, COALESCE(published_at, '1900-01-01') DESC",
  prepare(input) {
    const row: Record<string, unknown> = {};
    if ("type" in input) row.type = input.type;
    if ("publisher" in input) row.publisher = input.publisher;
    if ("publishedAt" in input) row.published_at = input.publishedAt || null;
    if ("url" in input) row.url = input.url;
    if ("coverUrl" in input) row.cover_url = input.coverUrl;
    if ("content" in input) row.content = json(input.content);
    if ("published" in input) row.published = toDbBool(input.published);
    if ("sortOrder" in input) row.sort_order = input.sortOrder;
    return row;
  },
  serialize: (row) =>
    serializeRow(row, ["content"], ["published"], {
      id: "id",
      type: "type",
      publisher: "publisher",
      publishedAt: "published_at",
      url: "url",
      coverUrl: "cover_url",
      content: "content",
      published: "published",
      sortOrder: "sort_order"
    }),
  label: (row) => localizedName(parseJson(row.content, {}), "title")
};

const skillConfig: CrudConfig = {
  table: "skills",
  key: "skills",
  idPrefix: "skill",
  createSchema: skillInput,
  updateSchema: skillInput.partial(),
  searchColumns: ["name"],
  filters: { categoryId: "category_id" },
  orderBy: "sort_order ASC, name ASC",
  prepare(input) {
    const row: Record<string, unknown> = {};
    if ("name" in input) row.name = json(input.name);
    if ("categoryId" in input) row.category_id = input.categoryId;
    if ("level" in input) row.level = input.level === null || input.level === "" ? null : input.level;
    if ("published" in input) row.published = toDbBool(input.published);
    if ("sortOrder" in input) row.sort_order = input.sortOrder;
    return row;
  },
  serialize: (row) =>
    serializeRow(row, ["name"], ["published"], {
      id: "id",
      name: "name",
      categoryId: "category_id",
      level: "level",
      published: "published",
      sortOrder: "sort_order"
    }),
  label: (row) => {
    const name = parseJson(row.name, {}) as { pt?: string };
    return name.pt || "Competência";
  }
};

const categoryConfig: CrudConfig = {
  table: "skill_categories",
  key: "skill-categories",
  idPrefix: "cat",
  createSchema: skillCategoryInput,
  updateSchema: skillCategoryInput.partial(),
  searchColumns: ["name", "description"],
  orderBy: "sort_order ASC, name ASC",
  prepare(input) {
    const row: Record<string, unknown> = {};
    if ("name" in input) row.name = json(input.name);
    if ("description" in input) row.description = json(input.description);
    if ("icon" in input) row.icon = input.icon;
    if ("sortOrder" in input) row.sort_order = input.sortOrder;
    return row;
  },
  serialize: (row) => {
    const result = serializeRow(row, ["name", "description"], [], {
      id: "id",
      name: "name",
      description: "description",
      icon: "icon",
      sortOrder: "sort_order"
    });
    return result;
  },
  label: (row) => {
    const name = parseJson(row.name, {}) as { pt?: string };
    return name.pt || "Categoria";
  }
};

export const crudResources: Record<string, CrudConfig> = {
  projects: projectConfig,
  experiences: experienceConfig,
  certifications: certificationConfig,
  education: educationConfig,
  courses: courseConfig,
  publications: publicationConfig,
  skills: skillConfig,
  "skill-categories": categoryConfig
};

export const crudRouters = Object.fromEntries(
  Object.entries(crudResources).map(([key, config]) => [key, createCrudRouter(config)])
);
