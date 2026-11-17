import { useEffect, useState } from "react";
import {
  getCertificatesList,
  getEducationList,
  getExperiences,
  getProfile,
  getProjects,
  getStackCategories,
  type CertificateItem,
  type EducationItem,
  type Experience,
  type Profile,
  type Project,
  type StackCategory
} from "./data";
import type { Lang } from "./i18n";

export interface CourseItem {
  id: string;
  title: string;
  provider: string;
  type: string;
  date: string;
  description: string;
  url?: string;
  file?: string;
}

export interface PublicationItem {
  id: string;
  title: string;
  type: string;
  publisher: string;
  date: string;
  excerpt: string;
  body: string;
  url?: string;
  coverImage?: string;
}

export interface SectionSetting {
  key: string;
  label: { pt: string; en: string };
  visible: boolean;
  order: number;
}

export interface PortfolioData {
  source: "api" | "static";
  sitePublished: boolean;
  maintenanceMessage?: string;
  profile: Profile;
  stackCategories: StackCategory[];
  projects: Project[];
  experiences: Experience[];
  educationList: EducationItem[];
  certificatesList: CertificateItem[];
  courses: CourseItem[];
  publications: PublicationItem[];
  sections: SectionSetting[] | null;
  seo?: { title?: string; description?: string; ogTitle?: string; ogDescription?: string; ogImage?: string };
}

/** Conteúdo embutido no bundle: usado só se a API não estiver disponível (ex.: deploy estático). */
function staticData(lang: Lang): PortfolioData {
  return {
    source: "static",
    sitePublished: true,
    profile: getProfile(lang),
    stackCategories: getStackCategories(lang),
    projects: getProjects(lang),
    experiences: getExperiences(lang),
    educationList: getEducationList(lang),
    certificatesList: getCertificatesList(lang),
    courses: [],
    publications: [],
    sections: null
  };
}

function fromApi(json: any, lang: Lang): PortfolioData {
  if (json?.sitePublished === false) {
    return { ...staticData(lang), source: "api", sitePublished: false, maintenanceMessage: json.maintenanceMessage, seo: json.seo };
  }
  return {
    source: "api",
    sitePublished: true,
    profile: json.profile,
    stackCategories: json.stackCategories || [],
    projects: json.projects || [],
    experiences: json.experiences || [],
    educationList: json.educationList || [],
    certificatesList: json.certificatesList || [],
    courses: json.courses || [],
    publications: json.publications || [],
    sections: Array.isArray(json.settings?.sections) ? json.settings.sections : null,
    seo: json.seo
  };
}

const cache = new Map<Lang, PortfolioData>();

function setMeta(selector: string, attribute: string, value?: string) {
  if (!value) return;
  const element = document.head.querySelector<HTMLMetaElement>(selector);
  if (element) element.setAttribute(attribute, value);
}

/**
 * Carrega o portfólio a partir da API pública (apenas conteúdo publicado).
 * Enquanto carrega devolve null; se a API falhar, usa o conteúdo estático.
 */
export function usePortfolio(lang: Lang): PortfolioData | null {
  const [data, setData] = useState<PortfolioData | null>(() => cache.get(lang) || null);

  useEffect(() => {
    const cached = cache.get(lang);
    if (cached) setData(cached);
    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    fetch(`/api/public/portfolio?lang=${lang}`, { signal: controller.signal, headers: { Accept: "application/json" } })
      .then((response) => {
        const type = response.headers.get("content-type") || "";
        if (!response.ok || !type.includes("application/json")) throw new Error("API indisponível");
        return response.json();
      })
      .then((json) => {
        if (cancelled) return;
        const result = fromApi(json, lang);
        cache.set(lang, result);
        setData(result);
      })
      .catch(() => {
        if (cancelled) return;
        const fallback = cache.get(lang) || staticData(lang);
        cache.set(lang, fallback);
        setData(fallback);
      })
      .finally(() => clearTimeout(timeout));

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [lang]);

  useEffect(() => {
    if (!data?.seo) return;
    if (data.seo.title) document.title = data.seo.title;
    setMeta('meta[name="description"]', "content", data.seo.description);
    setMeta('meta[property="og:title"]', "content", data.seo.ogTitle || data.seo.title);
    setMeta('meta[property="og:description"]', "content", data.seo.ogDescription || data.seo.description);
  }, [data]);

  return data;
}
