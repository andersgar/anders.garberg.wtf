// Mobile menu functionality
document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileOverlay = document.getElementById("mobileOverlay");

  if (!hamburger || !mobileMenu || !mobileOverlay) return;

  // Calculate correct top position based on nav and dev banner
  function updateMobileMenuPosition() {
    const nav = document.querySelector("nav");
    const devBanner = document.querySelector(".dev-banner");
    const navHeight = nav ? nav.offsetHeight : 64;
    const bannerHeight = devBanner ? devBanner.offsetHeight : 0;
    const totalTop = navHeight + bannerHeight;

    mobileMenu.style.top = `${totalTop}px`;
    mobileMenu.style.height = `calc(100vh - ${totalTop}px)`;
    mobileOverlay.style.top = `${totalTop}px`;
    mobileOverlay.style.height = `calc(100vh - ${totalTop}px)`;
  }

  // Update position on load and resize
  updateMobileMenuPosition();
  window.addEventListener("resize", updateMobileMenuPosition);

  const mobileMenuLinks = mobileMenu.querySelectorAll("a");

  function toggleMobileMenu() {
    updateMobileMenuPosition(); // Ensure correct position
    hamburger.classList.toggle("active");
    mobileMenu.classList.toggle("active");
    mobileOverlay.classList.toggle("active");
    document.body.classList.toggle("mobile-menu-open");
  }

  function closeMobileMenu() {
    hamburger.classList.remove("active");
    mobileMenu.classList.remove("active");
    mobileOverlay.classList.remove("active");
    document.body.classList.remove("mobile-menu-open");
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

  // Theme toggle is handled in common.js

  if (langToggleMobile) {
    langToggleMobile.addEventListener("click", () => {
      const newLang = window.currentLang === "no" ? "en" : "no";
      if (window.updateLanguage) window.updateLanguage(newLang);
    });
  }

  // Login toggle for mobile
  const loginToggleMobile = document.getElementById("loginToggleMobile");
  if (loginToggleMobile) {
    loginToggleMobile.addEventListener("click", async () => {
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
});
