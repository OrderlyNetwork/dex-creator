import React, { useEffect, useState } from "react";
import { useTranslation } from "~/i18n";
import { DexSectionConfig } from "./DexSectionRenderer";

interface ProgressTrackerProps {
  sections: DexSectionConfig[];
  currentSection: number;
  onSectionClick: (sectionId: number) => void;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  sections,
  currentSection,
  onSectionClick,
}) => {
  const { t } = useTranslation();
  const [visibleSections, setVisibleSections] = useState<Set<number>>(
    new Set()
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        setVisibleSections(prevVisibleSections => {
          const newVisibleSections = new Set(prevVisibleSections);

          entries.forEach(entry => {
            const sectionId = parseInt(
              entry.target.getAttribute("data-section-id") || "0"
            );

            if (entry.isIntersecting) {
              newVisibleSections.add(sectionId);
            } else {
              newVisibleSections.delete(sectionId);
            }
          });

          return newVisibleSections;
        });
      },
      {
        rootMargin: "-20% 0px -20% 0px",
        threshold: 0.1,
      }
    );

    const sectionElements = document.querySelectorAll("[data-section-id]");
    sectionElements.forEach(element => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const handleSectionClick = (sectionId: number) => {
    const sectionElement = document.querySelector(
      `[data-section-id="${sectionId}"]`
    );
    if (sectionElement) {
      sectionElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    onSectionClick(sectionId);
  };

  const isSectionVisible = (sectionId: number) =>
    visibleSections.has(sectionId);
  const isSectionCompleted = (section: DexSectionConfig) => {
    return section.id < currentSection;
  };

  const getProgressPercentage = () => {
    if (sections.length === 0) return 0;
    return Math.round((currentSection / sections.length) * 100);
  };

  return (
    <div className="w-64 flex-shrink-0 hidden md:block">
      <div className="sticky top-26 bg-background-dark/50 backdrop-blur-sm rounded-lg border border-light/10 p-3 max-h-[calc(100vh-120px)] overflow-y-auto progress-tracker-scrollbar">
        <h3 className="text-sm font-semibold text-white mb-4">
          {t("progressTracker.configurationProgress")}
        </h3>

        <div className="space-y-1">
          {sections.map((section, index) => {
            const isVisible = isSectionVisible(section.id);
            const isCompleted = isSectionCompleted(section);
            const isCurrent = section.id === currentSection;

            return (
              <div key={section.id} className="relative">
                {index < sections.length - 1 && (
                  <div className="absolute left-2.5 top-7 w-0.5 h-5 bg-gray-600"></div>
                )}

                <button
                  type="button"
                  onClick={() => handleSectionClick(section.id)}
                  className={`w-full text-left p-2 rounded-lg transition-all duration-200 group ${
                    isCurrent
                      ? "bg-primary/20 border border-primary/30 text-primary-light"
                      : isVisible
                        ? "bg-background-light/20 border border-light/20 text-white"
                        : isCompleted
                          ? "bg-success/10 border border-success/20 text-success hover:bg-success/20"
                          : "bg-background-light/10 border border-light/10 text-gray-400 hover:bg-background-light/20 hover:text-gray-300"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCurrent
                          ? "bg-primary text-white"
                          : isCompleted
                            ? "bg-success text-white"
                            : "bg-gray-600 text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <div className="i-mdi:check text-xs"></div>
                      ) : (
                        <span className="text-xs font-medium">{index + 1}</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">
                        {section.label || section.title}
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-light/10">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>{t("progressTracker.progress")}</span>
            <span>{getProgressPercentage()}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary to-primary-light h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
