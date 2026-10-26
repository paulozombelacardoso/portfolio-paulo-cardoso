import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  badge?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function DetailModal({
  isOpen,
  onClose,
  title,
  badge,
  subtitle,
  children
}: DetailModalProps) {
  const modalContentRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="modal-content"
        ref={modalContentRef}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeBtnRef}
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Fechar"
          title="Fechar (Esc)"
        >
          <X size={18} />
        </button>

        <header className="modal-header">
          <div className="modal-title-row">
            <h2>{title}</h2>
            {badge && <span className="modal-badge">{badge}</span>}
          </div>
          {subtitle && <p className="modal-subtitle">{subtitle}</p>}
        </header>

        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
