import { useLanguage } from "../context/LanguageContext";
import { useMarkdownModal } from "./useMarkdownModal";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();
  const termsModal = useMarkdownModal("/terms-privacy.md", t("privacyTermsLink"));

  return (
    <footer>
      <div className="container footer-inner">
        <p className="small">
          &copy; {currentYear} Anders Garberg &middot; {t("allRightsReserved")}{" "}
          &middot;{" "}
          <a
            href="https://github.com/andersgar/anders.garberg.wtf"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            {t("viewSource")}
          </a>
        </p>
        <p className="small">
          <button
            type="button"
            className="link-button"
            onClick={termsModal.open}
          >
            {t("privacyTermsLink")}
          </button>
        </p>
      </div>
      {termsModal.modal}
    </footer>
  );
}
