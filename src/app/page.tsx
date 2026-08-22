import { Hero } from "@/components/sections/Hero";
import { Profile } from "@/components/sections/Profile";
import { Projects } from "@/components/sections/Projects";
import { ContactBand } from "@/components/sections/ContactBand";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { HomeEnter } from "@/components/effects/HomeEnter";

export default function HomePage() {
  return (
    <HomeEnter>
      <Hero />
      <div id="after-hero" className="after-hero relative z-[1]">
        <Profile />
        <Projects />
        <ContactBand />
        <SiteFooter />
      </div>
    </HomeEnter>
  );
}
