import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";

interface LangText {
  no: string;
  en: string;
}

interface Position {
  title: LangText;
  tag: LangText;
  date: LangText;
  desc: LangText;
}

interface Company {
  company: LangText;
  location: LangText;
  positions: Position[];
}

export function Experience() {
  const { t, lang } = useLanguage();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetch("/data/experience.json")
      .then((res) => res.json())
      .then((data) => setCompanies(data))
      .catch((err) => console.error("Failed to load experience data:", err));
  }, []);

  const getText = (obj: LangText): string => {
    return lang === "en" ? obj.en : obj.no;
  };

  return (
    <section id="experience">
      <h2 className="section-title">{t("experience")}</h2>
      <div className="card pad">
        <div
          className={`timeline-container ${isExpanded ? "expanded" : "collapsed"}`}
        >
          <div className="timeline" id="timeline">
            {companies.map((company, idx) => (
              <div className="step" key={idx}>
                <div className="dot" aria-hidden="true"></div>
                <div>
                  <span className="company">{getText(company.company)}</span>
                  <p className="small">{getText(company.location)}</p>
                  <div className="nested-positions">
                    {company.positions.map((pos, posIdx) => (
                      <div className="position" key={posIdx}>
                        <span className="position-title">
                          <h4>{getText(pos.title)}</h4>
                          <span className="tag">{getText(pos.tag)}</span>
                        </span>
                        <div className="date">{getText(pos.date)}</div>
                        <div className="desc">{getText(pos.desc)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {!isExpanded && <div className="timeline-fade" />}
        </div>
        <button
          className="timeline-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
        >
          <span>{isExpanded ? t("showLessExperience") : t("showMoreExperience")}</span>
          <i
            className={`fa-solid fa-chevron-${isExpanded ? "up" : "down"}`}
            aria-hidden="true"
          />
        </button>
      </div>
    </section>
  );
}
