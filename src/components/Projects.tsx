import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { MarkdownModal } from "./MarkdownModal";

interface LangText {
  no: string;
  en: string;
}

interface Project {
  title: LangText;
  description: LangText;
  tag?: LangText;
  cta?: LangText;
  mdPath?: string;
  image: string;
  link: string;
}

export function Projects() {
  const { t, lang } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  useEffect(() => {
    fetch("/data/projects.json")
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch((err) => console.error("Failed to load projects data:", err));
  }, []);

  const getText = (value: LangText) => (lang === "en" ? value.en : value.no);
  const closeModal = () => setActiveProject(null);

  return (
    <section id="projects">
      <div className="section-header">
        <h2 className="section-title">{t("projects")}</h2>
        <p className="small">{t("projectsIntro")}</p>
      </div>

      <div
        className="card pad projects-scroller"
        role="list"
        aria-label={t("projects")}
      >
        <div className="projects-strip">
          {projects.map((project) => (
            <article
              className="project-card"
              key={project.link}
              role="listitem"
            >
              <div className="project-image">
                <img
                  src={project.image}
                  alt={getText(project.title)}
                  loading="lazy"
                />
              </div>
              <div className="project-body">
                <div className="project-meta">
                  {project.tag && (
                    <span className="tag">{getText(project.tag)}</span>
                  )}
                </div>
                <h3>{getText(project.title)}</h3>
                <p className="small">{getText(project.description)}</p>
                {project.mdPath ? (
                  <button
                    type="button"
                    className="btn ghost project-link"
                    onClick={() => setActiveProject(project)}
                  >
                    <span>
                      {project.cta ? getText(project.cta) : t("readMore")}
                    </span>
                    <i
                      className="fa-solid fa-arrow-up-right-from-square"
                      aria-hidden="true"
                    ></i>
                  </button>
                ) : (
                  <a
                    className="btn ghost project-link"
                    href={project.link}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <span>
                      {project.cta ? getText(project.cta) : t("readMore")}
                    </span>
                    <i
                      className="fa-solid fa-arrow-up-right-from-square"
                      aria-hidden="true"
                    ></i>
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
      {activeProject?.mdPath && (
        <MarkdownModal
          isOpen={Boolean(activeProject)}
          onClose={closeModal}
          mdPath={activeProject.mdPath}
          title={getText(activeProject.title)}
        />
      )}
    </section>
  );
}
