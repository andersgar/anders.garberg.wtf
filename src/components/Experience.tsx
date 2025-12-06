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
  planned?: boolean;
}

interface Company {
  company: LangText;
  location: LangText;
  positions: Position[];
}

interface Institution {
  institution: LangText;
  location: LangText;
  degrees: Position[];
}

export function Experience() {
  const { t, lang } = useLanguage();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isExperienceExpanded, setIsExperienceExpanded] = useState(false);
  const [isEducationExpanded, setIsEducationExpanded] = useState(false);

  useEffect(() => {
    fetch("/data/experience.json")
      .then((res) => res.json())
      .then((data) => setCompanies(data))
      .catch((err) => console.error("Failed to load experience data:", err));

    fetch("/data/education.json")
      .then((res) => res.json())
      .then((data) => setInstitutions(data))
      .catch((err) => console.error("Failed to load education data:", err));
  }, []);

  const getText = (obj: LangText): string => {
    return lang === "en" ? obj.en : obj.no;
  };

  return (
    <>
      <section id="experience">
        <h2 className="section-title">{t("experience")}</h2>
        <div className="card pad">
          <div
            className={`timeline-container ${
              isExperienceExpanded ? "expanded" : "collapsed"
            }`}
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
            {!isExperienceExpanded && <div className="timeline-fade" />}
          </div>
          <button
            className="timeline-toggle"
            onClick={() => setIsExperienceExpanded(!isExperienceExpanded)}
            aria-expanded={isExperienceExpanded}
          >
            <span>
              {isExperienceExpanded
                ? t("showLessExperience")
                : t("showMoreExperience")}
            </span>
            <i
              className={`fa-solid fa-chevron-${isExperienceExpanded ? "up" : "down"}`}
              aria-hidden="true"
            />
          </button>
        </div>
      </section>

      <section id="education">
        <h2 className="section-title">{t("education")}</h2>
        <div className="card pad">
          <div
            className={`timeline-container ${
              isEducationExpanded ? "expanded" : "collapsed"
            }`}
          >
            <div className="timeline" id="timeline-education">
              {institutions.map((institution, idx) => (
                <div className="step" key={idx}>
                  <div className="dot" aria-hidden="true"></div>
                  <div>
                    <span className="company">
                      {getText(institution.institution)}
                    </span>
                    <p className="small">{getText(institution.location)}</p>
                    <div className="nested-positions">
                      {institution.degrees.map((degree, degIdx) => (
                        <div
                          className={`position ${degree.planned ? "planned" : ""}`}
                          key={degIdx}
                        >
                          <span className="position-title">
                            <h4>{getText(degree.title)}</h4>
                            <span className="tag">{getText(degree.tag)}</span>
                          </span>
                          <div className="date">{getText(degree.date)}</div>
                          <div className="desc">{getText(degree.desc)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {!isEducationExpanded && <div className="timeline-fade" />}
          </div>
          <button
            className="timeline-toggle"
            onClick={() => setIsEducationExpanded(!isEducationExpanded)}
            aria-expanded={isEducationExpanded}
          >
            <span>
              {isEducationExpanded
                ? t("showLessEducation")
                : t("showMoreEducation")}
            </span>
            <i
              className={`fa-solid fa-chevron-${isEducationExpanded ? "up" : "down"}`}
              aria-hidden="true"
            />
          </button>
        </div>
      </section>
    </>
  );
}
