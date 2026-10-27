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
  FileText,
  Globe,
  ChevronDown
} from "lucide-react";
import {
  profile,
  stackCategories,
  projects,
  experiences,
  educationList,
  certificatesList,
  getProfile,
  getStackCategories,
  getProjects,
  getExperiences,
  getEducationList,
  getCertificatesList,
  Project,
  Experience,
  CertificateItem
} from "./data";
import { Lang, translations } from "./i18n";
import { LeetCodeIcon, CodeforcesIcon } from "./components/Icons";
import { DetailModal } from "./components/DetailModal";
import { ProjectCard } from "./components/ProjectCard";
import { ExperienceCard } from "./components/ExperienceCard";
import { SkillGroupCard } from "./components/SkillGroupCard";
import { AboutCardsCarousel } from "./components/AboutCardsCarousel";
import { AnimatedLead } from "./components/AnimatedLead";
import { useScrollReveal } from "./hooks/useScrollReveal";
import { getTechIconUrl, getTechSlug } from "./techIcons";

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

function useLanguage() {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      const stored = localStorage.getItem("lang") as Lang;
      if (stored === "pt" || stored === "en") return stored;
    } catch {
      /* ignore */
    }
    return "pt";
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem("lang", lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  return [lang, setLang] as const;
}

export default function App() {
  const [theme, setTheme] = useTheme();
  const [lang, setLang] = useLanguage();
  const t = translations[lang];

  const currentProfile = getProfile(lang);
  const currentStack = getStackCategories(lang);
  const currentProjects = getProjects(lang);
  const currentExperiences = getExperiences(lang);
  const currentEducation = getEducationList(lang);
  const currentCerts = getCertificatesList(lang);

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  // Modais de detalhe
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);
  const [enlargedPhoto, setEnlargedPhoto] = useState<{ src: string; title: string } | null>(null);

  // Instâncias ativas sincronizadas com o idioma selecionado
  const activeProject = selectedProject
    ? currentProjects.find((p) => p.id === selectedProject.id) || selectedProject
    : null;
  const activeExperience = selectedExperience
    ? currentExperiences.find((e) => e.id === selectedExperience.id) || selectedExperience
    : null;
  const activeCert = selectedCert
    ? currentCerts.find((c) => c.id === selectedCert.id) || selectedCert
    : null;

  // Estados de formulário e scroll
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [photoError, setPhotoError] = useState(false);

  // Ativação da animação suave de subida ao fazer scroll
  useScrollReveal([lang, currentStack, currentProjects, currentExperiences, currentEducation, currentCerts]);

  const navItems = [
    ["home", t.nav.home],
    ["about", t.nav.about],
    ["stack", t.nav.stack],
    ["projects", t.nav.projects],
    ["experience", t.nav.experience],
    ["education", t.nav.education],
    ["contact", t.nav.contact]
  ] as const;

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
  }, [lang]);

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
    if (name.length < 2) errors.name = t.contact.nameError;
    if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = t.contact.emailError;
    if (message.length < 10) errors.message = t.contact.messageError;

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    window.location.href = `mailto:${currentProfile.email}?subject=${encodeURIComponent(
      t.contact.emailSubject(name)
    )}&body=${encodeURIComponent(`${message}\n\n${t.contact.emailBodyFrom(name, email)}`)}`;
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
          {/* Seletor de Idioma (PT / EN) */}
          <div
            className="lang-select-wrapper"
            title={lang === "pt" ? "Alternar idioma / Switch language" : "Switch language / Alternar idioma"}
          >
            <Globe size={14} className="lang-select-icon" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
              className="lang-select-btn"
              aria-label={lang === "pt" ? "Selecionar idioma" : "Select language"}
            >
              <option value="pt">PT</option>
              <option value="en">EN</option>
            </select>
            <ChevronDown size={11} className="lang-select-arrow" />
          </div>

          <a
            href={currentProfile.cvFile}
            download={currentProfile.cvDownload}
            className="nav-cv-btn"
            title={lang === "pt" ? "Descarregar Currículo em PDF" : "Download Resume in PDF"}
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
              <h1 className="hero-name">{currentProfile.name}</h1>
              <h2 className="hero-title">{currentProfile.title}</h2>

              <AnimatedLead
                phrases={
                  currentProfile.rotatingLeads && currentProfile.rotatingLeads.length > 0
                    ? currentProfile.rotatingLeads
                    : [currentProfile.lead]
                }
              />

              <p className="hero-bio">{currentProfile.shortBio}</p>

              <div className="hero-actions">
                <a className="btn solid" href="#projects">
                  {t.hero.viewProjects}
                </a>
                <a
                  className="btn outline"
                  href={currentProfile.cvFile}
                  download={currentProfile.cvDownload}
                >
                  <Download size={15} /> {t.hero.downloadCv}
                </a>
              </div>

              <div className="hero-social-list" aria-label="Redes e contactos">
                <a
                  href={currentProfile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-social-item"
                  title="GitHub"
                >
                  <Github size={16} /> <span>GitHub</span>
                </a>
                <a
                  href={currentProfile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-social-item"
                  title="LinkedIn"
                >
                  <Linkedin size={16} /> <span>LinkedIn</span>
                </a>
                <a
                  href={currentProfile.leetcode}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-social-item"
                  title="LeetCode"
                >
                  <LeetCodeIcon size={16} /> <span>LeetCode</span>
                </a>
                <a
                  href={currentProfile.codeforces}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-social-item"
                  title="Codeforces"
                >
                  <CodeforcesIcon size={16} /> <span>Codeforces</span>
                </a>
                <a
                  href={`mailto:${currentProfile.email}`}
                  className="hero-social-item"
                  title="Email"
                >
                  <Mail size={16} /> <span>Email</span>
                </a>
              </div>
            </div>

            <div className="hero-image-wrap">
              <div className="photo-container">
                {!photoError ? (
                  <img
                    src={currentProfile.photo}
                    alt={`Fotografia de ${currentProfile.name}`}
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
            <span className="section-kicker">{t.about.kicker}</span>
            <h2 className="section-title">{t.about.title}</h2>
          </div>

          <div className="about-wrap">
            <p className="about-text-lead">{t.about.lead}</p>
            <p className="about-text">{t.about.text}</p>

            <AboutCardsCarousel
              cards={[
                {
                  num: "01",
                  title: t.about.meta1Title,
                  desc: t.about.meta1Desc
                },
                {
                  num: "02",
                  title: t.about.meta2Title,
                  desc: t.about.meta2Desc
                },
                {
                  num: "03",
                  title: t.about.meta3Title,
                  desc: t.about.meta3Desc
                }
              ]}
            />
          </div>
        </section>

        {/* 5. Stack Tecnológica */}
        <section id="stack" className="section">
          <div className="section-head reveal-card">
            <span className="section-kicker">{t.stack.kicker}</span>
            <h2 className="section-title">{t.stack.title}</h2>
            <p className="section-desc">{t.stack.desc}</p>
          </div>

          <div className="stack-grid">
            {currentStack.map((cat, idx) => (
              <SkillGroupCard
                key={cat.name}
                category={cat}
                className="reveal-card"
                style={{ "--reveal-delay": `${(idx % 3) * 90}ms` } as React.CSSProperties}
              />
            ))}
          </div>
        </section>

        {/* 6. Projectos Técnicos */}
        <section id="projects" className="section">
          <div className="section-head reveal-card">
            <span className="section-kicker">{t.projects.kicker}</span>
            <h2 className="section-title">{t.projects.title}</h2>
            <p className="section-desc">{t.projects.desc}</p>
          </div>

          <div className="projects-grid">
            {currentProjects.map((proj, idx) => (
              <ProjectCard
                key={proj.id}
                project={proj}
                onSelect={setSelectedProject}
                exploreLabel={t.projects.viewDetails}
                codeLabel={t.projects.code}
                className="reveal-card"
                style={{ "--reveal-delay": `${(idx % 2) * 110}ms` } as React.CSSProperties}
              />
            ))}
          </div>
        </section>

        {/* 7. Experiência Profissional */}
        <section id="experience" className="section">
          <div className="section-head reveal-card">
            <span className="section-kicker">{t.experience.kicker}</span>
            <h2 className="section-title">{t.experience.title}</h2>
            <p className="section-desc">{t.experience.desc}</p>
          </div>

          <div className="experience-list">
            {currentExperiences.map((exp, idx) => (
              <ExperienceCard
                key={exp.id}
                experience={exp}
                onSelect={setSelectedExperience}
                lang={lang}
                className="reveal-card"
                style={{ "--reveal-delay": `${(idx % 2) * 100}ms` } as React.CSSProperties}
              />
            ))}
          </div>
        </section>

        {/* 8. Formação & Certificações */}
        <section id="education" className="section">
          <div className="section-head reveal-card">
            <span className="section-kicker">{t.education.kicker}</span>
            <h2 className="section-title">{t.education.title}</h2>
          </div>

          <div className="edu-grid">
            {currentEducation.map((edu, idx) => (
              <div
                key={edu.school}
                className="edu-card reveal-card"
                tabIndex={0}
                style={{ "--reveal-delay": `${(idx % 3) * 90}ms` } as React.CSSProperties}
              >
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
            <h3 className="certs-heading reveal-card">
              <Award size={18} /> {t.education.certsHeading}
            </h3>
            <div className="certs-grid">
              {currentCerts.map((c, idx) => {
                const thumb = c.thumbnail || (c.isImage ? c.file : undefined);
                return (
                  <div
                    key={c.id}
                    className="cert-card reveal-card"
                    style={{ "--reveal-delay": `${(idx % 4) * 80}ms` } as React.CSSProperties}
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
                          <CheckCircle2 size={13} /> {t.education.confirmed}
                        </span>
                        <span className="cert-date">{c.date}</span>
                      </div>
                      <h4 className="cert-title">{c.title}</h4>
                      <p className="cert-issuer">{c.issuer}</p>
                      <div className="cert-card-action">
                        <span>{t.education.viewDoc}</span>
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
            <span className="section-kicker">{t.contact.kicker}</span>
            <h2 className="section-title">{t.contact.title}</h2>
            <p className="section-desc">{t.contact.desc}</p>
          </div>

          <div className="contact-grid">
            <div className="contact-info-col">
              <h3>{t.contact.directTitle}</h3>
              <p className="contact-sub">{t.contact.directSub}</p>

              <div className="contact-links-box">
                <a href={`mailto:${currentProfile.email}`} className="contact-link-row">
                  <div className="cl-icon">
                    <Mail size={16} />
                  </div>
                  <div>
                    <span className="cl-label">{t.contact.emailLabel}</span>
                    <span className="cl-val">{currentProfile.email}</span>
                  </div>
                </a>

                <a href={`tel:${currentProfile.phone.replace(/\s+/g, "")}`} className="contact-link-row">
                  <div className="cl-icon">
                    <Phone size={16} />
                  </div>
                  <div>
                    <span className="cl-label">{t.contact.phoneLabel}</span>
                    <span className="cl-val">{currentProfile.phone}</span>
                  </div>
                </a>

                <div className="contact-link-row static">
                  <div className="cl-icon">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <span className="cl-label">{t.contact.locationLabel}</span>
                    <span className="cl-val">{currentProfile.location}</span>
                  </div>
                </div>
              </div>

              <h4 className="profiles-title">{t.contact.profilesTitle}</h4>
              <div className="profiles-mini-grid">
                <a
                  href={currentProfile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-pill"
                >
                  <Github size={15} /> <span>GitHub</span>
                  <ExternalLink size={11} className="pill-ext" />
                </a>
                <a
                  href={currentProfile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-pill"
                >
                  <Linkedin size={15} /> <span>LinkedIn</span>
                  <ExternalLink size={11} className="pill-ext" />
                </a>
                <a
                  href={currentProfile.leetcode}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-pill"
                >
                  <LeetCodeIcon size={15} /> <span>LeetCode</span>
                  <ExternalLink size={11} className="pill-ext" />
                </a>
                <a
                  href={currentProfile.codeforces}
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
              <h3>{t.contact.formTitle}</h3>
              <p className="form-sub">{t.contact.formSub}</p>

              <label className="form-field">
                <span>{t.contact.nameLabel}</span>
                <input
                  name="name"
                  type="text"
                  placeholder={t.contact.namePlaceholder}
                  aria-invalid={!!formErrors.name}
                />
                {formErrors.name && <em className="field-error">{formErrors.name}</em>}
              </label>

              <label className="form-field">
                <span>Email</span>
                <input
                  name="email"
                  type="email"
                  placeholder={t.contact.emailPlaceholder}
                  aria-invalid={!!formErrors.email}
                />
                {formErrors.email && <em className="field-error">{formErrors.email}</em>}
              </label>

              <label className="form-field">
                <span>{t.contact.messageLabel}</span>
                <textarea
                  name="message"
                  rows={4}
                  placeholder={t.contact.messagePlaceholder}
                  aria-invalid={!!formErrors.message}
                />
                {formErrors.message && <em className="field-error">{formErrors.message}</em>}
              </label>

              <button className="btn solid form-submit" type="submit">
                <Mail size={15} /> {t.contact.submitBtn}
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* 10. Footer */}
      <footer className="footer">
        <div className="footer-wrap">
          <div className="footer-left">
            <span>&copy; {new Date().getFullYear()} <strong>{currentProfile.name}</strong>. Software Engineer.</span>
            <span className="footer-sub">{currentProfile.location} &bull; 42 Luanda &bull; {t.footer.rights}</span>
          </div>

          <div className="footer-links">
            <a href={currentProfile.githubUrl} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            &bull;
            <a href={currentProfile.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
            &bull;
            <a href={currentProfile.leetcode} target="_blank" rel="noopener noreferrer">
              LeetCode
            </a>
            &bull;
            <a href={currentProfile.codeforces} target="_blank" rel="noopener noreferrer">
              Codeforces
            </a>
            &bull;
            <a href={currentProfile.cvFile} download={currentProfile.cvDownload}>
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
          aria-label={t.footer.backToTop}
          title={t.footer.backToTop}
        >
          <ArrowUp size={16} />
        </button>
      )}

      {/* MODAL 1: Detalhes do Projecto */}
      {activeProject && (
        <DetailModal
          isOpen={true}
          onClose={() => setSelectedProject(null)}
          title={activeProject.name}
          badge={activeProject.category}
          subtitle={activeProject.subtitle}
        >
          {/* Demonstração em Vídeo (se existir) */}
          {activeProject.videoUrl && (
            <div className="modal-media-block">
              <h4 className="media-heading">{t.projects.videoDemo}</h4>
              <video
                src={activeProject.videoUrl}
                controls
                playsInline
                preload="metadata"
                className="modal-video-player"
                poster={activeProject.coverImage}
              >
                O seu navegador não suporta a reprodução deste vídeo.
              </video>
            </div>
          )}

          {/* Imagem de Capa ou Galeria (se existir e não tiver vídeo duplicado) */}
          {activeProject.coverImage && !activeProject.videoUrl && (
            <div className="modal-media-block">
              <img
                src={activeProject.coverImage}
                alt={`Imagem do projecto ${activeProject.name}`}
                className="modal-cover-img modal-cover-clickable"
                onClick={() =>
                  setEnlargedPhoto({
                    src: activeProject.coverImage!,
                    title: activeProject.name
                  })
                }
                title={lang === "en" ? "Click to enlarge" : "Clique para ampliar"}
              />
            </div>
          )}

          {/* Galeria de Fotos Adicionais (ex: IMEL Defesa) */}
          {activeProject.galleryImages && activeProject.galleryImages.length > 1 && (
            <div className="modal-gallery-row">
              {activeProject.galleryImages.map((imgSrc, idx) => (
                <img
                  key={idx}
                  src={imgSrc}
                  alt={`Fotografia ${idx + 1} de ${activeProject.name}`}
                  className="modal-gallery-thumb modal-cover-clickable"
                  onClick={() =>
                    setEnlargedPhoto({
                      src: imgSrc,
                      title: `${activeProject.name} — ${lang === "en" ? "Photo" : "Fotografia"} ${idx + 1}`
                    })
                  }
                  title={lang === "en" ? "Click to enlarge" : "Clique para ampliar"}
                />
              ))}
            </div>
          )}

          <div className="modal-sec">
            <h4>{t.projects.overview}</h4>
            <p>{activeProject.summary}</p>
          </div>

          <div className="modal-sec">
            <h4>{t.projects.problem}</h4>
            <p>{activeProject.problem}</p>
          </div>

          <div className="modal-sec">
            <h4>{t.projects.architecture}</h4>
            <p>{activeProject.architecture}</p>
          </div>

          <div className="modal-sec">
            <h4>{t.projects.features}</h4>
            <ul className="modal-bullet-list">
              {activeProject.features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>

          <div className="modal-sec">
            <h4>{t.projects.tech}</h4>
            <div className="modal-tag-cloud">
              {activeProject.tech.map((techItem) => {
                const iconUrl = getTechIconUrl(techItem);
                const slug = getTechSlug(techItem);
                return (
                  <span key={techItem} className="tech-pill active" data-tech={slug}>
                    {iconUrl && (
                      <img
                        src={iconUrl}
                        alt=""
                        aria-hidden="true"
                        className="tech-pill-icon"
                        data-tech={slug}
                        loading="lazy"
                      />
                    )}
                    <span>{techItem}</span>
                  </span>
                );
              })}
            </div>
          </div>

          <div className="modal-sec">
            <h4>{t.projects.learnings}</h4>
            <p>{activeProject.learnings}</p>
          </div>

          <div className="modal-actions-footer">
            {activeProject.github && (
              <a
                className="btn solid"
                href={activeProject.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.projects.viewGithub} <ExternalLink size={14} />
              </a>
            )}
            <button className="btn outline" onClick={() => setSelectedProject(null)}>
              {t.projects.close}
            </button>
          </div>
        </DetailModal>
      )}

      {/* MODAL 2: Detalhes da Experiência */}
      {activeExperience && (
        <DetailModal
          isOpen={true}
          onClose={() => setSelectedExperience(null)}
          title={activeExperience.role}
          badge={activeExperience.period}
          subtitle={`${activeExperience.company} — ${activeExperience.location}`}
        >
          {/* Galeria de Fotos da Equipa / Hackathon (se existir) */}
          {activeExperience.photos && activeExperience.photos.length > 0 && (
            <div className="modal-media-block">
              <div className="modal-media-header">
                <h4 className="media-heading">
                  {t.experience.galleryHeading} ({activeExperience.photos.length}{" "}
                  {activeExperience.photos.length === 1
                    ? t.experience.photoUnitSingle
                    : t.experience.photoUnitPlural})
                </h4>
                <span className="media-subhint">{t.experience.clickToEnlarge}</span>
              </div>
              <div className="modal-photo-gallery">
                {activeExperience.photos.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    className="gallery-photo-btn"
                    onClick={() =>
                      setEnlargedPhoto({
                        src: p,
                        title: `${activeExperience.company} — ${lang === "en" ? "Photo" : "Fotografia"} ${i + 1}`
                      })
                    }
                    title={t.experience.clickToEnlarge}
                  >
                    <img
                      src={p}
                      alt={`Foto ${i + 1} de ${activeExperience.company}`}
                      className="gallery-photo"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Certificado Associado à Experiência */}
          {activeExperience.certificateFile && (
            <div className="modal-media-block">
              <div className="modal-media-header">
                <h4 className="media-heading">{t.experience.certHeading}</h4>
                <span className="media-subhint">{t.experience.clickToEnlarge}</span>
              </div>
              <div
                className="cert-preview-box cert-clickable"
                onClick={() =>
                  setEnlargedPhoto({
                    src: activeExperience.certificateFile!,
                    title:
                      activeExperience.certificateLabel ||
                      (lang === "en" ? "Official Certificate" : "Certificado Oficial")
                  })
                }
                title={t.experience.clickToEnlarge}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setEnlargedPhoto({
                      src: activeExperience.certificateFile!,
                      title:
                        activeExperience.certificateLabel ||
                        (lang === "en" ? "Official Certificate" : "Certificado Oficial")
                    });
                  }
                }}
              >
                <img
                  src={activeExperience.certificateFile}
                  alt={activeExperience.certificateLabel || (lang === "en" ? "Certificate" : "Certificado")}
                  className="cert-preview-img"
                />
              </div>
            </div>
          )}

          <div className="modal-sec">
            <h4>{t.experience.overview}</h4>
            <p>{activeExperience.summary}</p>
          </div>

          <div className="modal-sec">
            <h4>{t.experience.responsibilities}</h4>
            <ul className="modal-bullet-list">
              {activeExperience.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>

          <div className="modal-sec">
            <h4>{t.experience.skills}</h4>
            <div className="modal-tag-cloud">
              {activeExperience.tech.map((tItem) => {
                const iconUrl = getTechIconUrl(tItem);
                const slug = getTechSlug(tItem);
                return (
                  <span key={tItem} className="tech-pill active" data-tech={slug}>
                    {iconUrl && (
                      <img
                        src={iconUrl}
                        alt=""
                        aria-hidden="true"
                        className="tech-pill-icon"
                        data-tech={slug}
                        loading="lazy"
                      />
                    )}
                    <span>{tItem}</span>
                  </span>
                );
              })}
            </div>
          </div>

          <div className="modal-actions-footer">
            <button className="btn solid" onClick={() => setSelectedExperience(null)}>
              {t.experience.close}
            </button>
          </div>
        </DetailModal>
      )}

      {/* MODAL 3: Visualização de Certificado */}
      {activeCert && (
        <DetailModal
          isOpen={true}
          onClose={() => setSelectedCert(null)}
          title={activeCert.title}
          badge={activeCert.date}
          subtitle={activeCert.issuer}
        >
          <div className="cert-modal-body">
            {activeCert.isImage ? (
              <div className="cert-img-container">
                <img
                  src={activeCert.file}
                  alt={activeCert.title}
                  className="cert-full-img"
                />
              </div>
            ) : (
              <div className="cert-pdf-container">
                <iframe
                  src={activeCert.file}
                  title={activeCert.title}
                  className="cert-pdf-iframe"
                />
              </div>
            )}
          </div>

          <div className="modal-actions-footer">
            <a
              className="btn solid"
              href={activeCert.file}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={14} /> {t.education.openOriginal}
            </a>
            <a
              className="btn outline"
              href={activeCert.file}
              download
            >
              <Download size={14} /> {t.education.download}
            </a>
            <button className="btn outline" onClick={() => setSelectedCert(null)}>
              {t.education.close}
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
          badge={lang === "en" ? "Gallery" : "Galeria"}
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
              <ExternalLink size={14} /> {lang === "en" ? "Open original image" : "Abrir imagem original"}
            </a>
            <button className="btn outline" onClick={() => setEnlargedPhoto(null)}>
              {t.projects.close}
            </button>
          </div>
        </DetailModal>
      )}
    </>
  );
}
