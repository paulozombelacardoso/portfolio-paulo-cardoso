import React from "react";
import { ExternalLink, ChevronRight, Terminal } from "lucide-react";
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
      className="card interactive-card project-card"
      tabIndex={0}
      role="button"
      aria-haspopup="dialog"
      onClick={() => onSelect(project)}
      onKeyDown={handleKeyDown}
    >
      <div className="card-top-meta">
        <span className="card-category-badge">{project.category}</span>
        <span className="card-status-badge">{project.status}</span>
      </div>

      <div className="project-card-header">
        <div className="project-icon-box">
          <Terminal size={18} />
        </div>
        <h3>{project.name}</h3>
      </div>

      <p className="project-summary">{project.summary}</p>

      <div className="tags" aria-label="Tecnologias utilizadas">
        {project.tech.map((t) => (
          <span key={t} className="tag-i">
            {t}
          </span>
        ))}
      </div>

      <div className="card-actions-row">
        <span className="link-action">
          Ver detalhes <ChevronRight size={14} />
        </span>
        {project.github && (
          <a
            className="card-external-link"
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="Repositório no GitHub"
          >
            GitHub <ExternalLink size={13} />
          </a>
        )}
      </div>
    </article>
  );
}
