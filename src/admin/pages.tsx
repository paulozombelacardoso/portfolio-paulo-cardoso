import React, { FormEvent, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUp, CheckCircle2, Copy, ExternalLink, FileText, Lock, Pencil, Search, Trash2 } from "lucide-react";
import { api, ApiRequestError, assetSrc, qs, type Page } from "./api";
import { resources } from "./resources";
import { getPath, setPath } from "./ResourcePage";
import {
  Badge,
  Drawer,
  EmptyState,
  ListInput,
  MediaField,
  MediaPreview,
  PageHeader,
  Pagination,
  Spinner,
  TextArea,
  TextInput,
  Toggle,
  UploadBox,
  formatBytes,
  issuesToErrors,
  useConfirm,
  useToast,
  useUnsavedGuard,
  type MediaItem
} from "./ui";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor";
}

/* ================================================================== */
/* Login                                                               */
/* ================================================================== */
export function LoginPage({ onLogin }: { onLogin: (user: AdminUser) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError("Indique o email e a palavra-passe.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await api.post<{ user: AdminUser }>("/admin/auth/login", { email: email.trim(), password });
      onLogin(result.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível iniciar sessão.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm-login">
      <form className="adm-login-card" onSubmit={submit} noValidate>
        <div className="logo adm-login-logo">
          <span className="mark">&lt;P&gt;</span>
          <span className="logo-name">PAULO CARDOSO</span>
        </div>
        <h1>Painel de administração</h1>
        <p className="adm-muted">Área privada. Inicie sessão para gerir o conteúdo do portfólio.</p>
        <TextInput label="Email" type="email" value={email} onChange={setEmail} />
        <TextInput label="Palavra-passe" type="password" value={password} onChange={setPassword} />
        {error && (
          <div className="adm-alert" role="alert">
            {error}
          </div>
        )}
        <button className="btn solid adm-block" type="submit" disabled={busy}>
          <Lock size={14} /> {busy ? "A entrar…" : "Entrar"}
        </button>
        <a className="adm-link adm-center" href="/">
          ← Voltar ao portfólio
        </a>
      </form>
    </div>
  );
}

/* ================================================================== */
/* Dashboard                                                           */
/* ================================================================== */
interface DashboardData {
  stats: Array<{ key: string; label: string; total: number; published: number; drafts: number }>;
  mediaCount: number;
  recent: Array<{ id: string; userName: string; action: string; resourceType: string; title: string; createdAt: string }>;
  sitePublished: boolean;
}

const actionLabels: Record<string, string> = {
  create: "criou",
  update: "actualizou",
  delete: "eliminou",
  upload: "carregou",
  replace: "substituiu",
  reorder: "reordenou",
  publish: "publicou"
};

export function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .get<DashboardData>("/admin/dashboard")
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="adm-alert">{error}</div>;
  if (!data) return <Spinner />;

  const totalDrafts = data.stats.reduce((sum, stat) => sum + stat.drafts, 0);
  return (
    <div className="adm-page">
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral do conteúdo do portfólio."
        actions={
          <a className="btn outline" href="/" target="_blank" rel="noopener noreferrer">
            <ExternalLink size={14} /> Ver portfólio
          </a>
        }
      />
      <div className={`adm-status ${data.sitePublished ? "ok" : "warn"}`}>
        <CheckCircle2 size={16} />
        <span>
          {data.sitePublished ? "Portfólio publicado" : "Portfólio em modo de manutenção"} ·{" "}
          {totalDrafts > 0 ? `${totalDrafts} rascunho(s) por publicar` : "todo o conteúdo está publicado"}
        </span>
        <Link to="/settings" className="adm-link">
          Configurações
        </Link>
      </div>
      <div className="adm-stats">
        {data.stats.map((stat) => (
          <Link key={stat.key} to={`/${stat.key}`} className="adm-stat">
            <span className="adm-stat-label">{stat.label}</span>
            <strong>{stat.total}</strong>
            <span className="adm-muted">
              {stat.published} publicados{stat.drafts ? ` · ${stat.drafts} rascunhos` : ""}
            </span>
          </Link>
        ))}
        <Link to="/media" className="adm-stat">
          <span className="adm-stat-label">Ficheiros</span>
          <strong>{data.mediaCount}</strong>
          <span className="adm-muted">na biblioteca de media</span>
        </Link>
      </div>
      <section className="adm-card">
        <h2 className="adm-card-title">Últimas actualizações</h2>
        {data.recent.length === 0 ? (
          <p className="adm-muted">Ainda não há actividade registada.</p>
        ) : (
          <ul className="adm-activity">
            {data.recent.map((item) => (
              <li key={item.id}>
                <span>
                  <strong>{item.userName || "Sistema"}</strong> {actionLabels[item.action] || item.action}{" "}
                  <span className="adm-muted">{item.resourceType}</span> {item.title && <>· {item.title}</>}
                </span>
                <time className="adm-muted">{formatDate(item.createdAt)}</time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ================================================================== */
/* Hook genérico para formulários de página inteira                    */
/* ================================================================== */
function usePageForm<T extends Record<string, any>>(loader: () => Promise<T>) {
  const [initial, setInitial] = useState<T | null>(null);
  const [form, setForm] = useState<T | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState("");
  const reload = useCallback(() => {
    loader()
      .then((data) => {
        setInitial(data);
        setForm(data);
      })
      .catch((err) => setLoadError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(reload, [reload]);
  const dirty = !!form && JSON.stringify(form) !== JSON.stringify(initial);
  useUnsavedGuard(dirty);
  const update = (path: string, value: unknown) => {
    setForm((current) => (current ? setPath(current, path, value) : current));
    setErrors((current) => {
      const { [path]: _removed, ...rest } = current;
      return rest;
    });
  };
  return { form, setForm, initial, setInitial, errors, setErrors, update, dirty, loadError };
}

function SaveBar({ dirty, saving, onSave, onReset }: { dirty: boolean; saving: boolean; onSave: () => void; onReset: () => void }) {
  return (
    <div className={`adm-savebar ${dirty ? "show" : ""}`}>
      <span>{dirty ? "Tem alterações por guardar." : "Sem alterações."}</span>
      <button className="btn outline" onClick={onReset} disabled={!dirty || saving}>
        Descartar
      </button>
      <button className="btn solid" onClick={onSave} disabled={!dirty || saving}>
        {saving ? "A guardar…" : "Guardar"}
      </button>
    </div>
  );
}

const pruneEmpty = (value: Record<string, any> | undefined) => {
  if (!value) return undefined;
  const cleaned = Object.fromEntries(
    Object.entries(value).filter(([, v]) => !(v === "" || v == null || (Array.isArray(v) && v.length === 0)))
  );
  return Object.keys(cleaned).length ? cleaned : undefined;
};

/* ================================================================== */
/* Perfil                                                              */
/* ================================================================== */
export function ProfilePage() {
  const toast = useToast();
  const { form, setInitial, errors, setErrors, update, dirty, loadError, initial, setForm } = usePageForm<any>(() =>
    api.get<any>("/admin/profile")
  );
  const [lang, setLang] = useState<"pt" | "en">("pt");
  const [saving, setSaving] = useState(false);

  if (loadError) return <div className="adm-alert">{loadError}</div>;
  if (!form) return <Spinner />;

  const save = async () => {
    setSaving(true);
    try {
      const { updatedAt, ...rest } = form;
      const en = pruneEmpty(rest.content?.en);
      const payload = { ...rest, content: { pt: rest.content.pt, ...(en ? { en } : {}) } };
      const saved = await api.put<any>("/admin/profile", payload);
      setInitial(saved);
      setForm(saved);
      toast.success("Perfil actualizado.");
    } catch (err) {
      setErrors(issuesToErrors(err));
      toast.error(err);
    } finally {
      setSaving(false);
    }
  };

  const c = (key: string) => `content.${lang}.${key}`;
  return (
    <div className="adm-page with-savebar">
      <PageHeader title="Perfil" subtitle="Informação pessoal apresentada no topo e na secção de contacto." />
      <section className="adm-card">
        <div className="adm-section-head">
          <h2 className="adm-card-title">Apresentação</h2>
          <div className="adm-tabs" role="tablist">
            {(["pt", "en"] as const).map((code) => (
              <button key={code} type="button" className={lang === code ? "act" : ""} aria-selected={lang === code} onClick={() => setLang(code)}>
                {code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="adm-grid">
          <TextInput label="Nome" required value={getPath(form, c("name"))} error={errors[c("name")]} onChange={(v) => update(c("name"), v)} />
          <TextInput label="Título profissional" required value={getPath(form, c("title"))} error={errors[c("title")]} onChange={(v) => update(c("title"), v)} />
          <TextArea label="Frase principal" rows={2} value={getPath(form, c("lead"))} error={errors[c("lead")]} onChange={(v) => update(c("lead"), v)} />
          <ListInput label="Frases rotativas (animação do topo)" multiline value={getPath(form, c("rotatingLeads"))} onChange={(v) => update(c("rotatingLeads"), v)} />
          <TextArea label="Descrição pessoal" rows={3} value={getPath(form, c("shortBio"))} error={errors[c("shortBio")]} onChange={(v) => update(c("shortBio"), v)} />
          <TextArea label="Biografia" rows={6} value={getPath(form, c("bio"))} error={errors[c("bio")]} onChange={(v) => update(c("bio"), v)} />
          <TextInput label="Disponibilidade profissional" value={getPath(form, c("availability"))} onChange={(v) => update(c("availability"), v)} />
        </div>
      </section>
      <section className="adm-card">
        <h2 className="adm-card-title">Contacto e redes</h2>
        <div className="adm-grid">
          <TextInput label="Email profissional" type="email" required value={form.email} error={errors.email} onChange={(v) => update("email", v)} />
          <TextInput label="Telefone" value={form.phone} error={errors.phone} onChange={(v) => update("phone", v)} />
          <TextInput label="Localização" value={form.location} error={errors.location} onChange={(v) => update("location", v)} />
          <TextInput label="GitHub" type="url" value={form.githubUrl} error={errors.githubUrl} onChange={(v) => update("githubUrl", v)} />
          <TextInput label="LinkedIn" type="url" value={form.linkedinUrl} error={errors.linkedinUrl} onChange={(v) => update("linkedinUrl", v)} />
          <TextInput label="LeetCode" type="url" value={form.leetcodeUrl} error={errors.leetcodeUrl} onChange={(v) => update("leetcodeUrl", v)} />
          <TextInput label="Codeforces" type="url" value={form.codeforcesUrl} error={errors.codeforcesUrl} onChange={(v) => update("codeforcesUrl", v)} />
        </div>
      </section>
      <section className="adm-card">
        <h2 className="adm-card-title">Fotografia</h2>
        <MediaField label="Fotografia de perfil" folder="profile" accept="image" value={form.photoUrl} error={errors.photoUrl} onChange={(v) => update("photoUrl", v)} />
        <p className="adm-hint">
          O CV é gerido na página <Link to="/cv" className="adm-link">CV</Link>.
        </p>
      </section>
      <SaveBar dirty={dirty} saving={saving} onSave={save} onReset={() => setForm(initial)} />
    </div>
  );
}

/* ================================================================== */
/* CV                                                                  */
/* ================================================================== */
interface CvItem {
  id: string;
  label: string;
  fileUrl: string;
  fileName: string;
  isActive: boolean;
  createdAt: string;
}

export function CvPage() {
  const toast = useToast();
  const confirm = useConfirm();
  const [items, setItems] = useState<CvItem[] | null>(null);
  const [label, setLabel] = useState("Curriculum Vitae");
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api
      .get<{ items: CvItem[] }>("/admin/cv")
      .then((result) => setItems(result.items))
      .catch((err) => setError(err.message));
  }, []);
  useEffect(load, [load]);

  const created = async (media: MediaItem) => {
    try {
      const base = media.originalName.replace(/\.[^.]+$/, "") || "cv";
      await api.post("/admin/cv", { label: label.trim() || "Curriculum Vitae", fileUrl: media.secureUrl, fileName: `${base}.pdf`, isActive: true });
      toast.success("Novo CV carregado e definido como activo.");
      load();
    } catch (err) {
      toast.error(err);
    }
  };

  const activate = async (item: CvItem) => {
    try {
      await api.post(`/admin/cv/${item.id}/activate`);
      toast.success(`"${item.label}" é agora o CV activo.`);
      load();
    } catch (err) {
      toast.error(err);
    }
  };

  const remove = async (item: CvItem) => {
    const ok = await confirm({
      title: "Eliminar CV?",
      message: item.isActive ? "Este é o CV activo. O CV mais recente passa a activo." : `"${item.label}" será removido.`,
      confirmLabel: "Eliminar",
      danger: true
    });
    if (!ok) return;
    try {
      await api.delete(`/admin/cv/${item.id}`);
      toast.success("CV eliminado.");
      load();
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <div className="adm-page">
      <PageHeader title="CV" subtitle="O CV activo é o que o botão “Download CV” do portfólio descarrega." />
      <section className="adm-card">
        <h2 className="adm-card-title">Carregar novo CV</h2>
        <div className="adm-grid">
          <TextInput label="Nome / versão" value={label} onChange={setLabel} hint="Ex.: CV 2026 (PT)" />
        </div>
        <UploadBox folder="documents" accept="document" onUploaded={created} />
      </section>
      {error && <div className="adm-alert">{error}</div>}
      {!items ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState title="Nenhum CV" text="Carregue o primeiro CV em PDF." />
      ) : (
        <ul className="adm-rows">
          {items.map((item) => (
            <li key={item.id} className="adm-row-item">
              <div className="adm-media-ph doc small">
                <FileText size={16} />
              </div>
              <div className="adm-row-main static">
                <strong>{item.label}</strong>
                <span className="adm-muted">
                  {item.fileName} · {formatDate(item.createdAt)}
                </span>
              </div>
              <div className="adm-row-badges">{item.isActive && <Badge tone="ok">Activo</Badge>}</div>
              <div className="adm-row-actions">
                <a className="icon-btn" href={assetSrc(item.fileUrl)} target="_blank" rel="noopener noreferrer" title="Abrir" aria-label="Abrir">
                  <ExternalLink size={14} />
                </a>
                {!item.isActive && (
                  <button className="btn outline adm-btn-sm" onClick={() => activate(item)}>
                    Definir activo
                  </button>
                )}
                <button className="icon-btn adm-danger-hover" onClick={() => remove(item)} aria-label="Eliminar" title="Eliminar">
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ================================================================== */
/* Configurações                                                       */
/* ================================================================== */
export function SettingsPage() {
  const toast = useToast();
  const { form, setInitial, errors, setErrors, update, dirty, loadError, initial, setForm } = usePageForm<any>(() =>
    api.get<any>("/admin/settings")
  );
  const [saving, setSaving] = useState(false);

  if (loadError) return <div className="adm-alert">{loadError}</div>;
  if (!form) return <Spinner />;

  const sections: any[] = (form.sections || []).slice().sort((a: any, b: any) => a.order - b.order);
  const moveSection = (index: number, delta: number) => {
    const next = sections.slice();
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    update(
      "sections",
      next.map((section, i) => ({ ...section, order: (i + 1) * 10 }))
    );
  };

  const save = async () => {
    setSaving(true);
    try {
      const { updatedAt, ...payload } = form;
      const saved = await api.put<any>("/admin/settings", payload);
      setInitial(saved);
      setForm(saved);
      toast.success("Configurações guardadas.");
    } catch (err) {
      setErrors(issuesToErrors(err));
      toast.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="adm-page with-savebar">
      <PageHeader title="Configurações" subtitle="Publicação, secções visíveis, contactos e SEO." />
      <section className="adm-card">
        <h2 className="adm-card-title">Publicação</h2>
        <Toggle
          label="Portfólio publicado"
          hint="Desligado: o site mostra apenas a mensagem de manutenção."
          checked={!!form.sitePublished}
          onChange={(v) => update("sitePublished", v)}
        />
        <TextArea label="Mensagem de manutenção" rows={2} value={form.maintenanceMessage} onChange={(v) => update("maintenanceMessage", v)} />
      </section>

      <section className="adm-card">
        <h2 className="adm-card-title">Secções do portfólio</h2>
        <p className="adm-hint">Active, desactive e reordene as secções apresentadas no site.</p>
        <ul className="adm-sections">
          {sections.map((section, index) => (
            <li key={section.key}>
              <Toggle
                label={`${section.label.pt} / ${section.label.en}`}
                checked={section.visible}
                onChange={(v) =>
                  update(
                    "sections",
                    sections.map((s) => (s.key === section.key ? { ...s, visible: v } : s))
                  )
                }
              />
              <div className="adm-row-actions">
                <button className="icon-btn" onClick={() => moveSection(index, -1)} disabled={index === 0} aria-label="Subir">
                  <ArrowUp size={14} />
                </button>
                <button className="icon-btn" onClick={() => moveSection(index, 1)} disabled={index === sections.length - 1} aria-label="Descer">
                  <ArrowDown size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="adm-card">
        <h2 className="adm-card-title">Contacto e redes sociais</h2>
        <div className="adm-grid">
          <TextInput label="Email" type="email" value={form.contact?.email} error={errors["contact.email"]} onChange={(v) => update("contact.email", v)} />
          <TextInput label="Telefone" value={form.contact?.phone} onChange={(v) => update("contact.phone", v)} />
          <TextInput label="Localização" value={form.contact?.location} onChange={(v) => update("contact.location", v)} />
          <TextInput label="GitHub" type="url" value={form.social?.github} error={errors["social.github"]} onChange={(v) => update("social.github", v)} />
          <TextInput label="LinkedIn" type="url" value={form.social?.linkedin} error={errors["social.linkedin"]} onChange={(v) => update("social.linkedin", v)} />
          <TextInput label="LeetCode" type="url" value={form.social?.leetcode} error={errors["social.leetcode"]} onChange={(v) => update("social.leetcode", v)} />
          <TextInput label="Codeforces" type="url" value={form.social?.codeforces} error={errors["social.codeforces"]} onChange={(v) => update("social.codeforces", v)} />
        </div>
        <p className="adm-hint">Os dados do Perfil têm prioridade; estes valores servem de alternativa.</p>
      </section>

      <section className="adm-card">
        <h2 className="adm-card-title">SEO e Open Graph</h2>
        <div className="adm-grid">
          <TextInput label="Title" required value={form.seo?.title} error={errors["seo.title"]} onChange={(v) => update("seo.title", v)} />
          <TextInput label="OG title" value={form.seo?.ogTitle} onChange={(v) => update("seo.ogTitle", v)} />
          <TextArea label="Meta description" rows={2} value={form.seo?.description} error={errors["seo.description"]} onChange={(v) => update("seo.description", v)} />
          <TextArea label="OG description" rows={2} value={form.seo?.ogDescription} onChange={(v) => update("seo.ogDescription", v)} />
          <MediaField label="Imagem Open Graph" folder="profile" accept="image" value={form.seo?.ogImage} onChange={(v) => update("seo.ogImage", v)} />
        </div>
      </section>
      <SaveBar dirty={dirty} saving={saving} onSave={save} onReset={() => setForm(initial)} />
    </div>
  );
}

/* ================================================================== */
/* Biblioteca de media                                                 */
/* ================================================================== */
const folders = ["profile", "projects", "certifications", "experiences", "education", "documents", "publications"] as const;

export function MediaPage() {
  const toast = useToast();
  const confirm = useConfirm();
  const [data, setData] = useState<Page<MediaItem> | null>(null);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("");
  const [page, setPage] = useState(1);
  const [uploadFolder, setUploadFolder] = useState<(typeof folders)[number]>("projects");
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [alt, setAlt] = useState("");
  const [usages, setUsages] = useState<string[] | null>(null);
  const [replacing, setReplacing] = useState(false);

  const load = useCallback(() => {
    setError("");
    api
      .get<Page<MediaItem>>(`/admin/media${qs({ q, kind, page, pageSize: 24 })}`)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [q, kind, page]);

  useEffect(() => {
    const timer = setTimeout(load, 200);
    return () => clearTimeout(timer);
  }, [load]);

  const open = (item: MediaItem) => {
    setSelected(item);
    setAlt(item.altText || "");
    setUsages(null);
    api
      .get<{ usages: string[] }>(`/admin/media/${item.id}/usage`)
      .then((result) => setUsages(result.usages))
      .catch(() => setUsages([]));
  };

  const saveAlt = async () => {
    if (!selected) return;
    try {
      const updated = await api.patch<MediaItem>(`/admin/media/${selected.id}`, { altText: alt });
      setSelected(updated);
      toast.success("Texto alternativo guardado.");
      load();
    } catch (err) {
      toast.error(err);
    }
  };

  const replace = async (file?: File | null) => {
    if (!selected || !file) return;
    setReplacing(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const updated = await api.post<MediaItem>(`/admin/media/${selected.id}/replace`, form);
      setSelected(updated);
      toast.success("Ficheiro substituído. As referências foram actualizadas.");
      load();
    } catch (err) {
      toast.error(err);
    } finally {
      setReplacing(false);
    }
  };

  const remove = async () => {
    if (!selected) return;
    const ok = await confirm({ title: "Eliminar ficheiro?", message: `"${selected.originalName}" será eliminado do armazenamento.`, confirmLabel: "Eliminar", danger: true });
    if (!ok) return;
    try {
      await api.delete(`/admin/media/${selected.id}`);
      toast.success("Ficheiro eliminado.");
      setSelected(null);
      load();
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === "FILE_IN_USE") {
        toast.error("O ficheiro está a ser utilizado. Remova-o primeiro dos conteúdos que o usam.");
      } else toast.error(err);
    }
  };

  return (
    <div className="adm-page">
      <PageHeader title="Media" subtitle="Imagens, vídeos e documentos (Cloudinary). Os URLs ficam guardados na base de dados." />
      <section className="adm-card">
        <div className="adm-row wrap">
          <label className="adm-field">
            <span className="adm-label">Pasta de destino</span>
            <select className="adm-input" value={uploadFolder} onChange={(e) => setUploadFolder(e.target.value as any)}>
              {folders.map((folder) => (
                <option key={folder} value={folder}>
                  {folder}
                </option>
              ))}
            </select>
          </label>
        </div>
        <UploadBox folder={uploadFolder} accept="any" onUploaded={() => load()} />
      </section>

      <div className="adm-toolbar">
        <div className="adm-search">
          <Search size={15} />
          <input className="adm-input" placeholder="Pesquisar ficheiros…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        </div>
        <select className="adm-input adm-filter" value={kind} onChange={(e) => { setKind(e.target.value); setPage(1); }} aria-label="Tipo">
          <option value="">Todos os tipos</option>
          <option value="image">Imagens</option>
          <option value="video">Vídeos</option>
          <option value="document">Documentos</option>
        </select>
      </div>

      {error ? (
        <div className="adm-alert">{error}</div>
      ) : !data ? (
        <Spinner />
      ) : data.items.length === 0 ? (
        <EmptyState title="Sem ficheiros" text="Carregue o primeiro ficheiro acima." />
      ) : (
        <>
          <div className="adm-media-grid large">
            {data.items.map((item) => (
              <button key={item.id} className="adm-media-tile" onClick={() => open(item)} title={item.originalName}>
                <MediaPreview url={item.kind === "image" ? item.transformations?.thumbnail || item.secureUrl : item.secureUrl} />
                <span>{item.originalName}</span>
                <small className="adm-muted">
                  {item.kind} · {formatBytes(item.bytes)}
                </small>
              </button>
            ))}
          </div>
          <div className="adm-list-foot">
            <span className="adm-muted">{data.total} ficheiro(s)</span>
            <Pagination page={data.page} pages={data.pages} onChange={setPage} />
          </div>
        </>
      )}

      <Drawer open={!!selected} dirty={!!selected && alt !== (selected.altText || "")} title="Detalhes do ficheiro" onClose={() => setSelected(null)}>
        {selected && (
          <div className="adm-media-detail">
            <MediaPreview url={selected.secureUrl} alt={selected.altText} />
            <dl className="adm-dl">
              <dt>Nome</dt>
              <dd>{selected.originalName}</dd>
              <dt>Tipo</dt>
              <dd>
                {selected.kind} · {selected.format} · {formatBytes(selected.bytes)}
              </dd>
              <dt>Pasta</dt>
              <dd>{selected.folder}</dd>
              <dt>Em uso</dt>
              <dd>{usages === null ? "…" : usages.length ? usages.join(", ") : "Não está a ser utilizado"}</dd>
            </dl>
            <div className="adm-row">
              <input className="adm-input" readOnly value={selected.secureUrl} aria-label="URL" />
              <button
                className="icon-btn"
                title="Copiar URL"
                aria-label="Copiar URL"
                onClick={() => navigator.clipboard?.writeText(selected.secureUrl).then(() => toast.success("URL copiado."))}
              >
                <Copy size={14} />
              </button>
            </div>
            <TextInput label="Texto alternativo (acessibilidade)" value={alt} onChange={setAlt} />
            <div className="adm-row wrap">
              <button className="btn solid adm-btn-sm" onClick={saveAlt} disabled={alt === (selected.altText || "")}>
                <Pencil size={13} /> Guardar texto
              </button>
              <label className="btn outline adm-btn-sm">
                {replacing ? "A substituir…" : "Substituir ficheiro"}
                <input type="file" hidden accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,application/pdf" onChange={(e) => replace(e.target.files?.[0])} disabled={replacing} />
              </label>
              <button className="btn outline adm-btn-sm adm-danger-hover" onClick={remove}>
                <Trash2 size={13} /> Eliminar
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

/* ================================================================== */
/* Conta                                                               */
/* ================================================================== */
export function AccountPage({ user }: { user: AdminUser }) {
  const toast = useToast();
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirmPassword, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!currentPassword) next.currentPassword = "Indique a palavra-passe actual.";
    if (newPassword.length < 10) next.newPassword = "Mínimo de 10 caracteres.";
    else if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword))
      next.newPassword = "Inclua maiúsculas, minúsculas e números.";
    if (newPassword !== confirmPassword) next.confirmPassword = "As palavras-passe não coincidem.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      await api.put("/admin/auth/password", { currentPassword, newPassword });
      toast.success("Palavra-passe alterada. As outras sessões foram terminadas.");
      setCurrent("");
      setNew("");
      setConfirm("");
    } catch (err) {
      setErrors(issuesToErrors(err));
      toast.error(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm-page">
      <PageHeader title="Conta" subtitle={`${user.name} · ${user.email} · ${user.role}`} />
      <form className="adm-card adm-narrow" onSubmit={submit} noValidate>
        <h2 className="adm-card-title">Alterar palavra-passe</h2>
        <TextInput label="Palavra-passe actual" type="password" value={currentPassword} error={errors.currentPassword} onChange={setCurrent} />
        <TextInput label="Nova palavra-passe" type="password" value={newPassword} error={errors.newPassword} onChange={setNew} hint="Mínimo 10 caracteres, com maiúsculas, minúsculas e números." />
        <TextInput label="Confirmar nova palavra-passe" type="password" value={confirmPassword} error={errors.confirmPassword} onChange={setConfirm} />
        <button className="btn solid" type="submit" disabled={busy}>
          {busy ? "A guardar…" : "Alterar palavra-passe"}
        </button>
      </form>
    </div>
  );
}

export { resources };
