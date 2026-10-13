import { useLayoutEffect, useRef, useState } from "react";
import { ArrowDownRight } from "@phosphor-icons/react";
import { useLanguage } from "../context/LanguageContext";

interface ClampTextProps {
  text: string;
  /** Lines shown while collapsed. Only applies on narrow screens. */
  lines?: number;
  className?: string;
}

const NARROW = "(max-width: 768px)";
const ELLIPSIS = "…";

// On phones a long description is cut so that the text and the "… ↘" button
// fit in `lines` lines; tapping the button shows the whole thing. The cut is
// found by measuring the real layout, so the button always ends the last
// visible line. Once opened it stays open.
export function ClampText({ text, lines = 3, className = "" }: ClampTextProps) {
  const { t } = useLanguage();
  const paragraph = useRef<HTMLParagraphElement>(null);
  const body = useRef<HTMLSpanElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [cut, setCut] = useState<number | null>(null);

  useLayoutEffect(() => {
    const p = paragraph.current;
    const span = body.current;
    const button = toggle.current;
    if (!p || !span || !button || expanded) return;

    const measure = () => {
      if (!window.matchMedia(NARROW).matches) {
        span.textContent = text;
        button.hidden = true;
        setCut(null);
        return;
      }
      const lineHeight = parseFloat(getComputedStyle(p).lineHeight);
      const maxHeight = lineHeight * lines + 1;
      button.hidden = false;
      span.textContent = text;
      if (p.clientHeight <= maxHeight) {
        button.hidden = true;
        setCut(null);
        return;
      }
      // Longest prefix that, followed by the button, still fits.
      let lo = 0;
      let hi = text.length;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        span.textContent = text.slice(0, mid).trimEnd();
        if (p.clientHeight <= maxHeight) lo = mid;
        else hi = mid;
      }
      span.textContent = text.slice(0, lo).trimEnd();
      setCut(lo);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(p.parentElement ?? p);
    return () => observer.disconnect();
  }, [text, lines, expanded]);

  const shown = expanded || cut === null ? text : text.slice(0, cut).trimEnd();

  return (
    <p ref={paragraph} className={`clamp ${className}`.trim()}>
      <span ref={body}>{shown}</span>
      {!expanded && (
        <button
          ref={toggle}
          type="button"
          className="clamp-toggle"
          hidden={cut === null}
          aria-label={t("showMore")}
          onClick={() => setExpanded(true)}
        >
          <span aria-hidden="true">{ELLIPSIS}</span>
          <ArrowDownRight weight="bold" aria-hidden="true" />
        </button>
      )}
    </p>
  );
}
