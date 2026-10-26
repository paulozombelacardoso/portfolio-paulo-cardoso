import React, { useState } from "react";
import { FolderGit2, ExternalLink, Info, Code2 } from "lucide-react";
import { ftResources, FTResource } from "../data";
import { DetailModal } from "./DetailModal";

export function FTResourcesSection() {
  const [selected, setSelected] = useState<FTResource | null>(null);

  return (
    <section id="ft-resources" className="section-ft">
      <div className="section-head">
        <div className="head-badge">Formação Prática 42</div>
        <h2>Recursos & Projectos 42</h2>
        <p className="lead">
          Acesso aos projectos e especificações desenvolvidos durante a formação em Engenharia de Software na 42 Luanda.
        </p>
      </div>

      <div className="grid ft-grid">
        {ftResources.map((res) => (
          <article key={res.id} className="card ft-card">
            <div className="ft-card-top">
              <span className="card-category-badge">{res.category}</span>
              <span className="card-type-badge">{res.type}</span>
            </div>

            <div className="ft-card-title-row">
              <div className="ft-icon-box">
                <FolderGit2 size={18} />
              </div>
              <h3>{res.title}</h3>
            </div>

            <p className="ft-card-desc">{res.description}</p>

            <div className="tags">
              {res.tech.map((t) => (
                <span key={t} className="tag-i">
                  {t}
                </span>
              ))}
            </div>

            <div className="card-actions-row">
              <button
                className="link"
                onClick={() => setSelected(res)}
                aria-label={`Ver documentação técnica de ${res.title}`}
              >
                <Info size={14} /> Documentação
              </button>
              {res.link && (
                <a
                  className="link"
                  href={res.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Aceder a ${res.title}`}
                >
                  <Code2 size={14} /> Repositório <ExternalLink size={12} />
                </a>
              )}
            </div>
          </article>
        ))}
      </div>

      {selected && (
        <DetailModal
          isOpen={true}
          onClose={() => setSelected(null)}
          title={selected.title}
          badge={selected.category}
          subtitle={selected.type}
        >
          <div className="modal-section">
            <h4>Visão Geral</h4>
            <p>{selected.description}</p>
          </div>

          <div className="modal-section">
            <h4>Detalhes Técnicos & Padrões 42</h4>
            <p>{selected.details}</p>
          </div>

          <div className="modal-section">
            <h4>Tecnologias & Ferramentas</h4>
            <div className="tags">
              {selected.tech.map((t) => (
                <span key={t} className="tag-i featured">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            {selected.link && (
              <a
                className="btn solid"
                href={selected.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver Repositório no GitHub <ExternalLink size={14} />
              </a>
            )}
            <button className="btn" onClick={() => setSelected(null)}>
              Fechar
            </button>
          </div>
        </DetailModal>
      )}
    </section>
  );
}
