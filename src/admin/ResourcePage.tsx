import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { api, qs, type Page } from "./api";
import { resourceTechFields, type FieldDef, type ResourceDef } from "./resources";
import {
  Badge,
  Drawer,
  EmptyState,
  GalleryField,
  ListInput,
  MediaField,
  MediaPreview,
  PageHeader,
  Pagination,
  SelectInput,
  Spinner,
  TextArea,
  TextInput,
  Toggle,
  issuesToErrors,
  useConfirm,
  useToast
} from "./ui";

type Item = Record<string, any> & { id: string };
type Lang = "pt" | "en";

/* ---------------- helpers de caminho ("content.pt.name") ---------------- */
export function getPath(object: any, path: string) {
  return path.split(".").reduce((value, key) => (value == null ? undefined : value[key]), object);
}

export function setPath<T extends Record<string, any>>(object: T, path: string, value: unknown): T {
  const keys = path.split(".");
  const clone: any = Array.isArray(object) ? [...object] : { ...object };
  let cursor = clone;
  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      cursor[key] = value;
    } else {
      cursor[key] = cursor[key] && typeof cursor[key] === "object" ? { ...cursor[key] } : {};
      cursor = cursor[key];
    }
  });
  return clone;
}

const isEmpty = (value: unknown) =>
  value === "" || value === null || value === undefined || (Array.isArray(value) && value.length === 0);

/** Remove a versão EN quando está vazia, para não falhar a validação (EN é opcional). */
function pruneLocale(value: any) {
  if (!value || typeof value !== "object") return value;
  const cleaned = Object.fromEntries(Object.entries(value).filter(([, v]) => !isEmpty(v)));
  return Object.keys(cleaned).length ? cleaned : undefined;
}

function toPayload(def: ResourceDef, form: Item) {
  const { id, createdAt, updatedAt, ...rest } = form;
  const payload: Record<string, any> = { ...rest };
  if (def.localizedRoot === "content" && payload.content) {
    const en = pruneLocale(payload.content.en);
    payload.content = { ...payload.content, en };
    if (!en) delete payload.content.en;
  }
  for (const field of resourceTechFields[def.key] || []) {
    const value = payload[field.key];
    if (value && typeof value === "object") {
      payload[field.key] = { pt: value.pt || [], ...(Array.isArray(value.en) && value.en.length ? { en: value.en } : {}) };
    }
  }
  for (const field of def.fields) {
    if (field.type === "number") {
      const raw = payload[field.key];
      payload[field.key] = raw === "" || raw === null || raw === undefined ? (field.key === "level" ? null : 0) : Number(raw);
    }
  }
  if (payload.slug === "") delete payload.slug;
  return payload;
}

/* ---------------- componente de campo genérico ---------------- */
function FieldControl({
  field,
  path,
  form,
  errors,
  onChange,
  categories
}: {
  field: FieldDef;
  path: string;
  form: Item;
  errors: Record<string, string>;
  onChange: (path: string, value: unknown) => void;
  categories: Array<{ value: string; label: string }>;
}) {
  const value = getPath(form, path);
  const common = { label: field.label, error: errors[path], hint: "hint" in field ? field.hint : undefined };
  switch (field.type) {
    case "text":
    case "url":
      return <TextInput {...common} required={"required" in field && field.required} value={value} onChange={(v) => onChange(path, v)} type={field.type === "url" ? "url" : "text"} />;
    case "number":
      return <TextInput {...common} value={value ?? ""} onChange={(v) => onChange(path, v)} type="number" />;
    case "date":
      return <TextInput {...common} value={value ?? ""} onChange={(v) => onChange(path, v)} type="date" />;
    case "textarea":
      return <TextArea {...common} required={field.required} rows={field.rows} value={value} onChange={(v) => onChange(path, v)} />;
    case "select":
      return <SelectInput {...common} value={value ?? ""} options={field.options} onChange={(v) => onChange(path, v)} />;
    case "category":
      return (
        <SelectInput
          {...common}
          required={field.required}
          value={value ?? ""}
          options={[{ value: "", label: "Seleccione…" }, ...categories]}
          onChange={(v) => onChange(path, v)}
        />
      );
    case "bool":
      return <Toggle label={field.label} hint={field.hint} checked={!!value} onChange={(v) => onChange(path, v)} />;
    case "list":
      return <ListInput {...common} multiline={field.multiline} placeholder={field.placeholder} value={value} onChange={(v) => onChange(path, v)} />;
    case "media":
      return <MediaField {...common} folder={field.folder} accept={field.accept} value={value} onChange={(v) => onChange(path, v)} />;
    case "gallery":
      return <GalleryField {...common} folder={field.folder} value={value} onChange={(v) => onChange(path, v)} />;
  }
}

/* ---------------- formulário em drawer ---------------- */
function ResourceForm({
  def,
  initial,
  onClose,
  onSaved,
  categories
}: {
  def: ResourceDef;
  initial: Item | null;
  onClose: () => void;
  onSaved: () => void;
  categories: Array<{ value: string; label: string }>;
}) {
  const toast = useToast();
  const isNew = !initial?.id;
  const start = useMemo<Item>(() => {
    const base = { ...def.defaults(), ...(initial || {}) } as Item;
    if (def.localizedRoot === "content") {
      base.content = { pt: { ...def.defaults().content.pt, ...(base.content?.pt || {}) }, en: { ...(base.content?.en || {}) } };
    }
    return base;
  }, [def, initial]);
  const [form, setForm] = useState<Item>(start);
  const [lang, setLang] = useState<Lang>("pt");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(form) !== JSON.stringify(start);

  const update = useCallback((path: string, value: unknown) => {
    setForm((current) => setPath(current, path, value));
    setErrors((current) => {
      if (!current[path]) return current;
      const { [path]: _removed, ...rest } = current;
      return rest;
    });
  }, []);

  const localPath = (field: FieldDef) =>
    def.localizedRoot ? `${def.localizedRoot}.${lang}.${field.key}` : `${field.key}.${lang}`;

  const validate = () => {
    const next: Record<string, string> = {};
    for (const field of def.fields) {
      if ("required" in field && field.required && isEmpty(getPath(form, field.key))) next[field.key] = `${field.label} é obrigatório.`;
    }
    for (const field of def.localizedFields) {
      if ("required" in field && field.required) {
        const path = def.localizedRoot ? `${def.localizedRoot}.pt.${field.key}` : `${field.key}.pt`;
        if (isEmpty(getPath(form, path))) next[path] = `${field.label} (PT) é obrigatório.`;
      }
    }
    setErrors(next);
    if (Object.keys(next).some((key) => key.includes(".pt"))) setLang("pt");
    return Object.keys(next).length === 0;
  };

  const save = async () => {
    if (!validate()) {
      toast.error("Corrija os campos assinalados.");
      return;
    }
    setSaving(true);
    try {
      const payload = toPayload(def, form);
      if (isNew) await api.post(`/admin/${def.key}`, payload);
      else await api.patch(`/admin/${def.key}/${form.id}`, payload);
      toast.success(isNew ? `${capitalize(def.singular)} criado(a).` : "Alterações guardadas.");
      onSaved();
    } catch (error) {
      const fieldErrors = issuesToErrors(error);
      setErrors(fieldErrors);
      if (Object.keys(fieldErrors).some((key) => key.includes(".en"))) setLang("en");
      else if (Object.keys(fieldErrors).some((key) => key.includes(".pt"))) setLang("pt");
      toast.error(error);
    } finally {
      setSaving(false);
    }
  };

  const techFields = resourceTechFields[def.key] || [];
  const mainFields = def.fields.filter((f) => !["media", "gallery"].includes(f.type));
  const mediaFields = def.fields.filter((f) => ["media", "gallery"].includes(f.type));
  const enErrors = Object.keys(errors).some((key) => key.includes(".en"));

  return (
    <Drawer
      open
      dirty={dirty}
      title={isNew ? `Novo(a) ${def.singular}` : `Editar ${def.singular}`}
      onClose={onClose}
      footer={
        <>
          <span className="adm-muted adm-dirty">{dirty ? "Alterações por guardar" : ""}</span>
          <button className="btn outline" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button className="btn solid" onClick={save} disabled={saving}>
            {saving ? "A guardar…" : "Guardar"}
          </button>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <section className="adm-form-section">
          <div className="adm-section-head">
            <h3>Conteúdo</h3>
            <div className="adm-tabs" role="tablist" aria-label="Idioma">
              {(["pt", "en"] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  role="tab"
                  aria-selected={lang === code}
                  className={lang === code ? "act" : ""}
                  onClick={() => setLang(code)}
                >
                  {code.toUpperCase()}
                  {code === "en" && enErrors && <span className="adm-dot" aria-label="com erros" />}
                </button>
              ))}
            </div>
          </div>
          {lang === "en" && <p className="adm-hint">Opcional. Campos vazios em EN usam o texto em PT no site.</p>}
          <div className="adm-grid">
            {def.localizedFields.map((field) => (
              <FieldControl key={`${lang}-${field.key}`} field={field} path={localPath(field)} form={form} errors={errors} onChange={update} categories={categories} />
            ))}
            {techFields.map((field) => (
              <FieldControl key={`${lang}-${field.key}`} field={field} path={`${field.key}.${lang}`} form={form} errors={errors} onChange={update} categories={categories} />
            ))}
          </div>
        </section>

        <section className="adm-form-section">
          <h3>Detalhes</h3>
          <div className="adm-grid">
            {mainFields.map((field) => (
              <FieldControl key={field.key} field={field} path={field.key} form={form} errors={errors} onChange={update} categories={categories} />
            ))}
          </div>
        </section>

        {mediaFields.length > 0 && (
          <section className="adm-form-section">
            <h3>Ficheiros</h3>
            <div className="adm-grid">
              {mediaFields.map((field) => (
                <FieldControl key={field.key} field={field} path={field.key} form={form} errors={errors} onChange={update} categories={categories} />
              ))}
            </div>
          </section>
        )}
        <button type="submit" hidden />
      </form>
    </Drawer>
  );
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/* ---------------- página de listagem ---------------- */
export function ResourcePage({ def }: { def: ResourceDef }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [data, setData] = useState<Page<Item> | null>(null);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [published, setPublished] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Item | null | undefined>(undefined);
  const [categories, setCategories] = useState<Array<{ value: string; label: string }>>([]);
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q), 250);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    setQ("");
    setDebouncedQ("");
    setPublished("");
    setFilters({});
    setPage(1);
    setData(null);
    setEditing(undefined);
  }, [def.key]);

  const needsCategories = def.key === "skills";
  useEffect(() => {
    if (!needsCategories) return;
    api
      .get<Page<Item>>("/admin/skill-categories?pageSize=100")
      .then((result) => setCategories(result.items.map((item) => ({ value: item.id, label: item.name?.pt || item.id }))))
      .catch(() => setCategories([]));
  }, [needsCategories]);

  const load = useCallback(async () => {
    setError("");
    try {
      const result = await api.get<Page<Item>>(
        `/admin/${def.key}${qs({ q: debouncedQ, published, page, pageSize: 50, ...filters })}`
      );
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar.");
    }
  }, [def.key, debouncedQ, published, page, filters]);

  useEffect(() => {
    load();
  }, [load]);

  const filtering = !!debouncedQ || !!published || Object.values(filters).some(Boolean);
  const canReorder = !filtering && data && data.pages === 1 && data.items.length > 1;

  const togglePublished = async (item: Item) => {
    setBusyId(item.id);
    try {
      await api.patch(`/admin/${def.key}/${item.id}`, { published: !item.published });
      toast.success(item.published ? "Conteúdo despublicado." : "Conteúdo publicado.");
      await load();
    } catch (err) {
      toast.error(err);
    } finally {
      setBusyId("");
    }
  };

  const remove = async (item: Item) => {
    const ok = await confirm({
      title: `Eliminar ${def.singular}?`,
      message: `"${def.title(item) || item.id}" será eliminado(a) permanentemente.`,
      confirmLabel: "Eliminar",
      danger: true
    });
    if (!ok) return;
    setBusyId(item.id);
    try {
      await api.delete(`/admin/${def.key}/${item.id}`);
      toast.success("Eliminado.");
      await load();
    } catch (err) {
      toast.error(err);
    } finally {
      setBusyId("");
    }
  };

  const move = async (index: number, delta: number) => {
    if (!data) return;
    const ids = data.items.map((item) => item.id);
    const target = index + delta;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    const reordered = ids.map((id) => data.items.find((item) => item.id === id)!);
    setData({ ...data, items: reordered });
    try {
      await api.post(`/admin/${def.key}/reorder`, { ids });
    } catch (err) {
      toast.error(err);
      load();
    }
  };

  return (
    <div className="adm-page">
      <PageHeader
        title={def.label}
        subtitle={def.description}
        actions={
          <button className="btn solid" onClick={() => setEditing(null)}>
            <Plus size={15} /> Adicionar
          </button>
        }
      />

      <div className="adm-toolbar">
        <div className="adm-search">
          <Search size={15} />
          <input
            className="adm-input"
            placeholder="Pesquisar…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            aria-label="Pesquisar"
          />
        </div>
        {def.hasPublished && (
          <select
            className="adm-input adm-filter"
            value={published}
            onChange={(e) => {
              setPublished(e.target.value);
              setPage(1);
            }}
            aria-label="Estado de publicação"
          >
            <option value="">Todos</option>
            <option value="true">Publicados</option>
            <option value="false">Rascunhos</option>
          </select>
        )}
        {def.key === "skills" && categories.length > 0 && (
          <select
            className="adm-input adm-filter"
            value={filters.categoryId || ""}
            onChange={(e) => {
              setFilters({ ...filters, categoryId: e.target.value });
              setPage(1);
            }}
            aria-label="Categoria"
          >
            <option value="">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        )}
        {def.filters?.map((filter) => (
          <select
            key={filter.param}
            className="adm-input adm-filter"
            value={filters[filter.param] || ""}
            onChange={(e) => {
              setFilters({ ...filters, [filter.param]: e.target.value });
              setPage(1);
            }}
            aria-label={filter.label}
          >
            <option value="">{filter.label}: todos</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ))}
      </div>

      {error ? (
        <div className="adm-alert">
          {error}{" "}
          <button className="adm-link-btn" onClick={load}>
            Tentar novamente
          </button>
        </div>
      ) : !data ? (
        <Spinner />
      ) : data.items.length === 0 ? (
        <EmptyState
          title={filtering ? "Sem resultados" : `Ainda não há ${def.label.toLowerCase()}`}
          text={filtering ? "Ajuste a pesquisa ou os filtros." : `Adicione o primeiro registo.`}
          action={
            !filtering && (
              <button className="btn solid" onClick={() => setEditing(null)}>
                <Plus size={15} /> Adicionar
              </button>
            )
          }
        />
      ) : (
        <>
          <ul className="adm-rows">
            {data.items.map((item, index) => (
              <li key={item.id} className={`adm-row-item ${busyId === item.id ? "busy" : ""}`}>
                {def.thumbnail && <MediaPreview url={def.thumbnail(item)} small />}
                <button className="adm-row-main" onClick={() => setEditing(item)}>
                  <strong>{def.title(item) || <em className="adm-muted">Sem título</em>}</strong>
                  {def.subtitle && <span className="adm-muted">{def.subtitle(item)}</span>}
                </button>
                <div className="adm-row-badges">
                  {def.badges?.(item).map((badge) => (
                    <Badge key={badge.label} tone={badge.tone}>
                      {badge.label}
                    </Badge>
                  ))}
                </div>
                <div className="adm-row-actions">
                  {canReorder && (
                    <>
                      <button className="icon-btn" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Subir" title="Subir">
                        <ArrowUp size={14} />
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => move(index, 1)}
                        disabled={index === data.items.length - 1}
                        aria-label="Descer"
                        title="Descer"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </>
                  )}
                  {def.hasPublished && (
                    <button
                      className="icon-btn"
                      onClick={() => togglePublished(item)}
                      aria-label={item.published ? "Despublicar" : "Publicar"}
                      title={item.published ? "Despublicar" : "Publicar"}
                    >
                      {item.published ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  )}
                  <button className="icon-btn" onClick={() => setEditing(item)} aria-label="Editar" title="Editar">
                    <Pencil size={14} />
                  </button>
                  <button className="icon-btn adm-danger-hover" onClick={() => remove(item)} aria-label="Eliminar" title="Eliminar">
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="adm-list-foot">
            <span className="adm-muted">
              {data.total} registo(s){canReorder ? " · use as setas para reordenar" : ""}
            </span>
            <Pagination page={data.page} pages={data.pages} onChange={setPage} />
          </div>
        </>
      )}

      {editing !== undefined && (
        <ResourceForm
          key={editing?.id || "new"}
          def={def}
          initial={editing}
          categories={categories}
          onClose={() => setEditing(undefined)}
          onSaved={() => {
            setEditing(undefined);
            load();
          }}
        />
      )}
    </div>
  );
}
