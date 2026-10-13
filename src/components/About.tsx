import { useLanguage } from "../context/LanguageContext";
import { SKILL_GROUPS } from "../data/skills";

export function About() {
  const { t, lang } = useLanguage();

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
            {SKILL_GROUPS.map((group) => (
              <div className="skill-group" key={group.label.en}>
                <p className="skill-label">{group.label[lang]}</p>
                <div className="row">
                  {group.items.map((item) => (
                    <span className="tag" key={item.en}>
                      {item[lang]}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
