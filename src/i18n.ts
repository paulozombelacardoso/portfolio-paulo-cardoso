export type Lang = "pt" | "en";

export interface Translations {
  nav: {
    home: string;
    about: string;
    stack: string;
    projects: string;
    experience: string;
    education: string;
    contact: string;
  };
  hero: {
    badge: string;
    viewProjects: string;
    downloadCv: string;
  };
  about: {
    kicker: string;
    title: string;
    lead: string;
    text: string;
    meta1Title: string;
    meta1Desc: string;
    meta2Title: string;
    meta2Desc: string;
    meta3Title: string;
    meta3Desc: string;
  };
  stack: {
    kicker: string;
    title: string;
    desc: string;
  };
  projects: {
    kicker: string;
    title: string;
    desc: string;
    viewDetails: string;
    code: string;
    videoDemo: string;
    overview: string;
    problem: string;
    architecture: string;
    features: string;
    tech: string;
    learnings: string;
    viewGithub: string;
    close: string;
  };
  experience: {
    kicker: string;
    title: string;
    desc: string;
    galleryHeading: string;
    clickToEnlarge: string;
    certHeading: string;
    overview: string;
    responsibilities: string;
    skills: string;
    close: string;
    viewDetailsGallery: (count: number) => string;
    viewDetailsComplete: string;
    photosBadge: (current: number, total: number) => string;
    viewAllPhotos: string;
    photoUnitSingle: string;
    photoUnitPlural: string;
  };
  education: {
    kicker: string;
    title: string;
    certsHeading: string;
    confirmed: string;
    viewDoc: string;
    openOriginal: string;
    download: string;
    close: string;
  };
  contact: {
    kicker: string;
    title: string;
    desc: string;
    directTitle: string;
    directSub: string;
    emailLabel: string;
    phoneLabel: string;
    locationLabel: string;
    profilesTitle: string;
    formTitle: string;
    formSub: string;
    nameLabel: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    submitBtn: string;
    nameError: string;
    emailError: string;
    messageError: string;
    emailSubject: (name: string) => string;
    emailBodyFrom: (name: string, email: string) => string;
  };
  footer: {
    rights: string;
    backToTop: string;
  };
}

export const translations: Record<Lang, Translations> = {
  pt: {
    nav: {
      home: "Início",
      about: "Sobre",
      stack: "Stack",
      projects: "Projectos",
      experience: "Experiência",
      education: "Formação",
      contact: "Contacto"
    },
    hero: {
      badge: "Software Engineer • 42 Luanda",
      viewProjects: "Ver projectos",
      downloadCv: "Descarregar CV"
    },
    about: {
      kicker: "Trajectória",
      title: "Sobre mim",
      lead:
        "A minha formação conjuga a disciplina e organização da Informática de Gestão no IMEL com a exigência técnica, autonomia e resolução contínua de problemas da 42 Luanda.",
      text:
        "Foco-me no desenvolvimento backend estruturado com NestJS, TypeScript e PostgreSQL, infraestrutura e conteinerização com Docker, e sistemas Unix/Linux de baixo nível em C e C++. Integro também modelos de Inteligência Artificial (APIs Gemini e Anthropic) para enriquecer aplicações reais com pesquisa semântica e processamento de linguagem natural.",
      meta1Title: "Backend & APIs",
      meta1Desc: "Arquitecturas modulares, autenticação JWT/OAuth2 e Clean Architecture.",
      meta2Title: "DevOps & Linux",
      meta2Desc: "Ambientes Docker multi-serviços, redes POSIX e administração de servidores.",
      meta3Title: "Inteligência Artificial",
      meta3Desc: "Pesquisa semântica, engenharia de prompts e participação premiada em hackathons."
    },
    stack: {
      kicker: "Competências",
      title: "Stack tecnológica",
      desc:
        "Tecnologias e ferramentas que utilizo no desenvolvimento diário de software, infraestruturas e APIs."
    },
    projects: {
      kicker: "Trabalho Real",
      title: "Projectos em destaque",
      desc:
        "Seleção de sistemas, infraestruturas e aplicações full-stack com decisões de engenharia documentadas. Clique num projecto para ver detalhes, demonstrações em vídeo e arquitectura.",
      viewDetails: "Ver detalhes",
      code: "Código",
      videoDemo: "Demonstração em Vídeo",
      overview: "Visão Geral",
      problem: "Problema & Objectivo",
      architecture: "Arquitectura & Decisões Técnicas",
      features: "Funcionalidades Implementadas",
      tech: "Tecnologias Utilizadas",
      learnings: "Principais Aprendizagens",
      viewGithub: "Ver Repositório no GitHub",
      close: "Fechar"
    },
    experience: {
      kicker: "Carreira & Inovação",
      title: "Experiência profissional",
      desc:
        "Desenvolvimento backend no sector privado e liderança técnica em equipas vencedoras de hackathons de inteligência artificial.",
      galleryHeading: "Registo Fotográfico",
      clickToEnlarge: "Clique numa foto para ampliar",
      certHeading: "Certificado Oficial da Conquista",
      overview: "Resumo da Actuação",
      responsibilities: "Responsabilidades & Realizações Técnicas",
      skills: "Competências Aplicadas",
      close: "Fechar",
      viewDetailsGallery: (count) =>
        `Ver detalhes e galeria (${count} ${count === 1 ? "foto" : "fotos"})`,
      viewDetailsComplete: "Ver detalhes completos",
      photosBadge: (current, total) => `${current}/${total} fotos`,
      viewAllPhotos: "Ver todas as fotos",
      photoUnitSingle: "foto",
      photoUnitPlural: "fotos"
    },
    education: {
      kicker: "Educação Contínua",
      title: "Formação e certificados",
      certsHeading: "Certificações e Documentos Confirmados",
      confirmed: "Confirmado",
      viewDoc: "Ver documento",
      openOriginal: "Abrir documento original",
      download: "Descarregar",
      close: "Fechar"
    },
    contact: {
      kicker: "Comunicação",
      title: "Contacto",
      desc:
        "Tem um projecto em mente ou procura um Software Engineer para a sua equipa? Estou disponível para colaborar.",
      directTitle: "Canais Directos",
      directSub: "Respondo rapidamente através de qualquer uma das vias abaixo:",
      emailLabel: "Email Principal",
      phoneLabel: "Telefone / WhatsApp",
      locationLabel: "Localização",
      profilesTitle: "Perfis em Plataformas Técnicas",
      formTitle: "Envie uma Mensagem",
      formSub: "Abre o seu cliente de email com a mensagem pronta a enviar.",
      nameLabel: "Nome",
      namePlaceholder: "O seu nome ou empresa",
      emailPlaceholder: "seu.email@exemplo.com",
      messageLabel: "Mensagem",
      messagePlaceholder: "Descreva a sua proposta, projecto ou questão...",
      submitBtn: "Enviar Mensagem por Email",
      nameError: "Por favor, indique o seu nome.",
      emailError: "Por favor, indique um email válido.",
      messageError: "A mensagem deve conter pelo menos 10 caracteres.",
      emailSubject: (name) => `Contacto de ${name} via Portefólio`,
      emailBodyFrom: (name, email) => `De: ${name} (${email})`
    },
    footer: {
      rights: "Todos os direitos reservados.",
      backToTop: "Voltar ao topo"
    }
  },
  en: {
    nav: {
      home: "Home",
      about: "About",
      stack: "Stack",
      projects: "Projects",
      experience: "Experience",
      education: "Education",
      contact: "Contact"
    },
    hero: {
      badge: "Software Engineer • 42 Luanda",
      viewProjects: "View projects",
      downloadCv: "Download CV"
    },
    about: {
      kicker: "Background",
      title: "About me",
      lead:
        "My background combines the discipline and organization of Management Informatics at IMEL with the technical rigor, autonomy, and continuous problem-solving of 42 Luanda.",
      text:
        "I focus on structured backend development with NestJS, TypeScript, and PostgreSQL, infrastructure and containerization with Docker, and low-level Unix/Linux systems in C and C++. I also integrate Artificial Intelligence models (Gemini and Anthropic APIs) to enhance real-world applications with semantic search and natural language processing.",
      meta1Title: "Backend & APIs",
      meta1Desc: "Modular architectures, JWT/OAuth2 authentication, and Clean Architecture.",
      meta2Title: "DevOps & Linux",
      meta2Desc: "Multi-service Docker environments, POSIX networking, and server administration.",
      meta3Title: "Artificial Intelligence",
      meta3Desc: "Semantic search, prompt engineering, and award-winning hackathon solutions."
    },
    stack: {
      kicker: "Skills",
      title: "Tech stack",
      desc:
        "Technologies and tools I use in daily software development, infrastructure, and APIs."
    },
    projects: {
      kicker: "Real-world Work",
      title: "Featured projects",
      desc:
        "Curated selection of systems, infrastructure, and full-stack applications with documented engineering decisions. Click on a project to view details, video demos, and architecture.",
      viewDetails: "View details",
      code: "Code",
      videoDemo: "Video Demo",
      overview: "Overview",
      problem: "Problem & Goal",
      architecture: "Architecture & Technical Decisions",
      features: "Key Features",
      tech: "Technologies Used",
      learnings: "Key Learnings",
      viewGithub: "View GitHub Repository",
      close: "Close"
    },
    experience: {
      kicker: "Career & Innovation",
      title: "Professional experience",
      desc:
        "Backend development in the private sector and technical leadership in award-winning artificial intelligence hackathons.",
      galleryHeading: "Photo Gallery",
      clickToEnlarge: "Click on a photo to enlarge",
      certHeading: "Official Certificate of Achievement",
      overview: "Role Summary",
      responsibilities: "Responsibilities & Technical Achievements",
      skills: "Applied Skills",
      close: "Close",
      viewDetailsGallery: (count) =>
        `View details and gallery (${count} ${count === 1 ? "photo" : "photos"})`,
      viewDetailsComplete: "View full details",
      photosBadge: (current, total) => `${current}/${total} photos`,
      viewAllPhotos: "View all photos",
      photoUnitSingle: "photo",
      photoUnitPlural: "photos"
    },
    education: {
      kicker: "Lifelong Learning",
      title: "Education & certificates",
      certsHeading: "Certifications & Confirmed Documents",
      confirmed: "Verified",
      viewDoc: "View document",
      openOriginal: "Open original document",
      download: "Download",
      close: "Close"
    },
    contact: {
      kicker: "Communication",
      title: "Contact",
      desc:
        "Have a project in mind or looking for a Software Engineer for your team? I'm available to collaborate.",
      directTitle: "Direct Channels",
      directSub: "I respond quickly through any of the channels below:",
      emailLabel: "Primary Email",
      phoneLabel: "Phone / WhatsApp",
      locationLabel: "Location",
      profilesTitle: "Profiles on Technical Platforms",
      formTitle: "Send a Message",
      formSub: "Opens your email client with the message ready to send.",
      nameLabel: "Name",
      namePlaceholder: "Your name or company",
      emailPlaceholder: "your.email@example.com",
      messageLabel: "Message",
      messagePlaceholder: "Describe your proposal, project, or inquiry...",
      submitBtn: "Send Message via Email",
      nameError: "Please provide your name.",
      emailError: "Please provide a valid email address.",
      messageError: "The message must contain at least 10 characters.",
      emailSubject: (name) => `Inquiry from ${name} via Portfolio`,
      emailBodyFrom: (name, email) => `From: ${name} (${email})`
    },
    footer: {
      rights: "All rights reserved.",
      backToTop: "Back to top"
    }
  }
};
