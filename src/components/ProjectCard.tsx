import React from "react";
import { ExternalLink, ArrowUpRight, Play, Terminal, Layers, Sparkles } from "lucide-react";
import { Project } from "../data";

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
}

export function ProjectCard({ project, onSelect }: ProjectCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(project);
    }
  };

  return (
    <article
      className="project-card"
      tabIndex={0}
      role="button"
      aria-haspopup="dialog"
      onClick={() => onSelect(project)}
      onKeyDown={handleKeyDown}
    >
      <div className="project-thumb-wrap">
        {project.coverImage ? (
          <img
            src={project.coverImage}
            alt={`Capa do projecto ${project.name}`}
            className="project-thumb-img"
            loading="lazy"
          />
        ) : project.videoUrl ? (
          <div className="project-video-preview">
            <video
              src={project.videoUrl}
              muted
              playsInline
              preload="metadata"
              className="project-thumb-video"
            />
            <div className="video-play-hint" aria-hidden="true">
              <Play size={18} fill="currentColor" />
            </div>
          </div>
        ) : (
          <div className="project-thumb-fallback">
            {project.category.includes("C/C++") || project.category.includes("DevOps") ? (
              <Terminal size={32} className="thumb-icon" />
            ) : project.category.includes("IA") ? (
              <Sparkles size={32} className="thumb-icon" />
            ) : (
              <Layers size={32} className="thumb-icon" />
            )}
            <span className="thumb-code-name">&lt;/{project.name}&gt;</span>
          </div>
        )}
        <span className="project-badge">{project.category}</span>
      </div>

      <div className="project-content">
        <div className="project-header">
          <div>
            <h3 className="project-title">{project.name}</h3>
            <p className="project-subtitle">{project.subtitle}</p>
          </div>
          <span className="project-arrow" aria-hidden="true">
            <ArrowUpRight size={18} />
          </span>
        </div>

        <p className="project-desc">{project.summary}</p>

        <div className="project-tags" aria-label="Tecnologias">
          {project.tech.slice(0, 4).map((t) => (
            <span key={t} className="tech-pill">
              {t}
            </span>
          ))}
          {project.tech.length > 4 && (
            <span className="tech-pill more">+{project.tech.length - 4}</span>
          )}
        </div>

        <div className="project-footer">
          <span className="explore-text">Ver detalhes</span>
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="project-github-link"
              onClick={(e) => e.stopPropagation()}
              title="Ver código no GitHub"
            >
              Código <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
