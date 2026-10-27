import { Profile, StackCategory, Project, Experience, EducationItem, CertificateItem } from "./data";

export const profileEn: Profile = {
  name: "Paulo Cardoso",
  title: "Software Engineer | Backend & Systems",
  lead: "I build software solutions, APIs and systems focusing on architecture, performance and problem-solving.",
  shortBio: "",
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

export const stackCategoriesEn: StackCategory[] = [
  {
    name: "Languages",
    iconName: "Code2",
    description: "Programming and query languages for backend and low-level systems",
    items: ["C", "C++", "C#", "JavaScript", "TypeScript", "SQL"]
  },
  {
    name: "Backend",
    iconName: "Server",
    description: "Building scalable APIs, secure authentication, and architectural patterns",
    items: ["Node.js", "NestJS", "Express.js", "REST APIs", "JWT Authentication", "OAuth2", "Clean Architecture"]
  },
  {
    name: "Databases",
    iconName: "Database",
    description: "Relational modeling, data integrity, and object-relational mapping",
    items: ["PostgreSQL", "Prisma ORM", "TypeORM", "Data Modeling"]
  },
  {
    name: "DevOps & Systems",
    iconName: "Terminal",
    description: "Containerized environments, Linux administration, and version control",
    items: ["Docker", "Docker Compose", "Linux", "Bash", "Unix Systems", "POSIX Networks", "Git & GitHub"]
  },
  {
    name: "Artificial Intelligence",
    iconName: "Sparkles",
    description: "Generative model integration, semantic search, and agile prototyping",
    items: ["Anthropic & Gemini APIs", "Semantic Search", "AI Prototyping", "Data Analysis"]
  }
];

export const projectsEn: Project[] = [
  {
    id: "discover-angola",
    name: "Discover Angola",
    subtitle: "Smart Tourism & AI Platform",
    category: "Full Stack & IA",
    summary:
      "Technological platform promoting sustainable tourism and destination discovery in Angola, integrating AI-assisted search and verified local guide bookings.",
    coverImage: "Discover_Angola/Discover_Angola.jpg",
    videoUrl: "Discover_Angola/Discover_Angola.mp4",
    problem:
      "Travelers face difficulties identifying authentic experiences, safe routes, and credentialed local guides in Angola due to fragmented tourism data.",
    architecture:
      "Modular web architecture integrating AI APIs for personalized contextual recommendations tailored to each visitor's interests.",
    features: [
      "Interactive catalog of destinations, provinces, and cultural experiences in Angola",
      "AI-assisted search providing personalized travel recommendations",
      "Direct connection with verified local tour guides",
      "Modern responsive interface with fast category filtering"
    ],
    tech: ["TypeScript", "React", "Node.js", "AI APIs", "REST API", "Tailwind CSS"],
    learnings:
      "Designing socially impactful technological solutions, integrating AI models into user workflows, and optimizing media assets for high load speeds.",
    github: "https://github.com/paulozombelacardoso"
  },
  {
    id: "inception",
    name: "Inception",
    subtitle: "Containerized Infrastructure (42 Luanda)",
    category: "DevOps & Infra",
    summary:
      "Multi-service infrastructure orchestrated with Docker Compose, composed of TLS-secured Nginx, WordPress, and MariaDB in a strict Linux environment.",
    videoUrl: "inception/Inception.webm",
    problem:
      "Ensure reproducible, isolated, and secure orchestration of web services in Linux, adhering to 42's standard of building custom images without pre-built Docker Hub images.",
    architecture:
      "Dedicated Debian/Alpine Dockerfiles per service, closed internal bridge network, persistent host volumes, and secured secret environment variables.",
    features: [
      "Nginx server configured with TLS v1.2/v1.3 protocol and SSL termination",
      "Optimized WordPress service running on dedicated php-fpm",
      "MariaDB database with persistence on dedicated host volumes",
      "Strict network isolation and automated bootstrap via Bash entrypoints"
    ],
    tech: ["Docker", "Docker Compose", "Linux", "Nginx", "MariaDB", "WordPress", "Bash"],
    learnings:
      "In-depth Linux systems administration, container network design, TLS certificate management, and Infrastructure as Code (IaC) principles.",
    github: "https://github.com/paulozombelacardoso"
  },
  {
    id: "proteja-imel",
    name: "PROTEJA — Insurance Management",
    subtitle: "Academic Capstone Project (IMEL)",
    category: "Sistemas & Gestão",
    summary:
      "Information system for policy issuance, policyholder tracking, and claims management, successfully developed and defended before the IMEL technical jury.",
    coverImage: "IMEL/ProjectoFimCurso_Proteja.jpg",
    galleryImages: ["IMEL/ProjectoFimCurso_Proteja.jpg", "IMEL/ft_defesa.jpg"],
    problem:
      "Need to modernize and automate operational workflows for insurance mediation and claims processing, replacing manual error-prone spreadsheets.",
    architecture:
      "Relational database modeling following strict normalization rules, parameterized premium calculation, and daily administrative operation interface.",
    features: [
      "Structured registration and issuance of insurance policies",
      "Full lifecycle management for claims and indemnities",
      "Relational data modeling and process reporting",
      "Presented and defended with distinction at IMEL graduation"
    ],
    tech: ["Relational Databases", "Data Modeling", "SQL", "Information Systems", "Process Analysis"],
    learnings:
      "Translating business requirements and regulatory frameworks into efficient software models, bridging management skills with systems engineering.",
    github: "https://github.com/paulozombelacardoso"
  },
  {
    id: "pharmia",
    name: "PharmIA",
    subtitle: "Semantic AI Pharmaceutical Search",
    category: "Full Stack & IA",
    summary:
      "Full-stack application utilizing Artificial Intelligence and semantic search to locate pharmaceutical products from natural language symptom descriptions.",
    coverImage: "pharma_IA/AI-Powered Semantic Health Search.png",
    problem:
      "Difficulty in quickly locating appropriate pharmaceutical products based on user natural language while providing clear information without replacing medical advice.",
    architecture:
      "Modular MVC architecture with decoupled services consuming AI APIs (Gemini/Anthropic), validating and structuring results into strict schemas.",
    features: [
      "Semantic interpretation of symptoms described in everyday language",
      "Structured product recommendations and pharmaceutical guidance",
      "Modular MVC architecture separating domain layers and controllers",
      "Secure consumption of generative AI APIs with schema validation"
    ],
    tech: ["TypeScript", "Node.js", "AI APIs", "Semantic Search", "REST API", "MVC"],
    learnings:
      "Prompt engineering for deterministic JSON outputs, latency management in AI APIs, and clean user-focused interface design.",
    github: "https://github.com/paulozombelacardoso"
  },
  {
    id: "minishell",
    name: "Minishell",
    subtitle: "POSIX Unix Shell in C (42 Luanda)",
    category: "Sistemas & C/C++",
    summary:
      "C implementation of a Unix shell supporting binary execution, chained pipelines, I/O redirections, and POSIX signal handling.",
    videoUrl: "Minishell/MINISHELL.mp4",
    problem:
      "Deeply understand the internal operation of a POSIX command interpreter: process lifecycles, signal management, and syntactic parsing without high-level libraries.",
    architecture:
      "Pipeline divided into lexical analyzer (tokenizer), syntax parser command generator, multiprocess executor (fork, execve, waitpid), and file descriptor management (pipe, dup2).",
    features: [
      "Execution of system commands via PATH and built-in internal commands (cd, echo, pwd, export, unset, env, exit)",
      "Chained pipelines (|) with concurrent file descriptor management",
      "Input/output redirections (<, >, >>) and heredoc (<<)",
      "Resilient signal handling (SIGINT, SIGQUIT) and zombie process prevention"
    ],
    tech: ["C", "Unix / POSIX", "Process Management", "File Descriptors", "Signals", "Makefile"],
    learnings:
      "Low-level concurrent programming in POSIX systems, memory leak prevention (valgrind), and precise file descriptor manipulation.",
    github: "https://github.com/paulozombelacardoso"
  },
  {
    id: "ft_irc",
    name: "ft_irc",
    subtitle: "RFC 1459 IRC Server in C++ (42 Luanda)",
    category: "Sistemas & C/C++",
    summary:
      "Real-time chat server built to RFC 1459/2812 IRC specifications, featuring non-blocking I/O multiplexing via poll() syscall.",
    coverImage: "ft_irc/Diagrama de Arquitetura IRC em C++.png",
    problem:
      "Handle dozens of clients simultaneously across network sockets asynchronously, ensuring the server never blocks waiting for user data.",
    architecture:
      "Centralized event loop based on I/O multiplexing (poll()), with an object-oriented C++98 design comprising Server, Client, Channel, and CommandHandler.",
    features: [
      "Password authentication and Nickname/Username registration",
      "Public and private channel creation with specific modes (+i, +t, +k, +o, +l)",
      "Private messaging, broadcast channels, and moderation commands (KICK, INVITE, MODE)",
      "Non-blocking multiplexing for multiple concurrent clients"
    ],
    tech: ["C++98", "TCP/IP Sockets", "Multiplexing (poll)", "IRC Protocol", "Networking"],
    learnings:
      "Low-level TCP/IP network communication, packet fragmentation, and strict implementation of standard communication protocols.",
    github: "https://github.com/paulozombelacardoso"
  },
  {
    id: "cub3d",
    name: "Cub3D",
    subtitle: "Raycasting Graphic Engine in C (42 Luanda)",
    category: "Sistemas & C/C++",
    summary:
      "Interactive real-time 3D graphic engine in C based on the raycasting algorithm, inspired by the classic Wolfenstein 3D game.",
    videoUrl: "Cub3D/cub3D.mp4",
    problem:
      "Project and render an interactive 3D environment from a 2D map grid in real time with a consistently high frame rate.",
    architecture:
      "DDA (Digital Differential Analysis) algorithm for ray-wall intersections, vertical texture mapping by sampling, and camera vector mathematics.",
    features: [
      "Real-time rendering powered by the DDA raycasting algorithm",
      "XPM texture mapping and customizable ceiling and floor colors",
      "Strict map file parser and validator (.cub)",
      "First-person player movement with collision detection"
    ],
    tech: ["C", "Raycasting", "MiniLibX", "Linear Algebra", "Memory Management"],
    learnings:
      "Applied mathematics in computer graphics, pixel buffer optimization, and rigorous memory management in C.",
    github: "https://github.com/paulozombelacardoso"
  }
];

export const experiencesEn: Experience[] = [
  {
    id: "kupala",
    role: "Backend Developer (Freelancer)",
    company: "Kupala Solution",
    period: "06/2024 – Present",
    location: "Luanda, Angola",
    summary:
      "Architected modular backend services, secure REST APIs, and business management systems using NestJS, TypeScript, PostgreSQL, and Docker.",
    bullets: [
      "Designed and implemented modular backend architectures in NestJS and TypeScript for enterprise systems serving local businesses.",
      "Engineered REST APIs with JWT and OAuth2 authentication, following Clean Architecture principles.",
      "Applied security best practices, input validation, and protection against common vulnerabilities such as CSRF.",
      "Modeled and integrated PostgreSQL databases using Prisma ORM, ensuring data integrity and high query throughput.",
      "Containerized applications with Docker, standardizing development environments and streamlining deployments."
    ],
    tech: ["NestJS", "TypeScript", "Node.js", "PostgreSQL", "Prisma ORM", "Docker", "JWT", "OAuth2", "REST APIs"]
  },
  {
    id: "hackathon-tourism",
    role: "Winning Team Member",
    company: "AI for Sustainable Tourism Hackathon",
    period: "2026",
    location: "UNDP & Ministry of Tourism of Angola",
    summary:
      "Key member of the winning team that engineered an AI-powered technological solution to promote sustainable tourism and local economies in Angola.",
    bullets: [
      "Contributed to technical solution design and rapid prototyping of the smart tourism platform.",
      "Designed software architecture and AI recommendation features focused on visitor experience.",
      "Analyzed tourism data and engineered contextual destination recommendation algorithms.",
      "Pitched the solution to an expert jury, winning first place in the competition."
    ],
    tech: ["Artificial Intelligence", "Software Architecture", "Data Analysis", "Agile Prototyping"],
    photos: ["hackton_Turismo/fts/1.jpg", "hackton_Turismo/fts/2.jpg", "hackton_Turismo/fts/3.jpg"],
    certificateFile: "certificates/1785149446894.jpg",
    certificateLabel: "Certificate of Successful Participation — Sustainable Tourism Hackathon"
  },
  {
    id: "tigra-cubs",
    role: "Winning Team Member",
    company: "Tigra Cubs — AI Innovation Bootcamp",
    period: "07/2026",
    location: "Luanda, Angola",
    summary:
      "Member of the winning team in an intensive innovation bootcamp, developing an AI-driven solution selected for business incubation.",
    bullets: [
      "Analyzed technical problems and modeled an AI-supported value proposition.",
      "Directly defined the technical architecture and end-to-end technology pipeline.",
      "Presented the project before an evaluation panel, resulting in incubation selection.",
      "Applied agile product development methodologies in a multidisciplinary team."
    ],
    tech: ["Artificial Intelligence", "Innovation", "Technical Architecture", "Incubation"],
    photos: ["hackton_Tigra/1.jpg", "hackton_Tigra/2.jpg", "hackton_Tigra/3.jpg"],
    certificateFile: "certificates/TigraCubs.jpg",
    certificateLabel: "Tigra Cubs 2026 Certificate — Starts with You"
  }
];

export const educationListEn: EducationItem[] = [
  {
    school: "42 Luanda",
    degree: "Software Engineering",
    period: "In progress",
    description:
      "Intensive practical training focused on real-world projects and collaborative peer-to-peer learning.",
    bullets: [
      "Algorithms, data structures, and low-level programming in C and C++",
      "Unix/Linux operating systems, concurrency, processes, and networking",
      "Software architecture, backend development, and containerization with Docker",
      "Technical autonomy, methodical debugging, and complex problem-solving"
    ]
  },
  {
    school: "Instituto Médio de Economia de Luanda (IMEL)",
    degree: "Associate Degree in Management Informatics",
    period: "Completed",
    description:
      "Technical education combining information technology, business management, and business process organization.",
    bullets: [
      "Relational databases and information system modeling",
      "Computer networks, infrastructure, and systems administration",
      "Programming applied to business management and process automation"
    ]
  }
];

export const certificatesListEn: CertificateItem[] = [
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
    title: "Node.js with Generative AI in Practice",
    issuer: "Specialized Technical Training",
    date: "2026",
    file: "certificates/Certificate_Node.js com IA Generativa na prática.pdf",
    thumbnail: "certificates/thumb_node_ai.jpg"
  },
  {
    id: "cert-turismo",
    title: "Sustainable Tourism Hackathon (Winning Team)",
    issuer: "Government of Angola, MinTur, UNDP, 42 Luanda",
    date: "2026",
    file: "certificates/1785149446894.jpg",
    isImage: true,
    thumbnail: "certificates/1785149446894.jpg"
  },
  {
    id: "cert-tigra",
    title: "Tigra Cubs AI Innovation Bootcamp",
    issuer: "Refriango / Tigra Cubs",
    date: "07/2026",
    file: "certificates/TigraCubs.jpg",
    isImage: true,
    thumbnail: "certificates/TigraCubs.jpg"
  },
  {
    id: "cert-imel",
    title: "Management Informatics Technician Diploma",
    issuer: "Instituto Médio de Economia de Luanda (IMEL)",
    date: "Completed",
    file: "certificates/Certificado_IMEL.pdf",
    thumbnail: "certificates/thumb_imel.jpg"
  },
  {
    id: "cert-time",
    title: "Time Management Professional Certificate",
    issuer: "Professional Development",
    date: "2026",
    file: "certificates/Certificado_Gestão de Tempo.pdf",
    thumbnail: "certificates/thumb_gestao_tempo.jpg"
  },
  {
    id: "cert-42",
    title: "Academic Transcript 42 Luanda",
    issuer: "42 Luanda / 42 Network",
    date: "In progress",
    file: "certificates/42_transcript.pdf",
    thumbnail: "certificates/thumb_42_transcript.jpg"
  }
];
