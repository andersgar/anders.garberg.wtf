import { useState, useEffect } from "react";
import { CaretDown, CaretUp } from "@phosphor-icons/react";
import { useLanguage } from "../context/LanguageContext";
import { ClampText } from "./ClampText";

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
  /** Set to true in experience.json to keep an entry in the file but off the site. */
  hidden?: boolean;
}

interface Institution {
  institution: LangText;
  location: LangText;
  degrees: Position[];
  hidden?: boolean;
}

/** How many entries each list shows before "Show more". Whole boxes only:
 *  collapsing by count means a rectangle is never cut mid-way. */
const EXPERIENCE_PREVIEW = 2;
const EDUCATION_PREVIEW = 1;

/** Date ranges in the data use en-dashes; the design uses a plain hyphen. */
const formatDate = (value: string) => value.replace(/\s*[–—]\s*/g, " - ");

export function Experience() {
  const { t, lang } = useLanguage();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isExperienceExpanded, setIsExperienceExpanded] = useState(false);
  const [isEducationExpanded, setIsEducationExpanded] = useState(false);

  useEffect(() => {
    fetch("/data/experience.json")
      .then((res) => res.json())
      .then((data: Company[]) => setCompanies(data.filter((c) => !c.hidden)))
      .catch((err) => console.error("Failed to load experience data:", err));

    fetch("/data/education.json")
      .then((res) => res.json())
      .then((data: Institution[]) =>
        setInstitutions(data.filter((i) => !i.hidden))
      )
      .catch((err) => console.error("Failed to load education data:", err));
  }, []);

  const getText = (obj: LangText): string => {
    return lang === "en" ? obj.en : obj.no;
  };

  const visibleCompanies = isExperienceExpanded
    ? companies
    : companies.slice(0, EXPERIENCE_PREVIEW);
  const visibleInstitutions = isEducationExpanded
    ? institutions
    : institutions.slice(0, EDUCATION_PREVIEW);

  const renderPosition = (pos: Position, key: number) => (
    <div className={`position ${pos.planned ? "planned" : ""}`} key={key}>
      <div className="date">{formatDate(getText(pos.date))}</div>
      <div className="position-title">
        <h4>{getText(pos.title)}</h4>
        <span className="tag">{getText(pos.tag)}</span>
      </div>
      <ClampText className="desc" text={getText(pos.desc)} />
    </div>
  );

  const renderToggle = (
    expanded: boolean,
    onToggle: () => void,
    controls: string,
    moreKey: "showMoreExperience" | "showMoreEducation",
    lessKey: "showLessExperience" | "showLessEducation"
  ) => (
    <button
      className="timeline-toggle"
      onClick={onToggle}
      aria-expanded={expanded}
      aria-controls={controls}
    >
      {expanded ? (
        <CaretUp aria-hidden="true" />
      ) : (
        <CaretDown aria-hidden="true" />
      )}
      <span>{expanded ? t(lessKey) : t(moreKey)}</span>
    </button>
  );

  return (
    <div className="container background-grid">
      <section id="experience">
        <h2 className="section-title">{t("experience")}</h2>
        <div className="timeline-container">
          <ol className="cv" id="timeline">
            {visibleCompanies.map((company, idx) => (
              <li className="cv-entry" key={idx}>
                <div className="cv-head">
                  <h3 className="company">{getText(company.company)}</h3>
                  <span className="cv-where">{getText(company.location)}</span>
                </div>
                {company.positions.map(renderPosition)}
              </li>
            ))}
          </ol>
        </div>
        {companies.length > EXPERIENCE_PREVIEW &&
          renderToggle(
            isExperienceExpanded,
            () => setIsExperienceExpanded(!isExperienceExpanded),
            "timeline",
            "showMoreExperience",
            "showLessExperience"
          )}
      </section>

      <section id="education">
        <h2 className="section-title">{t("education")}</h2>
        <div className="timeline-container">
          <ol className="cv" id="timeline-education">
            {visibleInstitutions.map((institution, idx) => (
              <li className="cv-entry" key={idx}>
                <div className="cv-head">
                  <h3 className="company">
                    {getText(institution.institution)}
                  </h3>
                  <span className="cv-where">
                    {getText(institution.location)}
                  </span>
                </div>
                {institution.degrees.map(renderPosition)}
              </li>
            ))}
          </ol>
        </div>
        {institutions.length > EDUCATION_PREVIEW &&
          renderToggle(
            isEducationExpanded,
            () => setIsEducationExpanded(!isEducationExpanded),
            "timeline-education",
            "showMoreEducation",
            "showLessEducation"
          )}
      </section>
    </div>
  );
}
