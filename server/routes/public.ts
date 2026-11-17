import { Router, type Request } from "express";
import { db, getSettings } from "../db.js";
import { defaultSettings } from "../defaults.js";
import { asyncHandler, formatDatePt, formatPeriod, localizedValue, parseJson, pickLocale } from "../lib/util.js";

export const publicRouter = Router();

type Lang = "pt" | "en";

function getLang(req: Request): Lang {
  return req.query.lang === "en" ? "en" : "pt";
}

function parseArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  const parsed = parseJson<unknown>(typeof value === "string" ? value : null, []);
  return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
}

function localizedArray(value: unknown, lang: Lang): string[] {
  const parsed = typeof value === "string" ? parseJson<unknown>(value, []) : value;
  if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === "string");
  if (parsed && typeof parsed === "object") {
    const record = parsed as Record<string, unknown>;
    return parseArray(record[lang] ?? record.pt);
  }
  return [];
}

function fullDate(value?: string | null, lang: Lang = "pt") {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(lang === "en" ? "en-GB" : "pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function isImageFile(url: string) {
  return /\.(png|jpe?g|webp|gif)($|\?)/i.test(url);
}

function basename(url: string) {
  const clean = url.split("?")[0].split("#")[0];
  return decodeURIComponent(clean.split("/").pop() || "documento");
}

function ensureSections(settings: any) {
  if (!Array.isArray(settings?.sections) || settings.sections.length === 0) {
    return defaultSettings.sections;
  }
  return settings.sections
    .filter((section: any) => section && typeof section.key === "string")
    .slice()
    .sort((a: any, b: any) => Number(a.order) - Number(b.order));
}

function buildPortfolio(lang: Lang) {
  const settings = {
    ...defaultSettings,
    ...(getSettings() || {})
  } as typeof defaultSettings;

  if (!settings.sitePublished) {
    return {
      sitePublished: false,
      maintenanceMessage: settings.maintenanceMessage || defaultSettings.maintenanceMessage,
      seo: {
        title: settings.seo?.title || defaultSettings.seo.title,
        description: settings.seo?.description || defaultSettings.seo.description
      },
      generatedAt: new Date().toISOString()
    };
  }

  const profileRow = db.prepare("SELECT * FROM profile WHERE id = 1").get() as any;
  const profileContent = profileRow ? pickLocale<any>(parseJson(profileRow.content, {}), lang) : {};
  const activeCv = db.prepare("SELECT * FROM cvs WHERE is_active = 1 LIMIT 1").get() as any;
  const cvFile = activeCv?.file_url || "cv/Paulo_Cardoso_CV.pdf";
  const githubUrl = profileRow?.github_url || defaultSettings.social.github;

  const profile = {
    name: profileContent.name || "Paulo Cardoso",
    title: profileContent.title || "Software Engineer",
    lead: profileContent.lead || "",
    rotatingLeads: Array.isArray(profileContent.rotatingLeads) ? profileContent.rotatingLeads : [],
    shortBio: profileContent.shortBio || "",
    bio: profileContent.bio || "",
    availability: profileContent.availability || "",
    location: profileRow?.location || settings.contact.location,
    email: profileRow?.email || settings.contact.email,
    phone: profileRow?.phone || settings.contact.phone,
    github: String(githubUrl).replace(/^https?:\/\/github\.com\//i, "").replace(/\/$/, ""),
    githubUrl: githubUrl,
    linkedin: profileRow?.linkedin_url || settings.social.linkedin,
    leetcode: profileRow?.leetcode_url || settings.social.leetcode,
    codeforces: profileRow?.codeforces_url || settings.social.codeforces,
    photo: profileRow?.photo_url || "photo.png",
    cvFile,
    cvDownload: activeCv?.file_name || basename(cvFile)
  };

  const projectRows = db
    .prepare(
      "SELECT * FROM projects WHERE published = 1 ORDER BY featured DESC, sort_order ASC, created_at DESC"
    )
    .all() as any[];
  const projectItems = projectRows.map((row) => {
    const content = pickLocale<any>(parseJson(row.content, {}), lang);
    return {
      id: row.id,
      name: content.name,
      subtitle: content.subtitle || "",
      category: row.category,
      summary: content.summary || "",
      coverImage: row.cover_url || undefined,
      videoUrl: row.video_url || undefined,
      galleryImages: parseArray(row.gallery),
      problem: content.problem || "",
      architecture: content.architecture || "",
      features: Array.isArray(content.features) ? content.features : [],
      tech: localizedArray(row.technologies, lang),
      learnings: content.learnings || "",
      github: row.github_url || undefined,
      demo: row.demo_url || undefined,
      featured: row.featured === 1,
      status: row.status
    };
  });

  const experienceRows = db
    .prepare(
      `SELECT * FROM experiences WHERE published = 1
       ORDER BY sort_order ASC, COALESCE(start_date, '9999-12-31') DESC`
    )
    .all() as any[];
  const experienceItems = experienceRows.map((row) => {
    const content = pickLocale<any>(parseJson(row.content, {}), lang);
    return {
      id: row.id,
      role: content.role || "",
      company: row.company,
      companyLogo: row.company_logo_url || undefined,
      contractType: row.contract_type || "",
      period: formatPeriod(
        row.start_date,
        row.end_date,
        row.is_current === 1,
        content.period,
        lang
      ),
      location: row.location,
      summary: content.summary || "",
      bullets: Array.isArray(content.achievements) ? content.achievements : [],
      tech: localizedArray(row.technologies, lang),
      photos: parseArray(row.photos),
      certificateFile: row.certificate_file || undefined,
      certificateLabel: row.certificate_label || undefined
    };
  });

  const educationRows = db
    .prepare(
      `SELECT * FROM education WHERE published = 1
       ORDER BY sort_order ASC, COALESCE(start_date, '9999-12-31') DESC`
    )
    .all() as any[];
  const education = educationRows.map((row) => {
    const content = pickLocale<any>(parseJson(row.content, {}), lang);
    const fallbackPeriod =
      row.status === "in_progress"
        ? lang === "en"
          ? "In progress"
          : "Em curso"
        : row.status === "incomplete"
          ? lang === "en"
            ? "Incomplete"
            : "Incompleto"
          : lang === "en"
            ? "Completed"
            : "Concluído";
    return {
      id: row.id,
      school: row.institution,
      degree: content.degree || "",
      degreeLevel: row.degree_level || "",
      period: content.period || formatPeriod(row.start_date, row.end_date, false, "", lang) || fallbackPeriod,
      description: content.description || "",
      bullets: Array.isArray(content.bullets) ? content.bullets : [],
      logo: row.logo_url || undefined,
      status: row.status
    };
  });

  const certificateRows = db
    .prepare(
      `SELECT * FROM certifications WHERE published = 1
       ORDER BY sort_order ASC, COALESCE(issue_date, '1900-01-01') DESC`
    )
    .all() as any[];
  const certificates = certificateRows.map((row) => {
    const content = pickLocale<any>(parseJson(row.content, {}), lang);
    const file = row.file_url || "";
    const image = isImageFile(file);
    return {
      id: row.id,
      title: content.title || "",
      issuer: row.issuer,
      date: content.dateLabel || formatDatePt(row.issue_date, lang),
      file,
      isImage: image,
      thumbnail: row.thumbnail_url || (image ? file : undefined),
      description: content.description || "",
      credentialId: row.credential_id || "",
      verificationUrl: row.verification_url || undefined,
      expiryDate: row.expiry_date || undefined,
      skills: localizedArray(row.skills, lang)
    };
  });

  const skillRows = db
    .prepare(
      `SELECT s.*, c.name AS category_name, c.description AS category_description,
              c.icon AS category_icon, c.sort_order AS category_sort
       FROM skills s JOIN skill_categories c ON c.id = s.category_id
       WHERE s.published = 1
       ORDER BY c.sort_order ASC, s.sort_order ASC, s.name ASC`
    )
    .all() as any[];
  const categoryMap = new Map<string, any>();
  for (const row of skillRows) {
    if (!categoryMap.has(row.category_id)) {
      categoryMap.set(row.category_id, {
        name: localizedValue(row.category_name, lang),
        iconName: row.category_icon || "Code2",
        description: localizedValue(row.category_description, lang),
        items: [] as string[]
      });
    }
    const item = localizedValue(row.name, lang);
    if (item) categoryMap.get(row.category_id).items.push(item);
  }
  const stackCategories = Array.from(categoryMap.values()).filter((category) => category.items.length > 0);

  const courseRows = db
    .prepare(
      `SELECT * FROM courses WHERE published = 1
       ORDER BY sort_order ASC, COALESCE(completed_at, '1900-01-01') DESC`
    )
    .all() as any[];
  const courses = courseRows.map((row) => {
    const content = pickLocale<any>(parseJson(row.content, {}), lang);
    return {
      id: row.id,
      title: content.title || "",
      provider: row.provider,
      type: row.type,
      date: formatDatePt(row.completed_at, lang),
      description: content.description || "",
      url: row.url || undefined,
      file: row.file_url || undefined
    };
  });

  const publicationRows = db
    .prepare(
      `SELECT * FROM publications WHERE published = 1
       ORDER BY sort_order ASC, COALESCE(published_at, '1900-01-01') DESC`
    )
    .all() as any[];
  const publications = publicationRows.map((row) => {
    const content = pickLocale<any>(parseJson(row.content, {}), lang);
    return {
      id: row.id,
      title: content.title || "",
      type: row.type,
      publisher: row.publisher || "",
      date: fullDate(row.published_at, lang),
      excerpt: content.excerpt || "",
      body: content.body || "",
      url: row.url || undefined,
      coverImage: row.cover_url || undefined
    };
  });

  return {
    sitePublished: true,
    profile,
    stackCategories,
    projects: projectItems,
    experiences: experienceItems,
    educationList: education,
    certificatesList: certificates,
    courses,
    publications,
    settings: {
      contact: settings.contact,
      social: settings.social,
      sections: ensureSections(settings),
      seo: settings.seo,
      sitePublished: true,
      maintenanceMessage: settings.maintenanceMessage
    },
    seo: settings.seo,
    generatedAt: new Date().toISOString()
  };
}

publicRouter.get(
  "/portfolio",
  asyncHandler(async (req, res) => {
    const lang = getLang(req);
    res.setHeader("Cache-Control", "no-store");
    res.json(buildPortfolio(lang));
  })
);
