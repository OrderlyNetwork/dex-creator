import React from "react";
import { toast } from "react-toastify";
import { useTranslation } from "~/i18n";
import { Card } from "./Card";
import { Button } from "./Button";
import clsx from "clsx";

export interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  stepNumber: number;
  isOptional: boolean;
  showSkip?: boolean;
  onNextInternal: (skip?: boolean) => void;
  isStepContentValidTest: boolean;
  isActive: boolean;
  isCompleted: boolean;
  canOpen: boolean;
  setCurrentStep: (step: number) => void;
  allRequiredPreviousStepsCompleted: (stepNumber: number) => boolean;
  value?: string;
  isValidating?: boolean;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  children,
  stepNumber,
  isOptional,
  showSkip,
  onNextInternal,
  isStepContentValidTest,
  isActive,
  isCompleted,
  canOpen,
  setCurrentStep,
  allRequiredPreviousStepsCompleted,
  value,
  isValidating,
}) => {
  const { t } = useTranslation();
  return (
    <Card
      id={`step-${stepNumber}`}
      className={`overflow-visible transition-all duration-300 ease-in-out ${
        isActive ? "border-primary shadow-lg" : "border-light/10"
      }`}
    >
      <div
        className={`flex justify-between items-center p-4 cursor-pointer hover:bg-base-7/80 ${
          isCompleted && !isActive ? "bg-base-7/30" : ""
        }`}
        onClick={() => {
          if (canOpen) {
            setCurrentStep(stepNumber);
          } else if (
            stepNumber > 1 &&
            !allRequiredPreviousStepsCompleted(stepNumber)
          ) {
            toast.error(t("accordionItem.completePreviousSteps"));
          }
        }}
      >
        <div className="flex items-center">
          {isCompleted && (
            <div className="i-mdi:check-circle text-success h-5 w-5 mr-3"></div>
          )}
          <h3
            className={`text-lg font-bold ${
              isCompleted && !isActive ? "text-gray-400" : "text-white"
            }`}
          >
            {title}
            {isOptional && (
              <span className="text-sm text-gray-500">
                {" "}
                ({t("accordionItem.optional")})
              </span>
            )}
          </h3>
        </div>

        <div className="flex items-center gap-5">
          {!isActive && <span className="text-sm">{value}</span>}

          <div
            className={`i-mdi:chevron-down h-6 w-6 transition-transform ${
              isActive ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>
      {isActive && (
        <div
          className={clsx(
            "p-3 md:p-6 border-t border-light/10 slide-fade-in bg-base-8/30",
            // when isValidating is true, disabled user interaction
            isValidating ? "pointer-events-none" : ""
          )}
        >
          {children}
          <div className="mt-6 flex justify-end space-x-3">
            {showSkip && (
              <Button
                variant="secondary"
                onClick={() => onNextInternal(true)}
                type="button"
                size="sm"
              >
                {t("accordionItem.skip")}
              </Button>
            )}
            <Button
              variant="primary"
              onClick={() => onNextInternal(false)}
              type="button"
              size="sm"
              disabled={!isOptional && !isStepContentValidTest}
              isLoading={isValidating}
            >
              {t("common.next")}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default AccordionItem;
