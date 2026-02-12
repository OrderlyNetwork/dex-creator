import type { MetaFunction } from "@remix-run/node";
import { useState } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { i18n, useTranslation } from "~/i18n";

export const meta: MetaFunction = () => [
  { title: "Case Studies | Orderly One" },
];

const caseStudies = [
  {
    id: "aden",
    name: "ADEN",
    description: i18n.t("caseStudies.aden.description"),
    image: "/aden.webp",
    dexUrl: "https://aden.io",
    socialUrl: "https://x.com/aden",
    stats: [
      { value: "$45B+", label: i18n.t("caseStudies.stats.totalTradingVolume") },
      { value: "2K+", label: i18n.t("caseStudies.stats.dailyActiveUsers") },
      { value: "#2", label: i18n.t("caseStudies.stats.rankingOnCMC") },
    ],
    treasuryFeatures: [
      {
        type: "paragraph",
        title: i18n.t("caseStudies.aden.treasury.title"),
        description: i18n.t("caseStudies.aden.treasury.paragraph1"),
        description2: i18n.t("caseStudies.aden.treasury.paragraph2"),
      },
    ],
  },
  {
    id: "noot",
    name: "NOOT",
    description: i18n.t("caseStudies.noot.description"),
    image: "/noot.webp",
    dexUrl: "https://nootrade.xyz",
    socialUrl: "https://x.com/nootonabstract",
    stats: [
      { value: "$10M+", label: i18n.t("caseStudies.stats.totalTradingVolume") },
      {
        value: "$4K+",
        label: i18n.t("caseStudies.noot.stats.revenueGeneratedForTreasury"),
      },
      { value: "815+", label: i18n.t("caseStudies.noot.stats.uniqueTraders") },
    ],
    treasuryFeatures: [
      {
        icon: "mdi:fire",
        title: i18n.t("caseStudies.noot.treasury.tokenBuybacks.title"),
        description: i18n.t(
          "caseStudies.noot.treasury.tokenBuybacks.description"
        ),
      },
      {
        icon: "mdi:account-group",
        title: i18n.t("caseStudies.noot.treasury.communityGrowth.title"),
        description: i18n.t(
          "caseStudies.noot.treasury.communityGrowth.description"
        ),
      },
      {
        icon: "mdi:currency-usd",
        title: i18n.t("caseStudies.noot.treasury.cexListings.title"),
        description: i18n.t(
          "caseStudies.noot.treasury.cexListings.description"
        ),
      },
    ],
  },
  {
    id: "lol",
    name: "LOL",
    description: i18n.t("caseStudies.lol.description"),
    image: "/lol.webp",
    dexUrl: "https://www.loldex.lol/",
    socialUrl: "https://x.com/lolctolol",
    stats: [
      { value: "$30M+", label: i18n.t("caseStudies.stats.totalTradingVolume") },
      {
        value: "$9K+",
        label: i18n.t("caseStudies.lol.stats.revenueUsedForBuybacks"),
      },
    ],
    treasuryFeatures: [
      {
        icon: "mdi:fire",
        title: i18n.t("caseStudies.lol.treasury.tokenBuybacks.title"),
        description: i18n.t(
          "caseStudies.lol.treasury.tokenBuybacks.description"
        ),
      },
      {
        icon: "mdi:account-group",
        title: i18n.t("caseStudies.lol.treasury.communityGrowth.title"),
        description: i18n.t(
          "caseStudies.lol.treasury.communityGrowth.description"
        ),
      },
      {
        icon: "mdi:currency-usd",
        title: i18n.t("caseStudies.lol.treasury.cexListings.title"),
        description: i18n.t("caseStudies.lol.treasury.cexListings.description"),
      },
    ],
  },
];

export default function CaseStudies() {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState("aden");

  const activeCaseStudy = caseStudies.find(study => study.id === activeTab);

  return (
    <div className="bg-black min-h-screen pb-52">
      <div className="relative z-10 mt-20 flex flex-col gap-8">
        {/* Header Section */}
        <section className="section-container flex flex-col items-center text-center pt-20 pb-16 relative overflow-hidden">
          {/* Background Video */}
          <div className="absolute inset-0 w-full h-full">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{ objectPosition: "center" }}
            >
              <source src="/banner.webm" type="video/webm" />
            </video>
            {/* Overlay to ensure text readability */}
            <div className="absolute inset-0 bg-black/40"></div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 max-w-5xl leading-tight text-white">
              {t("caseStudies.title")}
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mb-12 leading-relaxed mx-auto">
              {t("caseStudies.subtitle")}
            </p>

            <div className="flex justify-center">
              <div className="flex flex-wrap justify-center gap-2">
                {caseStudies.map(study => (
                  <button
                    key={study.id}
                    onClick={() => setActiveTab(study.id)}
                    className={`px-10 py-3 rounded-full font-semibold transition-all duration-200 ${
                      activeTab === study.id
                        ? "bg-purple-400 text-black"
                        : "bg-gray-800/50 text-white"
                    }`}
                  >
                    {study.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Case Study Content */}
        {activeCaseStudy && (
          <section className="section-container">
            <div className="max-w-6xl mx-auto space-y-32">
              {/* Main Case Study Card */}
              <Card className="p-8 md:p-12 bg-gradient-to-r from-purple-500/10 to-transparent border-purple-500/30">
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                  <div className="space-y-6">
                    <h2 className="text-4xl md:text-5xl font-bold text-white">
                      {activeCaseStudy.name}
                    </h2>

                    <div className="flex gap-4 flex-wrap">
                      <Button
                        variant="primary"
                        as="a"
                        href={activeCaseStudy.dexUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t("caseStudies.buttons.visitDex")}
                      </Button>
                      <Button
                        variant="secondary"
                        as="a"
                        href={activeCaseStudy.socialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t("caseStudies.buttons.discoverX")}
                      </Button>
                    </div>

                    <p className="text-lg text-white/80 leading-relaxed">
                      {activeCaseStudy.description}
                    </p>
                  </div>

                  <div className="relative ma max-w-xl">
                    <div className="bg-gradient-to-br rounded-2xl flex items-center justify-center overflow-hidden">
                      <img
                        src={activeCaseStudy.image}
                        alt={`${activeCaseStudy.name} DEX interface`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Stats Section */}
              <div className="text-center space-y-8">
                <div
                  className={`grid gap-8 ${
                    activeCaseStudy.stats.length === 2
                      ? "md:grid-cols-2"
                      : "md:grid-cols-3"
                  }`}
                >
                  {activeCaseStudy.stats.map((stat, index) => (
                    <div
                      key={index}
                      className="space-y-4 [&:not(:last-child)]:border-r border-white/10"
                    >
                      <div className="text-5xl md:text-6xl font-bold bg-gradient-to-t from-white to-purple-300 bg-clip-text text-transparent">
                        {stat.value}
                      </div>
                      <div className="text-lg text-white/80 font-medium">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                {activeCaseStudy.id !== "aden" && (
                  <p className="text-sm text-white/60">
                    {t("caseStudies.note.firstTwoMonths")}
                  </p>
                )}
              </div>

              {/* Treasury Features */}
              {activeCaseStudy.id === "aden" ? (
                // ADEN has a different layout
                <div className="grid lg:grid-cols-2 gap-16 items-start">
                  <div>
                    <h3 className="text-4xl md:text-5xl font-bold text-white mb-8">
                      {activeCaseStudy.treasuryFeatures[0].title}
                    </h3>
                  </div>

                  <div className="space-y-6">
                    <p className="text-white/80 leading-relaxed text-lg">
                      {activeCaseStudy.treasuryFeatures[0].description}
                    </p>
                    <p className="text-white/80 leading-relaxed text-lg">
                      {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (activeCaseStudy.treasuryFeatures[0] as any)
                          .description2
                      }
                    </p>
                  </div>
                </div>
              ) : (
                // NOOT and LOL have the standard layout with icons
                <div className="grid lg:grid-cols-2 gap-16 items-start max-w-6xl mx-auto">
                  <div>
                    <h3 className="text-4xl md:text-5xl font-bold text-white mb-8">
                      {t("caseStudies.treasury.sectionHeading")}
                    </h3>
                  </div>

                  <div>
                    {activeCaseStudy.treasuryFeatures.map((feature, index) => (
                      <div
                        key={index}
                        className="py-6 [&:not(:last-child)]:border-b border-white/10"
                      >
                        <div className="flex items-start gap-4">
                          <div className="size-8 bg-black rounded-full flex items-center justify-center">
                            <img
                              src={
                                feature.title.includes("Buybacks") ||
                                feature.title.includes("Burns")
                                  ? "/fire.svg"
                                  : feature.title.includes("Community") ||
                                      feature.title.includes("Growth")
                                    ? "/partner.svg"
                                    : "/money.svg"
                              }
                              alt={feature.title}
                              className="min-w-6 min-h-6"
                            />
                          </div>
                          <div>
                            <h4 className="text-2xl font-semibold bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent mb-2 w-fit">
                              {feature.title}
                            </h4>
                            <p className="text-white/80">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
