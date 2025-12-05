import { Navigation, NavSpacer } from "../components/Navigation";
import { Hero } from "../components/Hero";
import { Experience } from "../components/Experience";
import { About } from "../components/About";
import { Contact } from "../components/Contact";
import { Footer } from "../components/Footer";
import { BackgroundBlobs } from "../components/BackgroundBlobs";
// import { DevBanner } from "../components/DevBanner";

export function HomePage() {
  return (
    <>
      <BackgroundBlobs />
      {/* <DevBanner /> */}
      <Navigation />
      <NavSpacer />
      <Hero />
      <main id="main" className="container" aria-live="polite">
        <div id="publicSections">
          <Experience />
          <About />
          <Contact />
        </div>
      </main>
      <Footer />
    </>
  );
}
