import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Inbox,
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
  XCircle
} from "lucide-react";
import { api, ApiRequestError, assetSrc, isImageUrl, isVideoUrl, qs, type Page } from "./api";

/* ------------------------------------------------------------------ */
/* Toasts                                                              */
/* ------------------------------------------------------------------ */
type ToastKind = "success" | "error";
interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}
const ToastContext = createContext<(kind: ToastKind, message: string) => void>(() => undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const push = useCallback((kind: ToastKind, message: string) => {
    const id = Date.now() + Math.random();
    setItems((current) => [...current, { id, kind, message }]);
    setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), kind === "error" ? 6000 : 3500);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="adm-toasts" role="status" aria-live="polite">
        {items.map((item) => (
          <div key={item.id} className={`adm-toast ${item.kind}`}>
            {item.kind === "success" ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            <span>{item.message}</span>
            <button
              className="adm-toast-close"
              aria-label="Fechar"
              onClick={() => setItems((current) => current.filter((t) => t.id !== item.id))}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const push = useContext(ToastContext);
  return {
    success: (message: string) => push("success", message),
    error: (error: unknown) =>
      push("error", error instanceof Error ? error.message : typeof error === "string" ? error : "Ocorreu um erro.")
  };
}

/* ------------------------------------------------------------------ */
/* Confirm dialog                                                      */
/* ------------------------------------------------------------------ */
interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  danger?: boolean;
}
const ConfirmContext = createContext<(options: ConfirmOptions) => Promise<boolean>>(async () => false);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<(ConfirmOptions & { resolve: (value: boolean) => void }) | null>(null);
  const confirm = useCallback(
    (options: ConfirmOptions) => new Promise<boolean>((resolve) => setState({ ...options, resolve })),
    []
  );
  const close = (value: boolean) => {
    state?.resolve(value);
    setState(null);
  };
  useEffect(() => {
    if (!state) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div className="adm-overlay adm-overlay-top" onMouseDown={() => close(false)}>
          <div className="adm-dialog" role="alertdialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
            <div className="adm-dialog-head">
              {state.danger && <AlertTriangle size={18} className="adm-danger-text" />}
              <h3>{state.title}</h3>
            </div>
            {state.message && <p className="adm-muted">{state.message}</p>}
            <div className="adm-dialog-actions">
              <button className="btn outline" onClick={() => close(false)}>
                Cancelar
              </button>
              <button className={`btn solid ${state.danger ? "adm-btn-danger" : ""}`} onClick={() => close(true)} autoFocus>
                {state.confirmLabel || "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);

/* ------------------------------------------------------------------ */
/* Layout primitives                                                   */
/* ------------------------------------------------------------------ */
export function Spinner({ label = "A carregar…" }: { label?: string }) {
  return (
    <div className="adm-loading" role="status">
      <Loader2 size={18} className="adm-spin" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="adm-empty">
      <Inbox size={28} />
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="adm-page-head">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="adm-muted">{subtitle}</p>}
      </div>
      {actions && <div className="adm-page-actions">{actions}</div>}
    </div>
  );
}

export function Badge({ tone = "neutral", children }: { tone?: "neutral" | "ok" | "warn"; children: React.ReactNode }) {
  return <span className={`adm-badge ${tone}`}>{children}</span>;
}

export function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (page: number) => void }) {
  if (pages <= 1) return null;
  return (
    <div className="adm-pagination">
      <button className="icon-btn" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Página anterior">
        <ChevronLeft size={16} />
      </button>
      <span>
        {page} / {pages}
      </span>
      <button className="icon-btn" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Página seguinte">
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Drawer with unsaved-changes guard                                   */
/* ------------------------------------------------------------------ */
export function Drawer({
  title,
  open,
  dirty,
  onClose,
  children,
  footer
}: {
  title: string;
  open: boolean;
  dirty?: boolean;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const confirm = useConfirm();
  const requestClose = useCallback(async () => {
    if (dirty) {
      const ok = await confirm({
        title: "Descartar alterações?",
        message: "Existem alterações por guardar. Se sair agora, perdem-se.",
        confirmLabel: "Descartar",
        danger: true
      });
      if (!ok) return;
    }
    onClose();
  }, [dirty, confirm, onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !document.querySelector(".adm-overlay-top")) requestClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, requestClose]);

  useUnsavedGuard(open && !!dirty);

  if (!open) return null;
  return (
    <div className="adm-overlay" onMouseDown={requestClose}>
      <aside className="adm-drawer" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.stopPropagation()}>
        <header className="adm-drawer-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={requestClose} aria-label="Fechar">
            <X size={16} />
          </button>
        </header>
        <div className="adm-drawer-body">{children}</div>
        {footer && <footer className="adm-drawer-foot">{footer}</footer>}
      </aside>
    </div>
  );
}

/** Pede confirmação ao fechar/recarregar o separador com alterações pendentes. */
export function useUnsavedGuard(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [active]);
}

/* ------------------------------------------------------------------ */
/* Form fields                                                         */
/* ------------------------------------------------------------------ */
interface FieldShell {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  wide?: boolean;
}

export function Field({ label, error, hint, required, wide, children }: FieldShell & { children: React.ReactNode }) {
  return (
    <label className={`adm-field ${wide ? "wide" : ""} ${error ? "has-error" : ""}`}>
      <span className="adm-label">
        {label}
        {required && <em aria-hidden="true"> *</em>}
      </span>
      {children}
      {error ? <em className="field-error">{error}</em> : hint ? <small className="adm-hint">{hint}</small> : null}
    </label>
  );
}

export function TextInput({
  value,
  onChange,
  type = "text",
  ...shell
}: FieldShell & { value: string | number | null | undefined; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  return (
    <Field {...shell}>
      <input
        className="adm-input"
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!shell.error}
      />
    </Field>
  );
}

export function TextArea({
  value,
  onChange,
  rows = 4,
  ...shell
}: FieldShell & { value: string | null | undefined; onChange: (value: string) => void; rows?: number }) {
  return (
    <Field {...shell} wide={shell.wide ?? true}>
      <textarea className="adm-input" rows={rows} value={value ?? ""} onChange={(e) => onChange(e.target.value)} aria-invalid={!!shell.error} />
    </Field>
  );
}

export function SelectInput({
  value,
  onChange,
  options,
  ...shell
}: FieldShell & { value: string | null | undefined; onChange: (value: string) => void; options: Array<{ value: string; label: string }> }) {
  return (
    <Field {...shell}>
      <select className="adm-input" value={value ?? ""} onChange={(e) => onChange(e.target.value)} aria-invalid={!!shell.error}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (value: boolean) => void; hint?: string }) {
  return (
    <label className="adm-toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="adm-toggle-track" aria-hidden="true" />
      <span>
        {label}
        {hint && <small className="adm-hint">{hint}</small>}
      </span>
    </label>
  );
}

/** Lista editável de textos (conquistas, tecnologias, frases…). */
export function ListInput({
  value,
  onChange,
  placeholder = "Adicionar item…",
  multiline,
  ...shell
}: FieldShell & { value: string[] | undefined; onChange: (value: string[]) => void; placeholder?: string; multiline?: boolean }) {
  const items = Array.isArray(value) ? value : [];
  const [draft, setDraft] = useState("");
  const add = () => {
    const text = draft.trim();
    if (!text) return;
    onChange([...items, text]);
    setDraft("");
  };
  const move = (index: number, delta: number) => {
    const next = items.slice();
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };
  return (
    <Field {...shell} wide={shell.wide ?? true}>
      <div className={`adm-list ${multiline ? "multiline" : "chips"}`}>
        {items.map((item, index) => (
          <div className="adm-list-item" key={`${index}-${item.slice(0, 20)}`}>
            {multiline ? (
              <textarea
                className="adm-input"
                rows={2}
                value={item}
                onChange={(e) => onChange(items.map((current, i) => (i === index ? e.target.value : current)))}
              />
            ) : (
              <span>{item}</span>
            )}
            <div className="adm-list-tools">
              {multiline && (
                <>
                  <button type="button" onClick={() => move(index, -1)} aria-label="Subir">
                    ↑
                  </button>
                  <button type="button" onClick={() => move(index, 1)} aria-label="Descer">
                    ↓
                  </button>
                </>
              )}
              <button type="button" onClick={() => onChange(items.filter((_, i) => i !== index))} aria-label={`Remover ${item}`}>
                <X size={12} />
              </button>
            </div>
          </div>
        ))}
        <div className="adm-list-add">
          <input
            className="adm-input"
            value={draft}
            placeholder={placeholder}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
          />
          <button type="button" className="icon-btn" onClick={add} aria-label="Adicionar">
            <Plus size={15} />
          </button>
        </div>
      </div>
    </Field>
  );
}

/* ------------------------------------------------------------------ */
/* Media                                                               */
/* ------------------------------------------------------------------ */
export type MediaFolder = "profile" | "projects" | "certifications" | "experiences" | "education" | "documents" | "publications";
export type AcceptKind = "image" | "video" | "document" | "image-or-document" | "any";

export interface MediaItem {
  id: string;
  secureUrl: string;
  originalName: string;
  kind: "image" | "video" | "document";
  bytes: number;
  folder: string;
  altText: string;
  format: string;
  transformations: Record<string, string>;
  createdAt: string;
}

const acceptMap: Record<AcceptKind, string> = {
  image: "image/png,image/jpeg,image/webp",
  video: "video/mp4,video/webm",
  document: "application/pdf",
  "image-or-document": "image/png,image/jpeg,image/webp,application/pdf",
  any: "image/png,image/jpeg,image/webp,video/mp4,video/webm,application/pdf"
};

const limits = { image: 5, video: 50, document: 10 };

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function kindOfFile(file: File): "image" | "video" | "document" | null {
  if (["image/png", "image/jpeg", "image/webp"].includes(file.type)) return "image";
  if (["video/mp4", "video/webm"].includes(file.type)) return "video";
  if (file.type === "application/pdf") return "document";
  return null;
}

/** Valida no cliente (o servidor volta a validar com magic bytes). */
export function validateFile(file: File, accept: AcceptKind): string | null {
  const kind = kindOfFile(file);
  if (!kind || !acceptMap[accept].split(",").includes(file.type)) {
    return "Formato não permitido para este campo.";
  }
  if (file.size > limits[kind] * 1024 * 1024) {
    return `O ficheiro excede ${limits[kind]} MB.`;
  }
  return null;
}

export function MediaPreview({ url, alt = "", small }: { url?: string; alt?: string; small?: boolean }) {
  if (!url) {
    return (
      <div className={`adm-media-ph ${small ? "small" : ""}`}>
        <ImageIcon size={small ? 16 : 22} />
      </div>
    );
  }
  const src = assetSrc(url);
  if (isVideoUrl(url)) return <video className={`adm-media-img ${small ? "small" : ""}`} src={src} muted controls={!small} />;
  if (isImageUrl(url)) return <img className={`adm-media-img ${small ? "small" : ""}`} src={src} alt={alt} loading="lazy" />;
  return (
    <a className={`adm-media-ph doc ${small ? "small" : ""}`} href={src} target="_blank" rel="noopener noreferrer" title="Abrir documento">
      <FileText size={small ? 16 : 22} />
      {!small && <span>PDF</span>}
    </a>
  );
}

/** Selecciona um ficheiro, mostra pré-visualização local e só depois envia para a API. */
export function UploadBox({
  folder,
  accept,
  onUploaded,
  compact
}: {
  folder: MediaFolder;
  accept: AcceptKind;
  onUploaded: (media: MediaItem) => void;
  compact?: boolean;
}) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);

  useEffect(() => () => (preview ? URL.revokeObjectURL(preview) : undefined), [preview]);

  const choose = (selected?: File | null) => {
    setError("");
    if (!selected) return;
    const problem = validateFile(selected, accept);
    if (problem) {
      setError(problem);
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const reset = () => {
    setFile(null);
    setPreview("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const send = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.append("folder", folder);
      form.append("file", file);
      const media = await api.post<MediaItem>("/admin/media/upload", form);
      toast.success("Ficheiro carregado.");
      onUploaded(media);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no upload.");
    } finally {
      setBusy(false);
    }
  };

  const kind = file ? kindOfFile(file) : null;
  return (
    <div className={`adm-upload ${compact ? "compact" : ""}`}>
      {!file ? (
        <button
          type="button"
          className={`adm-dropzone ${drag ? "drag" : ""}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            choose(e.dataTransfer.files?.[0]);
          }}
        >
          <Upload size={16} />
          <span>{compact ? "Carregar ficheiro" : "Arraste um ficheiro ou clique para escolher"}</span>
          <small className="adm-hint">
            {accept === "image" ? "JPG, PNG ou WebP até 5 MB" : accept === "document" ? "PDF até 10 MB" : accept === "video" ? "MP4 ou WebM até 50 MB" : "Imagem (5 MB), PDF (10 MB) ou vídeo (50 MB)"}
          </small>
        </button>
      ) : (
        <div className="adm-upload-preview">
          {kind === "image" ? (
            <img src={preview} alt="Pré-visualização" className="adm-media-img" />
          ) : kind === "video" ? (
            <video src={preview} className="adm-media-img" controls muted />
          ) : (
            <div className="adm-media-ph doc">
              <FileText size={22} />
              <span>PDF</span>
            </div>
          )}
          <div className="adm-upload-meta">
            <strong title={file.name}>{file.name}</strong>
            <span className="adm-muted">{formatBytes(file.size)}</span>
            <div className="adm-row">
              <button type="button" className="btn solid adm-btn-sm" onClick={send} disabled={busy}>
                {busy ? <Loader2 size={14} className="adm-spin" /> : <Upload size={14} />} {busy ? "A enviar…" : "Enviar"}
              </button>
              <button type="button" className="btn outline adm-btn-sm" onClick={reset} disabled={busy}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      <input ref={inputRef} type="file" hidden accept={acceptMap[accept]} onChange={(e) => choose(e.target.files?.[0])} />
      {error && <em className="field-error">{error}</em>}
    </div>
  );
}

/** Modal com a biblioteca de media para escolher um ficheiro já carregado. */
export function MediaLibraryModal({
  accept,
  onPick,
  onClose
}: {
  accept: AcceptKind;
  onPick: (media: MediaItem) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Page<MediaItem> | null>(null);
  const [error, setError] = useState("");
  const kind = accept === "image" || accept === "video" || accept === "document" ? accept : "";

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      api
        .get<Page<MediaItem>>(`/admin/media${qs({ q, page, pageSize: 24, kind })}`)
        .then((result) => !cancelled && setData(result))
        .catch((err) => !cancelled && setError(err.message));
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [q, page, kind]);

  return (
    <div className="adm-overlay adm-overlay-top" onMouseDown={onClose}>
      <div className="adm-dialog wide" role="dialog" aria-modal="true" aria-label="Biblioteca de media" onMouseDown={(e) => e.stopPropagation()}>
        <div className="adm-dialog-head between">
          <h3>Biblioteca de media</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Fechar">
            <X size={16} />
          </button>
        </div>
        <input
          className="adm-input"
          placeholder="Pesquisar por nome…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
        />
        {error && <em className="field-error">{error}</em>}
        {!data ? (
          <Spinner />
        ) : data.items.length === 0 ? (
          <EmptyState title="Sem ficheiros" text="Carregue um ficheiro no campo do formulário." />
        ) : (
          <div className="adm-media-grid">
            {data.items.map((item) => (
              <button key={item.id} type="button" className="adm-media-tile" onClick={() => onPick(item)} title={item.originalName}>
                <MediaPreview url={item.transformations?.thumbnail && item.kind !== "document" ? item.transformations.thumbnail : item.secureUrl} />
                <span>{item.originalName}</span>
              </button>
            ))}
          </div>
        )}
        {data && <Pagination page={data.page} pages={data.pages} onChange={setPage} />}
      </div>
    </div>
  );
}

/** Campo de URL de ficheiro: pré-visualização + upload + biblioteca + remover. */
export function MediaField({
  value,
  onChange,
  folder,
  accept = "image",
  ...shell
}: FieldShell & { value: string | undefined; onChange: (value: string) => void; folder: MediaFolder; accept?: AcceptKind }) {
  const [library, setLibrary] = useState(false);
  return (
    <div className={`adm-field wide ${shell.error ? "has-error" : ""}`}>
      <span className="adm-label">{shell.label}</span>
      <div className="adm-mediafield">
        <MediaPreview url={value} />
        <div className="adm-mediafield-side">
          {value ? (
            <div className="adm-row wrap">
              <a className="adm-link adm-ellipsis" href={assetSrc(value)} target="_blank" rel="noopener noreferrer" title={value}>
                {value}
              </a>
              <button type="button" className="btn outline adm-btn-sm" onClick={() => onChange("")}>
                <Trash2 size={13} /> Remover
              </button>
            </div>
          ) : (
            <span className="adm-muted">Nenhum ficheiro associado.</span>
          )}
          <UploadBox compact folder={folder} accept={accept} onUploaded={(media) => onChange(media.secureUrl)} />
          <button type="button" className="adm-link-btn" onClick={() => setLibrary(true)}>
            Escolher da biblioteca
          </button>
        </div>
      </div>
      {shell.error ? <em className="field-error">{shell.error}</em> : shell.hint ? <small className="adm-hint">{shell.hint}</small> : null}
      {library && (
        <MediaLibraryModal
          accept={accept}
          onClose={() => setLibrary(false)}
          onPick={(media) => {
            onChange(media.secureUrl);
            setLibrary(false);
          }}
        />
      )}
    </div>
  );
}

/** Galeria (lista de URLs de imagens). */
export function GalleryField({
  value,
  onChange,
  folder,
  ...shell
}: FieldShell & { value: string[] | undefined; onChange: (value: string[]) => void; folder: MediaFolder }) {
  const items = Array.isArray(value) ? value : [];
  const [library, setLibrary] = useState(false);
  return (
    <div className="adm-field wide">
      <span className="adm-label">{shell.label}</span>
      <div className="adm-gallery">
        {items.map((url, index) => (
          <div className="adm-gallery-item" key={`${url}-${index}`}>
            <MediaPreview url={url} />
            <button type="button" className="adm-gallery-remove" onClick={() => onChange(items.filter((_, i) => i !== index))} aria-label="Remover imagem">
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
      <UploadBox compact folder={folder} accept="image" onUploaded={(media) => onChange([...items, media.secureUrl])} />
      <button type="button" className="adm-link-btn" onClick={() => setLibrary(true)}>
        Adicionar da biblioteca
      </button>
      {library && (
        <MediaLibraryModal
          accept="image"
          onClose={() => setLibrary(false)}
          onPick={(media) => {
            onChange([...items, media.secureUrl]);
            setLibrary(false);
          }}
        />
      )}
    </div>
  );
}

/** Mapeia erros de validação da API (issues[].path) para os campos do formulário. */
export function issuesToErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiRequestError)) return {};
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    if (!result[issue.path]) result[issue.path] = issue.message;
  }
  return result;
}
