// Desktop functionality
document.addEventListener("DOMContentLoaded", function () {
  // Theme toggle for desktop
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isLight = document.documentElement.classList.contains("light");
      applyTheme(isLight ? "dark" : "light");
    });
  }

  // Language toggle for desktop
  const langToggle = document.getElementById("langToggle");
  if (langToggle) {
    langToggle.addEventListener("click", () => {
      const newLang = currentLang === "no" ? "en" : "no";
      updateLanguage(newLang);
    });
  }

  // Contact form functionality
  const form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = encodeURIComponent(form.name.value.trim());
      const email = encodeURIComponent(form.email.value.trim());
      const message = encodeURIComponent(form.message.value.trim());
      const subject = `Portfolio Contact from ${decodeURIComponent(name)}`;
      const body = `Name: ${decodeURIComponent(
        name
      )}%0AEmail: ${decodeURIComponent(email)}%0A%0A${message}`;
      window.location.href = `mailto:anders@garberg.wtf?subject=${encodeURIComponent(
        subject
      )}&body=${body}`;
    });
  }
});
