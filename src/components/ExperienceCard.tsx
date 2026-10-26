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

  const hasPhotos = !!experience.photos?.length || !!experience.certificateFile;

  return (
    <div
      className="exp-item"
      tabIndex={0}
      role="button"
      aria-haspopup="dialog"
      onClick={() => onSelect(experience)}
      onKeyDown={handleKeyDown}
    >
      <div className="exp-meta">
        <span className="exp-period">
          <Calendar size={13} /> {experience.period}
        </span>
        <span className="exp-location">
          <MapPin size={13} /> {experience.location}
        </span>
        {hasPhotos && (
          <span className="exp-has-media" title="Fotografias / Certificado disponíveis">
            <ImageIcon size={12} /> Galeria
          </span>
        )}
      </div>

      <div className="exp-body">
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
      </div>
    </div>
  );
}
