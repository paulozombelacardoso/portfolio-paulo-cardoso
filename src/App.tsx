import React, { useEffect, useState, FormEvent } from "react";
import {
  Github,
  Linkedin,
  Sun,
  Moon,
  Monitor,
  Menu,
  X,
  ArrowUp,
  Download,
  Eye,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Terminal,
  Server,
  Layers,
  GraduationCap,
  Award,
  Calendar,
  Briefcase,
  CheckCircle2,
  FolderGit2
} from "lucide-react";
import {
  profile,
  skillGroups,
  projects,
  projectCategories,
  experiences,
  education,
  certifications,
  certCategories,
  officialCv,
  Project,
  Experience,
  Certification
} from "./data";
import { LeetCodeIcon, CodeforcesIcon } from "./components/Icons";
import { DetailModal } from "./components/DetailModal";
import { ProjectCard } from "./components/ProjectCard";
import { ExperienceCard } from "./components/ExperienceCard";
import { SkillGroupCard } from "./components/SkillGroupCard";
import { FTResourcesSection } from "./components/FTResourcesSection";

type Theme = "system" | "light" | "dark";

function useTheme() {
  const [t, setT] = useState<Theme>(() => {
    try {
      return (localStorage.getItem("theme") as Theme) || "system";
    } catch {
      return "system";
    }
  });

  useEffect(() => {
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.dataset.theme =
        t === "dark" || (t === "system" && mq.matches) ? "dark" : "light";
    };
    apply();
    try {
      localStorage.setItem("theme", t);
    } catch {
      /* ignore */
    }
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [t]);

  return [t, setT] as const;
}

function Typed({ words }: { words: string[] }) {
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  const [del, setDel] = useState(false);
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (still) return;
    const w = words[i];
    let d = del ? 35 : 75;
    if (!del && n === w.length) d = 1700;
    if (del && n === 0) d = 300;

    const id = setTimeout(() => {
      if (!del && n === w.length) setDel(true);
      else if (del && n === 0) {
        setDel(false);
        setI((i + 1) % words.length);
      } else {
        setN(n + (del ? -1 : 1));
      }
    }, d);

    return () => clearTimeout(id);
  }, [n, del, i, words, still]);

  return (
    <span className="typed" aria-label={words.join(", ")}>
      {still ? words[0] : words[i].slice(0, n)}
      <i className="caret" />
    </span>
  );
}

const navItems = [
  ["home", "Início"],
  ["about", "Sobre"],
  ["skills", "Competências"],
  ["projects", "Projectos"],
  ["ft-resources", "Recursos 42"],
  ["experience", "Experiência"],
  ["education", "Formação"],
  ["certificates", "Certificações"],
  ["cv", "CV"],
  ["contact", "Contacto"]
] as const;

export default function App() {
  const [theme, setTheme] = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [projectFilter, setProjectFilter] = useState<string>("Todos");
  const [certFilter, setCertFilter] = useState<string>("Todas");

  // Estados de modais
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);

  // Form & Top
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [photoError, setPhotoError] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setActiveSection(e.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px" }
    );

    navItems.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const nextTheme = () =>
    setTheme(theme === "system" ? "light" : theme === "light" ? "dark" : "system");
  const ThemeIcon = theme === "system" ? Monitor : theme === "light" ? Sun : Moon;

  const shownProjects = projects.filter(
    (p) => projectFilter === "Todos" || p.category === projectFilter
  );

  const shownCerts = certifications.filter(
    (c) => certFilter === "Todas" || c.category === certFilter
  );

  const handleContactSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") || "").trim();
    const email = String(f.get("email") || "").trim();
    const message = String(f.get("message") || "").trim();

    const errors: Record<string, string> = {};
    if (name.length < 2) errors.name = "Por favor, indique o seu nome.";
    if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "Por favor, indique um email válido.";
    if (message.length < 10) errors.message = "A mensagem deve conter pelo menos 10 caracteres.";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(
      `Contacto de ${name} via Portefólio`
    )}&body=${encodeURIComponent(`${message}\n\nDe: ${name} (${email})`)}`;
  };

  return (
    <>
      {/* Top Header / Navigation */}
      <header className="top">
        <a href="#home" className="logo" aria-label="Paulo Cardoso — Início">
          <span className="mark">&lt;P&gt;</span>
          <span className="logo-text">PAULO CARDOSO</span>
        </a>

        <nav className={menuOpen ? "open" : ""} aria-label="Navegação Principal">
          {navItems.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className={activeSection === id ? "act" : ""}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="tools">
          <button
            className="icon"
            onClick={nextTheme}
            aria-label={`Tema actual: ${theme}. Clique para mudar.`}
            title={`Tema: ${theme}`}
          >
            <ThemeIcon size={18} />
          </button>
          <button
            className="icon burger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Floating Side Social Bar (Desktop) */}
      <aside className="side" aria-label="Perfis Sociais e Técnicos">
        <a
          href={profile.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub de Paulo Cardoso"
          title="GitHub"
        >
          <Github size={20} />
        </a>
        <a
          href={profile.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn de Paulo Cardoso"
          title="LinkedIn"
        >
          <Linkedin size={20} />
        </a>
        <a
          href={profile.leetcode}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Perfil LeetCode de Paulo Cardoso"
          title="LeetCode (PaulCard123)"
        >
          <LeetCodeIcon size={20} />
        </a>
        <a
          href={profile.codeforces}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Perfil Codeforces de Paulo Cardoso"
          title="Codeforces (Sunjinwoo42)"
        >
          <CodeforcesIcon size={20} />
        </a>
        <span className="side-line" />
      </aside>

      <main>
        {/* 1. Hero Section */}
        <section id="home" className="hero">
          <i className="sq a" aria-hidden="true" />
          <i className="sq b" aria-hidden="true" />

          <div className="hero-text">
            <div className="hero-pill">
              <span className="status-indicator" /> Software Engineer &bull; 42 Luanda
            </div>
            <h1>
              Paulo Cardoso é <Typed words={profile.roles} />
            </h1>
            <p className="hero-intro">{profile.intro}</p>
            <p className="tag hero-tagline">{profile.tagline}</p>

            <div className="btns">
              <a className="btn solid" href="#projects">
                Ver Projectos
              </a>
              <a className="btn" href="#cv">
                <Download size={15} /> Descarregar CV
              </a>
              <a className="btn" href="#contact">
                Contactar-me
              </a>
            </div>

            <div className="hero-social-row">
              <span className="hero-social-label">Perfis Técnicos:</span>
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="social-badge"
                title="GitHub"
              >
                <Github size={15} /> GitHub
              </a>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="social-badge"
                title="LinkedIn"
              >
                <Linkedin size={15} /> LinkedIn
              </a>
              <a
                href={profile.leetcode}
                target="_blank"
                rel="noopener noreferrer"
                className="social-badge"
                title="LeetCode"
              >
                <LeetCodeIcon size={15} /> LeetCode
              </a>
              <a
                href={profile.codeforces}
                target="_blank"
                rel="noopener noreferrer"
                className="social-badge"
                title="Codeforces"
              >
                <CodeforcesIcon size={15} /> Codeforces
              </a>
            </div>
          </div>

          <div className="avatar">
            {!photoError ? (
              <img
                src="photo.jpg"
                alt={`Fotografia de ${profile.name}`}
                onError={() => setPhotoError(true)}
              />
            ) : (
              <div className="avatar-monogram" aria-label={profile.name}>
                <span>PC</span>
                <small className="avatar-sub">Software Eng.</small>
              </div>
            )}
          </div>
        </section>

        {/* 2. About Section */}
        <section id="about">
          <div className="section-head">
            <div className="head-badge">Perfil Profissional</div>
            <h2>Sobre mim</h2>
          </div>

          <div className="about-content">
            <p className="lead">{profile.summaryParagraphs[0]}</p>
            <p>{profile.summaryParagraphs[1]}</p>
            <p>{profile.summaryParagraphs[2]}</p>

            <div className="about-highlights-grid">
              <div className="highlight-box">
                <div className="hl-icon">
                  <Server size={20} />
                </div>
                <h4>Backend & APIs</h4>
                <p>NestJS, Node.js, Express, RESTful APIs, JWT, OAuth2 e Clean Architecture.</p>
              </div>
              <div className="highlight-box">
                <div className="hl-icon">
                  <Terminal size={20} />
                </div>
                <h4>DevOps & Linux</h4>
                <p>Docker, Docker Compose, Bash scripting, sistemas Unix e redes POSIX.</p>
              </div>
              <div className="highlight-box">
                <div className="hl-icon">
                  <Layers size={20} />
                </div>
                <h4>Bases de Dados & ORM</h4>
                <p>PostgreSQL, modelação relacional avançada, Prisma ORM e TypeORM.</p>
              </div>
              <div className="highlight-box">
                <div className="hl-icon">
                  <Award size={20} />
                </div>
                <h4>Inteligência Artificial</h4>
                <p>Integração de APIs de IA (Gemini, Anthropic), pesquisa semântica e hackathons de inovação.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Technical Skills Section */}
        <section id="skills">
          <div className="section-head">
            <div className="head-badge">Stack & Conhecimento</div>
            <h2>Competências técnicas</h2>
            <p className="note">
              <b className="dot using" /> Tecnologias aplicadas em projectos reais &nbsp;&nbsp;&bull;&nbsp;&nbsp;
              <b className="dot normal" /> Competências técnicas consolidadas
            </p>
          </div>

          <div className="grid skills-grid">
            {skillGroups.map((g) => (
              <SkillGroupCard key={g.group} group={g} />
            ))}
          </div>
        </section>

        {/* 4. Projects Section */}
        <section id="projects">
          <div className="section-head">
            <div className="head-badge">Portefólio de Engenharia</div>
            <h2>Projectos técnicos em destaque</h2>
            <p className="lead">
              Aplicações e sistemas com decisões de arquitectura documentadas, foco na resolução de problemas e boas práticas de engenharia.
            </p>
          </div>

          <div className="filters" role="tablist" aria-label="Filtrar projectos por categoria">
            {projectCategories.map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={projectFilter === c}
                className={projectFilter === c ? "on" : ""}
                onClick={() => setProjectFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid projects-grid">
            {shownProjects.map((p) => (
              <ProjectCard key={p.id} project={p} onSelect={setSelectedProject} />
            ))}
          </div>
        </section>

        {/* 5. 42 Resources Section */}
        <FTResourcesSection />

        {/* 6. Experience Section */}
        <section id="experience">
          <div className="section-head">
            <div className="head-badge">Carreira & Competições</div>
            <h2>Experiência profissional</h2>
            <p className="lead">
              Trajecto em desenvolvimento backend freelancer e liderança técnica em equipas multidisciplinares de inovação.
            </p>
          </div>

          <ol className="timeline">
            {experiences.map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} onSelect={setSelectedExperience} />
            ))}
          </ol>
        </section>

        {/* 7. Education Section */}
        <section id="education">
          <div className="section-head">
            <div className="head-badge">Formação & Base Técnica</div>
            <h2>Formação académica</h2>
          </div>

          <div className="grid edu-grid">
            {education.map((e) => (
              <article key={e.school} className="card edu-card">
                <div className="edu-head">
                  <div className="edu-icon-box">
                    <GraduationCap size={22} />
                  </div>
                  <div>
                    <span className="edu-period">{e.period}</span>
                    <h3>{e.school}</h3>
                    <h4 className="edu-title">{e.title}</h4>
                  </div>
                </div>
                <p className="edu-desc">{e.description}</p>
                <div className="edu-highlights">
                  <h5>Destaques da formação:</h5>
                  <ul>
                    {e.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 8. Certifications Section */}
        <section id="certificates">
          <div className="section-head">
            <div className="head-badge">Aprendizagem Contínua</div>
            <h2>Certificações e qualificações</h2>
          </div>

          <div className="filters" role="tablist" aria-label="Filtrar certificações">
            {certCategories.map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={certFilter === c}
                className={certFilter === c ? "on" : ""}
                onClick={() => setCertFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid certs-grid">
            {shownCerts.map((c) => (
              <article key={c.id} className="card cert-card">
                <div className="cert-top">
                  <span className="card-category-badge">{c.category}</span>
                  <span className="verified-badge">
                    <CheckCircle2 size={13} /> Confirmado
                  </span>
                </div>
                <h3>{c.name}</h3>
                <p className="cert-issuer">
                  {c.issuer} &bull; {c.date}
                </p>
                <div className="tags">
                  {c.skills.map((s) => (
                    <span key={s} className="tag-i">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="card-actions-row">
                  <button className="link" onClick={() => setSelectedCert(c)}>
                    Ver Detalhes
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 9. CV Section */}
        <section id="cv">
          <div className="section-head">
            <div className="head-badge">Documento Profissional</div>
            <h2>Currículo</h2>
            <p className="lead">
              Consulte ou descarregue o meu CV consolidado com o resumo das minhas competências, experiências e projectos como Software Engineer.
            </p>
          </div>

          <div className="cv-container card">
            <div className="cv-header-row">
              <div className="cv-info">
                <h3>{profile.name} — Engenheiro de Software</h3>
                <p className="muted">
                  Formato PDF &bull; Actualizado com experiências, projectos (PharmIA, Inception, Minishell) e competências técnicas.
                </p>
              </div>

              <div className="btns cv-btns">
                <a
                  className="btn solid"
                  href={officialCv.file}
                  download={officialCv.download}
                  title="Descarregar ficheiro PDF do CV"
                >
                  <Download size={16} /> Descarregar CV
                </a>
                <a
                  className="btn"
                  href={officialCv.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Abrir o CV num novo separador do navegador"
                >
                  <Eye size={16} /> Abrir em novo separador
                </a>
              </div>
            </div>

            <div className="cv-preview-wrap">
              <iframe
                className="pdf"
                src={officialCv.file}
                title={`CV de ${profile.name} — Perfil Software Engineer`}
              />
            </div>
          </div>
        </section>

        {/* 10. Contact Section */}
        <section id="contact">
          <div className="section-head">
            <div className="head-badge">Vamos Conversar</div>
            <h2>Contacto & Perfis Técnicos</h2>
            <p className="lead">
              Disponível para projectos desafiantes de Engenharia de Software, posições de Backend Developer e parcerias tecnológicas.
            </p>
          </div>

          <div className="contact-layout">
            <div className="contact-details">
              <h3>Canais de Contacto</h3>
              <p className="muted">Entre em contacto através dos seguintes meios directos:</p>

              <div className="contact-links-list">
                <a className="contact-item" href={`mailto:${profile.email}`}>
                  <div className="contact-icon">
                    <Mail size={18} />
                  </div>
                  <div>
                    <span className="contact-label">Email Principal</span>
                    <span className="contact-value">{profile.email}</span>
                  </div>
                </a>

                <a className="contact-item" href={`tel:${profile.phone.replace(/\s+/g, "")}`}>
                  <div className="contact-icon">
                    <Phone size={18} />
                  </div>
                  <div>
                    <span className="contact-label">Telefone / WhatsApp</span>
                    <span className="contact-value">{profile.phone}</span>
                  </div>
                </a>

                <div className="contact-item">
                  <div className="contact-icon">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <span className="contact-label">Localização</span>
                    <span className="contact-value">{profile.location}</span>
                  </div>
                </div>
              </div>

              <h4 className="tech-profiles-title">Perfis em Plataformas Técnicas</h4>
              <div className="tech-profiles-grid">
                <a
                  className="tech-profile-card"
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github size={18} />
                  <div>
                    <span className="tp-name">GitHub</span>
                    <span className="tp-user">@{profile.github}</span>
                  </div>
                  <ExternalLink size={14} className="tp-ext" />
                </a>

                <a
                  className="tech-profile-card"
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin size={18} />
                  <div>
                    <span className="tp-name">LinkedIn</span>
                    <span className="tp-user">paulo-cardoso</span>
                  </div>
                  <ExternalLink size={14} className="tp-ext" />
                </a>

                <a
                  className="tech-profile-card"
                  href={profile.leetcode}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <LeetCodeIcon size={18} />
                  <div>
                    <span className="tp-name">LeetCode</span>
                    <span className="tp-user">PaulCard123</span>
                  </div>
                  <ExternalLink size={14} className="tp-ext" />
                </a>

                <a
                  className="tech-profile-card"
                  href={profile.codeforces}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <CodeforcesIcon size={18} />
                  <div>
                    <span className="tp-name">Codeforces</span>
                    <span className="tp-user">Sunjinwoo42</span>
                  </div>
                  <ExternalLink size={14} className="tp-ext" />
                </a>
              </div>
            </div>

            <form onSubmit={handleContactSubmit} noValidate className="contact-form card">
              <h3>Envie uma Mensagem</h3>
              <p className="muted">Preencha o formulário para abrir o seu cliente de email pronto a enviar.</p>

              <label>
                Nome
                <input
                  name="name"
                  type="text"
                  placeholder="O seu nome ou empresa"
                  aria-invalid={!!formErrors.name}
                />
                {formErrors.name && <em className="error-msg">{formErrors.name}</em>}
              </label>

              <label>
                Email
                <input
                  name="email"
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  aria-invalid={!!formErrors.email}
                />
                {formErrors.email && <em className="error-msg">{formErrors.email}</em>}
              </label>

              <label>
                Mensagem
                <textarea
                  name="message"
                  rows={5}
                  placeholder="Descreva a sua proposta, questão ou projecto..."
                  aria-invalid={!!formErrors.message}
                />
                {formErrors.message && <em className="error-msg">{formErrors.message}</em>}
              </label>

              <button className="btn solid form-submit-btn" type="submit">
                <Mail size={16} /> Enviar Mensagem por Email
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <div className="footer-left">
          <span>
            &copy; {new Date().getFullYear()} <strong>{profile.name}</strong>. Software Engineer.
          </span>
          <span className="footer-sub">Luanda, Angola &bull; 42 Luanda</span>
        </div>
        <div className="footer-links">
          <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          &bull;
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          &bull;
          <a href={profile.leetcode} target="_blank" rel="noopener noreferrer">
            LeetCode
          </a>
          &bull;
          <a href={profile.codeforces} target="_blank" rel="noopener noreferrer">
            Codeforces
          </a>
        </div>
      </footer>

      {/* Scroll to Top */}
      {showScrollTop && (
        <button
          className="icon totop"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Voltar ao topo da página"
        >
          <ArrowUp size={18} />
        </button>
      )}

      {/* Modal: Project Details */}
      {selectedProject && (
        <DetailModal
          isOpen={true}
          onClose={() => setSelectedProject(null)}
          title={selectedProject.name}
          badge={selectedProject.category}
          subtitle={`Estado: ${selectedProject.status}`}
        >
          <div className="modal-section">
            <h4>Visão Geral</h4>
            <p>{selectedProject.summary}</p>
          </div>

          <div className="modal-section">
            <h4>Problema a Resolver</h4>
            <p>{selectedProject.problem}</p>
          </div>

          <div className="modal-section">
            <h4>Arquitectura & Decisões Técnicas</h4>
            <p>{selectedProject.architecture}</p>
          </div>

          <div className="modal-section">
            <h4>Funcionalidades Implementadas</h4>
            <ul className="modal-bullets">
              {selectedProject.features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>

          <div className="modal-section">
            <h4>Tecnologias Utilizadas</h4>
            <div className="tags">
              {selectedProject.tech.map((t) => (
                <span key={t} className="tag-i featured">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="modal-section">
            <h4>Aprendizagens & Desafios Técnicos</h4>
            <p>{selectedProject.learnings}</p>
          </div>

          <div className="modal-actions">
            {selectedProject.github && (
              <a
                className="btn solid"
                href={selectedProject.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                Repositório GitHub <ExternalLink size={14} />
              </a>
            )}
            {selectedProject.demo && (
              <a
                className="btn"
                href={selectedProject.demo}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver Demonstração <ExternalLink size={14} />
              </a>
            )}
            <button className="btn" onClick={() => setSelectedProject(null)}>
              Fechar
            </button>
          </div>
        </DetailModal>
      )}

      {/* Modal: Experience Details */}
      {selectedExperience && (
        <DetailModal
          isOpen={true}
          onClose={() => setSelectedExperience(null)}
          title={selectedExperience.role}
          badge={selectedExperience.period}
          subtitle={`${selectedExperience.company} — ${selectedExperience.location}`}
        >
          <div className="modal-section">
            <h4>Resumo da Actuação</h4>
            <p>{selectedExperience.summary}</p>
          </div>

          <div className="modal-section">
            <h4>Responsabilidades & Realizações Técnicas</h4>
            <ul className="modal-bullets">
              {selectedExperience.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>

          <div className="modal-section">
            <h4>Competências & Tecnologias Aplicadas</h4>
            <div className="tags">
              {selectedExperience.skills.map((s) => (
                <span key={s} className="tag-i featured">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn solid" onClick={() => setSelectedExperience(null)}>
              Fechar
            </button>
          </div>
        </DetailModal>
      )}

      {/* Modal: Certification Details */}
      {selectedCert && (
        <DetailModal
          isOpen={true}
          onClose={() => setSelectedCert(null)}
          title={selectedCert.name}
          badge={selectedCert.category}
          subtitle={`${selectedCert.issuer} — ${selectedCert.date}`}
        >
          <div className="modal-section">
            <h4>Competências Atestadas</h4>
            <div className="tags">
              {selectedCert.skills.map((s) => (
                <span key={s} className="tag-i featured">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="modal-section">
            <p className="muted">
              Certificação técnica e formação contínua alinhada com as exigências de desenvolvimento de software e comunicação global.
            </p>
          </div>

          <div className="modal-actions">
            <button className="btn solid" onClick={() => setSelectedCert(null)}>
              Fechar
            </button>
          </div>
        </DetailModal>
      )}
    </>
  );
}
