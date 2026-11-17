import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { config } from "../config.js";
import { db, getSettingsRow, now } from "../db.js";
import { defaultSettings } from "../defaults.js";
import { hashPassword } from "../middleware/auth.js";
import {
  certificatesList,
  educationList,
  experiences,
  profile,
  projects,
  stackCategories
} from "../../src/data.js";
import {
  certificatesListEn,
  educationListEn,
  experiencesEn,
  profileEn,
  projectsEn,
  stackCategoriesEn
} from "../../src/data.en.js";
import { slugify } from "../lib/util.js";

const json = (value: unknown) => JSON.stringify(value ?? null);

async function seedAdmin() {
  const count = (db.prepare("SELECT COUNT(*) AS count FROM admin_users").get() as { count: number })
    .count;
  if (count > 0) return;

  if (!config.admin.email || !config.admin.password) {
    console.warn(
      "[seed] Nenhum administrador criado. Defina ADMIN_EMAIL e ADMIN_PASSWORD no ficheiro .env."
    );
    return;
  }
  if (config.admin.password.length < 10) {
    console.warn("[seed] ADMIN_PASSWORD deve ter pelo menos 10 caracteres.");
  }

  const passwordHash = await hashPassword(config.admin.password);
  db.prepare(
    `INSERT INTO admin_users (id, email, password_hash, name, role, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'admin', 1, ?, ?)`
  ).run(
    randomUUID(),
    config.admin.email.toLowerCase(),
    passwordHash,
    config.admin.name,
    now(),
    now()
  );
  console.info(`[seed] Administrador criado: ${config.admin.email}`);
}

function seedProfile() {
  const count = (db.prepare("SELECT COUNT(*) AS count FROM profile").get() as { count: number })
    .count;
  if (count > 0) return;

  const content = {
    pt: {
      name: profile.name,
      title: profile.title,
      lead: profile.lead,
      rotatingLeads: profile.rotatingLeads || [],
      shortBio: profile.shortBio,
      bio: "",
      availability: "Disponível para colaborar"
    },
    en: {
      name: profileEn.name,
      title: profileEn.title,
      lead: profileEn.lead,
      rotatingLeads: profileEn.rotatingLeads || [],
      shortBio: profileEn.shortBio,
      bio: "",
      availability: "Available to collaborate"
    }
  };

  db.prepare(
    `INSERT INTO profile
     (id, content, email, phone, location, photo_url, github_url, linkedin_url, leetcode_url, codeforces_url, updated_at)
     VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    json(content),
    profile.email,
    profile.phone,
    profile.location,
    profile.photo,
    profile.githubUrl,
    profile.linkedin,
    profile.leetcode,
    profile.codeforces,
    now()
  );
}

function seedProjects() {
  const count = (db.prepare("SELECT COUNT(*) AS count FROM projects").get() as { count: number })
    .count;
  if (count > 0) return;

  const insert = db.prepare(
    `INSERT INTO projects
     (id, slug, category, status, featured, cover_url, video_url, gallery, technologies, demo_url, github_url,
      started_at, completed_at, content, published, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, 'completed', ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, 1, ?, ?, ?)`
  );

  projects.forEach((project, index) => {
    const english = projectsEn.find((item) => item.id === project.id);
    insert.run(
      project.id,
      project.id,
      project.category,
      index < 2 ? 1 : 0,
      project.coverImage || "",
      project.videoUrl || "",
      json(project.galleryImages || []),
      json({ pt: project.tech, en: english?.tech || project.tech }),
      project.demo || "",
      project.github || "",
      json({
        pt: {
          name: project.name,
          subtitle: project.subtitle,
          summary: project.summary,
          problem: project.problem,
          architecture: project.architecture,
          features: project.features,
          learnings: project.learnings
        },
        en: english
          ? {
              name: english.name,
              subtitle: english.subtitle,
              summary: english.summary,
              problem: english.problem,
              architecture: english.architecture,
              features: english.features,
              learnings: english.learnings
            }
          : undefined
      }),
      index * 10,
      now(),
      now()
    );
  });
}

function seedExperiences() {
  const count = (db.prepare("SELECT COUNT(*) AS count FROM experiences").get() as { count: number })
    .count;
  if (count > 0) return;

  const insert = db.prepare(
    `INSERT INTO experiences
     (id, company, company_logo_url, contract_type, location, start_date, end_date, is_current,
      content, technologies, photos, certificate_file, certificate_label, published, sort_order, created_at, updated_at)
     VALUES (?, ?, '', ?, ?, NULL, NULL, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`
  );

  experiences.forEach((experience, index) => {
    const english = experiencesEn.find((item) => item.id === experience.id);
    insert.run(
      experience.id,
      experience.company,
      experience.role.toLowerCase().includes("freelancer") ? "freelance" : "other",
      experience.location,
      experience.period.toLowerCase().includes("presente") ? 1 : 0,
      json({
        pt: {
          role: experience.role,
          summary: experience.summary,
          achievements: experience.bullets,
          period: experience.period
        },
        en: english
          ? {
              role: english.role,
              summary: english.summary,
              achievements: english.bullets,
              period: english.period
            }
          : undefined
      }),
      json({ pt: experience.tech, en: english?.tech || experience.tech }),
      json(experience.photos || []),
      experience.certificateFile || "",
      experience.certificateLabel || "",
      index * 10,
      now(),
      now()
    );
  });
}

function seedCertifications() {
  const count = (db.prepare("SELECT COUNT(*) AS count FROM certifications").get() as { count: number })
    .count;
  if (count > 0) return;

  const insert = db.prepare(
    `INSERT INTO certifications
     (id, issuer, issue_date, expiry_date, credential_id, verification_url, file_url, thumbnail_url,
      skills, content, published, sort_order, created_at, updated_at)
     VALUES (?, ?, NULL, NULL, '', '', ?, ?, ?, ?, 1, ?, ?, ?)`
  );

  certificatesList.forEach((certificate, index) => {
    const english = certificatesListEn.find((item) => item.id === certificate.id);
    insert.run(
      certificate.id,
      certificate.issuer,
      certificate.file,
      certificate.thumbnail || "",
      json({ pt: [], en: [] }),
      json({
        pt: {
          title: certificate.title,
          description: "",
          dateLabel: certificate.date
        },
        en: english
          ? {
              title: english.title,
              description: "",
              dateLabel: english.date
            }
          : undefined
      }),
      index * 10,
      now(),
      now()
    );
  });
}

function seedEducation() {
  const count = (db.prepare("SELECT COUNT(*) AS count FROM education").get() as { count: number })
    .count;
  if (count > 0) return;

  const insert = db.prepare(
    `INSERT INTO education
     (id, institution, degree_level, status, start_date, end_date, logo_url, content, published, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, NULL, NULL, '', ?, 1, ?, ?, ?)`
  );

  educationList.forEach((item, index) => {
    const english = educationListEn[index];
    const inProgress = item.period.toLowerCase().includes("curso");
    insert.run(
      slugify(item.school) || `education-${index}`,
      item.school,
      "",
      inProgress ? "in_progress" : "completed",
      json({
        pt: {
          degree: item.degree,
          period: item.period,
          description: item.description,
          bullets: item.bullets
        },
        en: english
          ? {
              degree: english.degree,
              period: english.period,
              description: english.description,
              bullets: english.bullets
            }
          : undefined
      }),
      index * 10,
      now(),
      now()
    );
  });
}

function seedSkills() {
  const categoryCount = (
    db.prepare("SELECT COUNT(*) AS count FROM skill_categories").get() as { count: number }
  ).count;
  if (categoryCount > 0) return;

  const keys = ["languages", "backend", "database", "devops", "ai"];
  const icons = ["Code2", "Server", "Database", "Terminal", "Sparkles"];
  const insertCategory = db.prepare(
    `INSERT INTO skill_categories (id, name, description, icon, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  const insertSkill = db.prepare(
    `INSERT INTO skills (id, name, category_id, level, published, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, NULL, 1, ?, ?, ?)`
  );

  stackCategories.forEach((category, categoryIndex) => {
    const english = stackCategoriesEn[categoryIndex];
    const categoryId = `cat-${keys[categoryIndex]}`;
    insertCategory.run(
      categoryId,
      json({ pt: category.name, en: english?.name || category.name }),
      json({
        pt: category.description,
        en: english?.description || category.description
      }),
      category.iconName || icons[categoryIndex] || "Code2",
      (categoryIndex + 1) * 10,
      now(),
      now()
    );

    category.items.forEach((item, skillIndex) => {
      insertSkill.run(
        `skill-${keys[categoryIndex]}-${slugify(item) || skillIndex}`,
        json({ pt: item, en: english?.items[skillIndex] || item }),
        categoryId,
        skillIndex * 10,
        now(),
        now()
      );
    });
  });

  const extraCategories = [
    { key: "frontend", pt: "Frontend", en: "Frontend", icon: "Layout", order: 60 },
    { key: "tools", pt: "Ferramentas", en: "Tools", icon: "Wrench", order: 70 },
    { key: "other", pt: "Outros", en: "Other", icon: "Layers", order: 80 }
  ];
  for (const extra of extraCategories) {
    insertCategory.run(
      `cat-${extra.key}`,
      json({ pt: extra.pt, en: extra.en }),
      json({ pt: "", en: "" }),
      extra.icon,
      extra.order,
      now(),
      now()
    );
  }
}

function seedCourses() {
  const count = (db.prepare("SELECT COUNT(*) AS count FROM courses").get() as { count: number })
    .count;
  if (count > 0) return;

  const insert = db.prepare(
    `INSERT INTO courses
     (id, provider, type, completed_at, url, file_url, content, published, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, '', ?, ?, 1, ?, ?, ?)`
  );

  insert.run(
    "course-node-ai",
    "Formação Técnica Especializada",
    "course",
    null,
    "certificates/Certificate_Node.js com IA Generativa na prática.pdf",
    json({
      pt: {
        title: "Node.js com IA Generativa na Prática",
        description: "Integração de modelos generativos em aplicações Node.js."
      },
      en: {
        title: "Node.js with Generative AI in Practice",
        description: "Integrating generative models into Node.js applications."
      }
    }),
    10,
    now(),
    now()
  );

  insert.run(
    "course-english",
    "OPEN MOOCs / U.S. Dept of State & FHI 360",
    "course",
    "2026-04-01",
    "certificates/English.jpg",
    json({
      pt: {
        title: "English for Career Development MOOC",
        description: "Desenvolvimento de competências de comunicação profissional em inglês."
      },
      en: {
        title: "English for Career Development MOOC",
        description: "Professional English communication skills for career development."
      }
    }),
    20,
    now(),
    now()
  );

  insert.run(
    "course-tigra",
    "Refriango / Tigra Cubs",
    "bootcamp",
    "2026-07-01",
    "certificates/TigraCubs.jpg",
    json({
      pt: {
        title: "Tigra Cubs — Bootcamp de Inovação em IA",
        description: "Bootcamp intensivo de inovação e desenvolvimento de produto com IA."
      },
      en: {
        title: "Tigra Cubs — AI Innovation Bootcamp",
        description: "Intensive AI innovation and product development bootcamp."
      }
    }),
    30,
    now(),
    now()
  );
}

function seedSettings() {
  if (getSettingsRow()) return;
  db.prepare("INSERT INTO settings (id, data, updated_at) VALUES (1, ?, ?)").run(
    json(defaultSettings),
    now()
  );
}

function seedCv() {
  const count = (db.prepare("SELECT COUNT(*) AS count FROM cvs").get() as { count: number }).count;
  if (count > 0) return;
  db.prepare(
    `INSERT INTO cvs (id, label, file_url, file_name, is_active, created_at)
     VALUES (?, ?, ?, ?, 1, ?)`
  ).run(
    "cv-default",
    "Curriculum Vitae",
    "cv/Paulo_Cardoso_CV.pdf",
    "Paulo_Cardoso_CV.pdf",
    now()
  );
}

const mimeByExtension: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".pdf": "application/pdf"
};

function walkFiles(directory: string, base = ""): string[] {
  if (!fs.existsSync(directory)) return [];
  const files: string[] = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const relative = base ? `${base}/${entry.name}` : entry.name;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(absolute, relative));
    } else if (mimeByExtension[path.extname(entry.name).toLowerCase()]) {
      files.push(relative);
    }
  }
  return files;
}

function seedMedia() {
  const insert = db.prepare(
    `INSERT OR IGNORE INTO media
     (id, filename, original_name, url, mime_type, size, kind, alt_text, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, '', ?)`
  );
  const files = walkFiles(config.publicDir);
  for (const relative of files) {
    const absolute = path.join(config.publicDir, relative);
    const extension = path.extname(relative).toLowerCase();
    const mime = mimeByExtension[extension];
    if (!mime) continue;
    const stats = fs.statSync(absolute);
    insert.run(
      `media-${randomUUID()}`,
      relative,
      path.basename(relative),
      relative,
      mime,
      stats.size,
      mime.startsWith("image/") ? "image" : "document",
      now()
    );
  }
}

export async function seedDatabase() {
  await seedAdmin();
  seedProfile();
  seedProjects();
  seedExperiences();
  seedCertifications();
  seedEducation();
  seedSkills();
  seedCourses();
  seedSettings();
  seedCv();
  seedMedia();
}

if (process.argv[1] && process.argv[1].endsWith("seed.ts")) {
  seedDatabase()
    .then(() => {
      console.info("[seed] Base de dados preparada com sucesso.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("[seed] Falha ao preparar a base de dados:", error);
      process.exit(1);
    });
}
