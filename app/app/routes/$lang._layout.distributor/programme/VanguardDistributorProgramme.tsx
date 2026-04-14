import { HeroSection } from "./components/HeroSection";
import { RevenueTable } from "./components/RevenueTable";
import { RevenueSimulator } from "./components/RevenueSimulator";
import { CaseStudy } from "./components/CaseStudy";
import { HowItWorks } from "./components/HowItWorks";
import { CtaSection } from "./components/CtaSection";
import "./vanguard.css";

export function VanguardDistributorProgramme() {
  return (
    <div className="vanguard-page min-h-screen bg-background text-base-contrast bg-[linear-gradient(90deg,theme('colors.purple.dark')_0%,transparent_50%,theme('colors.purple.dark')_100%),url('/distributor/bg.png')] bg-no-repeat bg-top bg-contain bg-fixed leading-[1.2] antialiased">
      <div className="pt-[100px] max-md:pt-[56px]">
        <HeroSection />
        <RevenueTable />
        <RevenueSimulator />
        <CaseStudy />
        <HowItWorks />
        <CtaSection />
      </div>
    </div>
  );
}
