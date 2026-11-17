import { afterAll, describe, expect, it } from "vitest";
import { CSRF, closeDb, getApp, loginAgent, request } from "./helpers";
import { TEST_ADMIN } from "./env";

afterAll(async () => {
  await closeDb();
});

describe("Autenticação administrativa", () => {
  it("recusa login sem header CSRF", async () => {
    const res = await request(await getApp()).post("/api/admin/auth/login").send(TEST_ADMIN);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("CSRF_REJECTED");
  });

  it("recusa origem não autorizada", async () => {
    const res = await request(await getApp())
      .post("/api/admin/auth/login")
      .set(CSRF)
      .set("Origin", "https://evil.example")
      .send(TEST_ADMIN);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("ORIGIN_REJECTED");
  });

  it("recusa credenciais inválidas sem revelar qual campo falhou", async () => {
    const wrongPassword = await request(await getApp())
      .post("/api/admin/auth/login")
      .set(CSRF)
      .send({ email: TEST_ADMIN.email, password: "errada-123456" });
    const wrongEmail = await request(await getApp())
      .post("/api/admin/auth/login")
      .set(CSRF)
      .send({ email: "ninguem@test.local", password: TEST_ADMIN.password });
    expect(wrongPassword.status).toBe(401);
    expect(wrongEmail.status).toBe(401);
    expect(wrongPassword.body.error).toBe(wrongEmail.body.error);
  });

  it("valida o corpo do login", async () => {
    const res = await request(await getApp()).post("/api/admin/auth/login").set(CSRF).send({ email: "x" });
    expect(res.status).toBe(422);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });

  it("inicia sessão com cookie httpOnly e não devolve o hash da password", async () => {
    const res = await request(await getApp()).post("/api/admin/auth/login").set(CSRF).send(TEST_ADMIN);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(TEST_ADMIN.email);
    expect(JSON.stringify(res.body)).not.toContain("password");
    const cookie = String(res.headers["set-cookie"]);
    expect(cookie).toContain("pc_admin_session=");
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
  });

  it("/me devolve o utilizador e o logout invalida a sessão", async () => {
    const agent = await loginAgent();
    const me = await agent.get("/api/admin/auth/me");
    expect(me.status).toBe(200);
    expect(me.body.user.role).toBe("admin");

    const logout = await agent.post("/api/admin/auth/logout").set(CSRF);
    expect(logout.status).toBe(200);
    expect((await agent.get("/api/admin/auth/me")).status).toBe(401);
  });

  it("rejeita cookie de sessão forjado", async () => {
    const res = await request(await getApp()).get("/api/admin/profile").set("Cookie", "pc_admin_session=forjado");
    expect(res.status).toBe(401);
  });

  it("valida a força da nova password", async () => {
    const agent = await loginAgent();
    const res = await agent
      .put("/api/admin/auth/password")
      .set(CSRF)
      .send({ currentPassword: TEST_ADMIN.password, newPassword: "fraca" });
    expect(res.status).toBe(422);
  });
});

describe("Protecção de rotas", () => {
  const protectedRoutes = [
    "/api/admin/dashboard",
    "/api/admin/profile",
    "/api/admin/settings",
    "/api/admin/cv",
    "/api/admin/media",
    "/api/admin/projects",
    "/api/admin/experiences",
    "/api/admin/certifications",
    "/api/admin/education",
    "/api/admin/courses",
    "/api/admin/publications",
    "/api/admin/skills",
    "/api/admin/skill-categories"
  ];

  it.each(protectedRoutes)("GET %s sem sessão → 401", async (route) => {
    const res = await request(await getApp()).get(route);
    expect(res.status).toBe(401);
  });

  it("escrita autenticada sem CSRF → 403", async () => {
    const agent = await loginAgent();
    const res = await agent.post("/api/admin/projects").send({});
    expect(res.status).toBe(403);
  });

  it("API pública não precisa de sessão", async () => {
    const res = await request(await getApp()).get("/api/public/portfolio");
    expect(res.status).toBe(200);
    expect(res.body.sitePublished).toBe(true);
  });
});
