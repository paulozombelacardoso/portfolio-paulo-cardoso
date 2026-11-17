import type { AcceptKind, MediaFolder } from "./ui";

export type FieldDef =
  | { type: "text" | "textarea" | "date" | "number" | "url"; key: string; label: string; required?: boolean; hint?: string; localized?: boolean; rows?: number }
  | { type: "select"; key: string; label: string; options: Array<{ value: string; label: string }>; localized?: false; hint?: string }
  | { type: "bool"; key: string; label: string; hint?: string; localized?: false }
  | { type: "list"; key: string; label: string; multiline?: boolean; placeholder?: string; localized?: boolean; hint?: string }
  | { type: "media"; key: string; label: string; folder: MediaFolder; accept?: AcceptKind; hint?: string; localized?: false }
  | { type: "gallery"; key: string; label: string; folder: MediaFolder; localized?: false }
  | { type: "category"; key: string; label: string; required?: boolean; localized?: false };

export interface ResourceDef {
  key: string;
  label: string;
  singular: string;
  description: string;
  /** Path do título (pt) para a listagem. */
  title: (item: any) => string;
  subtitle?: (item: any) => string;
  thumbnail?: (item: any) => string | undefined;
  badges?: (item: any) => Array<{ label: string; tone?: "neutral" | "ok" | "warn" }>;
  hasPublished: boolean;
  filters?: Array<{ param: string; label: string; options: Array<{ value: string; label: string }> }>;
  fields: FieldDef[];
  /** Campos dentro de content.{pt,en} ou {key}.{pt,en}. */
  localizedFields: FieldDef[];
  /** Raiz dos campos localizados: "content" → content.pt.X ; "" → X.pt */
  localizedRoot: "content" | "";
  defaults: () => Record<string, any>;
}

const projectStatus = [
  { value: "in_development", label: "Em desenvolvimento" },
  { value: "completed", label: "Concluído" },
  { value: "archived", label: "Arquivado" }
];
const educationStatus = [
  { value: "in_progress", label: "Em curso" },
  { value: "completed", label: "Concluída" },
  { value: "incomplete", label: "Incompleta" }
];
const courseTypes = [
  { value: "course", label: "Curso" },
  { value: "workshop", label: "Workshop" },
  { value: "bootcamp", label: "Bootcamp" },
  { value: "certification_prep", label: "Preparação para certificação" },
  { value: "other", label: "Outro" }
];
const publicationTypes = [
  { value: "article", label: "Artigo" },
  { value: "technical_post", label: "Post técnico" },
  { value: "event", label: "Evento" },
  { value: "hackathon", label: "Hackathon" },
  { value: "talk", label: "Palestra" },
  { value: "other", label: "Outro" }
];
const contractTypes = [
  { value: "", label: "—" },
  { value: "full_time", label: "Tempo inteiro" },
  { value: "part_time", label: "Tempo parcial" },
  { value: "internship", label: "Estágio" },
  { value: "freelance", label: "Freelance" },
  { value: "volunteer", label: "Voluntariado" },
  { value: "other", label: "Outro" }
];

export const labelOf = (options: Array<{ value: string; label: string }>, value: string) =>
  options.find((option) => option.value === value)?.label || value;

const pt = (item: any, key: string) => item?.content?.pt?.[key] || "";
const publishedBadge = (item: any) =>
  item.published ? { label: "Publicado", tone: "ok" as const } : { label: "Rascunho", tone: "warn" as const };

export const resources: ResourceDef[] = [
  {
    key: "projects",
    label: "Projectos",
    singular: "projecto",
    description: "Projectos técnicos apresentados no portfólio.",
    title: (item) => pt(item, "name"),
    subtitle: (item) => [item.category, labelOf(projectStatus, item.status)].filter(Boolean).join(" · "),
    thumbnail: (item) => item.coverUrl,
    badges: (item) => [publishedBadge(item), ...(item.featured ? [{ label: "Destaque" }] : [])],
    hasPublished: true,
    filters: [{ param: "status", label: "Estado", options: projectStatus }],
    localizedRoot: "content",
    fields: [
      { type: "text", key: "category", label: "Categoria", required: true, hint: "Ex.: Full Stack & IA, DevOps & Infra" },
      { type: "select", key: "status", label: "Estado", options: projectStatus },
      { type: "date", key: "startedAt", label: "Início do desenvolvimento" },
      { type: "date", key: "completedAt", label: "Conclusão" },
      { type: "url", key: "demoUrl", label: "URL de demonstração" },
      { type: "url", key: "githubUrl", label: "Repositório GitHub" },
      { type: "text", key: "slug", label: "Slug", hint: "Gerado a partir do nome se ficar vazio." },
      { type: "number", key: "sortOrder", label: "Ordem" },
      { type: "bool", key: "featured", label: "Projecto em destaque" },
      { type: "bool", key: "published", label: "Publicado" },
      { type: "media", key: "coverUrl", label: "Imagem de capa", folder: "projects", accept: "image" },
      { type: "media", key: "videoUrl", label: "Vídeo de demonstração", folder: "projects", accept: "video" },
      { type: "gallery", key: "gallery", label: "Galeria de imagens", folder: "projects" }
    ],
    localizedFields: [
      { type: "text", key: "name", label: "Nome", required: true },
      { type: "text", key: "subtitle", label: "Subtítulo" },
      { type: "textarea", key: "summary", label: "Descrição", rows: 4 },
      { type: "textarea", key: "problem", label: "Problema", rows: 4 },
      { type: "textarea", key: "architecture", label: "Arquitectura", rows: 4 },
      { type: "list", key: "features", label: "Funcionalidades", multiline: true },
      { type: "textarea", key: "learnings", label: "Aprendizagens", rows: 3 }
    ],
    defaults: () => ({
      category: "",
      status: "completed",
      featured: false,
      published: false,
      coverUrl: "",
      videoUrl: "",
      gallery: [],
      technologies: { pt: [], en: [] },
      demoUrl: "",
      githubUrl: "",
      startedAt: "",
      completedAt: "",
      sortOrder: 0,
      content: { pt: { name: "", subtitle: "", summary: "", problem: "", architecture: "", features: [], learnings: "" }, en: {} }
    })
  },
  {
    key: "experiences",
    label: "Experiências",
    singular: "experiência",
    description: "Percurso profissional.",
    title: (item) => `${pt(item, "role")} — ${item.company}`,
    subtitle: (item) => [pt(item, "period") || [item.startDate, item.isCurrent ? "Actual" : item.endDate].filter(Boolean).join(" → "), item.location].filter(Boolean).join(" · "),
    thumbnail: (item) => item.companyLogoUrl,
    badges: (item) => [publishedBadge(item), ...(item.isCurrent ? [{ label: "Actual" }] : [])],
    hasPublished: true,
    filters: [{ param: "contractType", label: "Contrato", options: contractTypes.filter((c) => c.value) }],
    localizedRoot: "content",
    fields: [
      { type: "text", key: "company", label: "Empresa", required: true },
      { type: "select", key: "contractType", label: "Tipo de contrato", options: contractTypes },
      { type: "text", key: "location", label: "Localização" },
      { type: "date", key: "startDate", label: "Data de início" },
      { type: "date", key: "endDate", label: "Data de término" },
      { type: "number", key: "sortOrder", label: "Ordem" },
      { type: "bool", key: "isCurrent", label: "Experiência actual" },
      { type: "bool", key: "published", label: "Publicado" },
      { type: "media", key: "companyLogoUrl", label: "Logótipo da empresa", folder: "experiences", accept: "image" },
      { type: "gallery", key: "photos", label: "Fotografias", folder: "experiences" },
      { type: "media", key: "certificateFile", label: "Declaração / certificado", folder: "documents", accept: "image-or-document" },
      { type: "text", key: "certificateLabel", label: "Legenda do certificado" }
    ],
    localizedFields: [
      { type: "text", key: "role", label: "Cargo", required: true },
      { type: "text", key: "period", label: "Período (texto livre)", hint: "Opcional. Se vazio, usa as datas." },
      { type: "textarea", key: "summary", label: "Responsabilidades", rows: 4 },
      { type: "list", key: "achievements", label: "Principais conquistas", multiline: true }
    ],
    defaults: () => ({
      company: "",
      companyLogoUrl: "",
      contractType: "",
      location: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      technologies: { pt: [], en: [] },
      photos: [],
      certificateFile: "",
      certificateLabel: "",
      published: false,
      sortOrder: 0,
      content: { pt: { role: "", summary: "", achievements: [], period: "" }, en: {} }
    })
  },
  {
    key: "certifications",
    label: "Certificações",
    singular: "certificação",
    description: "Certificados e credenciais.",
    title: (item) => pt(item, "title"),
    subtitle: (item) => [item.issuer, pt(item, "dateLabel") || item.issueDate].filter(Boolean).join(" · "),
    thumbnail: (item) => item.thumbnailUrl || item.fileUrl,
    badges: (item) => [publishedBadge(item)],
    hasPublished: true,
    localizedRoot: "content",
    fields: [
      { type: "text", key: "issuer", label: "Instituição emissora", required: true },
      { type: "text", key: "credentialId", label: "ID da credencial" },
      { type: "date", key: "issueDate", label: "Data de emissão" },
      { type: "date", key: "expiryDate", label: "Data de validade" },
      { type: "url", key: "verificationUrl", label: "URL de verificação" },
      { type: "number", key: "sortOrder", label: "Ordem" },
      { type: "bool", key: "published", label: "Publicado" },
      { type: "media", key: "fileUrl", label: "Certificado (imagem ou PDF)", folder: "certifications", accept: "image-or-document" },
      { type: "media", key: "thumbnailUrl", label: "Miniatura", folder: "certifications", accept: "image", hint: "Opcional. Para PDFs, mostra uma imagem no cartão." }
    ],
    localizedFields: [
      { type: "text", key: "title", label: "Nome da certificação", required: true },
      { type: "text", key: "dateLabel", label: "Data (texto livre)", hint: "Ex.: Março 2026. Se vazio, usa a data de emissão." },
      { type: "textarea", key: "description", label: "Descrição", rows: 3 }
    ],
    defaults: () => ({
      issuer: "",
      issueDate: "",
      expiryDate: "",
      credentialId: "",
      verificationUrl: "",
      fileUrl: "",
      thumbnailUrl: "",
      skills: { pt: [], en: [] },
      published: false,
      sortOrder: 0,
      content: { pt: { title: "", description: "", dateLabel: "" }, en: {} }
    })
  },
  {
    key: "education",
    label: "Formação académica",
    singular: "formação",
    description: "Percurso académico.",
    title: (item) => `${pt(item, "degree")} — ${item.institution}`,
    subtitle: (item) => [pt(item, "period"), labelOf(educationStatus, item.status)].filter(Boolean).join(" · "),
    thumbnail: (item) => item.logoUrl,
    badges: (item) => [publishedBadge(item)],
    hasPublished: true,
    filters: [{ param: "status", label: "Estado", options: educationStatus }],
    localizedRoot: "content",
    fields: [
      { type: "text", key: "institution", label: "Instituição", required: true },
      { type: "text", key: "degreeLevel", label: "Grau académico", hint: "Ex.: Licenciatura, Ensino Médio" },
      { type: "select", key: "status", label: "Estado", options: educationStatus },
      { type: "date", key: "startDate", label: "Data de início" },
      { type: "date", key: "endDate", label: "Conclusão / previsão" },
      { type: "number", key: "sortOrder", label: "Ordem" },
      { type: "bool", key: "published", label: "Publicado" },
      { type: "media", key: "logoUrl", label: "Logótipo da instituição", folder: "education", accept: "image" }
    ],
    localizedFields: [
      { type: "text", key: "degree", label: "Curso", required: true },
      { type: "text", key: "period", label: "Período (texto livre)" },
      { type: "textarea", key: "description", label: "Descrição", rows: 4 },
      { type: "list", key: "bullets", label: "Destaques", multiline: true }
    ],
    defaults: () => ({
      institution: "",
      degreeLevel: "",
      status: "in_progress",
      startDate: "",
      endDate: "",
      logoUrl: "",
      published: false,
      sortOrder: 0,
      content: { pt: { degree: "", period: "", description: "", bullets: [] }, en: {} }
    })
  },
  {
    key: "courses",
    label: "Cursos e formações",
    singular: "curso",
    description: "Cursos, workshops e bootcamps complementares.",
    title: (item) => pt(item, "title"),
    subtitle: (item) => [item.provider, labelOf(courseTypes, item.type), item.completedAt].filter(Boolean).join(" · "),
    thumbnail: (item) => item.fileUrl,
    badges: (item) => [publishedBadge(item)],
    hasPublished: true,
    filters: [{ param: "type", label: "Tipo", options: courseTypes }],
    localizedRoot: "content",
    fields: [
      { type: "text", key: "provider", label: "Entidade formadora", required: true },
      { type: "select", key: "type", label: "Tipo", options: courseTypes },
      { type: "date", key: "completedAt", label: "Data de conclusão" },
      { type: "url", key: "url", label: "Link" },
      { type: "number", key: "sortOrder", label: "Ordem" },
      { type: "bool", key: "published", label: "Publicado" },
      { type: "media", key: "fileUrl", label: "Certificado (imagem ou PDF)", folder: "certifications", accept: "image-or-document" }
    ],
    localizedFields: [
      { type: "text", key: "title", label: "Nome do curso", required: true },
      { type: "textarea", key: "description", label: "Descrição", rows: 3 }
    ],
    defaults: () => ({
      provider: "",
      type: "course",
      completedAt: "",
      url: "",
      fileUrl: "",
      published: false,
      sortOrder: 0,
      content: { pt: { title: "", description: "" }, en: {} }
    })
  },
  {
    key: "publications",
    label: "Publicações",
    singular: "publicação",
    description: "Artigos, posts técnicos, eventos e hackathons.",
    title: (item) => pt(item, "title"),
    subtitle: (item) => [labelOf(publicationTypes, item.type), item.publisher, item.publishedAt].filter(Boolean).join(" · "),
    thumbnail: (item) => item.coverUrl,
    badges: (item) => [publishedBadge(item)],
    hasPublished: true,
    filters: [{ param: "type", label: "Tipo", options: publicationTypes }],
    localizedRoot: "content",
    fields: [
      { type: "select", key: "type", label: "Tipo", options: publicationTypes },
      { type: "text", key: "publisher", label: "Publicado em / organizador" },
      { type: "date", key: "publishedAt", label: "Data" },
      { type: "url", key: "url", label: "Link" },
      { type: "number", key: "sortOrder", label: "Ordem" },
      { type: "bool", key: "published", label: "Publicado" },
      { type: "media", key: "coverUrl", label: "Imagem de capa", folder: "publications", accept: "image" }
    ],
    localizedFields: [
      { type: "text", key: "title", label: "Título", required: true },
      { type: "textarea", key: "excerpt", label: "Resumo", rows: 3 },
      { type: "textarea", key: "body", label: "Conteúdo", rows: 10 }
    ],
    defaults: () => ({
      type: "article",
      publisher: "",
      publishedAt: "",
      url: "",
      coverUrl: "",
      published: false,
      sortOrder: 0,
      content: { pt: { title: "", excerpt: "", body: "" }, en: {} }
    })
  },
  {
    key: "skills",
    label: "Competências",
    singular: "competência",
    description: "Tecnologias e competências agrupadas por categoria.",
    title: (item) => item.name?.pt || "",
    subtitle: (item) => (item.level !== null && item.level !== undefined ? `Nível ${item.level}%` : ""),
    badges: (item) => [publishedBadge(item)],
    hasPublished: true,
    localizedRoot: "",
    fields: [
      { type: "category", key: "categoryId", label: "Categoria", required: true },
      { type: "number", key: "level", label: "Nível de domínio (0–100)", hint: "Opcional." },
      { type: "number", key: "sortOrder", label: "Ordem" },
      { type: "bool", key: "published", label: "Publicado" }
    ],
    localizedFields: [{ type: "text", key: "name", label: "Nome", required: true }],
    defaults: () => ({ name: { pt: "", en: "" }, categoryId: "", level: null, published: true, sortOrder: 0 })
  },
  {
    key: "skill-categories",
    label: "Categorias de competências",
    singular: "categoria",
    description: "Backend, Frontend, Database, DevOps, Tools…",
    title: (item) => item.name?.pt || "",
    subtitle: (item) => item.icon,
    hasPublished: false,
    localizedRoot: "",
    fields: [
      { type: "text", key: "icon", label: "Ícone (lucide)", hint: "Ex.: Code2, Server, Database, Terminal, Sparkles, Layout, Wrench" },
      { type: "number", key: "sortOrder", label: "Ordem" }
    ],
    localizedFields: [
      { type: "text", key: "name", label: "Nome", required: true },
      { type: "textarea", key: "description", label: "Descrição", rows: 3 }
    ],
    defaults: () => ({ name: { pt: "", en: "" }, description: { pt: "", en: "" }, icon: "Code2", sortOrder: 0 })
  }
];

/** Campos "tecnologias" partilhados (objecto {pt: [], en: []}). */
export const techField = (key: string, label: string): FieldDef => ({ type: "list", key, label, localized: true, placeholder: "Ex.: TypeScript ↵" });

export const resourceTechFields: Record<string, FieldDef[]> = {
  projects: [techField("technologies", "Tecnologias")],
  experiences: [techField("technologies", "Tecnologias")],
  certifications: [techField("skills", "Competências relacionadas")]
};
