import { DownloadSimple } from "@phosphor-icons/react";
import { useLanguage } from "../context/LanguageContext";
import { useProfile } from "../context/ProfileContext";
import { translations } from "../i18n/translations";
import { trackCVDownload } from "../lib/analytics";

export function Hero() {
  const { t, lang } = useLanguage();
  const { profile } = useProfile();

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
            <a
              className="btn"
              href={translations[lang].cv}
              download
              onClick={() => trackCVDownload()}
            >
              <DownloadSimple aria-hidden="true" />
              {t("downloadCV")}
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
    </header>
  );
}
