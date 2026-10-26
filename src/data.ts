// Fonte central dos dados profissionais de Paulo Cardoso — Software Engineer
import type { Lang } from "./i18n";
import {
  profileEn,
  stackCategoriesEn,
  projectsEn,
  experiencesEn,
  educationListEn,
  certificatesListEn
} from "./data.en";

export interface Profile {
  name: string;
  title: string;
  lead: string;
  shortBio: string;
  location: string;
  email: string;
  phone: string;
  github: string;
  githubUrl: string;
  linkedin: string;
  leetcode: string;
  codeforces: string;
  photo: string;
  cvFile: string;
  cvDownload: string;
}

export const profile: Profile = {
  name: "Paulo Cardoso",
  title: "Software Engineer | Backend & Systems",
  lead: "Construo soluções de software, APIs e sistemas com foco em arquitectura, desempenho e resolução de problemas.",
  shortBio:
    "",
  location: "Luanda, Angola",
  email: "paulozombelacardoso@gmail.com",
  phone: "+244 943 126 619",
  github: "paulozombelacardoso",
  githubUrl: "https://github.com/paulozombelacardoso",
  linkedin: "https://www.linkedin.com/in/paulo-cardoso-99772835b/",
  leetcode: "https://leetcode.com/u/PaulCard123/",
  codeforces: "https://codeforces.com/profile/Sunjinwoo42",
  photo: "photo.png",
  cvFile: "cv/Paulo_Cardoso_CV.pdf",
  cvDownload: "Paulo_Cardoso_CV.pdf"
};

export interface StackCategory {
  name: string;
  iconName: string;
  description: string;
  items: string[];
}

export const stackCategories: StackCategory[] = [
  {
    name: "Linguagens",
    iconName: "Code2",
    description: "Linguagens de programação e consulta para backend e sistemas de baixo nível",
    items: ["C", "C++", "C#", "JavaScript", "TypeScript", "SQL"]
  },
  {
    name: "Backend",
    iconName: "Server",
    description: "Construção de APIs escaláveis, autenticação segura e padrões de arquitectura",
    items: ["Node.js", "NestJS", "Express.js", "APIs REST", "Autenticação JWT", "OAuth2", "Clean Architecture"]
  },
  {
    name: "Bases de dados",
    iconName: "Database",
    description: "Modelação relacional, integridade de dados e mapeamento objecto-relacional",
    items: ["PostgreSQL", "Prisma ORM", "TypeORM", "Modelação de Dados"]
  },
  {
    name: "DevOps e sistemas",
    iconName: "Terminal",
    description: "Ambientes conteinerizados, administração Linux e controlo de versões",
    items: ["Docker", "Docker Compose", "Linux", "Bash", "Sistemas Unix", "Redes POSIX", "Git e GitHub"]
  },
  {
    name: "Inteligência Artificial",
    iconName: "Sparkles",
    description: "Integração de modelos generativos, pesquisa semântica e prototipagem ágil",
    items: ["APIs Anthropic e Gemini", "Pesquisa Semântica", "Prototipagem com IA", "Análise de Dados"]
  }
];

export interface Project {
  id: string;
  name: string;
  subtitle: string;
  category: "Full Stack & IA" | "DevOps & Infra" | "Sistemas & C/C++" | "Sistemas & Gestão";
  summary: string;
  coverImage?: string;
  videoUrl?: string;
  galleryImages?: string[];
  problem: string;
  architecture: string;
  features: string[];
  tech: string[];
  learnings: string;
  github?: string;
  demo?: string;
}

export const projects: Project[] = [
  {
    id: "discover-angola",
    name: "Discover Angola",
    subtitle: "Plataforma de Turismo Inteligente & IA",
    category: "Full Stack & IA",
    summary:
      "Plataforma tecnológica para promoção do turismo sustentável e descoberta de destinos em Angola, integrando pesquisa assistida por Inteligência Artificial e reservas de guias locais.",
    coverImage: "Discover_Angola/Discover_Angola.jpg",
    videoUrl: "Discover_Angola/Discover_Angola.mp4",
    problem:
      "Dificuldade dos viajantes na identificação de experiências autênticas, rotas turísticas seguras e guias locais credenciados em Angola, associada à dispersão da informação turística.",
    architecture:
      "Arquitectura web modular com integração de APIs de Inteligência Artificial para recomendações contextuais personalizadas com base no perfil e interesses do visitante.",
    features: [
      "Catálogo interactivo de destinos, províncias e experiências culturais em Angola",
      "Pesquisa assistida por Inteligência Artificial para sugestões personalizadas",
      "Conexão com guias turísticos locais verificados",
      "Interface responsiva moderna e navegação rápida por filtros temáticos"
    ],
    tech: ["TypeScript", "React", "Node.js", "APIs de IA", "REST API", "Tailwind CSS"],
    learnings:
      "Desenho de soluções tecnológicas orientadas a impacto social, integração de modelos de IA na experiência do utilizador e tratamento de recursos multimédia para alta velocidade de carregamento.",
    github: "https://github.com/paulozombelacardoso"
  },
  {
    id: "inception",
    name: "Inception",
    subtitle: "Infraestrutura Conteinerizada (42 Luanda)",
    category: "DevOps & Infra",
    summary:
      "Infraestrutura de múltiplos serviços orquestrada com Docker Compose, composta por Nginx com TLS seguro, WordPress e MariaDB em ambiente Linux rigoroso.",
    videoUrl: "inception/Inception.webm",
    problem:
      "Garantir a orquestração reprodutível, segura e isolada de uma pilha de serviços web em ambiente Linux, respeitando o padrão da 42 de criar imagens personalizadas sem recurso a contentores pré-prontos do Docker Hub.",
    architecture:
      "Dockerfiles dedicados baseados em Debian/Alpine para cada serviço, rede interna bridge fechada, volumes persistentes montados no host e variáveis de ambiente confidenciais protegidas.",
    features: [
      "Servidor Nginx configurado com protocolo TLS v1.2/v1.3 e terminação SSL",
      "Serviço WordPress optimizado executando em php-fpm dedicado",
      "Base de dados MariaDB com persistência em volumes dedicados",
      "Isolamento rigoroso de redes e arranque automatizado por scripts Bash (entrypoint)"
    ],
    tech: ["Docker", "Docker Compose", "Linux", "Nginx", "MariaDB", "WordPress", "Bash"],
    learnings:
      "Administração aprofundada de sistemas Linux, desenho de redes de contentores, gestão de certificados TLS e princípios essenciais de Infraestrutura como Código (IaC).",
    github: "https://github.com/paulozombelacardoso"
  },
  {
    id: "proteja-imel",
    name: "PROTEJA — Gestão de Seguros",
    subtitle: "Projecto Académico de Fim de Curso (IMEL)",
    category: "Sistemas & Gestão",
    summary:
      "Sistema de informação para emissão de apólices, acompanhamento de segurados e controlo de sinistros, desenvolvido e defendido com sucesso perante o júri técnico do IMEL.",
    coverImage: "IMEL/ProjectoFimCurso_Proteja.jpg",
    galleryImages: ["IMEL/ProjectoFimCurso_Proteja.jpg", "IMEL/ft_defesa.jpg"],
    problem:
      "Necessidade de modernizar e automatizar os fluxos operacionais de mediação e gestão de apólices e sinistros, substituindo processos manuais propensos a incoerências.",
    architecture:
      "Modelação relacional de bases de dados seguindo regras de normalização estritas, cálculo parametrizado de prémios e interface orientada à operação administrativa diária.",
    features: [
      "Registo e emissão estruturada de apólices de seguro",
      "Gestão do ciclo de vida de sinistros e indemnizações",
      "Modelação de dados relacional e relatórios de processo",
      "Apresentado e defendido com distinção na conclusão do curso no IMEL"
    ],
    tech: ["Bases de Dados Relacionais", "Modelação de Dados", "SQL", "Sistemas de Informação", "Análise de Processos"],
    learnings:
      "Tradução de requisitos de negócio e enquadramento regulatório em modelos de software eficientes, combinando competências de gestão com engenharia de sistemas.",
    github: "https://github.com/paulozombelacardoso"
  },
  {
    id: "pharmia",
    name: "PharmIA",
    subtitle: "Pesquisa Farmacêutica com IA Semântica",
    category: "Full Stack & IA",
    summary:
      "Aplicação full-stack que utiliza Inteligência Artificial e pesquisa semântica para localizar produtos farmacêuticos a partir de sintomas descritos em linguagem natural.",
    problem:
      "Dificuldade na localização rápida e orientada de produtos farmacêuticos adequados com base na linguagem natural do utilizador, assegurando informação clara sem substituir a avaliação profissional médica.",
    architecture:
      "Arquitectura MVC modular com serviços desacoplados e consumo de APIs de IA (Gemini/Anthropic), validando e estruturando os resultados em esquemas estritos.",
    features: [
      "Interpretação semântica de sintomas descritos em linguagem comum",
      "Recomendação estruturada de produtos e orientações farmacêuticas",
      "Arquitectura MVC modular com separação de camadas de domínio e controladores",
      "Consumo seguro de APIs de IA generativa com validação de formato"
    ],
    tech: ["TypeScript", "Node.js", "APIs de IA", "Pesquisa Semântica", "REST API", "MVC"],
    learnings:
      "Engenharia de prompts para saídas JSON determinísticas, gestão de latência em APIs de IA e desenho de interfaces limpas focadas no utilizador.",
    github: "https://github.com/paulozombelacardoso"
  },
  {
    id: "minishell",
    name: "Minishell",
    subtitle: "Shell Unix POSIX em C (42 Luanda)",
    category: "Sistemas & C/C++",
    summary:
      "Implementação em C de uma shell Unix com suporte à execução de binários, pipelines encadeados, redireccionamentos de I/O e gestão de sinais POSIX.",
    problem:
      "Compreender detalhadamente o funcionamento interno de um interpretador de comandos POSIX: ciclo de vida de processos, gestão de sinais e parsing sintáctico sem bibliotecas de alto nível.",
    architecture:
      "Pipeline dividido em analisador léxico (tokenizador), parser sintáctico gerador de comandos, executor multiprocesso (fork, execve, waitpid) e gestão de file descriptors (pipe, dup2).",
    features: [
      "Execução de comandos de sistema via PATH e comandos internos built-in (cd, echo, pwd, export, unset, env, exit)",
      "Pipelines encadeados (|) com gestão concorrente de descritores de ficheiro",
      "Redireccionamentos de entrada/saída (<, >, >>) e heredoc (<<)",
      "Tratamento resiliente de sinais (SIGINT, SIGQUIT) e prevenção de processos zombie"
    ],
    tech: ["C", "Unix / POSIX", "Gestão de Processos", "File Descriptors", "Signals", "Makefile"],
    learnings:
      "Programação concorrente de baixo nível em sistemas POSIX, prevenção de fugas de memória (memory leaks) e manipulação precisa de descritores de ficheiros.",
    github: "https://github.com/paulozombelacardoso"
  },
  {
    id: "ft_irc",
    name: "ft_irc",
    subtitle: "Servidor IRC RFC 1459 em C++ (42 Luanda)",
    category: "Sistemas & C/C++",
    summary:
      "Servidor de chat em tempo real concebido segundo as especificações RFC 1459/2812 do protocolo IRC, com multiplexagem não-bloqueante via syscall poll().",
    problem:
      "Gerir dezenas de clientes em simultâneo através de sockets de rede de forma totalmente assíncrona, assegurando que o servidor nunca bloqueia ao esperar por dados de um utilizador.",
    architecture:
      "Loop de eventos centralizado baseado em multiplexagem de I/O (poll()), com modelo orientado a objectos em C++98 composto por entidades Server, Client, Channel e CommandHandler.",
    features: [
      "Autenticação por palavra-passe e registo de Nickname/Username",
      "Criação de canais públicos e privados com modos específicos (+i, +t, +k, +o, +l)",
      "Mensagens privadas, canais de difusão e comandos de moderação (KICK, INVITE, MODE)",
      "Multiplexagem não-bloqueante para múltiplos clientes concorrentes"
    ],
    tech: ["C++98", "Sockets TCP/IP", "Multiplexing (poll)", "Protocolo IRC", "Redes"],
    learnings:
      "Comunicação em rede TCP/IP de baixo nível, fragmentação de pacotes de rede e implementação estrita de protocolos standard de comunicação.",
    github: "https://github.com/paulozombelacardoso"
  },
  {
    id: "cub3d",
    name: "Cub3D",
    subtitle: "Motor Gráfico Raycasting em C (42 Luanda)",
    category: "Sistemas & C/C++",
    summary:
      "Motor gráfico tridimensional interactivo em tempo real em C baseado no algoritmo de raycasting, inspirado no clássico jogo Wolfenstein 3D.",
    videoUrl: "Cub3D/cub3D.mp4",
    problem:
      "Projectar e renderizar um ambiente tridimensional interactivo a partir de uma matriz bidimensional de mapa em tempo real com alta taxa de fotogramas por segundo.",
    architecture:
      "Algoritmo DDA (Digital Differential Analysis) para intersecção de raios com paredes, mapeamento de texturas verticais por amostragem e cálculo de vectores de câmara.",
    features: [
      "Renderização em tempo real com algoritmo DDA de raycasting",
      "Mapeamento de texturas XPM e cores configuráveis de tecto e chão",
      "Parser e validador estrito de mapas (.cub)",
      "Movimentação do jogador em primeira pessoa com detecção de colisões"
    ],
    tech: ["C", "Raycasting", "MiniLibX", "Álgebra Linear", "Gestão de Memória"],
    learnings:
      "Matemática aplicada a computação gráfica, optimização de buffers de píxeis e gestão rigorosa de memória em C.",
    github: "https://github.com/paulozombelacardoso"
  }
];

export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  location: string;
  summary: string;
  bullets: string[];
  tech: string[];
  photos?: string[];
  certificateFile?: string;
  certificateLabel?: string;
}

export const experiences: Experience[] = [
  {
    id: "kupala",
    role: "Backend Developer (Freelancer)",
    company: "Kupala Solution",
    period: "06/2024 – Presente",
    location: "Luanda, Angola",
    summary:
      "Desenvolvimento de arquitecturas backend modulares, APIs REST seguras e sistemas de gestão empresarial utilizando NestJS, TypeScript, PostgreSQL e Docker.",
    bullets: [
      "Concepção e implementação de arquitecturas backend modulares em NestJS e TypeScript para sistemas empresariais destinados a negócios locais.",
      "Desenvolvimento de APIs REST com autenticação JWT e OAuth2, aplicando princípios de Clean Architecture.",
      "Aplicação de boas práticas de segurança, validação de inputs e protecção contra vulnerabilidades comuns como CSRF.",
      "Modelação e integração de bases de dados PostgreSQL com Prisma ORM, garantindo integridade e alto rendimento de consultas.",
      "Conteinerização de aplicações com Docker, padronizando ambientes de desenvolvimento e facilitando o deployment."
    ],
    tech: ["NestJS", "TypeScript", "Node.js", "PostgreSQL", "Prisma ORM", "Docker", "JWT", "OAuth2", "REST APIs"]
  },
  {
    id: "hackathon-tourism",
    role: "Membro de Equipa Vencedora",
    company: "AI for Sustainable Tourism Hackathon",
    period: "2026",
    location: "PNUD & Ministério do Turismo de Angola",
    summary:
      "Integração da equipa vencedora que concebeu uma solução tecnológica baseada em Inteligência Artificial para promover o turismo sustentável e a economia local em Angola.",
    bullets: [
      "Participação na concepção técnica e na prototipagem da solução de turismo inteligente.",
      "Contribuição para o desenho da arquitectura de software e funcionalidades de Inteligência Artificial orientadas à experiência dos visitantes.",
      "Análise de dados turísticos e desenvolvimento de algoritmos de recomendação contextualizada de destinos.",
      "Apresentação da solução perante júri especializado, obtendo o prémio de equipa vencedora."
    ],
    tech: ["Inteligência Artificial", "Arquitectura de Software", "Análise de Dados", "Prototipagem Ágil"],
    photos: ["hackton_Turismo/fts/1.jpg", "hackton_Turismo/fts/2.jpg", "hackton_Turismo/fts/3.jpg"],
    certificateFile: "certificates/1785149446894.jpg",
    certificateLabel: "Certificado de Participação com Êxito — Hackathon de Turismo Sustentável"
  },
  {
    id: "tigra-cubs",
    role: "Membro de Equipa Vencedora",
    company: "Tigra Cubs — Bootcamp de Inovação em IA",
    period: "07/2026",
    location: "Luanda, Angola",
    summary:
      "Participação numa equipa vencedora num bootcamp de inovação intensivo, desenvolvendo uma solução suportada por IA seleccionada para programa de incubação.",
    bullets: [
      "Análise técnica de problemas e modelação da proposta de valor suportada por Inteligência Artificial.",
      "Contribuição directa para a definição da arquitectura técnica da solução e pipeline tecnológico.",
      "Apresentação do projecto perante banca examinadora, resultando na selecção da proposta para programa de incubação empresarial.",
      "Aplicação de metodologias ágeis de desenvolvimento de produto em equipa multidisciplinar."
    ],
    tech: ["Inteligência Artificial", "Inovação", "Arquitectura Técnica", "Incubação"],
    photos: ["hackton_Tigra/1.jpg", "hackton_Tigra/2.jpg", "hackton_Tigra/3.jpg"],
    certificateFile: "certificates/TigraCubs.jpg",
    certificateLabel: "Certificado Tigra Cubs 2026 — Começa em Ti"
  }
];

export interface EducationItem {
  school: string;
  degree: string;
  period: string;
  description: string;
  bullets: string[];
}

export const educationList: EducationItem[] = [
  {
    school: "42 Luanda",
    degree: "Engenharia de Software",
    period: "Em curso",
    description:
      "Formação prática intensiva orientada a projectos do mundo real e aprendizagem colaborativa entre pares (peer-to-peer).",
    bullets: [
      "Algoritmos, estruturas de dados e programação de baixo nível em C e C++",
      "Sistemas operativos Unix/Linux, concorrência, processos e redes",
      "Arquitectura de software, desenvolvimento backend e conteinerização com Docker",
      "Autonomia técnica, depuração metódica e resolução de problemas complexos"
    ]
  },
  {
    school: "Instituto Médio de Economia de Luanda (IMEL)",
    degree: "Técnico Médio em Informática de Gestão",
    period: "Concluído",
    description:
      "Formação técnica que conjuga tecnologias de informação, gestão empresarial e organização de processos de negócio.",
    bullets: [
      "Bases de dados relacionais e modelação de sistemas de informação",
      "Redes de computadores, infraestrutura e administração de sistemas",
      "Programação aplicada à gestão e automatização de processos empresariais"
    ]
  }
];

export interface CertificateItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  file: string;
  isImage?: boolean;
  thumbnail?: string;
}

export const certificatesList: CertificateItem[] = [
  {
    id: "cert-english",
    title: "English for Career Development MOOC",
    issuer: "OPEN MOOCs / U.S. Dept of State & FHI 360",
    date: "04/2026",
    file: "certificates/English.jpg",
    isImage: true,
    thumbnail: "certificates/English.jpg"
  },
  {
    id: "cert-node-ai",
    title: "Node.js com IA Generativa na Prática",
    issuer: "Formação Técnica Especializada",
    date: "2026",
    file: "certificates/Certificate_Node.js com IA Generativa na prática.pdf",
    thumbnail: "certificates/thumb_node_ai.jpg"
  },
  {
    id: "cert-turismo",
    title: "Hackathon de Turismo Sustentável (Equipa Vencedora)",
    issuer: "Governo de Angola, MinTur, PNUD, 42 Luanda",
    date: "2026",
    file: "certificates/1785149446894.jpg",
    isImage: true,
    thumbnail: "certificates/1785149446894.jpg"
  },
  {
    id: "cert-tigra",
    title: "Tigra Cubs Bootcamp de Inovação em IA",
    issuer: "Refriango / Tigra Cubs",
    date: "07/2026",
    file: "certificates/TigraCubs.jpg",
    isImage: true,
    thumbnail: "certificates/TigraCubs.jpg"
  },
  {
    id: "cert-imel",
    title: "Técnico Médio em Informática de Gestão",
    issuer: "Instituto Médio de Economia de Luanda (IMEL)",
    date: "Concluído",
    file: "certificates/Certificado_IMEL.pdf",
    thumbnail: "certificates/thumb_imel.jpg"
  },
  {
    id: "cert-time",
    title: "Certificado de Gestão de Tempo",
    issuer: "Desenvolvimento Profissional",
    date: "2026",
    file: "certificates/Certificado_Gestão de Tempo.pdf",
    thumbnail: "certificates/thumb_gestao_tempo.jpg"
  },
  {
    id: "cert-42",
    title: "Transcript Académico 42 Luanda",
    issuer: "42 Luanda / Ecole 42",
    date: "Em curso",
    file: "certificates/42_transcript.pdf",
    thumbnail: "certificates/thumb_42_transcript.jpg"
  }
];
