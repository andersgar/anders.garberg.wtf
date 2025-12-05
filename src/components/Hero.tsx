import { useLanguage } from "../context/LanguageContext";
import { translations } from "../i18n/translations";

export function Hero() {
  const { t, lang } = useLanguage();

  return (
    <header id="home" className="hero">
      <div className="container hero-wrap">
        <div className="hero-left">
          <p className="pill">
            <i className="fa-solid fa-graduation-cap"></i>
            <span>{t("degreeProgram")}</span>
          </p>
          <h1>
            <span>{t("greeting")}</span>{" "}
            <span style={{ color: "var(--brand)" }}>Anders Garberg</span>
          </h1>
          <div style={{ height: "1rem" }}></div>
          <div className="hero-cta">
            <a className="btn" href="#projects">
              {t("seeProjects")}
            </a>
            <a className="btn ghost" href="#contact">
              {t("getInTouch")}
            </a>
          </div>
          <div className="row" style={{ marginTop: "12px" }}>
            <span className="tag">{t("controlSystems")}</span>
            <span className="tag">{t("modeling")}</span>
            <span className="tag">{t("physics")}</span>
            <span className="tag">C++</span>
          </div>
        </div>

        <aside
          className="hero-right card pad hero-card"
          aria-label="Rask profil"
        >
          <div
            className="row"
            style={{ justifyContent: "space-between", alignItems: "center" }}
          >
            <strong>{t("openToInternships")}</strong>
            <div className="icons">
              <a
                className="icon-btn"
                href="https://github.com/andersgar"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="GitHub"
              >
                <i className="fa-brands fa-github" aria-hidden="true"></i>
              </a>
              <a
                className="icon-btn"
                href="https://www.linkedin.com/in/anders-garberg-4214ba383"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="LinkedIn"
              >
                <i className="fa-brands fa-linkedin" aria-hidden="true"></i>
              </a>
              <a
                className="icon-btn"
                href="mailto:anders@garberg.wtf"
                aria-label="E-post"
              >
                <i className="fa-solid fa-envelope" aria-hidden="true"></i>
              </a>
            </div>
          </div>
          <p className="small">{t("heroDescription")}</p>
          <div className="row">
            <a className="btn" href={translations[lang].cv} download>
              {t("downloadCV")}
            </a>
            <a className="btn ghost" href="#contact">
              {t("emailMe")}
            </a>
          </div>
        </aside>
      </div>
    </header>
  );
}
