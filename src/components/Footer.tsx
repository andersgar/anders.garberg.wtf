import { useLanguage } from "../context/LanguageContext";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer>
      <div
        className="container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <p className="small">
          © {currentYear} Anders Garberg · {t("allRightsReserved")} ·{" "}
          <a
            href="https://github.com/andersgar/anders.garberg.wtf"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "underline" }}
          >
            {t("viewSource")}
          </a>
        </p>
        <p className="small">{t("location")}</p>
        <p className="small">
          <a href="/terms-privacy.md" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>
            {t("privacyTermsLink")}
          </a>
        </p>
      </div>
    </footer>
  );
}
