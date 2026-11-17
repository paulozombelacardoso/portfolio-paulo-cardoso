import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Agent } from "supertest";
import { CSRF, PDF_MINI, PNG_1X1, closeDb, loginAgent } from "./helpers";

let agent: Agent;

beforeAll(async () => {
  agent = await loginAgent();
});

afterAll(async () => {
  await closeDb();
});

function upload(buffer: Buffer, filename: string, contentType: string, folder = "projects") {
  return agent
    .post("/api/admin/media/upload")
    .set(CSRF)
    .field("folder", folder)
    .field("altText", "Teste")
    .attach("file", buffer, { filename, contentType });
}

describe("Upload de ficheiros", () => {
  it("carrega uma imagem válida e guarda os metadados (não o binário)", async () => {
    const res = await upload(PNG_1X1, "capa.png", "image/png");
    expect(res.status).toBe(201);
    expect(res.body.kind).toBe("image");
    expect(res.body.secureUrl).toMatch(/^https:\/\//);
    expect(res.body.altText).toBe("Teste");
    expect(res.body.transformations.thumbnail).toBeTruthy();
    expect(res.body).not.toHaveProperty("buffer");

    const listed = await agent.get(`/api/admin/media/${res.body.id}`);
    expect(listed.status).toBe(200);
  });

  it("carrega um PDF válido", async () => {
    const res = await upload(PDF_MINI, "certificado.pdf", "application/pdf", "certifications");
    expect(res.status).toBe(201);
    expect(res.body.kind).toBe("document");
  });

  it("rejeita ficheiros cujo conteúdo não corresponde ao tipo declarado", async () => {
    const res = await upload(Buffer.from("<?php echo 1; ?>"), "imagem.png", "image/png");
    expect(res.status).toBe(415);
  });

  it("rejeita extensão diferente do conteúdo", async () => {
    const res = await upload(PNG_1X1, "imagem.pdf", "image/png");
    expect(res.status).toBe(415);
    expect(res.body.code).toBe("EXTENSION_MISMATCH");
  });

  it("rejeita formatos não permitidos", async () => {
    const res = await upload(Buffer.from("MZ executável"), "virus.exe", "application/x-msdownload");
    expect(res.status).toBe(415);
  });

  it("rejeita imagens acima do limite", async () => {
    const big = Buffer.concat([PNG_1X1, Buffer.alloc(6 * 1024 * 1024)]);
    const res = await upload(big, "grande.png", "image/png");
    expect(res.status).toBe(413);
  });

  it("rejeita pasta de destino inválida e pedido sem ficheiro", async () => {
    expect((await upload(PNG_1X1, "a.png", "image/png", "../etc")).status).toBe(400);
    const noFile = await agent.post("/api/admin/media/upload").set(CSRF).field("folder", "projects");
    expect(noFile.status).toBe(400);
  });

  it("não elimina ficheiros em uso; substituir actualiza as referências", async () => {
    const media = (await upload(PNG_1X1, "logo.png", "image/png", "experiences")).body;
    const experience = await agent
      .post("/api/admin/experiences")
      .set(CSRF)
      .send({ company: "Empresa Media", companyLogoUrl: media.secureUrl, content: { pt: { role: "Dev" } } });
    expect(experience.status).toBe(201);

    const usage = await agent.get(`/api/admin/media/${media.id}/usage`);
    expect(usage.body.usages).toContain("Experiências");

    const blocked = await agent.delete(`/api/admin/media/${media.id}`).set(CSRF);
    expect(blocked.status).toBe(409);
    expect(blocked.body.code).toBe("FILE_IN_USE");

    const replaced = await agent
      .post(`/api/admin/media/${media.id}/replace`)
      .set(CSRF)
      .attach("file", PNG_1X1, { filename: "logo-novo.png", contentType: "image/png" });
    expect(replaced.status).toBe(200);
    expect(replaced.body.secureUrl).not.toBe(media.secureUrl);

    const updatedExperience = await agent.get(`/api/admin/experiences/${experience.body.id}`);
    expect(updatedExperience.body.companyLogoUrl).toBe(replaced.body.secureUrl);

    await agent.delete(`/api/admin/experiences/${experience.body.id}`).set(CSRF);
    expect((await agent.delete(`/api/admin/media/${media.id}`).set(CSRF)).status).toBe(204);
    expect((await agent.get(`/api/admin/media/${media.id}`)).status).toBe(404);
  });

  it("actualiza o texto alternativo e filtra a listagem", async () => {
    const media = (await upload(PNG_1X1, "filtro-unico.png", "image/png")).body;
    const patched = await agent.patch(`/api/admin/media/${media.id}`).set(CSRF).send({ altText: "Novo alt" });
    expect(patched.body.altText).toBe("Novo alt");

    const search = await agent.get("/api/admin/media?q=filtro-unico&kind=image");
    expect(search.body.items.map((item: any) => item.id)).toContain(media.id);
    const docs = await agent.get("/api/admin/media?q=filtro-unico&kind=document");
    expect(docs.body.total).toBe(0);
  });
});
