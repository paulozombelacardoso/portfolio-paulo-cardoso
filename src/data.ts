// Fonte central dos dados profissionais de Paulo Cardoso — Software Engineer

export interface Profile {
  name: string;
  title: string;
  roles: string[];
  tagline: string;
  location: string;
  email: string;
  phone: string;
  github: string;
  githubUrl: string;
  linkedin: string;
  leetcode: string;
  codeforces: string;
  intro: string;
  summaryParagraphs: string[];
}

export const profile: Profile = {
  name: "Paulo Cardoso",
  title: "Software Engineer",
  roles: [
    "Software Engineer",
    "Backend Developer",
    "DevOps & Linux Practitioner",
    "AI Solutions Builder"
  ],
  tagline: "Arquitecturas backend escaláveis, sistemas Unix/Linux, DevOps e Inteligência Artificial aplicada.",
  location: "Luanda, Angola",
  email: "paulozombelacardoso@gmail.com",
  phone: "+244 943 126 619",
  github: "paulozombelacardoso",
  githubUrl: "https://github.com/paulozombelacardoso",
  linkedin: "https://www.linkedin.com/in/paulo-cardoso-99772835b/",
  leetcode: "https://leetcode.com/u/PaulCard123/",
  codeforces: "https://codeforces.com/profile/Sunjinwoo42",
  intro:
    "Estudante de Engenharia de Software na 42 Luanda e desenvolvedor backend com foco em NestJS, TypeScript, Docker e sistemas Linux.",
  summaryParagraphs: [
    "Sou estudante de Engenharia de Software na 42 Luanda, com experiência prática em desenvolvimento backend utilizando Node.js, NestJS e TypeScript, e forte interesse em DevOps, Linux e arquitectura de sistemas.",
    "Tenho desenvolvido APIs REST, sistemas de autenticação e serviços conteinerizados com Docker. Continuo a aprofundar conhecimentos em automação, sistemas escaláveis, Inteligência Artificial aplicada e boas práticas de engenharia de software.",
    "Estou motivado para aplicar e expandir estas competências em ambientes reais, com foco na aprendizagem contínua e na resolução de problemas."
  ]
};

export interface SkillItem {
  name: string;
  featured?: boolean; // Destaque visual para tecnologias aplicadas em projectos reais
}

export interface SkillGroup {
  group: string;
  description: string;
  items: SkillItem[];
}

export const skillGroups: SkillGroup[] = [
  {
    group: "Linguagens",
    description: "Linguagens de programação e consulta para backend e sistemas",
    items: [
      { name: "TypeScript", featured: true },
      { name: "JavaScript (ES6+)", featured: true },
      { name: "C", featured: true },
      { name: "C++", featured: true },
      { name: "SQL", featured: true },
      { name: "C#" }
    ]
  },
  {
    group: "Backend e APIs",
    description: "Desenho de arquitecturas robustas, APIs REST e autenticação",
    items: [
      { name: "Node.js", featured: true },
      { name: "NestJS", featured: true },
      { name: "Express.js", featured: true },
      { name: "REST API Design", featured: true },
      { name: "JWT Authentication", featured: true },
      { name: "Clean Architecture", featured: true }
    ]
  },
  {
    group: "Bases de dados e ORM",
    description: "Modelação relacional, integridade e gestão de dados",
    items: [
      { name: "PostgreSQL", featured: true },
      { name: "Prisma ORM", featured: true },
      { name: "TypeORM" },
      { name: "Modelação de dados", featured: true }
    ]
  },
  {
    group: "DevOps e sistemas",
    description: "Conteinerização, orquestração e ambiente Unix/Linux",
    items: [
      { name: "Docker", featured: true },
      { name: "Linux", featured: true },
      { name: "Bash", featured: true },
      { name: "Sistemas Unix", featured: true },
      { name: "Redes", featured: true },
      { name: "Git e GitHub", featured: true }
    ]
  },
  {
    group: "Segurança e Inteligência Artificial",
    description: "Autenticação moderna, modelos de IA generativa e análise de dados",
    items: [
      { name: "OAuth2", featured: true },
      { name: "Boas práticas de autenticação", featured: true },
      { name: "APIs Anthropic e Gemini", featured: true },
      { name: "Análise de dados", featured: true },
      { name: "Prototipagem rápida assistida por IA", featured: true }
    ]
  }
];

export interface Project {
  id: string;
  name: string;
  category: "Full Stack & IA" | "DevOps & Infra" | "Sistemas & C/C++";
  status: string;
  summary: string;
  problem: string;
  architecture: string;
  features: string[];
  tech: string[];
  learnings: string;
  github?: string;
  demo?: string;
  image?: string;
}

export const projectCategories = [
  "Todos",
  "Full Stack & IA",
  "DevOps & Infra",
  "Sistemas & C/C++"
] as const;

export const projects: Project[] = [
  {
    id: "pharmia",
    name: "PharmIA",
    category: "Full Stack & IA",
    status: "Concluído",
    summary:
      "Aplicação full-stack que utiliza Inteligência Artificial e pesquisa semântica para pesquisar e recomendar produtos farmacêuticos a partir de descrições de sintomas em linguagem natural.",
    problem:
      "Dificuldade na localização rápida e orientada de produtos farmacêuticos adequados com base na linguagem natural do utilizador, assegurando informação clara sem substituir a avaliação profissional médica.",
    architecture:
      "Desenvolvida segundo o padrão MVC (Model-View-Controller) com APIs REST estruturadas. Integra modelos de IA (APIs Anthropic/Gemini) com engenharia de prompts estrita para gerar respostas normalizadas e orientações consistentes.",
    features: [
      "Interpretação semântica de sintomas descritos em linguagem natural",
      "Recomendação estruturada de produtos e orientações farmacêuticas",
      "Arquitectura MVC modular com serviços e controladores desacoplados",
      "Consumo seguro de APIs de IA generativa com validação de dados"
    ],
    tech: ["TypeScript", "Node.js", "APIs de IA (Gemini/Anthropic)", "Pesquisa Semântica", "REST API", "MVC"],
    learnings:
      "Engenharia de prompts para saídas estruturadas em JSON, integração com APIs de IA de baixa latência e separação rigorosa entre camadas de domínio e controladores.",
    github: "https://github.com/paulozombelacardoso"
  },
  {
    id: "inception",
    name: "Inception",
    category: "DevOps & Infra",
    status: "Concluído (42 Luanda)",
    summary:
      "Infraestrutura de múltiplos serviços conteinerizados desenvolvida com Docker Compose no contexto da formação na 42 Luanda.",
    problem:
      "Construir e orquestrar um ambiente completo de serviços web interligados em conformidade com as regras da 42, utilizando apenas imagens base personalizadas sem recorrer a imagens pré-configuradas do Docker Hub.",
    architecture:
      "Orquestração via Docker Compose com redes dedicadas isoladas, volumes persistentes montados no host e variáveis de ambiente/segredos protegidos. Inclui Nginx (TLS v1.2/v1.3), WordPress (com php-fpm) e MariaDB.",
    features: [
      "Dockerfiles dedicados e otimizados para Alpine/Debian",
      "Configuração de Nginx com terminação TLS segura",
      "Comunicação inter-serviços através de rede interna Docker",
      "Volumes de persistência de dados dedicados",
      "Scripts de inicialização (entrypoint) automatizados em Bash"
    ],
    tech: ["Docker", "Docker Compose", "Linux", "Nginx", "MariaDB", "WordPress", "Bash"],
    learnings:
      "Orquestração de contentores, gestão de certificados TLS, networking entre serviços, isolamento de processos e administração prática de Linux.",
    github: "https://github.com/paulozombelacardoso"
  },
  {
    id: "minishell",
    name: "Minishell",
    category: "Sistemas & C/C++",
    status: "Concluído (42 Luanda)",
    summary:
      "Implementação de uma shell Unix simplificada em C com suporte à execução de comandos, pipelines, redirecionamentos e variáveis de ambiente.",
    problem:
      "Compreender detalhadamente os mecanismos internos de um terminal POSIX: ciclo de vida de processos, gestão de sinais, manipulação de descritores de ficheiro e parsing léxico/sintáctico sem recurso a bibliotecas de alto nível.",
    architecture:
      "Arquitectura em camadas: analisador léxico (tokenizador), parser sintáctico gerador de árvore de comandos, executor de processos com chamadas de sistema (fork, execve, waitpid, pipe, dup2) e gestor central de variáveis de ambiente.",
    features: [
      "Execução de binários do sistema através da variável PATH",
      "Comandos embutidos (builtins): echo, cd, pwd, export, unset, env e exit",
      "Pipelines encadeados (|) com gestão concorrente de descritores",
      "Redireccionamentos de entrada/saída (<, >, >>) e heredoc (<<)",
      "Gestão de sinais (SIGINT, SIGQUIT) sem interrupção indevida da shell"
    ],
    tech: ["C", "Sistemas Unix", "Gestão de Processos", "File Descriptors", "Signals", "Makefile"],
    learnings:
      "Concorrência e sincronização de processos em sistemas POSIX, prevenção de memory leaks e zombie processes, e tratamento resiliente de erros do sistema operativo.",
    github: "https://github.com/paulozombelacardoso"
  },
  {
    id: "cub3d",
    name: "Cub3D",
    category: "Sistemas & C/C++",
    status: "Concluído (42 Luanda)",
    summary:
      "Motor gráfico tridimensional interactivo em C baseado na técnica de raycasting, inspirado no clássico Wolfenstein 3D.",
    problem:
      "Renderizar uma perspectiva tridimensional fluida e interactiva em tempo real a partir de uma matriz bidimensional de mapa, assegurando alto desempenho visual em C.",
    architecture:
      "Implementação do algoritmo DDA (Digital Differential Analysis) para calcular a distância e intersecção dos raios com as paredes, texturização vertical por amostragem de píxeis e gestão de câmara e movimentação com vectores.",
    features: [
      "Cálculo de raycasting em tempo real com algoritmo DDA",
      "Mapeamento de texturas XPM e cores de tecto e chão configuráveis",
      "Leitor e validador estrito de ficheiros de mapas (.cub)",
      "Movimentação do jogador em primeira pessoa com colisão"
    ],
    tech: ["C", "Raycasting", "MiniLibX", "Álgebra Linear", "Gestão de Memória"],
    learnings:
      "Matemática aplicada a computação gráfica, otimização de buffers de píxeis e controlo rigoroso de alocação de memória.",
    github: "https://github.com/paulozombelacardoso"
  },
  {
    id: "ft_irc",
    name: "ft_irc",
    category: "Sistemas & C/C++",
    status: "Concluído (42 Luanda)",
    summary:
      "Servidor de comunicação em tempo real em C++ baseado nas especificações RFC 1459/2812 do protocolo IRC.",
    problem:
      "Gerir múltiplos utilizadores em simultâneo através de sockets de rede de forma totalmente não-bloqueante, garantindo que o servidor nunca suspenda a execução ao esperar por dados de um cliente.",
    architecture:
      "Servidor concebido com multiplexagem de I/O (utilizando a syscall poll()), permitindo gerir ligações simultâneas num único fio de execução. Modelo orientado a objectos com entidades Server, Client, Channel e CommandHandler.",
    features: [
      "Autenticação segura com palavra-passe e registo de Nickname/Username",
      "Canais públicos e privados com suporte a modos (+i, +t, +k, +o, +l)",
      "Comandos IRC essenciais: JOIN, PART, PRIVMSG, KICK, INVITE, TOPIC, MODE",
      "Multiplexagem não-bloqueante para clientes concorrentes"
    ],
    tech: ["C++98", "Sockets TCP/IP", "Multiplexing (poll)", "Protocolo IRC", "Redes"],
    learnings:
      "Comunicação em rede de baixo nível, fragmentação e bufferização de pacotes TCP, e arquitectura de servidores orientados a eventos.",
    github: "https://github.com/paulozombelacardoso"
  }
];

export interface FTResource {
  id: string;
  title: string;
  category: string;
  description: string;
  details: string;
  tech: string[];
  type: "Repositório / Código" | "Especificação / Docs" | "Infraestrutura";
  link: string;
  isExternal?: boolean;
}

export const ftResources: FTResource[] = [
  {
    id: "ft-inception",
    title: "Inception — Infraestrutura Docker",
    category: "DevOps & SysAdmin",
    description: "Ambiente multi-serviços com Docker Compose, Nginx (TLS), MariaDB e WordPress.",
    details: "Configuração detalhada de Dockerfiles, volumes persistentes, segredos e redes internas isoladas segundo as normas da 42.",
    tech: ["Docker", "Docker Compose", "Nginx", "Linux", "MariaDB"],
    type: "Infraestrutura",
    link: "https://github.com/paulozombelacardoso",
    isExternal: true
  },
  {
    id: "ft-minishell",
    title: "Minishell — Shell Unix POSIX",
    category: "Sistemas Operativos",
    description: "Implementação em C com parsing de comandos, pipelines, redirecionamentos e sinais.",
    details: "Arquitectura completa de processos com fork/execve, duplicação de descritores de ficheiro (dup2/pipe) e gestão de ambiente.",
    tech: ["C", "Unix / POSIX", "Gestão de Processos", "Signals"],
    type: "Repositório / Código",
    link: "https://github.com/paulozombelacardoso",
    isExternal: true
  },
  {
    id: "ft-irc",
    title: "ft_irc — Servidor IRC RFC 1459",
    category: "Redes & Concorrência",
    description: "Servidor de chat em C++ com sockets não-bloqueantes e multiplexagem com poll().",
    details: "Implementação de canais de comunicação, gestão de utilizadores e operadores, e troca de mensagens privadas e globais.",
    tech: ["C++", "Sockets TCP", "Multiplexing", "RFC 1459"],
    type: "Repositório / Código",
    link: "https://github.com/paulozombelacardoso",
    isExternal: true
  },
  {
    id: "ft-cub3d",
    title: "Cub3D — Motor Raycasting",
    category: "Computação Gráfica",
    description: "Motor gráfico tridimensional em C com cálculo DDA e renderização em tempo real.",
    details: "Algoritmos matemáticos de projecção 3D a partir de mapas 2D, mapeamento de texturas e interacção com o utilizador.",
    tech: ["C", "Raycasting", "MiniLibX", "Álgebra Linear"],
    type: "Repositório / Código",
    link: "https://github.com/paulozombelacardoso",
    isExternal: true
  }
];

export interface Experience {
  id: string;
  company: string;
  role: string;
  period: string;
  location: string;
  summary: string;
  bullets: string[];
  skills: string[];
}

export const experiences: Experience[] = [
  {
    id: "kupala",
    company: "Kupala Solution",
    role: "Backend Developer (Freelancer)",
    period: "06/2024 – Presente",
    location: "Luanda, Angola",
    summary:
      "Desenvolvimento de arquitecturas backend modulares, APIs REST seguras e sistemas de gestão empresarial utilizando NestJS, TypeScript, PostgreSQL e Docker.",
    bullets: [
      "Concepção e implementação de arquitecturas backend modulares em NestJS e TypeScript para sistemas de gestão empresarial destinados a negócios locais.",
      "Desenvolvimento de APIs REST com autenticação JWT e OAuth2.",
      "Aplicação de boas práticas de segurança, incluindo protecção contra CSRF quando aplicável à arquitectura.",
      "Modelação e integração de bases de dados PostgreSQL com Prisma ORM, assegurando integridade e performance das consultas.",
      "Conteinerização de aplicações com Docker, padronizando ambientes de desenvolvimento e facilitando o deployment.",
      "Padronização dos ambientes de desenvolvimento e preparação para deployment em produção."
    ],
    skills: ["NestJS", "TypeScript", "PostgreSQL", "Prisma ORM", "Docker", "JWT", "OAuth2", "REST API", "Clean Architecture"]
  },
  {
    id: "hackathon-tourism",
    company: "AI for Sustainable Tourism Hackathon",
    role: "Membro de Equipa Vencedora",
    period: "2026",
    location: "PNUD, Acelera Angola, Min. Turismo, 42 Luanda, Discovery Angola",
    summary:
      "Participação numa equipa vencedora que desenvolveu uma solução baseada em Inteligência Artificial para promover o turismo sustentável em Angola.",
    bullets: [
      "Participação na concepção e prototipagem da solução de IA orientada para desafios reais do turismo sustentável em Angola.",
      "Contribuição para a arquitectura técnica, desenho de software e estruturação dos serviços da aplicação.",
      "Desenvolvimento de funcionalidades de Inteligência Artificial focadas em melhorar a experiência dos visitantes e apoiar a gestão sustentável de destinos.",
      "Participação na análise de conjuntos de dados turísticos e criação de recomendações inteligentes.",
      "Apresentação da solução perante um painel de júris e especialistas do sector, demonstrando impacto, inovação e viabilidade."
    ],
    skills: ["Inteligência Artificial", "Análise de Dados", "Arquitectura de Software", "Prototipagem Rápida", "Trabalho em Equipa"]
  },
  {
    id: "tigra-cubs",
    company: "Tigra Cubs — Bootcamp de Inovação em IA",
    role: "Membro de Equipa Vencedora",
    period: "07/2026",
    location: "Luanda, Angola",
    summary:
      "Participação numa equipa vencedora num bootcamp de inovação, contribuindo para a concepção de uma solução baseada em Inteligência Artificial posteriormente seleccionada para um programa de incubação.",
    bullets: [
      "Análise de problemas do sector e concepção da proposta de valor suportada por Inteligência Artificial.",
      "Contribuição directa para a arquitectura técnica da proposta e definição do pipeline tecnológico.",
      "Colaboração intensiva no desenho e apresentação do projecto perante um painel avaliador.",
      "Participação em actividades de inovação, trabalho em equipa multidisciplinar e metodologias ágeis de desenvolvimento de produto.",
      "Projecto seleccionado para integração em programa de incubação com vista ao desenvolvimento e implementação futura."
    ],
    skills: ["Inteligência Artificial", "Inovação", "Arquitectura Técnica", "Prototipagem Ágil", "Incubação"]
  }
];

export interface EducationItem {
  school: string;
  title: string;
  period: string;
  description: string;
  highlights: string[];
}

export const education: EducationItem[] = [
  {
    school: "42 Luanda",
    title: "Engenharia de Software",
    period: "Em curso",
    description:
      "Formação prática e intensiva baseada em projectos do mundo real e aprendizagem entre pares (peer-to-peer).",
    highlights: [
      "Algoritmos avançados e estruturas de dados",
      "Sistemas Unix/Linux e programação de baixo nível em C/C++",
      "Arquitectura de software e desenvolvimento backend",
      "Conteinerização com Docker e redes de computadores",
      "Autonomia técnica, depuração rigorosa e resolução metódica de problemas"
    ]
  },
  {
    school: "Instituto Médio de Economia de Luanda (IMEL)",
    title: "Técnico Médio em Informática de Gestão",
    period: "Concluído",
    description:
      "Formação técnica sólida em tecnologias de informação, gestão, organização e análise de processos de negócio.",
    highlights: [
      "Redes de computadores, infraestrutura e administração de sistemas",
      "Bases de dados relacionais e modelação de sistemas de informação",
      "Lógica de programação e desenvolvimento de ferramentas de suporte",
      "Organização empresarial e optimização de processos operacionais"
    ]
  }
];

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  category: string;
  skills: string[];
  credentialId?: string;
  file?: string;
  validationUrl?: string;
  verified: boolean;
}

export const certCategories = ["Todas", "Programação & IA", "Idiomas & Comunicação"] as const;

export const certifications: Certification[] = [
  {
    id: "cert-english",
    name: "English for Career Development",
    issuer: "MOOC / University of Pennsylvania",
    date: "2025/2026",
    category: "Idiomas & Comunicação",
    skills: ["Inglês Profissional", "Comunicação Técnica", "Carreira Global"],
    verified: true
  },
  {
    id: "cert-node-ai",
    name: "Node.js com IA Generativa",
    issuer: "Formação Técnica Especializada",
    date: "2026",
    category: "Programação & IA",
    skills: ["Node.js", "APIs de IA Generativa", "Pesquisa Semântica", "Engenharia de Prompts"],
    verified: true
  }
];

// CV Único oficial — Perfil de Software Engineer
export const officialCv = {
  label: "Paulo Cardoso — Software Engineer CV",
  file: "cv/Paulo_Cardoso_CV.pdf",
  download: "Paulo_Cardoso_CV.pdf"
};
