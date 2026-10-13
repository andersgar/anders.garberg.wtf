import { useEffect, useState } from "react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { useLanguage } from "../context/LanguageContext";
import { MarkdownModal } from "./MarkdownModal";
import { ClampText } from "./ClampText";

interface LangText {
  no: string;
  en: string;
}

interface ExtraLink {
  url: string;
  label: LangText;
}

interface Project {
  title: LangText;
  description: LangText;
  cta?: LangText;
  mdPath?: string;
  image: string;
  link: string;
  /** Optional secondary link, e.g. a publication record. */
  extraLink?: ExtraLink;
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
      <div className="container">
        <h2 className="section-title">{t("projects")}</h2>

        <div className="projects-grid" role="list" aria-label={t("projects")}>
          {projects.map((project, index) => (
            <article
              className={`project-card ${index < 2 ? "featured" : ""}`}
              key={project.link}
              role="listitem"
            >
              <div
                className={`project-image ${
                  project.image.endsWith(".svg") ? "is-logo" : ""
                }`}
              >
                <img
                  src={project.image}
                  alt={getText(project.title)}
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
              <div className="project-body">
                <h3>{getText(project.title)}</h3>
                <ClampText text={getText(project.description)} lines={4} />
                <div className="project-actions">
                  {project.mdPath ? (
                    <button
                      type="button"
                      className="project-link"
                      onClick={() => setActiveProject(project)}
                    >
                      <span>
                        {project.cta ? getText(project.cta) : t("readMore")}
                      </span>
                      <ArrowUpRight aria-hidden="true" />
                    </button>
                  ) : (
                    <a
                      className="project-link"
                      href={project.link}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <span>
                        {project.cta ? getText(project.cta) : t("readMore")}
                      </span>
                      <ArrowUpRight aria-hidden="true" />
                    </a>
                  )}
                  {project.extraLink && (
                    <a
                      className="project-link"
                      href={project.extraLink.url}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <span>{getText(project.extraLink.label)}</span>
                      <ArrowUpRight aria-hidden="true" />
                    </a>
                  )}
                </div>
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
