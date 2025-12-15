import ReactMarkdown from "react-markdown";
import { useLanguage } from "../context/LanguageContext";
import { useMarkdownFile } from "../lib/useMarkdownFile";
import "../styles/terms-privacy-modal.css";

interface TermsPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  mdPath?: string;
}

export function TermsPrivacyModal({
  isOpen,
  onClose,
  mdPath = "/terms-privacy.md",
}: TermsPrivacyModalProps) {
  const { t } = useLanguage();
  const { content, isLoading, error } = useMarkdownFile(mdPath, isOpen);

  if (!isOpen) return null;

  return (
    <div className="terms-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="terms-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="termsModalTitle"
        aria-describedby="termsModalBody"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="terms-modal__header">
          <div className="terms-modal__title">
            <p className="terms-modal__eyebrow">{t("privacyTermsLink")}</p>
            <h2 id="termsModalTitle">{t("privacyTermsLink")}</h2>
          </div>
          <button
            type="button"
            className="terms-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>

        <div className="terms-modal__content" id="termsModalBody">
          {isLoading ? (
            <div className="terms-modal__loading">
              <i className="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
              <span>Loading...</span>
            </div>
          ) : error ? (
            <div className="terms-modal__error">{error}</div>
          ) : (
            <div className="terms-markdown">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
