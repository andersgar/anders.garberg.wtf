import { lazy, Suspense, useCallback, useState } from "react";
import { FileText } from "@phosphor-icons/react";
import { useLanguage } from "../context/LanguageContext";
import { useProfile } from "../context/ProfileContext";
import { translations } from "../i18n/translations";

// pdf.js is only loaded once someone opens the CV.
const CvViewer = lazy(() =>
  import("./CvViewer").then((m) => ({ default: m.CvViewer }))
);

export function Hero() {
  const { t, lang } = useLanguage();
  const { profile } = useProfile();
  const [showCv, setShowCv] = useState(false);
  const closeCv = useCallback(() => setShowCv(false), []);

  // Easter egg: Check if the logged-in user is Anders Garberg
  const isAnders = profile?.email?.toLowerCase() === "anders@garberg.wtf";

  return (
    <header id="home" className="hero">
      <div className="container hero-wrap">
        <div className="hero-main">
          <p className="eyebrow">{t("roleTitle")}</p>
          <h1>
            <span className="greeting">
              {isAnders ? t("greetingEasterEgg") : t("greeting")}
            </span>{" "}
            <span className="name">Anders Garberg</span>
          </h1>
          <p className="hero-sub">{t("heroSubtext")}</p>
          <div className="hero-cta">
            <button
              type="button"
              className="btn"
              onClick={() => setShowCv(true)}
            >
              <FileText aria-hidden="true" />
              {t("viewCV")}
            </button>
            <a className="btn ghost" href="#about">
              {t("about")}
            </a>
            <a className="btn ghost" href="#contact">
              {t("contact")}
            </a>
          </div>
        </div>

        <figure className="hero-portrait">
          <img
            src="/assets/portrait.jpg"
            alt="Anders Garberg"
            width={800}
            height={800}
            fetchPriority="high"
            decoding="async"
          />
        </figure>
      </div>

      {showCv && (
        <Suspense fallback={<div className="cv-viewer" aria-busy="true" />}>
          <CvViewer src={translations[lang].cv} onClose={closeCv} />
        </Suspense>
      )}
    </header>
  );
}
