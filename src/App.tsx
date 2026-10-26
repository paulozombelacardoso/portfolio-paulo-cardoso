import { useEffect, useState, FormEvent } from "react";
import { Github, Linkedin, Sun, Moon, Monitor, Menu, X, ArrowUp, Download, Eye, Mail, ExternalLink } from "lucide-react";
import { profile, skills, projects, projectCategories, certifications, certCategories, education, experience, cvs } from "./data";

type Theme = "system" | "light" | "dark";
function useTheme() {
  const [t, setT] = useState<Theme>(() => { try { return (localStorage.getItem("theme") as Theme) || "system"; } catch { return "system"; } });
  useEffect(() => {
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => { document.documentElement.dataset.theme = t === "dark" || (t === "system" && mq.matches) ? "dark" : "light"; };
    apply(); try { localStorage.setItem("theme", t); } catch { /* ignore */ }
    mq.addEventListener("change", apply); return () => mq.removeEventListener("change", apply);
  }, [t]);
  return [t, setT] as const;
}

function Typed({ words }: { words: string[] }) {
  const [i, setI] = useState(0); const [n, setN] = useState(0); const [del, setDel] = useState(false);
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  useEffect(() => {
    if (still) return;
    const w = words[i]; let d = del ? 35 : 80;
    if (!del && n === w.length) d = 1600; if (del && n === 0) d = 300;
    const id = setTimeout(() => {
      if (!del && n === w.length) setDel(true);
      else if (del && n === 0) { setDel(false); setI((i + 1) % words.length); }
      else setN(n + (del ? -1 : 1));
    }, d);
    return () => clearTimeout(id);
  }, [n, del, i, words, still]);
  return <span className="typed" aria-label={words.join(", ")}>{still ? words[0] : words[i].slice(0, n)}<i className="caret" /></span>;
}

const nav = [["home", "Início"], ["about", "Sobre"], ["skills", "Competências"], ["projects", "Projectos"], ["certificates", "Certificados"], ["education", "Formação"], ["experience", "Experiência"], ["cv", "CV"], ["contact", "Contacto"]];

function Filters({ items, value, set }: { items: string[]; value: string; set: (v: string) => void }) {
  return <div className="filters" role="tablist">{items.map(c => <button key={c} role="tab" aria-selected={value === c} className={value === c ? "on" : ""} onClick={() => set(c)}>{c}</button>)}</div>;
}
const ghUrl = "https://github.com/" + profile.github;

function useCvAvailability() {
  const [ok, setOk] = useState<Record<string, boolean>>({});
  useEffect(() => {
    cvs.forEach(c => fetch(c.file, { method: "HEAD" }).then(r => setOk(o => ({ ...o, [c.file]: r.ok && (r.headers.get("content-type") || "").includes("pdf") }))).catch(() => setOk(o => ({ ...o, [c.file]: false }))));
  }, []);
  return ok;
}

export default function App() {
  const [theme, setTheme] = useTheme();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");
  const [pf, setPf] = useState("Todos"); const [sel, setSel] = useState<number | null>(null);
  const [cf, setCf] = useState("Todas");
  const [cvI, setCvI] = useState(0); const avail = useCvAvailability();
  const [err, setErr] = useState<Record<string, string>>({}); const [photoOk, setPhotoOk] = useState(true);
  const [top, setTop] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-45% 0px -50% 0px" });
    nav.forEach(([id]) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    const sc = () => setTop(scrollY > 600); addEventListener("scroll", sc); return () => { obs.disconnect(); removeEventListener("scroll", sc); };
  }, []);

  const nextTheme = () => setTheme(theme === "system" ? "light" : theme === "light" ? "dark" : "system");
  const ThemeIcon = theme === "system" ? Monitor : theme === "light" ? Sun : Moon;
  const cv = cvs[cvI]; const cvOk = avail[cv.file];
  const shownProjects = projects.filter(p => pf === "Todos" || p.category === pf);
  const shownCerts = certifications.filter(c => cf === "Todas" || c.category === cf);
  const proj = sel !== null ? projects[sel] : null;

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    const name = String(f.get("name") || "").trim(), email = String(f.get("email") || "").trim(), msg = String(f.get("msg") || "").trim();
    const er: Record<string, string> = {};
    if (name.length < 2) er.name = "Indique o seu nome.";
    if (!/^\S+@\S+\.\S+$/.test(email)) er.email = "Indique um email válido.";
    if (msg.length < 10) er.msg = "Escreva pelo menos 10 caracteres.";
    setErr(er); if (Object.keys(er).length) return;
    location.href = "mailto:" + profile.email + "?subject=" + encodeURIComponent("Contacto de " + name) + "&body=" + encodeURIComponent(msg + "\n\n" + name + " (" + email + ")");
  };

  return (<>
    <header className="top">
      <a href="#home" className="logo"><span className="mark">&lt;P&gt;</span>{profile.name.split(" ")[0].toUpperCase()}</a>
      <nav className={open ? "open" : ""} aria-label="Principal">
        {nav.map(([id, l]) => <a key={id} href={"#" + id} className={active === id ? "act" : ""} onClick={() => setOpen(false)}>{l}</a>)}
      </nav>
      <div className="tools">
        <button className="icon" onClick={nextTheme} aria-label={"Tema: " + theme} title={"Tema: " + theme}><ThemeIcon size={18} /></button>
        <button className="icon burger" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>{open ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
    </header>

    <aside className="side"><a href={ghUrl} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><Github size={22} /></a><a href={profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin size={22} /></a><span /></aside>

    <main>
      <section id="home" className="hero">
        <i className="sq a" /><i className="sq b" />
        <div className="hero-text">
          <h1>{profile.name} é <Typed words={profile.roles} /></h1>
          <p>{profile.intro}</p><p className="tag">{profile.tagline}</p>
          <div className="btns"><a className="btn solid" href="#projects">Ver projectos</a><a className="btn" href="#cv">Descarregar CV</a><a className="btn" href="#contact">Contactar-me</a></div>
        </div>
        <div className="avatar">{photoOk ? <img src="photo.jpg" alt={"Fotografia de " + profile.name} onError={() => setPhotoOk(false)} /> : <span>PC</span>}</div>
      </section>

      <section id="about"><h2>Sobre mim</h2>
        <p className="lead">Passei da Informática de Gestão no IMEL para a Engenharia de Software na 42 Luanda, onde a aprendizagem é prática, autónoma e feita em colaboração.</p>
        <p>A experiência em gestão de seguros ensinou-me a organizar processos, acompanhar clientes e comunicar com clareza. Hoje aplico isso no desenvolvimento backend, com interesse também em aplicações Full Stack, análise de dados, inteligência artificial e cloud.</p>
      </section>

      <section id="skills"><h2>Competências técnicas</h2>
        <p className="note"><b className="dot using" /> Já utilizo &nbsp; <b className="dot learning" /> Em aprendizagem</p>
        <div className="grid">{skills.map(g => <div className="card" key={g.group}><h3>{g.group}</h3><div className="tags">{g.items.map(i => <span key={i.n} className={"tag-i " + i.level}>{i.n}</span>)}</div></div>)}</div>
      </section>

      <section id="projects"><h2>Projectos em destaque</h2>
        <Filters items={projectCategories} value={pf} set={setPf} />
        <div className="grid">{shownProjects.map(p => { const idx = projects.indexOf(p); return (
          <article className="card proj" key={p.name}>
            <div className="thumb">{p.image ? <img src={p.image} alt={"Captura de " + p.name} loading="lazy" /> : <span>{p.name}</span>}</div>
            <h3>{p.name} <small>{p.status}</small></h3><p>{p.description}</p>
            <div className="tags">{p.tech.map(t => <span className="tag-i" key={t}>{t}</span>)}</div>
            <div className="row"><button className="link" onClick={() => setSel(idx)}>Detalhes</button>
              {p.github ? <a className="link" href={p.github} target="_blank" rel="noopener noreferrer">Código <ExternalLink size={14} /></a> : <span className="muted">Código por adicionar</span>}
              {p.demo && <a className="link" href={p.demo} target="_blank" rel="noopener noreferrer">Demo <ExternalLink size={14} /></a>}</div>
          </article>); })}
          {!shownProjects.length && <p className="muted">Ainda não há projectos nesta categoria.</p>}</div>
      </section>

      <section id="certificates"><h2>Certificações e formação complementar</h2>
        <Filters items={certCategories} value={cf} set={setCf} />
        {shownCerts.length ? <div className="grid">{shownCerts.map(c => (
          <article className="card" key={c.name}><h3>{c.name}</h3><p>{c.issuer} · {c.date}</p>
            <div className="tags">{c.skills.map(s => <span className="tag-i" key={s}>{s}</span>)}</div>
            {c.credentialId && <p className="muted">ID: {c.credentialId}</p>}
            <div className="row">{c.file ? <><a className="link" href={c.file} target="_blank" rel="noopener noreferrer">Ver</a><a className="link" href={c.file} download>Descarregar</a></> : <span className="muted">Sem ficheiro associado</span>}
              {c.validationUrl && <a className="link" href={c.validationUrl} target="_blank" rel="noopener noreferrer">Validar</a>}</div></article>))}</div>
          : <p className="empty">Ainda não há certificados. Adicione-os em <code>src/data.ts</code> e coloque os PDFs em <code>public/certificates/</code>.</p>}
      </section>

      <section id="education"><h2>Formação académica</h2>
        <ol className="timeline">{education.map(e => <li key={e.school}><h3>{e.school}</h3><p><b>{e.title}</b>{e.period && " · " + e.period}</p><p>{e.text}</p></li>)}</ol></section>

      <section id="experience"><h2>Experiência profissional</h2>
        <ol className="timeline">{experience.map(e => <li key={e.company}><h3>{e.company}</h3><p><b>{e.role}</b>{e.period && " · " + e.period}</p><p>{e.text}</p><div className="tags">{e.skills.map(s => <span className="tag-i" key={s}>{s}</span>)}</div></li>)}</ol></section>

      <section id="cv"><h2>Currículo</h2>
        <Filters items={cvs.map(c => c.label)} value={cv.label} set={l => setCvI(cvs.findIndex(c => c.label === l))} />
        {cvOk ? <>
          <div className="btns"><a className="btn solid" href={cv.file} download={cv.download}><Download size={16} /> Descarregar CV</a><a className="btn" href={cv.file} target="_blank" rel="noopener noreferrer"><Eye size={16} /> Abrir em novo separador</a></div>
          <iframe className="pdf" src={cv.file} title={"CV — " + cv.label} /></>
          : <p className="empty">Esta versão do CV ainda não está disponível. Coloque o ficheiro em <code>public/{cv.file}</code>.</p>}
      </section>

      <section id="contact"><h2>Contacto</h2>
        <div className="links"><a className="link" href={"mailto:" + profile.email}><Mail size={16} /> {profile.email}</a><a className="link" href={profile.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin size={16} /> LinkedIn</a><a className="link" href={ghUrl} target="_blank" rel="noopener noreferrer"><Github size={16} /> GitHub</a></div>
        <form onSubmit={submit} noValidate>
          {[["name", "Nome", "text"], ["email", "Email", "email"]].map(([k, l, t]) => <label key={k}>{l}<input name={k} type={t} aria-invalid={!!err[k]} />{err[k] && <em>{err[k]}</em>}</label>)}
          <label>Mensagem<textarea name="msg" rows={5} aria-invalid={!!err.msg} />{err.msg && <em>{err.msg}</em>}</label>
          <button className="btn solid" type="submit">Enviar por email</button>
          <p className="muted">Abre o seu cliente de email com a mensagem preenchida.</p>
        </form>
      </section>
    </main>

    <footer><span>© {new Date().getFullYear()} {profile.name}. Sempre a aprender.</span><span><a href={ghUrl} target="_blank" rel="noopener noreferrer">GitHub</a> · <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></span></footer>
    {top && <button className="icon totop" onClick={() => scrollTo({ top: 0 })} aria-label="Voltar ao topo"><ArrowUp size={18} /></button>}

    {proj && <div className="modal" role="dialog" aria-modal="true" aria-label={proj.name} onClick={() => setSel(null)}>
      <div className="card" onClick={e => e.stopPropagation()}>
        <button className="icon close" onClick={() => setSel(null)} aria-label="Fechar"><X size={18} /></button>
        <h3>{proj.name} <small>{proj.status}</small></h3><p>{proj.description}</p>
        {proj.problem && <p><b>Problema:</b> {proj.problem}</p>}
        {!!proj.features.length && <><b>Funcionalidades</b><ul>{proj.features.map(f => <li key={f}>{f}</li>)}</ul></>}
        <div className="tags">{proj.tech.map(t => <span className="tag-i" key={t}>{t}</span>)}</div>
      </div></div>}
  </>);
}
