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
  GraduationCap,
  Award,
  CheckCircle2,
  FileText
} from "lucide-react";
import {
  profile,
  stackCategories,
  projects,
  experiences,
  educationList,
  certificatesList,
  Project,
  Experience,
  CertificateItem
} from "./data";
import { LeetCodeIcon, CodeforcesIcon } from "./components/Icons";
import { DetailModal } from "./components/DetailModal";
import { ProjectCard } from "./components/ProjectCard";
import { ExperienceCard } from "./components/ExperienceCard";
import { SkillGroupCard } from "./components/SkillGroupCard";

type Theme = "system" | "light" | "dark";

function useTheme() {
  const [t, setT] = useState<Theme>(() => {
    try {
      return (localStorage.getItem("theme") as Theme) || "dark";
    } catch {
      return "dark";
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

const navItems = [
  ["home", "Início"],
  ["about", "Sobre"],
  ["stack", "Stack"],
  ["projects", "Projectos"],
  ["experience", "Experiência"],
  ["education", "Formação"],
  ["contact", "Contacto"]
] as const;

export default function App() {
  const [theme, setTheme] = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  // Modais de detalhe
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);
  const [enlargedPhoto, setEnlargedPhoto] = useState<{ src: string; title: string } | null>(null);

  // Estados de formulário e scroll
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
      { rootMargin: "-35% 0px -45% 0px" }
    );

    navItems.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const nextTheme = () =>
    setTheme(theme === "dark" ? "light" : theme === "light" ? "system" : "dark");
  const ThemeIcon = theme === "system" ? Monitor : theme === "light" ? Sun : Moon;

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
      {/* 1. Header / Navegação Principal */}
      <header className="top">
        <a href="#home" className="logo" aria-label="Paulo Cardoso — Início">
          <span className="mark">&lt;P&gt;</span>
          <span className="logo-name">PAULO CARDOSO</span>
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
          <a
            href={profile.cvFile}
            download={profile.cvDownload}
            className="nav-cv-btn"
            title="Descarregar Currículo em PDF"
          >
            <Download size={14} /> CV
          </a>

          <button
            className="icon-btn"
            onClick={nextTheme}
            aria-label={`Mudar tema (actual: ${theme})`}
            title={`Tema: ${theme}`}
          >
            <ThemeIcon size={16} />
          </button>

          <button
            className="icon-btn burger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* 2. Barra Lateral de Redes / Perfis (Desktop) */}
      <aside className="side" aria-label="Perfis Técnicos">
        <a
          href={profile.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub de Paulo Cardoso"
          title="GitHub (@paulozombelacardoso)"
        >
          <Github size={18} />
        </a>
        <a
          href={profile.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn de Paulo Cardoso"
          title="LinkedIn"
        >
          <Linkedin size={18} />
        </a>
        <a
          href={profile.leetcode}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LeetCode de Paulo Cardoso"
          title="LeetCode (PaulCard123)"
        >
          <LeetCodeIcon size={18} />
        </a>
        <a
          href={profile.codeforces}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Codeforces de Paulo Cardoso"
          title="Codeforces (Sunjinwoo42)"
        >
          <CodeforcesIcon size={18} />
        </a>
        <span className="side-line" />
      </aside>

      <main>
        {/* 3. Hero Section — Apresentação Pessoal */}
        <section id="home" className="hero-section">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="hero-badge">
                <span className="badge-pulse" /> Software Engineer &bull; 42 Luanda
              </div>

              <h1 className="hero-name">{profile.name}</h1>
              <h2 className="hero-title">{profile.title}</h2>

              <p className="hero-lead">"{profile.lead}"</p>

              <p className="hero-bio">{profile.shortBio}</p>

              <div className="hero-actions">
                <a className="btn solid" href="#projects">
                  Ver projectos
                </a>
                <a
                  className="btn outline"
                  href={profile.cvFile}
                  download={profile.cvDownload}
                >
                  <Download size={15} /> Descarregar CV
                </a>
              </div>

              <div className="hero-social-list" aria-label="Redes e contactos">
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-social-item"
                  title="GitHub"
                >
                  <Github size={16} /> <span>GitHub</span>
                </a>
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-social-item"
                  title="LinkedIn"
                >
                  <Linkedin size={16} /> <span>LinkedIn</span>
                </a>
                <a
                  href={profile.leetcode}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-social-item"
                  title="LeetCode"
                >
                  <LeetCodeIcon size={16} /> <span>LeetCode</span>
                </a>
                <a
                  href={profile.codeforces}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-social-item"
                  title="Codeforces"
                >
                  <CodeforcesIcon size={16} /> <span>Codeforces</span>
                </a>
                <a
                  href={`mailto:${profile.email}`}
                  className="hero-social-item"
                  title="Enviar Email"
                >
                  <Mail size={16} /> <span>Email</span>
                </a>
              </div>
            </div>

            <div className="hero-image-wrap">
              <div className="photo-container">
                {!photoError ? (
                  <img
                    src={profile.photo}
                    alt={`Fotografia de ${profile.name}`}
                    className="hero-photo"
                    onError={() => setPhotoError(true)}
                  />
                ) : (
                  <div className="photo-fallback">
                    <span>PC</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 4. Sobre Mim */}
        <section id="about" className="section">
          <div className="section-head">
            <span className="section-kicker">Trajectória</span>
            <h2 className="section-title">Sobre mim</h2>
          </div>

          <div className="about-wrap">
            <p className="about-text-lead">
              A minha formação conjuga a disciplina e organização da Informática de Gestão no IMEL com a exigência técnica, autonomia e resolução contínua de problemas da <strong>42 Luanda</strong>.
            </p>
            <p className="about-text">
              Foco-me no desenvolvimento backend estruturado com <strong>NestJS, TypeScript e PostgreSQL</strong>, infraestrutura e conteinerização com <strong>Docker</strong>, e sistemas Unix/Linux de baixo nível em <strong>C e C++</strong>. Integro também modelos de <strong>Inteligência Artificial</strong> (APIs Gemini e Anthropic) para enriquecer aplicações reais com pesquisa semântica e processamento de linguagem natural.
            </p>

            <div className="about-meta-row">
              <div className="meta-card">
                <span className="meta-number">01</span>
                <h4>Backend & APIs</h4>
                <p>Arquitecturas modulares, autenticação JWT/OAuth2 e Clean Architecture.</p>
              </div>
              <div className="meta-card">
                <span className="meta-number">02</span>
                <h4>DevOps & Linux</h4>
                <p>Ambientes Docker multi-serviços, redes POSIX e administração de servidores.</p>
              </div>
              <div className="meta-card">
                <span className="meta-number">03</span>
                <h4>Inteligência Artificial</h4>
                <p>Pesquisa semântica, engenharia de prompts e participação premiada em hackathons.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Stack Tecnológica */}
        <section id="stack" className="section">
          <div className="section-head">
            <span className="section-kicker">Competências</span>
            <h2 className="section-title">Stack tecnológica</h2>
            <p className="section-desc">
              Tecnologias e ferramentas que utilizo no desenvolvimento diário de software, infraestruturas e APIs.
            </p>
          </div>

          <div className="stack-grid">
            {stackCategories.map((cat) => (
              <SkillGroupCard key={cat.name} category={cat} />
            ))}
          </div>
        </section>

        {/* 6. Projectos Técnicos */}
        <section id="projects" className="section">
          <div className="section-head">
            <span className="section-kicker">Trabalho Real</span>
            <h2 className="section-title">Projectos em destaque</h2>
            <p className="section-desc">
              Seleção de sistemas, infraestruturas e aplicações full-stack com decisões de engenharia documentadas. Clique num projecto para ver detalhes, demonstrações em vídeo e arquitectura.
            </p>
          </div>

          <div className="projects-grid">
            {projects.map((proj) => (
              <ProjectCard key={proj.id} project={proj} onSelect={setSelectedProject} />
            ))}
          </div>
        </section>

        {/* 7. Experiência Profissional */}
        <section id="experience" className="section">
          <div className="section-head">
            <span className="section-kicker">Carreira & Inovação</span>
            <h2 className="section-title">Experiência profissional</h2>
            <p className="section-desc">
              Desenvolvimento backend no sector privado e liderança técnica em equipas vencedoras de hackathons de inteligência artificial.
            </p>
          </div>

          <div className="experience-list">
            {experiences.map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} onSelect={setSelectedExperience} />
            ))}
          </div>
        </section>

        {/* 8. Formação & Certificações */}
        <section id="education" className="section">
          <div className="section-head">
            <span className="section-kicker">Educação Contínua</span>
            <h2 className="section-title">Formação e certificados</h2>
          </div>

          <div className="edu-grid">
            {educationList.map((edu) => (
              <div key={edu.school} className="edu-card">
                <div className="edu-card-top">
                  <div className="edu-icon-wrap">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <span className="edu-period">{edu.period}</span>
                    <h3 className="edu-degree">{edu.degree}</h3>
                    <h4 className="edu-school">{edu.school}</h4>
                  </div>
                </div>
                <p className="edu-desc">{edu.description}</p>
                <ul className="edu-bullets">
                  {edu.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="certs-section">
            <h3 className="certs-heading">
              <Award size={18} /> Certificações e Documentos Confirmados
            </h3>
            <div className="certs-grid">
              {certificatesList.map((c) => {
                const thumb = c.thumbnail || (c.isImage ? c.file : undefined);
                return (
                  <div
                    key={c.id}
                    className="cert-card"
                    tabIndex={0}
                    role="button"
                    onClick={() => setSelectedCert(c)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedCert(c);
                      }
                    }}
                  >
                    <div className="cert-card-main">
                      <div className="cert-card-header">
                        <span className="cert-verified">
                          <CheckCircle2 size={13} /> Confirmado
                        </span>
                        <span className="cert-date">{c.date}</span>
                      </div>
                      <h4 className="cert-title">{c.title}</h4>
                      <p className="cert-issuer">{c.issuer}</p>
                      <div className="cert-card-action">
                        <span>Ver documento</span>
                        <Eye size={13} />
                      </div>
                    </div>
                    {thumb && (
                      <div className="cert-thumb-wrap">
                        <img
                          src={thumb}
                          alt={`Miniatura de ${c.title}`}
                          className="cert-thumb-img"
                          loading="lazy"
                        />
                        <div className="cert-thumb-overlay" aria-hidden="true">
                          <Eye size={14} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 9. Contacto */}
        <section id="contact" className="section">
          <div className="section-head">
            <span className="section-kicker">Comunicação</span>
            <h2 className="section-title">Contacto</h2>
            <p className="section-desc">
              Tem um projecto em mente ou procura um Software Engineer para a sua equipa? Estou disponível para colaborar.
            </p>
          </div>

          <div className="contact-grid">
            <div className="contact-info-col">
              <h3>Canais Directos</h3>
              <p className="contact-sub">
                Respondo rapidamente através de qualquer uma das vias abaixo:
              </p>

              <div className="contact-links-box">
                <a href={`mailto:${profile.email}`} className="contact-link-row">
                  <div className="cl-icon">
                    <Mail size={16} />
                  </div>
                  <div>
                    <span className="cl-label">Email Principal</span>
                    <span className="cl-val">{profile.email}</span>
                  </div>
                </a>

                <a href={`tel:${profile.phone.replace(/\s+/g, "")}`} className="contact-link-row">
                  <div className="cl-icon">
                    <Phone size={16} />
                  </div>
                  <div>
                    <span className="cl-label">Telefone / WhatsApp</span>
                    <span className="cl-val">{profile.phone}</span>
                  </div>
                </a>

                <div className="contact-link-row static">
                  <div className="cl-icon">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <span className="cl-label">Localização</span>
                    <span className="cl-val">{profile.location}</span>
                  </div>
                </div>
              </div>

              <h4 className="profiles-title">Perfis em Plataformas Técnicas</h4>
              <div className="profiles-mini-grid">
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-pill"
                >
                  <Github size={15} /> <span>GitHub</span>
                  <ExternalLink size={11} className="pill-ext" />
                </a>
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-pill"
                >
                  <Linkedin size={15} /> <span>LinkedIn</span>
                  <ExternalLink size={11} className="pill-ext" />
                </a>
                <a
                  href={profile.leetcode}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-pill"
                >
                  <LeetCodeIcon size={15} /> <span>LeetCode</span>
                  <ExternalLink size={11} className="pill-ext" />
                </a>
                <a
                  href={profile.codeforces}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-pill"
                >
                  <CodeforcesIcon size={15} /> <span>Codeforces</span>
                  <ExternalLink size={11} className="pill-ext" />
                </a>
              </div>
            </div>

            <form onSubmit={handleContactSubmit} noValidate className="contact-form-box">
              <h3>Envie uma Mensagem</h3>
              <p className="form-sub">Abre o seu cliente de email com a mensagem pronta a enviar.</p>

              <label className="form-field">
                <span>Nome</span>
                <input
                  name="name"
                  type="text"
                  placeholder="O seu nome ou empresa"
                  aria-invalid={!!formErrors.name}
                />
                {formErrors.name && <em className="field-error">{formErrors.name}</em>}
              </label>

              <label className="form-field">
                <span>Email</span>
                <input
                  name="email"
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  aria-invalid={!!formErrors.email}
                />
                {formErrors.email && <em className="field-error">{formErrors.email}</em>}
              </label>

              <label className="form-field">
                <span>Mensagem</span>
                <textarea
                  name="message"
                  rows={4}
                  placeholder="Descreva a sua proposta, projecto ou questão..."
                  aria-invalid={!!formErrors.message}
                />
                {formErrors.message && <em className="field-error">{formErrors.message}</em>}
              </label>

              <button className="btn solid form-submit" type="submit">
                <Mail size={15} /> Enviar Mensagem por Email
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* 10. Footer */}
      <footer className="footer">
        <div className="footer-wrap">
          <div className="footer-left">
            <span>&copy; {new Date().getFullYear()} <strong>{profile.name}</strong>. Software Engineer.</span>
            <span className="footer-sub">{profile.location} &bull; 42 Luanda</span>
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
            &bull;
            <a href={profile.cvFile} download={profile.cvDownload}>
              CV (PDF)
            </a>
          </div>
        </div>
      </footer>

      {/* Scroll to Top */}
      {showScrollTop && (
        <button
          className="totop-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Voltar ao topo"
          title="Voltar ao topo"
        >
          <ArrowUp size={16} />
        </button>
      )}

      {/* MODAL 1: Detalhes do Projecto */}
      {selectedProject && (
        <DetailModal
          isOpen={true}
          onClose={() => setSelectedProject(null)}
          title={selectedProject.name}
          badge={selectedProject.category}
          subtitle={selectedProject.subtitle}
        >
          {/* Demonstração em Vídeo (se existir) */}
          {selectedProject.videoUrl && (
            <div className="modal-media-block">
              <h4 className="media-heading">Demonstração em Vídeo</h4>
              <video
                src={selectedProject.videoUrl}
                controls
                playsInline
                preload="metadata"
                className="modal-video-player"
                poster={selectedProject.coverImage}
              >
                O seu navegador não suporta a reprodução deste vídeo.
              </video>
            </div>
          )}

          {/* Imagem de Capa ou Galeria (se existir e não tiver vídeo duplicado) */}
          {selectedProject.coverImage && !selectedProject.videoUrl && (
            <div className="modal-media-block">
              <img
                src={selectedProject.coverImage}
                alt={`Imagem do projecto ${selectedProject.name}`}
                className="modal-cover-img"
              />
            </div>
          )}

          {/* Galeria de Fotos Adicionais (ex: IMEL Defesa) */}
          {selectedProject.galleryImages && selectedProject.galleryImages.length > 1 && (
            <div className="modal-gallery-row">
              {selectedProject.galleryImages.map((imgSrc, idx) => (
                <img
                  key={idx}
                  src={imgSrc}
                  alt={`Fotografia ${idx + 1} de ${selectedProject.name}`}
                  className="modal-gallery-thumb"
                />
              ))}
            </div>
          )}

          <div className="modal-sec">
            <h4>Visão Geral</h4>
            <p>{selectedProject.summary}</p>
          </div>

          <div className="modal-sec">
            <h4>Problema & Objectivo</h4>
            <p>{selectedProject.problem}</p>
          </div>

          <div className="modal-sec">
            <h4>Arquitectura & Decisões Técnicas</h4>
            <p>{selectedProject.architecture}</p>
          </div>

          <div className="modal-sec">
            <h4>Funcionalidades Implementadas</h4>
            <ul className="modal-bullet-list">
              {selectedProject.features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>

          <div className="modal-sec">
            <h4>Tecnologias Utilizadas</h4>
            <div className="modal-tag-cloud">
              {selectedProject.tech.map((t) => (
                <span key={t} className="tech-pill active">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="modal-sec">
            <h4>Principais Aprendizagens</h4>
            <p>{selectedProject.learnings}</p>
          </div>

          <div className="modal-actions-footer">
            {selectedProject.github && (
              <a
                className="btn solid"
                href={selectedProject.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver Repositório no GitHub <ExternalLink size={14} />
              </a>
            )}
            <button className="btn outline" onClick={() => setSelectedProject(null)}>
              Fechar
            </button>
          </div>
        </DetailModal>
      )}

      {/* MODAL 2: Detalhes da Experiência */}
      {selectedExperience && (
        <DetailModal
          isOpen={true}
          onClose={() => setSelectedExperience(null)}
          title={selectedExperience.role}
          badge={selectedExperience.period}
          subtitle={`${selectedExperience.company} — ${selectedExperience.location}`}
        >
          {/* Galeria de Fotos da Equipa / Hackathon (se existir) */}
          {selectedExperience.photos && selectedExperience.photos.length > 0 && (
            <div className="modal-media-block">
              <div className="modal-media-header">
                <h4 className="media-heading">
                  Registo Fotográfico ({selectedExperience.photos.length} fotos)
                </h4>
                <span className="media-subhint">Clique numa foto para ampliar</span>
              </div>
              <div className="modal-photo-gallery">
                {selectedExperience.photos.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    className="gallery-photo-btn"
                    onClick={() =>
                      setEnlargedPhoto({
                        src: p,
                        title: `${selectedExperience.company} — Fotografia ${i + 1}`
                      })
                    }
                    title="Clique para ampliar esta foto"
                  >
                    <img
                      src={p}
                      alt={`Foto ${i + 1} de ${selectedExperience.company}`}
                      className="gallery-photo"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Certificado Associado à Experiência */}
          {selectedExperience.certificateFile && (
            <div className="modal-media-block">
              <div className="modal-media-header">
                <h4 className="media-heading">Certificado Oficial da Conquista</h4>
                <span className="media-subhint">Clique para ampliar</span>
              </div>
              <div
                className="cert-preview-box cert-clickable"
                onClick={() =>
                  setEnlargedPhoto({
                    src: selectedExperience.certificateFile!,
                    title: selectedExperience.certificateLabel || "Certificado Oficial"
                  })
                }
                title="Clique para ampliar o certificado"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setEnlargedPhoto({
                      src: selectedExperience.certificateFile!,
                      title: selectedExperience.certificateLabel || "Certificado Oficial"
                    });
                  }
                }}
              >
                <img
                  src={selectedExperience.certificateFile}
                  alt={selectedExperience.certificateLabel || "Certificado"}
                  className="cert-preview-img"
                />
              </div>
            </div>
          )}

          <div className="modal-sec">
            <h4>Resumo da Actuação</h4>
            <p>{selectedExperience.summary}</p>
          </div>

          <div className="modal-sec">
            <h4>Responsabilidades & Realizações Técnicas</h4>
            <ul className="modal-bullet-list">
              {selectedExperience.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>

          <div className="modal-sec">
            <h4>Competências Aplicadas</h4>
            <div className="modal-tag-cloud">
              {selectedExperience.tech.map((t) => (
                <span key={t} className="tech-pill active">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="modal-actions-footer">
            <button className="btn solid" onClick={() => setSelectedExperience(null)}>
              Fechar
            </button>
          </div>
        </DetailModal>
      )}

      {/* MODAL 3: Visualização de Certificado */}
      {selectedCert && (
        <DetailModal
          isOpen={true}
          onClose={() => setSelectedCert(null)}
          title={selectedCert.title}
          badge={selectedCert.date}
          subtitle={selectedCert.issuer}
        >
          <div className="cert-modal-body">
            {selectedCert.isImage ? (
              <div className="cert-img-container">
                <img
                  src={selectedCert.file}
                  alt={selectedCert.title}
                  className="cert-full-img"
                />
              </div>
            ) : (
              <div className="cert-pdf-container">
                <iframe
                  src={selectedCert.file}
                  title={selectedCert.title}
                  className="cert-pdf-iframe"
                />
              </div>
            )}
          </div>

          <div className="modal-actions-footer">
            <a
              className="btn solid"
              href={selectedCert.file}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={14} /> Abrir documento original
            </a>
            <a
              className="btn outline"
              href={selectedCert.file}
              download
            >
              <Download size={14} /> Descarregar
            </a>
            <button className="btn outline" onClick={() => setSelectedCert(null)}>
              Fechar
            </button>
          </div>
        </DetailModal>
      )}

      {/* MODAL 4: Visualização Ampliada de Fotografia / Registo */}
      {enlargedPhoto && (
        <DetailModal
          isOpen={true}
          onClose={() => setEnlargedPhoto(null)}
          title={enlargedPhoto.title}
          badge="Galeria"
        >
          <div className="cert-img-container">
            <img
              src={enlargedPhoto.src}
              alt={enlargedPhoto.title}
              className="cert-full-img"
            />
          </div>
          <div className="modal-actions-footer">
            <a
              className="btn solid"
              href={enlargedPhoto.src}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={14} /> Abrir imagem original
            </a>
            <button className="btn outline" onClick={() => setEnlargedPhoto(null)}>
              Fechar
            </button>
          </div>
        </DetailModal>
      )}
    </>
  );
}
