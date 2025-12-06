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
          © {currentYear} Anders Garberg · {t("codedInReact")} ·{" "}
          <a
            href="https://github.com/andersgar/anders.garberg.wtf"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "underline" }}
          >
            Source Code
          </a>
        </p>
        <p className="small">Trondheim, Norge</p>
      </div>
    </footer>
  );
}
