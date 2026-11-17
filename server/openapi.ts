import type express from "express";
import swaggerUi from "swagger-ui-express";

const swaggerUiOptions = {
  swaggerOptions: {
    deepLinking: true,
    persistAuthorization: true,
    docExpansion: "list",
    tryItOutsEnabled: true,
    withCredentials: true
  }
};

export const openApiDocument: Record<string, any> = {
  openapi: "3.0.0",
  info: {
    title: "Portfolio CMS Admin API",
    version: "1.0.0",
    description: "API documentation for the Paulo Cardoso portfolio administrative panel",
    contact: {
      name: "Paulo Cardoso",
      email: "admin@paulocardoso.dev"
    }
  },
  servers: [
    {
      url: "/api",
      description: "Development server"
    }
  ],
  tags: [
    { name: "Authentication", description: "Auth endpoints" },
    { name: "Media", description: "Media upload, replace, delete and listing" },
    { name: "Admin", description: "Admin resource CRUD endpoints" },
    { name: "Public", description: "Public portfolio API endpoints" }
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "pc_admin_session"
      },
      csrfHeader: {
        type: "apiKey",
        in: "header",
        name: "X-Requested-With",
        description: "Use o valor 'portfolio-cms' em pedidos POST/PUT/PATCH/DELETE."
      }
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "string", description: "Error message" },
          code: { type: "string", description: "Error code" },
          details: {
            type: "array",
            items: { type: "object" },
            description: "Validation error details (optional)"
          }
        },
        required: ["error", "code"]
      },
      SuccessResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", default: true }
        }
      }
    }
  },
  security: [{ cookieAuth: [] }]
};

const storedAssetSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    publicId: { type: "string" },
    secureUrl: { type: "string", format: "uri" },
    resourceType: { type: "string", enum: ["image", "video", "raw"] },
    format: { type: "string" },
    bytes: { type: "integer" },
    width: { type: ["integer", "null"] },
    height: { type: ["integer", "null"] },
    duration: { type: ["number", "null"] },
    folder: { type: "string" },
    originalName: { type: "string" },
    mimeType: { type: "string" },
    kind: { type: "string", enum: ["image", "video", "document"] },
    altText: { type: "string" },
    transformations: {
      type: "object",
      additionalProperties: { type: "string" }
    },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" }
  },
  required: ["id", "publicId", "secureUrl", "resourceType", "format", "bytes", "folder", "createdAt", "updatedAt"]
};

// Auth schemas
const loginInput = {
  type: "object",
  required: ["email", "password"],
  properties: {
    email: { type: "string", format: "email" },
    password: { type: "string", minLength: 10 }
  }
};

const passwordInput = {
  type: "object",
  required: ["currentPassword", "newPassword"],
  properties: {
    currentPassword: { type: "string", minLength: 1 },
    newPassword: {
      type: "string",
      minLength: 10,
      pattern: "^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{10,}$"
    }
  }
};

// Profile schemas
const profileInput = {
  type: "object",
  required: ["content", "email", "phone", "location", "photoUrl", "githubUrl", "linkedinUrl", "leetcodeUrl", "codeforcesUrl"],
  properties: {
    content: {
      type: "object",
      properties: {
        pt: {
          type: "object",
          properties: {
            name: { type: "string" },
            title: { type: "string" },
            lead: { type: "string" },
            rotatingLeads: { type: "array", items: { type: "string" } },
            shortBio: { type: "string" },
            bio: { type: "string" },
            availability: { type: "string" }
          },
          required: ["name", "title"]
        },
        en: {
          type: "object",
          properties: {
            name: { type: "string" },
            title: { type: "string" },
            lead: { type: "string" },
            rotatingLeads: { type: "array", items: { type: "string" } },
            shortBio: { type: "string" },
            bio: { type: "string" },
            availability: { type: "string" }
          }
        }
      }
    },
    email: { type: "string", format: "email" },
    phone: { type: "string" },
    location: { type: "string" },
    photoUrl: { type: "string", format: "uri" },
    githubUrl: { type: "string", format: "uri" },
    linkedinUrl: { type: "string", format: "uri" },
    leetcodeUrl: { type: "string", format: "uri" },
    codeforcesUrl: { type: "string", format: "uri" }
  }
};

// Settings schemas
const sectionSetting = {
  type: "object",
  required: ["key", "label", "visible", "order"],
  properties: {
    key: { type: "string", pattern: "^[a-z0-9-]+$" },
    label: {
      type: "object",
      properties: {
        pt: { type: "string" },
        en: { type: "string" }
      }
    },
    visible: { type: "boolean" },
    order: { type: "integer", minimum: 0 }
  }
};

const settingsInput = {
  type: "object",
  required: ["contact", "social", "sections", "seo", "sitePublished"],
  properties: {
    contact: {
      type: "object",
      properties: {
        email: { type: "string", format: "email" },
        phone: { type: "string" },
        location: { type: "string" }
      }
    },
    social: {
      type: "object",
      properties: {
        github: { type: "string", format: "uri" },
        linkedin: { type: "string", format: "uri" },
        leetcode: { type: "string", format: "uri" },
        codeforces: { type: "string", format: "uri" }
      }
    },
    sections: {
      type: "array",
      items: { $ref: "#/components/schemas/SectionSetting" },
      maxItems: 30
    },
    seo: {
      type: "object",
      required: ["title"],
      properties: {
        title: { type: "string", maxLength: 180 },
        description: { type: "string", maxLength: 400 },
        ogTitle: { type: "string", maxLength: 180, default: "" },
        ogDescription: { type: "string", maxLength: 400, default: "" },
        ogImage: { type: "string", format: "uri", default: "" }
      }
    },
    sitePublished: { type: "boolean" },
    maintenanceMessage: { type: "string", maxLength: 600, default: "" }
  }
};

// Crud response
const crudItem = {
  type: "object",
  properties: {
    id: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" }
  }
};

export function registerSwagger(app: express.Express) {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument, swaggerUiOptions));
}
// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const errorRef = { $ref: "#/components/schemas/ErrorResponse" };
const jsonBody = (schema: unknown = { type: "object" }) => ({
  required: true,
  content: { "application/json": { schema } }
});
const ok = (description = "OK", schema: unknown = { type: "object" }) => ({
  description,
  content: { "application/json": { schema } }
});
const errors = {
  401: ok("Não autenticado", errorRef),
  403: ok("CSRF / permissão", errorRef),
  422: ok("Dados inválidos", errorRef)
};
const idParam = { name: "id", in: "path", required: true, schema: { type: "string" } };
const listParams = [
  { name: "page", in: "query", schema: { type: "integer", default: 1 } },
  { name: "pageSize", in: "query", schema: { type: "integer", default: 12 } },
  { name: "q", in: "query", schema: { type: "string" } },
  { name: "published", in: "query", schema: { type: "string", enum: ["true", "false"] } }
];
const write = [{ cookieAuth: [], csrfHeader: [] }];
const multipart = (withFolder = true) => ({
  required: true,
  content: {
    "multipart/form-data": {
      schema: {
        type: "object",
        required: ["file"],
        properties: {
          file: { type: "string", format: "binary" },
          ...(withFolder
            ? {
                folder: {
                  type: "string",
                  enum: ["profile", "projects", "certifications", "experiences", "education", "documents", "publications"]
                }
              }
            : {}),
          altText: { type: "string", maxLength: 300 }
        }
      }
    }
  }
});

const crudResources = [
  "projects",
  "experiences",
  "certifications",
  "education",
  "courses",
  "publications",
  "skills",
  "skill-categories"
];

const paths: Record<string, any> = {
  "/health": { get: { tags: ["Public"], security: [], summary: "Health check", responses: { 200: ok() } } },
  "/admin/auth/login": {
    post: {
      tags: ["Authentication"],
      security: [{ csrfHeader: [] }],
      summary: "Iniciar sessão (define o cookie pc_admin_session)",
      requestBody: jsonBody(loginInput),
      responses: { 200: ok(), 401: ok("Credenciais inválidas", errorRef), 429: ok("Rate limit", errorRef) }
    }
  },
  "/admin/auth/logout": { post: { tags: ["Authentication"], security: write, responses: { 200: ok(), ...errors } } },
  "/admin/auth/me": { get: { tags: ["Authentication"], responses: { 200: ok(), ...errors } } },
  "/admin/auth/password": {
    put: { tags: ["Authentication"], security: write, requestBody: jsonBody(passwordInput), responses: { 200: ok(), ...errors } }
  },
  "/admin/dashboard": { get: { tags: ["Admin"], summary: "Estatísticas e actividade recente", responses: { 200: ok(), ...errors } } },
  "/admin/profile": {
    get: { tags: ["Admin"], responses: { 200: ok(), ...errors } },
    put: { tags: ["Admin"], security: write, requestBody: jsonBody(profileInput), responses: { 200: ok(), ...errors } }
  },
  "/admin/settings": {
    get: { tags: ["Admin"], responses: { 200: ok(), ...errors } },
    put: { tags: ["Admin"], security: write, requestBody: jsonBody(settingsInput), responses: { 200: ok(), ...errors } }
  },
  "/admin/cv": {
    get: { tags: ["Admin"], responses: { 200: ok(), ...errors } },
    post: { tags: ["Admin"], security: write, requestBody: jsonBody(), responses: { 201: ok(), ...errors } }
  },
  "/admin/cv/{id}": {
    patch: { tags: ["Admin"], security: write, parameters: [idParam], requestBody: jsonBody(), responses: { 200: ok(), ...errors } },
    delete: { tags: ["Admin"], security: write, parameters: [idParam], responses: { 204: { description: "Eliminado" }, ...errors } }
  },
  "/admin/cv/{id}/activate": {
    post: { tags: ["Admin"], security: write, parameters: [idParam], responses: { 200: ok(), ...errors } }
  },
  "/admin/media": {
    get: {
      tags: ["Media"],
      parameters: [
        ...listParams.slice(0, 3),
        { name: "kind", in: "query", schema: { type: "string", enum: ["image", "video", "document"] } },
        { name: "folder", in: "query", schema: { type: "string" } }
      ],
      responses: { 200: ok("Lista", { type: "object", properties: { items: { type: "array", items: storedAssetSchema }, total: { type: "integer" }, page: { type: "integer" }, pageSize: { type: "integer" }, pages: { type: "integer" } } }), ...errors }
    }
  },
  "/admin/media/upload": {
    post: { tags: ["Media"], security: write, requestBody: multipart(), responses: { 201: ok("Carregado", storedAssetSchema), 413: ok("Demasiado grande", errorRef), 415: ok("Formato inválido", errorRef), ...errors } }
  },
  "/admin/media/{id}": {
    get: { tags: ["Media"], parameters: [idParam], responses: { 200: ok("OK", storedAssetSchema), ...errors } },
    patch: {
      tags: ["Media"],
      security: write,
      parameters: [idParam],
      requestBody: jsonBody({ type: "object", properties: { altText: { type: "string" } } }),
      responses: { 200: ok("OK", storedAssetSchema), ...errors }
    },
    delete: { tags: ["Media"], security: write, parameters: [idParam], responses: { 204: { description: "Eliminado" }, 409: ok("Em uso", errorRef), ...errors } }
  },
  "/admin/media/{id}/replace": {
    post: { tags: ["Media"], security: write, parameters: [idParam], requestBody: multipart(), responses: { 200: ok("Substituído", storedAssetSchema), ...errors } }
  },
  "/admin/media/{id}/usage": {
    get: { tags: ["Media"], parameters: [idParam], responses: { 200: ok(), ...errors } }
  },
  "/public/portfolio": {
    get: {
      tags: ["Public"],
      security: [],
      parameters: [{ name: "lang", in: "query", schema: { type: "string", enum: ["pt", "en"] } }],
      responses: { 200: ok() }
    }
  },
  "/public/seo": { get: { tags: ["Public"], security: [], responses: { 200: ok() } } }
};

for (const resource of crudResources) {
  paths[`/admin/${resource}`] = {
    get: { tags: ["Admin"], parameters: listParams, responses: { 200: ok(), ...errors } },
    post: { tags: ["Admin"], security: write, requestBody: jsonBody(), responses: { 201: ok("Criado", crudItem), ...errors } }
  };
  paths[`/admin/${resource}/reorder`] = {
    post: {
      tags: ["Admin"],
      security: write,
      requestBody: jsonBody({ type: "object", properties: { ids: { type: "array", items: { type: "string" } } } }),
      responses: { 200: ok(), ...errors }
    }
  };
  paths[`/admin/${resource}/{id}`] = {
    get: { tags: ["Admin"], parameters: [idParam], responses: { 200: ok("OK", crudItem), ...errors } },
    patch: { tags: ["Admin"], security: write, parameters: [idParam], requestBody: jsonBody(), responses: { 200: ok("OK", crudItem), ...errors } },
    delete: { tags: ["Admin"], security: write, parameters: [idParam], responses: { 204: { description: "Eliminado" }, ...errors } }
  };
}

openApiDocument.paths = paths;
