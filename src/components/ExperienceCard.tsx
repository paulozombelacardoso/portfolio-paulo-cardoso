import React from "react";
import { ArrowUpRight, Calendar, MapPin, Image as ImageIcon } from "lucide-react";
import { Experience } from "../data";

interface ExperienceCardProps {
  experience: Experience;
  onSelect: (exp: Experience) => void;
}

export function ExperienceCard({ experience, onSelect }: ExperienceCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(experience);
    }
  };

  const coverPhoto = experience.photos?.[0];
  const photoCount = experience.photos?.length || 0;

  return (
    <article
      className={`exp-item ${coverPhoto ? "has-thumb" : ""}`}
      tabIndex={0}
      role="button"
      aria-haspopup="dialog"
      onClick={() => onSelect(experience)}
      onKeyDown={handleKeyDown}
    >
      <div className="exp-content-grid">
        <div className="exp-body">
          <div className="exp-meta">
            <span className="exp-period">
              <Calendar size={13} /> {experience.period}
            </span>
            <span className="exp-location">
              <MapPin size={13} /> {experience.location}
            </span>
            {photoCount > 0 && (
              <span className="exp-has-media" title="Fotografias disponíveis">
                <ImageIcon size={12} /> {photoCount} {photoCount === 1 ? "foto" : "fotos"}
              </span>
            )}
          </div>

          <div className="exp-header">
            <div>
              <h3 className="exp-role">{experience.role}</h3>
              <h4 className="exp-company">{experience.company}</h4>
            </div>
            <span className="exp-arrow" aria-hidden="true">
              <ArrowUpRight size={18} />
            </span>
          </div>

          <p className="exp-desc">{experience.summary}</p>

          <div className="exp-tags">
            {experience.tech.slice(0, 5).map((t) => (
              <span key={t} className="tech-pill">
                {t}
              </span>
            ))}
            {experience.tech.length > 5 && (
              <span className="tech-pill more">+{experience.tech.length - 5}</span>
            )}
          </div>

          <div className="exp-card-footer">
            <span className="exp-cta">
              {photoCount > 0
                ? `Ver detalhes e galeria (${photoCount} ${photoCount === 1 ? "foto" : "fotos"})`
                : "Ver detalhes completos"}
            </span>
          </div>
        </div>

        {coverPhoto && (
          <div className="exp-thumb-col">
            <div className="exp-thumb-box">
              <img
                src={coverPhoto}
                alt={`Registo fotográfico de ${experience.company}`}
                className="exp-thumb-img"
                loading="lazy"
              />
              <div className="exp-thumb-badge">
                <ImageIcon size={12} />
                <span>{photoCount > 1 ? `1/${photoCount} fotos` : "1 foto"}</span>
              </div>
              <div className="exp-thumb-overlay" aria-hidden="true">
                <span>Ver todas as fotos</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
