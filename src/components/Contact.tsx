import { PaperPlaneRight } from "@phosphor-icons/react";
import { useLanguage } from "../context/LanguageContext";
import { trackContact } from "../lib/analytics";

export function Contact() {
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const message = (form.elements.namedItem("message") as HTMLTextAreaElement)
      .value;

    trackContact({ name, email, message });

    const mailtoLink = `mailto:anders@garberg.wtf?subject=Kontakt fra ${name}&body=${encodeURIComponent(
      message
    )}%0A%0AFra: ${name}%0AE-post: ${email}`;
    window.location.href = mailtoLink;
  };

  return (
    <section id="contact">
      <div className="container">
        <h2 className="section-title">{t("contact")}</h2>
        <div className="contact-grid">
          <div className="box">
            <p className="contact-intro">{t("contactDesc")}</p>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="name">{t("name")}</label>
                <input type="text" id="name" name="name" required />
              </div>
              <div className="field">
                <label htmlFor="email">{t("email")}</label>
                <input type="email" id="email" name="email" required />
              </div>
              <div className="field">
                <label htmlFor="message">{t("message")}</label>
                <textarea id="message" name="message" required></textarea>
              </div>
              <div className="row">
                <button type="submit" className="btn">
                  <PaperPlaneRight aria-hidden="true" />
                  {t("send")}
                </button>
                <span className="small">{t("formNote")}</span>
              </div>
            </form>
          </div>

          <dl className="contact-aside box">
            <div className="fact">
              <dt>{t("email")}</dt>
              <dd>
                <a href="mailto:anders@garberg.wtf">anders@garberg.wtf</a>
              </dd>
            </div>
            <div className="fact">
              <dt>GitHub</dt>
              <dd>
                <a
                  href="https://github.com/andersgar"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  github.com/andersgar
                </a>
              </dd>
            </div>
            <div className="fact">
              <dt>LinkedIn</dt>
              <dd>
                <a
                  href="https://www.linkedin.com/in/anders-garberg"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  anders-garberg
                </a>
              </dd>
            </div>
            <div className="fact">
              <dt>{t("factLocation")}</dt>
              <dd>Trondheim, Norge</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
