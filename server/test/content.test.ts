import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Agent } from "supertest";
import { CSRF, closeDb, getApp, loginAgent, request } from "./helpers";

let agent: Agent;

beforeAll(async () => {
  agent = await loginAgent();
});

afterAll(async () => {
  await closeDb();
});

async function publicPortfolio(lang = "pt") {
  const res = await request(await getApp()).get(`/api/public/portfolio?lang=${lang}`);
  expect(res.status).toBe(200);
  return res.body;
}

const newProject = {
  category: "Testes",
  technologies: { pt: ["Vitest"], en: ["Vitest"] },
  content: {
    pt: { name: "Projecto CMS Teste", summary: "Resumo PT", features: ["A", "B"] },
    en: { name: "CMS Test Project", summary: "EN summary" }
  }
};

describe("CRUD de conteúdos", () => {
  it("lista conteúdo seeded com paginação", async () => {
    const res = await agent.get("/api/admin/projects?pageSize=2");
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(2);
    expect(res.body.total).toBeGreaterThan(2);
    expect(res.body.pages).toBeGreaterThan(1);
    expect(typeof res.body.items[0].published).toBe("boolean");
    expect(typeof res.body.items[0].content).toBe("object");
  });

  it("pesquisa dentro do conteúdo JSON", async () => {
    const res = await agent.get("/api/admin/projects?q=minishell");
    expect(res.status).toBe(200);
    expect(res.body.total).toBeGreaterThanOrEqual(1);
  });

  it("cria, lê, actualiza e elimina um projecto", async () => {
    const created = await agent.post("/api/admin/projects").set(CSRF).send(newProject);
    expect(created.status).toBe(201);
    expect(created.body.slug).toBe("projecto-cms-teste");
    expect(created.body.published).toBe(false);
    const id = created.body.id;

    const read = await agent.get(`/api/admin/projects/${id}`);
    expect(read.body.content.pt.features).toEqual(["A", "B"]);

    const updated = await agent.patch(`/api/admin/projects/${id}`).set(CSRF).send({ featured: true, status: "archived" });
    expect(updated.status).toBe(200);
    expect(updated.body.featured).toBe(true);
    expect(updated.body.status).toBe("archived");
    expect(updated.body.content.pt.name).toBe("Projecto CMS Teste");

    const second = await agent.post("/api/admin/projects").set(CSRF).send(newProject);
    expect(second.body.slug).toBe("projecto-cms-teste-2");

    expect((await agent.delete(`/api/admin/projects/${id}`).set(CSRF)).status).toBe(204);
    expect((await agent.delete(`/api/admin/projects/${second.body.id}`).set(CSRF)).status).toBe(204);
    expect((await agent.get(`/api/admin/projects/${id}`)).status).toBe(404);
  });

  it("PATCH parcial não repõe campos omitidos (regressão Zod partial + default)", async () => {
    const created = await agent
      .post("/api/admin/projects")
      .set(CSRF)
      .send({
        ...newProject,
        coverUrl: "https://res.cloudinary.test/capa.png",
        gallery: ["https://res.cloudinary.test/g1.png"],
        githubUrl: "https://github.com/x/y",
        featured: true
      });
    const id = created.body.id;
    const toggled = await agent.patch(`/api/admin/projects/${id}`).set(CSRF).send({ published: true });
    expect(toggled.body.published).toBe(true);
    expect(toggled.body.coverUrl).toBe("https://res.cloudinary.test/capa.png");
    expect(toggled.body.gallery).toEqual(["https://res.cloudinary.test/g1.png"]);
    expect(toggled.body.githubUrl).toBe("https://github.com/x/y");
    expect(toggled.body.featured).toBe(true);
    expect(toggled.body.technologies.pt).toEqual(["Vitest"]);
    await agent.delete(`/api/admin/projects/${id}`).set(CSRF);

    const cv = await agent
      .post("/api/admin/cv")
      .set(CSRF)
      .send({ label: "CV A", fileUrl: "https://res.cloudinary.test/a.pdf", fileName: "a.pdf", isActive: true });
    const renamed = await agent.patch(`/api/admin/cv/${cv.body.id}`).set(CSRF).send({ label: "CV B" });
    expect(renamed.body.isActive).toBe(true);
    await agent.delete(`/api/admin/cv/${cv.body.id}`).set(CSRF);
  });

  it("reordena registos", async () => {
    const list = await agent.get("/api/admin/education?pageSize=100");
    const ids = list.body.items.map((item: any) => item.id).reverse();
    expect((await agent.post("/api/admin/education/reorder").set(CSRF).send({ ids })).status).toBe(200);
    const after = await agent.get("/api/admin/education?pageSize=100");
    expect(after.body.items.map((item: any) => item.id)).toEqual(ids);
  });

  it("gere experiências, certificações, formação, cursos e publicações", async () => {
    const payloads: Record<string, any> = {
      experiences: { company: "Empresa X", isCurrent: true, startDate: "2025-01-01", content: { pt: { role: "Dev", achievements: ["x"] } } },
      certifications: { issuer: "Emissor", issueDate: "2026-01-10", verificationUrl: "https://verify.example/1", content: { pt: { title: "Cert X" } } },
      education: { institution: "Universidade X", status: "completed", content: { pt: { degree: "Licenciatura" } } },
      courses: { provider: "Provider", type: "workshop", content: { pt: { title: "Workshop X" } } },
      publications: { type: "hackathon", publisher: "Org", content: { pt: { title: "Hackathon X", excerpt: "Resumo" } } }
    };
    for (const [resource, payload] of Object.entries(payloads)) {
      const created = await agent.post(`/api/admin/${resource}`).set(CSRF).send(payload);
      expect(created.status, resource).toBe(201);
      const patched = await agent.patch(`/api/admin/${resource}/${created.body.id}`).set(CSRF).send({ published: true });
      expect(patched.body.published, resource).toBe(true);
      expect((await agent.delete(`/api/admin/${resource}/${created.body.id}`).set(CSRF)).status, resource).toBe(204);
    }
  });

  it("competências exigem categoria existente e categorias em uso não podem ser eliminadas", async () => {
    const category = await agent
      .post("/api/admin/skill-categories")
      .set(CSRF)
      .send({ name: { pt: "Testes", en: "Testing" }, description: { pt: "", en: "" }, icon: "Wrench" });
    expect(category.status).toBe(201);

    const orphan = await agent.post("/api/admin/skills").set(CSRF).send({ name: { pt: "X" }, categoryId: "nao-existe" });
    expect(orphan.status).toBe(409);

    const skill = await agent
      .post("/api/admin/skills")
      .set(CSRF)
      .send({ name: { pt: "Vitest", en: "Vitest" }, categoryId: category.body.id, level: 80, published: true });
    expect(skill.status).toBe(201);
    expect(skill.body.level).toBe(80);

    expect((await agent.delete(`/api/admin/skill-categories/${category.body.id}`).set(CSRF)).status).toBe(409);
    expect((await agent.delete(`/api/admin/skills/${skill.body.id}`).set(CSRF)).status).toBe(204);
    expect((await agent.delete(`/api/admin/skill-categories/${category.body.id}`).set(CSRF)).status).toBe(204);
  });
});

describe("Validação de dados", () => {
  it("rejeita projecto sem campos obrigatórios com issues por campo", async () => {
    const res = await agent.post("/api/admin/projects").set(CSRF).send({});
    expect(res.status).toBe(422);
    const paths = res.body.issues.map((issue: any) => issue.path);
    expect(paths).toContain("category");
    expect(paths).toContain("content");
  });

  it("rejeita URLs perigosas e datas inválidas", async () => {
    const js = await agent
      .post("/api/admin/projects")
      .set(CSRF)
      .send({ ...newProject, demoUrl: "javascript:alert(1)" });
    expect(js.status).toBe(422);
    expect(js.body.issues[0].path).toBe("demoUrl");

    const traversal = await agent
      .post("/api/admin/projects")
      .set(CSRF)
      .send({ ...newProject, coverUrl: "../../etc/passwd" });
    expect(traversal.status).toBe(422);

    const date = await agent
      .post("/api/admin/projects")
      .set(CSRF)
      .send({ ...newProject, startedAt: "17/11/2026" });
    expect(date.status).toBe(422);
  });

  it("guarda HTML como texto (o frontend React escapa-o)", async () => {
    const res = await agent
      .post("/api/admin/publications")
      .set(CSRF)
      .send({ content: { pt: { title: "<script>alert(1)</script>" } }, published: true });
    expect(res.status).toBe(201);
    expect(res.body.content.pt.title).toBe("<script>alert(1)</script>");
    await agent.delete(`/api/admin/publications/${res.body.id}`).set(CSRF);
  });

  it("valida o perfil e as configurações", async () => {
    const profile = await agent.get("/api/admin/profile");
    const badEmail = await agent.put("/api/admin/profile").set(CSRF).send({ ...profile.body, email: "não-é-email" });
    expect(badEmail.status).toBe(422);

    const settings = await agent.get("/api/admin/settings");
    const { updatedAt, ...current } = settings.body;
    const missing = await agent
      .put("/api/admin/settings")
      .set(CSRF)
      .send({ ...current, sections: current.sections.slice(1) });
    expect(missing.status).toBe(422);
  });
});

describe("Publicação e integração com o portfólio público", () => {
  it("conteúdo não publicado nunca aparece; publicar/despublicar/eliminar reflecte-se", async () => {
    const created = await agent.post("/api/admin/projects").set(CSRF).send(newProject);
    const id = created.body.id;
    const names = async (lang = "pt") => (await publicPortfolio(lang)).projects.map((p: any) => p.name);

    expect(await names()).not.toContain("Projecto CMS Teste");

    await agent.patch(`/api/admin/projects/${id}`).set(CSRF).send({ published: true });
    expect(await names()).toContain("Projecto CMS Teste");
    expect(await names("en")).toContain("CMS Test Project");

    await agent
      .patch(`/api/admin/projects/${id}`)
      .set(CSRF)
      .send({ content: { pt: { name: "Projecto CMS Renomeado" } } });
    expect(await names()).toContain("Projecto CMS Renomeado");
    // EN removido → usa PT como fallback
    expect(await names("en")).toContain("Projecto CMS Renomeado");

    await agent.patch(`/api/admin/projects/${id}`).set(CSRF).send({ published: false });
    expect(await names()).not.toContain("Projecto CMS Renomeado");

    await agent.patch(`/api/admin/projects/${id}`).set(CSRF).send({ published: true });
    await agent.delete(`/api/admin/projects/${id}`).set(CSRF);
    expect(await names()).not.toContain("Projecto CMS Renomeado");
  });

  it("perfil actualizado aparece no portfólio", async () => {
    const profile = await agent.get("/api/admin/profile");
    const { updatedAt, ...body } = profile.body;
    const original = body.location;
    await agent.put("/api/admin/profile").set(CSRF).send({ ...body, location: "Benguela, Angola" });
    expect((await publicPortfolio()).profile.location).toBe("Benguela, Angola");
    await agent.put("/api/admin/profile").set(CSRF).send({ ...body, location: original });
  });

  it("secções e modo de manutenção controlados pelas configurações", async () => {
    const settings = await agent.get("/api/admin/settings");
    const { updatedAt, ...current } = settings.body;

    const hidden = {
      ...current,
      sections: current.sections.map((s: any) => (s.key === "projects" ? { ...s, visible: false } : s))
    };
    expect((await agent.put("/api/admin/settings").set(CSRF).send(hidden)).status).toBe(200);
    const sections = (await publicPortfolio()).settings.sections;
    expect(sections.find((s: any) => s.key === "projects").visible).toBe(false);

    await agent.put("/api/admin/settings").set(CSRF).send({ ...current, sitePublished: false });
    const maintenance = await publicPortfolio();
    expect(maintenance.sitePublished).toBe(false);
    expect(maintenance.projects).toBeUndefined();
    expect(maintenance.profile).toBeUndefined();

    expect((await agent.put("/api/admin/settings").set(CSRF).send(current)).status).toBe(200);
    expect((await publicPortfolio()).sitePublished).toBe(true);
  });

  it("CV activo é único e é o usado pelo portfólio", async () => {
    const created = await agent
      .post("/api/admin/cv")
      .set(CSRF)
      .send({ label: "CV Teste", fileUrl: "https://res.cloudinary.test/cv.pdf", fileName: "cv-teste.pdf", isActive: true });
    expect(created.status).toBe(201);
    const list = await agent.get("/api/admin/cv");
    expect(list.body.items.filter((item: any) => item.isActive)).toHaveLength(1);
    expect((await publicPortfolio()).profile.cvFile).toBe("https://res.cloudinary.test/cv.pdf");

    await agent.delete(`/api/admin/cv/${created.body.id}`).set(CSRF);
    const after = await agent.get("/api/admin/cv");
    expect(after.body.items.filter((item: any) => item.isActive)).toHaveLength(1);
  });

  it("dashboard conta publicados e rascunhos", async () => {
    const res = await agent.get("/api/admin/dashboard");
    expect(res.status).toBe(200);
    const projects = res.body.stats.find((s: any) => s.key === "projects");
    expect(projects.total).toBe(projects.published + projects.drafts);
    expect(Array.isArray(res.body.recent)).toBe(true);
  });
});
