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
    const sections = SECTIONS.flatMap((s) => {
      const el = document.getElementById(s.id);
      return el ? [{ id: s.id as string, el }] : [];
    });
    if (sections.length === 0) return;

    // The active section is the last one whose top has passed a line 40% down
    // the viewport. Unlike an "in view" test this never goes empty between
    // sections, so the rail does not blink when something unlisted (education,
    // a toggle, a gap) sits at that line.
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      let current: string | null = null;
      for (const s of sections) {
        if (s.el.getBoundingClientRect().top <= line) current = s.id;
      }
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
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
