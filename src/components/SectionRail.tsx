import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

/** Sections of the public page, in document order. Ids are the anchors the
 *  nav already links to; labels reuse the section-title strings. Education is
 *  left out on purpose: on desktop it shares a row with experience. */
const SECTIONS = [
  { id: "experience", key: "experience" },
  { id: "projects", key: "projects" },
  { id: "about", key: "about" },
  { id: "contact", key: "contact" },
] as const;

const ITEM_HEIGHT = 28;

/**
 * Fixed side rail that tracks the section in view and jumps to any of them.
 * A single marker slides between items so the eye can follow the change.
 */
export function SectionRail() {
  const { t } = useLanguage();
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sections = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (sections.length === 0) return;

    // A section is "in band" while it crosses 35-45% down the viewport. When
    // several are (side-by-side layouts), the first in document order wins.
    const inBand = new Set<string>();
    const spy = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inBand.add(entry.target.id);
          else inBand.delete(entry.target.id);
        }
        const first = SECTIONS.find((s) => inBand.has(s.id));
        setActive(first ? first.id : null);
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach((el) => spy.observe(el));

    return () => spy.disconnect();
  }, []);

  const activeIndex = SECTIONS.findIndex((s) => s.id === active);
  const visible = activeIndex >= 0;

  return (
    <nav
      className={`section-rail ${visible ? "is-visible" : ""}`}
      aria-label={t("onThisPage")}
    >
      <span
        className="section-rail__marker"
        aria-hidden="true"
        style={{
          transform: `translateY(${Math.max(activeIndex, 0) * ITEM_HEIGHT}px)`,
        }}
      />
      <ol>
        {SECTIONS.map((section) => {
          const isActive = section.id === active;
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className={isActive ? "is-active" : ""}
                aria-current={isActive ? "location" : undefined}
              >
                <span className="section-rail__label">{t(section.key)}</span>
                <span className="section-rail__square" aria-hidden="true" />
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
