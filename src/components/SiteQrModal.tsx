import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { QRCodeSVG } from "qrcode.react";
import { X } from "@phosphor-icons/react";
import { useLanguage } from "../context/LanguageContext";
import "../styles/markdown-modal.css";

const SITE_URL = "https://garberg.wtf";

interface SiteQrModalProps {
  onClose: () => void;
}

/** QR code for the site itself, for handing the address to someone's phone. */
export function SiteQrModal({ onClose }: SiteQrModalProps) {
  const { t } = useLanguage();
  const closeRef = useRef<HTMLButtonElement>(null);

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

  return createPortal(
    <div className="md-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="md-modal site-qr"
        role="dialog"
        aria-modal="true"
        aria-labelledby="siteQrTitle"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="md-modal__header">
          <div className="md-modal__title">
            <p className="md-modal__eyebrow">garberg.wtf</p>
            <h2 id="siteQrTitle">{t("siteQr")}</h2>
          </div>
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
        <div className="md-modal__content site-qr__content">
          {/* Always black on white: that is what every scanner reads best. */}
          <div className="site-qr__code">
            <QRCodeSVG
              value={SITE_URL}
              size={256}
              level="M"
              bgColor="#ffffff"
              fgColor="#000000"
              role="img"
              aria-label={SITE_URL}
            />
          </div>
          <p className="site-qr__url mono">{SITE_URL}</p>
          <p className="site-qr__thanks">{t("siteQrThanks")}</p>
        </div>
      </div>
    </div>,
    document.body
  );
}
