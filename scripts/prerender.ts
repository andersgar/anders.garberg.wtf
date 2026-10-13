// Writes crawler-ready HTML for the public pages after `vite build`.
//
// The app is a client-rendered SPA, so the HTML Vite emits is an empty shell.
// This plugin fills `om-meg.html` and `about.html` with the same content the
// React tree renders (hero, experience, education, projects, about, contact),
// adds per-language metadata, Open Graph tags and JSON-LD, writes noindex
// shells for the private routes, and generates `sitemap.xml`. React replaces
// the static markup on load, so nothing changes for a visitor with JavaScript.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Plugin } from "vite";
import { translations, type Language } from "../src/i18n/translations";
import { SKILL_GROUPS } from "../src/data/skills";

const SITE = "https://garberg.wtf";

const PERSON = {
  name: "Anders Garberg",
  givenName: "Anders",
  familyName: "Garberg",
  email: "anders@garberg.wtf",
  image: `${SITE}/assets/portrait.jpg`,
  ogImage: `${SITE}/assets/og.png`,
  linkedin: "https://www.linkedin.com/in/anders-garberg",
  github: "https://github.com/andersgar",
  thesis:
    "https://nva.sikt.no/registration/019fdbfa5b5b-f2a75d0c-5d47-4efa-a779-18a72d807721",
};

interface LangText {
  no: string;
  en: string;
}
interface Position {
  title: LangText;
  tag: LangText;
  date: LangText;
  desc: LangText;
  planned?: boolean;
  hidden?: boolean;
}
interface Company {
  company: LangText;
  location: LangText;
  positions: Position[];
  hidden?: boolean;
}
interface Institution {
  institution: LangText;
  location: LangText;
  degrees: Position[];
  hidden?: boolean;
}
interface Project {
  title: LangText;
  description: LangText;
  cta?: LangText;
  mdPath?: string;
  image: string;
  link: string;
  extraLink?: { url: string; label: LangText };
  hidden?: boolean;
}

interface PublicPage {
  file: string;
  path: string;
  lang: Language;
  locale: string;
}

const PAGES: PublicPage[] = [
  { file: "om-meg.html", path: "/om-meg", lang: "no", locale: "nb_NO" },
  { file: "about.html", path: "/about", lang: "en", locale: "en_US" },
];

// SPA routes that must not end up in search results.
const PRIVATE_ROUTES = [
  "login",
  "register",
  "reset-password",
  "qr-generator",
  "admin",
];

const escape = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Same normalisation the Experience component applies to dates.
const formatDate = (value: string) => value.replace(/–/g, "-");

function readJson<T>(publicDir: string, name: string): T[] {
  const list = JSON.parse(
    readFileSync(resolve(publicDir, "data", name), "utf-8")
  ) as (T & { hidden?: boolean })[];
  return list.filter((item) => !item.hidden);
}

function jsonLd(lang: Language, pagePath: string): string {
  const t = translations[lang];
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE}/#website`,
        url: `${SITE}/`,
        name: PERSON.name,
        inLanguage: ["nb", "en"],
        publisher: { "@id": `${SITE}/#person` },
      },
      {
        "@type": "ProfilePage",
        "@id": `${SITE}${pagePath}`,
        url: `${SITE}${pagePath}`,
        name: t.metaTitle,
        description: t.metaDescription,
        inLanguage: lang === "no" ? "nb" : "en",
        isPartOf: { "@id": `${SITE}/#website` },
        mainEntity: { "@id": `${SITE}/#person` },
      },
      {
        "@type": "Person",
        "@id": `${SITE}/#person`,
        name: PERSON.name,
        givenName: PERSON.givenName,
        familyName: PERSON.familyName,
        jobTitle: t.roleTitle,
        description: t.aboutText1,
        image: PERSON.image,
        url: `${SITE}/`,
        email: `mailto:${PERSON.email}`,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Trondheim",
          addressCountry: "NO",
        },
        alumniOf: {
          "@type": "CollegeOrUniversity",
          name: "NTNU",
          alternateName: "Norges teknisk-naturvitenskapelige universitet",
          url: "https://www.ntnu.no/",
        },
        memberOf: { "@type": "Organization", name: "Marinor NTNU" },
        knowsAbout: [
          "Robotics",
          "Autonomous systems",
          "Control engineering",
          "ROS 2",
          "NVIDIA Isaac Sim",
          "C++",
          "Python",
        ],
        knowsLanguage: ["nb", "en"],
        sameAs: [PERSON.linkedin, PERSON.github, PERSON.thesis],
      },
    ],
  };
  // A closing tag inside the JSON would end the script element early.
  return JSON.stringify(graph).replace(/</g, "\\u003c");
}

function headTags(page: PublicPage): string {
  const t = translations[page.lang];
  const url = `${SITE}${page.path}`;
  const alternate = page.lang === "no" ? "en_US" : "nb_NO";
  return [
    `<link rel="canonical" href="${url}" />`,
    `<link rel="alternate" hreflang="nb" href="${SITE}/om-meg" />`,
    `<link rel="alternate" hreflang="en" href="${SITE}/about" />`,
    `<link rel="alternate" hreflang="x-default" href="${SITE}/om-meg" />`,
    `<meta property="og:type" content="profile" />`,
    `<meta property="og:site_name" content="${PERSON.name}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${escape(t.metaTitle)}" />`,
    `<meta property="og:description" content="${escape(t.metaDescription)}" />`,
    `<meta property="og:image" content="${PERSON.ogImage}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${PERSON.name}" />`,
    `<meta property="og:locale" content="${page.locale}" />`,
    `<meta property="og:locale:alternate" content="${alternate}" />`,
    `<meta property="profile:first_name" content="${PERSON.givenName}" />`,
    `<meta property="profile:last_name" content="${PERSON.familyName}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escape(t.metaTitle)}" />`,
    `<meta name="twitter:description" content="${escape(t.metaDescription)}" />`,
    `<meta name="twitter:image" content="${PERSON.ogImage}" />`,
    `<script type="application/ld+json">${jsonLd(page.lang, page.path)}</script>`,
  ]
    .map((line) => `    ${line}`)
    .join("\n");
}

function renderEntries(
  lang: Language,
  entries: { name: LangText; location: LangText; items: Position[] }[]
): string {
  const text = (v: LangText) => escape(v[lang]);
  return entries
    .map(
      (entry) => `<li class="cv-entry">
<div class="cv-head"><h3 class="company">${text(entry.name)}</h3><span class="cv-where">${text(entry.location)}</span></div>
${entry.items
  .filter((item) => !item.hidden)
  .map(
    (item) => `<div class="position${item.planned ? " planned" : ""}">
<div class="date">${escape(formatDate(item.date[lang]))}</div>
<div class="position-title"><h4>${text(item.title)}</h4><span class="tag">${text(item.tag)}</span></div>
<div class="desc">${text(item.desc)}</div>
</div>`
  )
  .join("\n")}
</li>`
    )
    .join("\n");
}

function renderBody(
  lang: Language,
  publicDir: string
): string {
  const t = translations[lang];
  const text = (v: LangText) => escape(v[lang]);
  const companies = readJson<Company>(publicDir, "experience.json");
  const institutions = readJson<Institution>(publicDir, "education.json");
  const projects = readJson<Project>(publicDir, "projects.json");

  const experience = renderEntries(
    lang,
    companies.map((c) => ({ name: c.company, location: c.location, items: c.positions }))
  );
  const education = renderEntries(
    lang,
    institutions.map((i) => ({ name: i.institution, location: i.location, items: i.degrees }))
  );

  const projectCards = projects
    .map((project, index) => {
      const logo = project.image.endsWith(".svg") ? " is-logo" : "";
      const cta = project.cta ? text(project.cta) : escape(t.readMore);
      const extra = project.extraLink
        ? `<a class="project-link" href="${escape(project.extraLink.url)}" target="_blank" rel="noreferrer noopener">${text(project.extraLink.label)}</a>`
        : "";
      return `<article class="project-card${index < 2 ? " featured" : ""}">
<div class="project-image${logo}"><img src="${escape(project.image)}" alt="${text(project.title)}" loading="lazy" /></div>
<div class="project-body"><h3>${text(project.title)}</h3><p>${text(project.description)}</p>
<div class="project-actions"><a class="project-link" href="${escape(project.link)}" target="_blank" rel="noreferrer noopener">${cta}</a>${extra}</div></div>
</article>`;
    })
    .join("\n");

  const skills = SKILL_GROUPS.map(
    (group) =>
      `<div class="skill-group"><p class="skill-label">${escape(group.label[lang])}</p><div class="row">${group.items
        .map((item) => `<span class="tag">${escape(item[lang])}</span>`)
        .join("")}</div></div>`
  ).join("\n");

  return `
<header id="home" class="hero"><div class="container hero-wrap">
<div class="hero-main">
<p class="eyebrow">${escape(t.roleTitle)}</p>
<h1><span class="greeting">${escape(t.greeting)}</span> <span class="name">${PERSON.name}</span></h1>
<p class="hero-sub">${escape(t.heroSubtext)}</p>
<div class="hero-cta"><a class="btn" href="${escape(t.cv)}">${escape(t.viewCV)}</a><a class="btn ghost" href="#contact">${escape(t.contact)}</a></div>
</div>
<figure class="hero-portrait"><img src="/assets/portrait.jpg" alt="${PERSON.name}" width="800" height="800" /></figure>
</div></header>
<main id="main">
<div class="container background-grid">
<section id="experience"><h2 class="section-title">${escape(t.experience)}</h2><ol class="cv">
${experience}
</ol></section>
<section id="education"><h2 class="section-title">${escape(t.education)}</h2><ol class="cv">
${education}
</ol></section>
</div>
<section id="projects"><div class="container"><h2 class="section-title">${escape(t.projects)}</h2><div class="projects-grid">
${projectCards}
</div></div></section>
<section id="about"><div class="container"><h2 class="section-title">${escape(t.about)}</h2><div class="about-grid">
<div class="about-prose box"><p>${escape(t.aboutText1)}</p><p>${escape(t.aboutText2)}</p></div>
<div class="about-facts box"><h3>${escape(t.highlights)}</h3><ul><li>${escape(t.highlight1)}</li><li>${escape(t.highlight2)}</li><li>${escape(t.highlight3)}</li><li>${escape(t.highlight4)}</li></ul>
<h3>${escape(t.skills)}</h3>
${skills}</div>
</div></div></section>
<section id="contact"><div class="container"><h2 class="section-title">${escape(t.contact)}</h2>
<p class="contact-intro">${escape(t.contactDesc)}</p>
<dl class="contact-aside box">
<div class="fact"><dt>${escape(t.email)}</dt><dd><a href="mailto:${PERSON.email}">${PERSON.email}</a></dd></div>
<div class="fact"><dt>GitHub</dt><dd><a href="${PERSON.github}" rel="me">github.com/andersgar</a></dd></div>
<div class="fact"><dt>LinkedIn</dt><dd><a href="${PERSON.linkedin}" rel="me">anders-garberg</a></dd></div>
<div class="fact"><dt>${escape(t.factLocation)}</dt><dd>Trondheim, ${lang === "no" ? "Norge" : "Norway"}</dd></div>
</dl></div></section>
</main>
<footer><div class="container footer-inner"><p class="small mono">&copy; ${new Date().getFullYear()} ${PERSON.name}. ${escape(t.allRightsReserved)}.</p></div></footer>
`;
}

function applyHead(template: string, page: PublicPage): string {
  const t = translations[page.lang];
  return template
    .replace(/<html lang="[^"]*"/, `<html lang="${page.lang === "no" ? "nb" : "en"}"`)
    .replace(/<title>[^<]*<\/title>/, `<title>${escape(t.metaTitle)}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
      `<meta name="description" content="${escape(t.metaDescription)}" />`
    )
    .replace(/\n\s*<\/head>/, `\n${headTags(page)}\n  </head>`);
}

function sitemap(): string {
  const today = new Date().toISOString().slice(0, 10);
  const alternates = PAGES.map(
    (p) =>
      `    <xhtml:link rel="alternate" hreflang="${p.lang === "no" ? "nb" : "en"}" href="${SITE}${p.path}" />`
  ).join("\n");
  const urls = PAGES.map(
    (p) => `  <url>
    <loc>${SITE}${p.path}</loc>
    <lastmod>${today}</lastmod>
${alternates}
  </url>`
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
}

export function prerenderStaticPages(): Plugin {
  let outDir = "dist";
  let publicDir = "public";
  return {
    name: "prerender-static-pages",
    apply: "build",
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
      publicDir = config.publicDir;
    },
    closeBundle() {
      const template = readFileSync(resolve(outDir, "index.html"), "utf-8");
      if (!template.includes('<div id="root"></div>')) {
        throw new Error("prerender: could not find the empty #root in index.html");
      }

      for (const page of PAGES) {
        const html = applyHead(template, page).replace(
          '<div id="root"></div>',
          `<div id="root">${renderBody(page.lang, publicDir)}</div>`
        );
        writeFileSync(resolve(outDir, page.file), html);
      }

      // The root URL sends visitors on to the language page, so it points
      // search engines there too.
      writeFileSync(
        resolve(outDir, "index.html"),
        applyHead(template, PAGES[0])
      );

      for (const route of PRIVATE_ROUTES) {
        writeFileSync(
          resolve(outDir, `${route}.html`),
          template.replace(
            "</head>",
            `    <meta name="robots" content="noindex" />\n  </head>`
          )
        );
      }

      writeFileSync(resolve(outDir, "sitemap.xml"), sitemap());
      this.info(
        `prerendered ${PAGES.length} pages, ${PRIVATE_ROUTES.length} noindex shells, sitemap.xml`
      );
    },
  };
}
