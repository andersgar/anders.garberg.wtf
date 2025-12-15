import ReactMarkdown from "react-markdown";
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

  return (
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
            <i className="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>

        <div className="md-modal__content" id="markdownModalBody">
          {isLoading ? (
            <div className="md-modal__loading">
              <i className="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
              <span>Loading...</span>
            </div>
          ) : error ? (
            <div className="md-modal__error">{error}</div>
          ) : (
            <div className="md-markdown">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
