import { register as registerSwaggerUi, SwaggerUiOptions } from "swagger-ui-express";
import type { Document } from "swagger-typescript-api";

const swaggerUiOptions: SwaggerUiOptions = {
  deepLinking: true,
  persistAuthorization: true,
  docExpansion: "list",
  tryItOutByDefault: true,
};

export const openApiDocument: Document = {
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
      url: "http://localhost:4000/api",
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
        type: "http",
        in: "cookie",
        scheme: "bearer",
        bearerFormat: "jwt"
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

// Media endpoints
const mediaResponses = {
  200: {
    description: "List of media assets",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                $ref: "#/components/schemas/StoredAsset"
              }
            },
            total: { type: "integer" },
            page: { type: "integer" },
            pageSize: { type: "integer" },
            pages: { type: "integer" }
          }
        }
      }
    }
  },
  401: { $ref: "#/components/schemas/ErrorResponse" }
};

const singleMediaResponse = {
  200: {
    description: "Media asset details",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/StoredAsset" }
      }
    }
  },
  404: { $ref: "#/components/schemas/ErrorResponse" }
};

const uploadResponse = {
  201: {
    description: "Media uploaded successfully",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/StoredAsset" }
      }
    }
  },
  400: { $ref: "#/components/schemas/ErrorResponse" },
  413: { $ref: "#/components/schemas/ErrorResponse" },
  415: { $ref: "#/components/schemas/ErrorResponse" }
};

const replaceResponse = {
  200: {
    description: "Media replaced successfully",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/StoredAsset" }
      }
    }
  },
  404: { $ref: "#/components/schemas/ErrorResponse" },
  500: { $ref: "#/components/schemas/ErrorResponse" }
};

const deleteResponse = {
  204: {
    description: "Media deleted successfully"
  },
  404: { $ref: "#/components/schemas/ErrorResponse" },
  409: { $ref: "#/components/schemas/ErrorResponse" }
};

// StoredAsset schema
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
  register(swaggerUiOptions)(app, "/api/docs", {});
}