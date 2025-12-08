import { useRef, useState } from "react";
import { Navigation, NavSpacer } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { BackgroundBlobs } from "../components/BackgroundBlobs";
import { useLanguage } from "../context/LanguageContext";
import { QRCodeSVG } from "qrcode.react";
import "../styles/qr-generator.css";

export function QRGeneratorPage() {
  const { t } = useLanguage();
  const [input, setInput] = useState("https://garberg.wtf");
  const [focused, setFocused] = useState(false);
  const qrRef = useRef<SVGSVGElement | null>(null);

  const hasValue = input.trim().length > 0;

  const handleDownload = () => {
    if (!qrRef.current || !hasValue) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(qrRef.current);
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "qr-code.svg";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <>
      <BackgroundBlobs />
      <Navigation />
      <NavSpacer />
      <main className="qr-generator">
        <div className="container">
          <header className="qr-generator__header">
            <div>
              <p className="eyebrow">{t("qrGeneratorName")}</p>
              <h1>{t("qrGeneratorTitle")}</h1>
              <p className="qr-generator__subtitle">
                {t("qrGeneratorDescription")}
              </p>
            </div>
          </header>

          <div className="qr-generator__grid">
            <section className="qr-generator__panel">
              <h2>{t("qrGeneratorInputLabel")}</h2>
              <label className="qr-generator__label" htmlFor="qr-input">
                {t("qrGeneratorHelper")}
              </label>
              <div
                className={`qr-generator__input ${
                  focused ? "qr-generator__input--focused" : ""
                }`}
              >
                <i className="fa-solid fa-link"></i>
                <input
                  id="qr-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder={t("qrGeneratorPlaceholder")}
                  spellCheck={false}
                />
              </div>
              <div className="qr-generator__actions">
                <span className="qr-generator__hint">
                  {t("qrGeneratorLiveHint")}
                </span>
                <button
                  className="button"
                  type="button"
                  onClick={handleDownload}
                  disabled={!hasValue}
                >
                  <i className="fa-solid fa-download"></i>{" "}
                  {t("qrGeneratorDownload")}
                </button>
              </div>
            </section>

            <section className="qr-generator__panel qr-generator__preview">
              <div className="qr-generator__preview-header">
                <h2>{t("qrGeneratorPreviewTitle")}</h2>
                <span className="qr-generator__badge">
                  {t("qrGeneratorBadge")}
                </span>
              </div>
              <div className="qr-generator__qr-wrapper">
                <div className="qr-generator__qr">
                  {/* @ts-ignore - QRCodeSVG typing misses ref */}
                  <QRCodeSVG
                    ref={qrRef}
                    value={hasValue ? input : " "}
                    size={200}
                    level="H"
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                  />
                </div>
              </div>
              <p className="qr-generator__caption">
                {hasValue
                  ? input
                  : t("qrGeneratorEmptyState")}
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
