import { useLanguage } from "../context/LanguageContext";

export function About() {
  const { t } = useLanguage();

  return (
    <section id="about">
      <h2 className="section-title">{t("about")}</h2>
      <div className="grid cols-2">
        <div className="card pad">
          <p>{t("aboutText1")}</p>
        </div>
        <div className="card pad">
          <h3 style={{ marginTop: 0 }}>{t("highlights")}</h3>
          <ul>
            <li>{t("highlight1")}</li>
            <li>{t("highlight2")}</li>
            <li>{t("highlight3")}</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
