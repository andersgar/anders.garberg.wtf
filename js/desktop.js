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

  // Login toggle for desktop
  const loginToggle = document.getElementById("loginToggle");
  if (loginToggle) {
    loginToggle.addEventListener("click", async () => {
      // Wait for auth module
      let attempts = 0;
      while (!window.auth && attempts < 50) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }

      if (window.auth) {
        const isLoggedIn = await window.auth.isAuthenticated();
        if (isLoggedIn) {
          // If logged in, show user popup
          if (window.showUserPopup) {
            window.showUserPopup();
          }
        } else {
          // If not logged in, go to login page
          window.location.href = "login.html";
        }
      } else {
        // Fallback if auth module not loaded
        window.location.href = "login.html";
      }
    });
  }

  // Contact form functionality
  const form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      // Track contact form submission
      if (window.analytics) {
        window.analytics.trackContact();
      }

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
