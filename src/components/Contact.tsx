import { useLanguage } from "../context/LanguageContext";

export function Contact() {
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const message = (form.elements.namedItem("message") as HTMLTextAreaElement)
      .value;

    const mailtoLink = `mailto:anders@garberg.wtf?subject=Kontakt fra ${name}&body=${encodeURIComponent(
      message
    )}%0A%0AFra: ${name}%0AE-post: ${email}`;
    window.location.href = mailtoLink;
  };

  return (
    <section id="contact">
      <h2 className="section-title">{t("contact")}</h2>
      <div className="contact-grid">
        <div className="card pad">
          <h3 style={{ marginTop: 0 }}>{t("letsStartSomething")}</h3>
          <p className="small">{t("contactDesc")}</p>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">{t("name")}</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder={t("name")}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="email">{t("email")}</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder={t("email")}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="message">{t("message")}</label>
              <textarea
                id="message"
                name="message"
                placeholder={t("message")}
                required
              ></textarea>
            </div>
            <p className="small">{t("formNote")}</p>
            <div className="row">
              <button type="submit" className="btn">
                <i className="fa-solid fa-paper-plane"></i> {t("send")}
              </button>
              <a className="btn ghost" href="mailto:anders@garberg.wtf">
                <i className="fa-solid fa-envelope"></i> {t("emailMe")}
              </a>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
