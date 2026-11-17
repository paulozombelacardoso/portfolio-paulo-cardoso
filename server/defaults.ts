export const defaultSections = [
  { key: "about", label: { pt: "Sobre", en: "About" }, visible: true, order: 10 },
  { key: "stack", label: { pt: "Stack", en: "Stack" }, visible: true, order: 20 },
  { key: "projects", label: { pt: "Projectos", en: "Projects" }, visible: true, order: 30 },
  {
    key: "experience",
    label: { pt: "Experiência", en: "Experience" },
    visible: true,
    order: 40
  },
  { key: "education", label: { pt: "Formação", en: "Education" }, visible: true, order: 50 },
  {
    key: "courses",
    label: { pt: "Cursos", en: "Courses" },
    visible: false,
    order: 60
  },
  {
    key: "publications",
    label: { pt: "Publicações", en: "Publications" },
    visible: false,
    order: 70
  },
  { key: "contact", label: { pt: "Contacto", en: "Contact" }, visible: true, order: 80 }
];

export const defaultSettings = {
  contact: {
    email: "paulozombelacardoso@gmail.com",
    phone: "+244 943 126 619",
    location: "Luanda, Angola"
  },
  social: {
    github: "https://github.com/paulozombelacardoso",
    linkedin: "https://www.linkedin.com/in/paulo-cardoso-99772835b/",
    leetcode: "https://leetcode.com/u/PaulCard123/",
    codeforces: "https://codeforces.com/profile/Sunjinwoo42"
  },
  sections: defaultSections,
  seo: {
    title: "Paulo Cardoso — Software Engineer | Backend, DevOps & IA",
    description:
      "Portefólio profissional de Paulo Cardoso — Software Engineer e estudante na 42 Luanda. Especialista em backend (NestJS, TypeScript), Docker, Linux e Inteligência Artificial.",
    ogTitle: "Paulo Cardoso — Software Engineer",
    ogDescription:
      "Estudante de Engenharia de Software na 42 Luanda. Projectos (PharmIA, Inception, Minishell), competências técnicas, experiências e CV.",
    ogImage: ""
  },
  sitePublished: true,
  maintenanceMessage:
    "O portefólio encontra-se temporariamente em manutenção. Volte em breve."
};

export const sectionKeys = defaultSections.map((section) => section.key);
