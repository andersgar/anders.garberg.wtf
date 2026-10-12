import { useLanguage } from "../context/LanguageContext";

export function About() {
  const { t } = useLanguage();

  return (
    <section id="about">
      <div className="container">
        <h2 className="section-title">{t("about")}</h2>
        <div className="about-grid">
          <div className="about-prose box">
            <p>{t("aboutText1")}</p>
            <p>{t("aboutText2")}</p>
          </div>
          <div className="about-facts box">
            <h3>{t("highlights")}</h3>
            <ul>
              <li>{t("highlight1")}</li>
              <li>{t("highlight2")}</li>
              <li>{t("highlight3")}</li>
              <li>{t("highlight4")}</li>
            </ul>
            <h3>{t("skills")}</h3>
            <div className="row">
              <span className="tag">{t("controlSystems")}</span>
              <span className="tag">{t("robotics")}</span>
              <span className="tag">{t("autonomy")}</span>
              <span className="tag">C++</span>
              <span className="tag">Python</span>
              <span className="tag">ROS 2</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
