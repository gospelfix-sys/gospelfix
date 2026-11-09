import type { WorkProject } from "@/types/reelsfactory.types";
import AboutSection from "@/components/reelsfactory/AboutSection";
import ContactSection from "@/components/reelsfactory/ContactSection";
import EducationSection from "@/components/reelsfactory/EducationSection";
import ExperienceSection from "@/components/reelsfactory/ExperienceSection";
import HeroSection from "@/components/reelsfactory/HeroSection";
import SideRail from "@/components/reelsfactory/SideRail";
import SkillsSection from "@/components/reelsfactory/SkillsSection";
import WorkSection from "@/components/reelsfactory/WorkSection";

interface ReelsfactoryPageProps {
  works: WorkProject[];
}

export default function ReelsfactoryPage({ works }: ReelsfactoryPageProps) {
  return (
    <div className="bg-rf-ink font-sans">
      <SideRail />
      <main>
        <HeroSection />
        <WorkSection works={works} />
        <AboutSection />
        <ExperienceSection />
        <SkillsSection />
        <EducationSection />
        <ContactSection />
      </main>
    </div>
  );
}
