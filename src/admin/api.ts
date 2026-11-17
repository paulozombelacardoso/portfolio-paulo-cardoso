// Cliente HTTP do painel admin. A sessão vive num cookie httpOnly definido pela API;
// o frontend nunca vê credenciais nem tokens.

export interface ApiIssue {
  path: string;
  message: string;
}

export class ApiRequestError extends Error {
  status: number;
  code: string;
  issues: ApiIssue[];
  details?: unknown;

  constructor(status: number, message: string, code = "ERROR", issues: ApiIssue[] = [], details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.issues = issues;
    this.details = details;
  }
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

type Listener = () => void;
const unauthorizedListeners = new Set<Listener>();

export function onUnauthorized(listener: Listener) {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { "X-Requested-With": "portfolio-cms" };
  let payload: BodyInit | undefined;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(`/api${path}`, { method, headers, body: payload, credentials: "same-origin" });
  } catch {
    throw new ApiRequestError(0, "Sem ligação à API. Verifique se o servidor está a correr.", "NETWORK_ERROR");
  }

  if (response.status === 204) return undefined as T;

  let data: any = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    if (response.status === 401 && !path.startsWith("/admin/auth/login")) {
      unauthorizedListeners.forEach((listener) => listener());
    }
    throw new ApiRequestError(
      response.status,
      data?.error || `Erro ${response.status}.`,
      data?.code || "ERROR",
      Array.isArray(data?.issues) ? data.issues : [],
      data?.details
    );
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body ?? {}),
  put: <T>(path: string, body: unknown) => request<T>("PUT", path, body),
  patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, body),
  delete: (path: string) => request<void>("DELETE", path)
};

export function qs(params: Record<string, string | number | undefined | null>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

/** Resolve URLs relativas (ficheiros em /public) para uso no admin. */
export function assetSrc(url?: string | null) {
  if (!url) return "";
  if (/^(https?:)?\/\//i.test(url) || url.startsWith("/") || url.startsWith("blob:") || url.startsWith("data:")) {
    return url;
  }
  return `/${url}`;
}

export function isImageUrl(url?: string | null) {
  return !!url && /\.(png|jpe?g|webp|gif|svg)(\?|#|$)/i.test(url) || (!!url && /\/image\/upload\//.test(url) && !/\.pdf(\?|$)/i.test(url));
}

export function isVideoUrl(url?: string | null) {
  return !!url && (/\.(mp4|webm)(\?|#|$)/i.test(url) || /\/video\/upload\//.test(url));
}
