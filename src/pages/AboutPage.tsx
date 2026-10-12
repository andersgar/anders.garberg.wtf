import { Navigation, NavSpacer } from "../components/Navigation";
import { Hero } from "../components/Hero";
import { Experience } from "../components/Experience";
import { Projects } from "../components/Projects";
import { About } from "../components/About";
import { Contact } from "../components/Contact";
import { Footer } from "../components/Footer";
import { SectionRail } from "../components/SectionRail";

export function AboutPage() {
  return (
    <>
      <Navigation />
      <NavSpacer />
      <Hero />
      <SectionRail />
      <main id="main" aria-live="polite">
        <div id="publicSections">
          <Experience />
          <Projects />
          <About />
          <Contact />
        </div>
      </main>
      <Footer />
    </>
  );
}
