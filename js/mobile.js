// Mobile menu functionality
document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileOverlay = document.getElementById("mobileOverlay");

  if (!hamburger || !mobileMenu || !mobileOverlay) return;

  const mobileMenuLinks = mobileMenu.querySelectorAll("a");

  function toggleMobileMenu() {
    hamburger.classList.toggle("active");
    mobileMenu.classList.toggle("active");
    mobileOverlay.classList.toggle("active");
    document.body.style.overflow = mobileMenu.classList.contains("active")
      ? "hidden"
      : "";
  }

  function closeMobileMenu() {
    hamburger.classList.remove("active");
    mobileMenu.classList.remove("active");
    mobileOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  hamburger.addEventListener("click", toggleMobileMenu);
  mobileOverlay.addEventListener("click", closeMobileMenu);

  // Close menu when clicking on links
  mobileMenuLinks.forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });

  // Close menu on escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileMenu.classList.contains("active")) {
      closeMobileMenu();
    }
  });

  // Mobile theme and language toggles
  const themeToggleMobile = document.getElementById("themeToggleMobile");
  const langToggleMobile = document.getElementById("langToggleMobile");

  if (themeToggleMobile) {
    themeToggleMobile.addEventListener("click", () => {
      const isLight = document.documentElement.classList.contains("light");
      applyTheme(isLight ? "dark" : "light");
    });
  }

  if (langToggleMobile) {
    langToggleMobile.addEventListener("click", () => {
      const newLang = currentLang === "no" ? "en" : "no";
      updateLanguage(newLang);
    });
  }
});
