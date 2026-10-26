// Edite este ficheiro para actualizar o conteúdo. Campos vazios ("") aparecem como "por adicionar".
export const profile = {
  name: "Paulo Cardoso",
  roles: ["Software Engineering Student", "Backend Developer"],
  tagline: "Transformo problemas em soluções através do código.",
  intro: "Sou estudante de Engenharia de Software na 42 Luanda, com formação em Informática de Gestão pelo IMEL. Tenho interesse no desenvolvimento de software, na construção de aplicações backend e na criação de soluções tecnológicas que resolvam problemas reais.",
  github: "paulozombelacardoso",
  linkedin: "https://www.linkedin.com/in/paulo-cardoso-99772835b/",
  email: "paulozombelacardoso@gmail.com",
};

export type Level = "using" | "learning";
export const skills: { group: string; items: { n: string; level: Level }[] }[] = [
  { group: "Linguagens", items: [{ n: "C", level: "using" }, { n: "C++", level: "learning" }, { n: "JavaScript", level: "using" }, { n: "TypeScript", level: "using" }, { n: "Python", level: "learning" }] },
  { group: "Backend", items: [{ n: "Node.js", level: "using" }, { n: "NestJS", level: "using" }, { n: "APIs REST", level: "using" }, { n: "Integração de sistemas", level: "using" }] },
  { group: "Bases de dados", items: [{ n: "PostgreSQL", level: "using" }, { n: "SQL", level: "using" }] },
  { group: "Ferramentas e infraestrutura", items: [{ n: "Docker", level: "using" }, { n: "Linux", level: "using" }, { n: "Git", level: "using" }, { n: "GitHub", level: "using" }] },
  { group: "Áreas de interesse", items: [{ n: "Engenharia de Software", level: "learning" }, { n: "Full Stack", level: "learning" }, { n: "Engenharia de Dados", level: "learning" }, { n: "Business Intelligence", level: "learning" }, { n: "IA e Machine Learning", level: "learning" }, { n: "Cloud Computing", level: "learning" }] },
];

export const projectCategories = ["Todos", "Backend", "C/C++", "Full Stack", "Dados", "Outros"];
export const projects = [
  { name: "Cub3D", category: "C/C++", status: "A confirmar", description: "Projecto gráfico em C com raycasting.", problem: "Renderizar um ambiente 3D interactivo a partir de um mapa 2D.", tech: ["C", "Raycasting"], features: ["Raycasting", "Gestão de memória", "Estruturas de dados"], github: "", demo: "", image: "" },
  { name: "Inception", category: "Backend", status: "A confirmar", description: "Infraestrutura com Docker e Docker Compose.", problem: "Orquestrar vários serviços de forma reproduzível.", tech: ["Docker", "Docker Compose", "Nginx", "WordPress", "MariaDB"], features: ["Nginx", "WordPress", "MariaDB"], github: "", demo: "", image: "" },
  { name: "ft_irc", category: "C/C++", status: "A confirmar", description: "Servidor IRC implementado em C++.", problem: "Permitir comunicação em tempo real entre vários clientes.", tech: ["C++", "Sockets"], features: ["Sockets", "Gestão de clientes", "Protocolo IRC"], github: "", demo: "", image: "" },
  { name: "Discover Angola", category: "Full Stack", status: "Conceito", description: "Plataforma de turismo para descobrir destinos, cultura e experiências em Angola.", problem: "Ajudar utilizadores a encontrar destinos e experiências no país.", tech: [], features: [], github: "", demo: "", image: "" },
  { name: "Análise de dados", category: "Dados", status: "Futuro", description: "Espaço para projectos com Python, SQL, Excel e Business Intelligence.", problem: "", tech: ["Python", "SQL", "Excel"], features: [], github: "", demo: "", image: "" },
];

export const certCategories = ["Todas", "Programação", "Dados e BI", "Cloud e DevOps", "Redes e sistemas", "Outros"];
// Exemplo: { name:"…", issuer:"…", date:"2026-01", category:"Programação", skills:["…"], credentialId:"", validationUrl:"", file:"certificates/nome.pdf" }
export const certifications: { name: string; issuer: string; date: string; category: string; skills: string[]; credentialId: string; validationUrl: string; file: string }[] = [];

export const education = [
  { school: "42 Luanda", title: "Engenharia de Software", period: "Em curso", text: "Aprendizagem prática, baseada em projectos e na colaboração entre pares." },
  { school: "Instituto Médio de Economia de Luanda (IMEL)", title: "Técnico Médio em Informática de Gestão", period: "", text: "Base em informática aplicada à gestão e organização de processos." },
];
export const experience = [
  { company: "Kupala Solution", role: "Freelance Backend Developer", period: "", text: "Desenvolvimento backend com TypeScript, Node.js, NestJS e PostgreSQL.", skills: ["Node.js", "NestJS", "PostgreSQL"] },
  { company: "Sanham Angola Seguros", role: "Gestor de seguros", period: "", text: "Acompanhamento de clientes e análise de processos.", skills: ["Organização", "Comunicação", "Resolução de problemas"] },
];

// Coloque os PDFs em public/cv/ com estes nomes.
export const cvs = [
  { label: "Full Stack Developer", file: "cv/Paulo_Cardoso_CV_FullStack_PT.pdf", download: "Paulo_Cardoso_CV_FullStack.pdf" },
  { label: "Informática / IT Support", file: "cv/CV_Paulo_Cardoso_IT.pdf", download: "Paulo_Cardoso_CV_IT.pdf" },
  { label: "Tecnologia (geral)", file: "cv/Paulo_Cardoso_CV.pdf", download: "Paulo_Cardoso_CV.pdf" },
];
