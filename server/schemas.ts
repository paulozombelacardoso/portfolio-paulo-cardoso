import { z } from "zod";

const text = (max = 4000) => z.string().trim().max(max);
const requiredText = (label: string, max = 4000, min = 1) =>
  z
    .string({ error: `${label} é obrigatório.` })
    .trim()
    .min(min, `${label} é obrigatório.`)
    .max(max, `${label} excede o limite de ${max} caracteres.`);

export const dateString = z
  .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (use AAAA-MM-DD)."), z.literal("")])
  .nullable()
  .optional();

export function isSafeAssetUrl(value: string) {
  if (!value) return true;
  if (value.length > 2048) return false;
  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return false;
  if (value.startsWith("//") || value.includes("\\") || value.includes("\0")) return false;
  return !value.split(/[\\/]/).includes("..");
}

export const assetUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => isSafeAssetUrl(value), "URL de ficheiro inválida.");

export const linkUrl = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (value) => value === "" || /^https?:\/\/[^\s]+$/i.test(value),
    "O link deve começar por http:// ou https://."
  );

const asset = assetUrl.default("");
const link = linkUrl.default("");
const bool = z.boolean().default(false);
const order = z.coerce.number().int().min(0).max(100000).default(0);
const published = bool;
const arrayOfText = (max: number, itemMax = 240) =>
  z.array(text(itemMax).min(1)).max(max).default([]);

const localizedTextList = (max: number, itemMax = 240) =>
  z
    .object({
      pt: arrayOfText(max, itemMax),
      en: arrayOfText(max, itemMax).optional()
    })
    .default({ pt: [] });

export const projectLocalized = z.object({
  name: requiredText("Nome do projecto", 160, 2),
  subtitle: text(220).default(""),
  summary: text(4000).default(""),
  problem: text(6000).default(""),
  architecture: text(6000).default(""),
  features: arrayOfText(30, 600),
  learnings: text(6000).default("")
});

export const projectContent = z.object({
  pt: projectLocalized,
  en: projectLocalized.partial().optional()
});

export const projectInput = z.object({
  slug: z
    .string()
    .trim()
    .max(140)
    .regex(/^[a-z0-9-]*$/, "O slug só pode conter letras minúsculas, números e hífens.")
    .optional(),
  category: requiredText("Categoria", 120, 2),
  status: z.enum(["in_development", "completed", "archived"]).default("completed"),
  featured: bool,
  coverUrl: asset,
  videoUrl: asset,
  gallery: arrayOfText(20, 2048),
  technologies: localizedTextList(40, 80),
  demoUrl: link,
  githubUrl: link,
  startedAt: dateString,
  completedAt: dateString,
  content: projectContent,
  published,
  sortOrder: order
});

export const experienceLocalized = z.object({
  role: requiredText("Cargo", 180, 2),
  summary: text(4000).default(""),
  achievements: arrayOfText(30, 600),
  period: text(120).default("")
});

export const experienceContent = z.object({
  pt: experienceLocalized,
  en: experienceLocalized.partial().optional()
});

export const experienceInput = z.object({
  company: requiredText("Empresa", 180, 2),
  companyLogoUrl: asset,
  contractType: text(80).default(""),
  location: text(180).default(""),
  startDate: dateString,
  endDate: dateString,
  isCurrent: bool,
  content: experienceContent,
  technologies: localizedTextList(40, 80),
  photos: arrayOfText(30, 2048),
  certificateFile: asset,
  certificateLabel: text(240).default(""),
  published,
  sortOrder: order
});

export const certificationLocalized = z.object({
  title: requiredText("Nome da certificação", 220, 2),
  description: text(3000).default(""),
  dateLabel: text(80).default("")
});

export const certificationContent = z.object({
  pt: certificationLocalized,
  en: certificationLocalized.partial().optional()
});

export const certificationInput = z.object({
  issuer: requiredText("Instituição emissora", 220, 2),
  issueDate: dateString,
  expiryDate: dateString,
  credentialId: text(180).default(""),
  verificationUrl: link,
  fileUrl: asset,
  thumbnailUrl: asset,
  skills: localizedTextList(30, 120),
  content: certificationContent,
  published,
  sortOrder: order
});

export const skillCategoryInput = z.object({
  key: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Use letras minúsculas, números e hífens.")
    .optional(),
  name: z.object({
    pt: requiredText("Nome da categoria", 100, 2),
    en: text(100).default("")
  }),
  description: z.object({
    pt: text(500).default(""),
    en: text(500).default("")
  }),
  descriptionDefault: z.object({
    pt: text(500).default(""),
    en: text(500).default("")
  }).optional(),
  icon: text(60).default("Code2"),
  sortOrder: order
});

export const skillInput = z.object({
  name: z.object({
    pt: requiredText("Competência", 100, 1),
    en: text(100).default("")
  }),
  categoryId: requiredText("Categoria", 100, 1),
  level: z.union([z.coerce.number().int().min(0).max(100), z.null()]).optional(),
  published,
  sortOrder: order
});

export const educationLocalized = z.object({
  degree: requiredText("Curso / grau", 240, 2),
  period: text(120).default(""),
  description: text(4000).default(""),
  bullets: arrayOfText(30, 600)
});

export const educationContent = z.object({
  pt: educationLocalized,
  en: educationLocalized.partial().optional()
});

export const educationInput = z.object({
  institution: requiredText("Instituição", 220, 2),
  degreeLevel: text(160).default(""),
  status: z.enum(["in_progress", "completed", "incomplete"]).default("in_progress"),
  startDate: dateString,
  endDate: dateString,
  logoUrl: asset,
  content: educationContent,
  published,
  sortOrder: order
});

export const courseLocalized = z.object({
  title: requiredText("Nome do curso", 240, 2),
  description: text(4000).default("")
});

export const courseContent = z.object({
  pt: courseLocalized,
  en: courseLocalized.partial().optional()
});

export const courseInput = z.object({
  provider: requiredText("Entidade formadora", 220, 1),
  type: z.enum(["course", "workshop", "bootcamp", "certification_prep", "other"]).default("course"),
  completedAt: dateString,
  url: link,
  fileUrl: asset,
  content: courseContent,
  published,
  sortOrder: order
});

export const publicationLocalized = z.object({
  title: requiredText("Título", 260, 2),
  excerpt: text(1200).default(""),
  body: text(20000).default("")
});

export const publicationContent = z.object({
  pt: publicationLocalized,
  en: publicationLocalized.partial().optional()
});

export const publicationInput = z.object({
  type: z.enum(["article", "technical_post", "event", "hackathon", "talk", "other"]).default("article"),
  publisher: text(220).default(""),
  publishedAt: dateString,
  url: link,
  coverUrl: asset,
  content: publicationContent,
  published,
  sortOrder: order
});

export const profileLocalized = z.object({
  name: requiredText("Nome", 160, 2),
  title: requiredText("Título profissional", 220, 2),
  lead: text(1200).default(""),
  rotatingLeads: arrayOfText(10, 400),
  shortBio: text(4000).default(""),
  bio: text(12000).default(""),
  availability: text(240).default("")
});

export const profileInput = z.object({
  content: z.object({
    pt: profileLocalized,
    en: profileLocalized.partial().optional()
  }),
  email: z.string().trim().email("Email inválido.").max(220),
  phone: text(60).default(""),
  location: text(220).default(""),
  photoUrl: asset,
  githubUrl: link,
  linkedinUrl: link,
  leetcodeUrl: link,
  codeforcesUrl: link
});

export const sectionSetting = z.object({
  key: z
    .string()
    .trim()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9-]+$/),
  label: z.object({
    pt: z.string().trim().min(1).max(80),
    en: z.string().trim().min(1).max(80)
  }),
  visible: z.boolean(),
  order: z.coerce.number().int().min(0).max(1000)
});

export const settingsInput = z.object({
  contact: z.object({
    email: z.string().trim().email("Email inválido.").max(220),
    phone: text(60).default(""),
    location: text(220).default("")
  }),
  social: z.object({
    github: link,
    linkedin: link,
    leetcode: link,
    codeforces: link
  }),
  sections: z.array(sectionSetting).max(30),
  seo: z.object({
    title: requiredText("SEO title", 180, 2),
    description: text(400).default(""),
    ogTitle: text(180).default(""),
    ogDescription: text(400).default(""),
    ogImage: asset
  }),
  sitePublished: z.boolean(),
  maintenanceMessage: text(600).default("")
});

export const cvInput = z.object({
  label: requiredText("Nome do CV", 180, 2),
  fileUrl: assetUrl,
  fileName: requiredText("Nome do ficheiro", 220, 1),
  isActive: z.boolean().default(false)
});

export const mediaUpdateInput = z.object({
  altText: text(300).default("")
});

export const reorderInput = z.object({
  ids: z.array(z.string().trim().min(1).max(140)).min(1).max(500)
});

export const loginInput = z.object({
  email: z.string().trim().email("Email inválido."),
  password: z.string().min(1, "Palavra-passe obrigatória.").max(300)
});

export const passwordInput = z.object({
  currentPassword: z.string().min(1).max(300),
  newPassword: z
    .string()
    .min(10, "A nova palavra-passe deve ter pelo menos 10 caracteres.")
    .max(300)
    .regex(/[A-Z]/, "Inclua pelo menos uma letra maiúscula.")
    .regex(/[a-z]/, "Inclua pelo menos uma letra minúscula.")
    .regex(/[0-9]/, "Inclua pelo menos um número.")
});
