import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Document, Page, pdfjs } from "react-pdf";
import { DownloadSimple, X } from "@phosphor-icons/react";
import { useLanguage } from "../context/LanguageContext";
import { trackCVDownload } from "../lib/analytics";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "../styles/cv-viewer.css";

// Vite bundles the worker as its own chunk; it is only fetched when the
// viewer opens.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const MAX_PAGE_WIDTH = 900;

interface CvViewerProps {
  src: string;
  onClose: () => void;
}

export function CvViewer({ src, onClose }: CvViewerProps) {
  const { t } = useLanguage();
  const [pageCount, setPageCount] = useState(0);
  const [pageWidth, setPageWidth] = useState(0);
  const pagesRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const filename = src.split("/").filter(Boolean).pop() ?? src;

  // Pages fill the scroll area up to a readable maximum.
  useEffect(() => {
    const el = pagesRef.current;
    if (!el) return;
    const measure = () => {
      const style = getComputedStyle(el);
      const inner =
        el.clientWidth -
        parseFloat(style.paddingLeft) -
        parseFloat(style.paddingRight);
      setPageWidth(Math.max(0, Math.min(inner, MAX_PAGE_WIDTH)));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Full-screen dialog: lock the page behind it, close on Escape, start with
  // focus on the close button.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const skeleton = (
    <div
      className="cv-viewer__skeleton"
      style={{ width: pageWidth || undefined }}
      aria-busy="true"
    />
  );

  return createPortal(
    <div
      className="cv-viewer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cvViewerTitle"
    >
      <div className="cv-viewer__bar">
        <div className="cv-viewer__title">
          <h2 id="cvViewerTitle">CV</h2>
          <span className="cv-viewer__file">{filename}</span>
        </div>
        <div className="cv-viewer__actions">
          <a
            className="btn"
            href={src}
            download
            onClick={() => trackCVDownload()}
            aria-label={t("downloadCV")}
          >
            <DownloadSimple aria-hidden="true" />
            <span className="cv-viewer__label">{t("downloadCV")}</span>
          </a>
          <button
            ref={closeRef}
            type="button"
            className="theme-toggle"
            onClick={onClose}
            aria-label={t("close")}
          >
            <X aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="cv-viewer__pages" ref={pagesRef}>
        {pageWidth > 0 && (
          <Document
            file={src}
            onLoadSuccess={({ numPages }) => setPageCount(numPages)}
            loading={skeleton}
            error={
              <div className="cv-viewer__error box">
                <p>{t("cvLoadError")}</p>
                <a className="btn" href={src} download>
                  <DownloadSimple aria-hidden="true" />
                  {t("downloadCV")}
                </a>
              </div>
            }
          >
            {Array.from({ length: pageCount }, (_, index) => (
              <Page
                key={index}
                pageNumber={index + 1}
                width={pageWidth}
                className="cv-viewer__page"
                loading={skeleton}
              />
            ))}
          </Document>
        )}
      </div>
    </div>,
    document.body
  );
}
