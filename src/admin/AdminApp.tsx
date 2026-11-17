import React, { useEffect, useState } from "react";
import { BrowserRouter, NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import {
  Award,
  BookOpen,
  Briefcase,
  ExternalLink,
  FileText,
  FolderKanban,
  GraduationCap,
  Images,
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  Monitor,
  Moon,
  Newspaper,
  Settings,
  Sun,
  Tags,
  User,
  UserCog,
  X,
  type LucideIcon
} from "lucide-react";
import { api, onUnauthorized } from "./api";
import { resources } from "./resources";
import { ResourcePage } from "./ResourcePage";
import {
  AccountPage,
  CvPage,
  DashboardPage,
  LoginPage,
  MediaPage,
  ProfilePage,
  SettingsPage,
  type AdminUser
} from "./pages";
import { ConfirmProvider, Spinner, ToastProvider, useConfirm } from "./ui";
import "./admin.css";

type Theme = "system" | "light" | "dark";

/** Mesmo mecanismo de tema do portfólio (localStorage "theme" + data-theme). */
function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return (localStorage.getItem("theme") as Theme) || "dark";
    } catch {
      return "dark";
    }
  });
  useEffect(() => {
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.dataset.theme = theme === "dark" || (theme === "system" && mq.matches) ? "dark" : "light";
    };
    apply();
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* ignore */
    }
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);
  return [theme, setTheme] as const;
}

const icons: Record<string, LucideIcon> = {
  projects: FolderKanban,
  experiences: Briefcase,
  certifications: Award,
  education: GraduationCap,
  courses: BookOpen,
  publications: Newspaper,
  skills: Tags,
  "skill-categories": Layers
};

const navGroups = [
  {
    title: "Geral",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/profile", label: "Perfil", icon: User },
      { to: "/cv", label: "CV", icon: FileText }
    ]
  },
  {
    title: "Conteúdo",
    items: resources.map((resource) => ({ to: `/${resource.key}`, label: resource.label, icon: icons[resource.key] || Layers }))
  },
  {
    title: "Sistema",
    items: [
      { to: "/media", label: "Media", icon: Images },
      { to: "/settings", label: "Configurações", icon: Settings },
      { to: "/account", label: "Conta", icon: UserCog }
    ]
  }
];

function Shell({ user, onLogout }: { user: AdminUser; onLogout: () => void }) {
  const [theme, setTheme] = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const confirm = useConfirm();
  const ThemeIcon = theme === "system" ? Monitor : theme === "light" ? Sun : Moon;

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const logout = async () => {
    const ok = await confirm({ title: "Terminar sessão?", confirmLabel: "Sair" });
    if (!ok) return;
    await api.post("/admin/auth/logout").catch(() => undefined);
    onLogout();
  };

  return (
    <div className="adm-shell">
      <header className="top adm-top">
        <div className="adm-top-left">
          <button className="icon-btn adm-burger" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen}>
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <NavLink to="/" className="logo" aria-label="Dashboard">
            <span className="mark">&lt;P&gt;</span>
            <span className="logo-name">ADMIN</span>
          </NavLink>
        </div>
        <div className="tools">
          <a className="btn outline adm-btn-sm adm-hide-sm" href="/" target="_blank" rel="noopener noreferrer">
            <ExternalLink size={13} /> Ver site
          </a>
          <button
            className="icon-btn"
            onClick={() => setTheme(theme === "dark" ? "light" : theme === "light" ? "system" : "dark")}
            aria-label={`Mudar tema (actual: ${theme})`}
            title={`Tema: ${theme}`}
          >
            <ThemeIcon size={16} />
          </button>
          <button className="icon-btn" onClick={logout} aria-label="Terminar sessão" title="Terminar sessão">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <aside className={`adm-sidebar ${menuOpen ? "open" : ""}`} aria-label="Navegação do painel">
        {navGroups.map((group) => (
          <div className="adm-nav-group" key={group.title}>
            <span className="adm-nav-title">{group.title}</span>
            {group.items.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === "/"} className={({ isActive }) => `adm-nav-link ${isActive ? "act" : ""}`}>
                <item.icon size={15} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
        <div className="adm-sidebar-user">
          <strong>{user.name}</strong>
          <span className="adm-muted">{user.email}</span>
        </div>
      </aside>
      {menuOpen && <div className="adm-sidebar-backdrop" onClick={() => setMenuOpen(false)} />}

      <main className="adm-main">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/cv" element={<CvPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/media" element={<MediaPage />} />
          <Route path="/account" element={<AccountPage user={user} />} />
          {resources.map((resource) => (
            <Route key={resource.key} path={`/${resource.key}`} element={<ResourcePage def={resource} />} />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function AuthGate() {
  const [user, setUser] = useState<AdminUser | null | undefined>(undefined);
  useTheme();

  useEffect(() => {
    document.title = "Admin — Paulo Cardoso";
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    api
      .get<{ user: AdminUser }>("/admin/auth/me")
      .then((result) => setUser(result.user))
      .catch(() => setUser(null));
    const off = onUnauthorized(() => setUser(null));
    return () => {
      off();
      meta.remove();
    };
  }, []);

  if (user === undefined) {
    return (
      <div className="adm-login">
        <Spinner label="A verificar sessão…" />
      </div>
    );
  }
  if (!user) return <LoginPage onLogin={setUser} />;
  return <Shell user={user} onLogout={() => setUser(null)} />;
}

export default function AdminApp() {
  return (
    <BrowserRouter basename="/admin">
      <ToastProvider>
        <ConfirmProvider>
          <AuthGate />
        </ConfirmProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
