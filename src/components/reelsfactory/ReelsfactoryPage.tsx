import type { WorkProject } from "@/types/reelsfactory.types";
import { FEATURED_PROJECT } from "@/lib/reelsfactory/resumeContent";
import AboutSection from "@/components/reelsfactory/AboutSection";
import ContactSection from "@/components/reelsfactory/ContactSection";
import EducationSection from "@/components/reelsfactory/EducationSection";
import ExperienceSection from "@/components/reelsfactory/ExperienceSection";
import FeaturedProjectSection from "@/components/reelsfactory/FeaturedProjectSection";
import HeroSection from "@/components/reelsfactory/HeroSection";
import SideRail from "@/components/reelsfactory/SideRail";
import SkillsSection from "@/components/reelsfactory/SkillsSection";
import WorkSection from "@/components/reelsfactory/WorkSection";

interface ReelsfactoryPageProps {
  works: WorkProject[];
}

export default function ReelsfactoryPage({ works }: ReelsfactoryPageProps) {
  const featured = works.find((work) => work.slug === FEATURED_PROJECT.slug);
  // 대표 프로젝트는 위에서 보여주므로 Work 목록에서는 뺀다
  const otherWorks = works.filter((work) => work.slug !== FEATURED_PROJECT.slug);

  return (
    <div className="bg-rf-ink font-sans">
      <SideRail />
      <main>
        <HeroSection />
        {featured && <FeaturedProjectSection work={featured} />}
        <WorkSection works={otherWorks} />
        <AboutSection />
        <ExperienceSection />
        <SkillsSection />
        <EducationSection />
        <ContactSection />
      </main>
    </div>
  );
}
