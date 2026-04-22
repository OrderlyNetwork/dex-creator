import { HeroSection } from "./components/HeroSection";
import { HowItWorks } from "./components/HowItWorks";
import { RevenueTable } from "./components/RevenueTable";
import { RevenueSimulator } from "./components/RevenueSimulator";
import { BoostedDistributorSection } from "./components/BoostedDistributorSection";
import { CtaSection } from "./components/CtaSection";
import "./vanguard.css";

export function VanguardDistributorProgramme() {
  return (
    <div className="vanguard-page">
      <HeroSection />
      <HowItWorks />
      <RevenueTable />
      <RevenueSimulator />
      <BoostedDistributorSection />
      <CtaSection />
    </div>
  );
}
