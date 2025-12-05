let experienceData = null;

async function fetchExperienceData() {
  if (experienceData) return experienceData;
  const res = await fetch("data/experience.json");
  experienceData = await res.json();
  return experienceData;
}

async function renderTimeline() {
  const timelineEl = document.getElementById("timeline");
  if (!timelineEl) return;

  const companies = await fetchExperienceData();
  const lang = window.currentLang || "no";

  timelineEl.innerHTML = companies
    .map(
      (company) => `
    <div class="step">
      <div class="dot" aria-hidden="true"></div>
      <div>
        <span class="company">${
          company.company[lang] || company.company.no
        }</span>
        <p class="small">${company.location[lang] || company.location.no}</p>
        <div class="nested-positions">
          ${company.positions
            .map(
              (pos) => `
            <div class="position">
              <span class="position-title">
                <h4>${pos.title[lang] || pos.title.no}</h4>
                <span class="tag">${pos.tag[lang] || pos.tag.no}</span>
              </span>
              <div class="date">${pos.date[lang] || pos.date.no}</div>
              <div class="desc">${pos.desc[lang] || pos.desc.no}</div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    </div>
  `
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", renderTimeline);

// Listen for global language changes
if (window.updateLanguage) {
  const originalUpdateLanguage = window.updateLanguage;
  window.updateLanguage = function (lang) {
    originalUpdateLanguage(lang);
    renderTimeline();
  };
}
