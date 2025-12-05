import { useLanguage } from "../context/LanguageContext";

export function DevBanner() {
  const { t } = useLanguage();

  return (
    <div className="dev-banner">
      <span dangerouslySetInnerHTML={{ __html: t("devBanner") }} />
    </div>
  );
}
