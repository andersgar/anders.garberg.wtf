import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import { X } from "@phosphor-icons/react";
import { useMarkdownFile } from "../lib/useMarkdownFile";
import "../styles/markdown-modal.css";

interface MarkdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  mdPath: string;
  title: string;
}

export function MarkdownModal({
  isOpen,
  onClose,
  mdPath,
  title,
}: MarkdownModalProps) {
  const { content, isLoading, error } = useMarkdownFile(mdPath, isOpen);
  const filename = mdPath.split("/").filter(Boolean).pop() ?? mdPath;

  if (!isOpen) return null;

  return createPortal(
    <div className="md-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="md-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="markdownModalTitle"
        aria-describedby="markdownModalBody"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="md-modal__header">
          <div className="md-modal__title">
            <p className="md-modal__eyebrow">{filename}</p>
            <h2 id="markdownModalTitle">{title}</h2>
          </div>
          <button
            type="button"
            className="md-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            <X aria-hidden="true" />
          </button>
        </div>

        <div className="md-modal__content" id="markdownModalBody">
          {isLoading ? (
            // Skeleton shaped like the paragraphs it is standing in for.
            <div className="md-modal__loading" aria-busy="true">
              <span className="md-skeleton" style={{ width: "92%" }} />
              <span className="md-skeleton" style={{ width: "100%" }} />
              <span className="md-skeleton" style={{ width: "78%" }} />
              <span className="md-skeleton" style={{ width: "96%" }} />
              <span className="md-skeleton" style={{ width: "60%" }} />
            </div>
          ) : error ? (
            <div className="md-modal__error">{error}</div>
          ) : (
            <div className="md-markdown">
              <ReactMarkdown
                components={{
                  a: ({ children, ...props }) => (
                    <a {...props} target="_blank" rel="noreferrer noopener">
                      {children}
                    </a>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
