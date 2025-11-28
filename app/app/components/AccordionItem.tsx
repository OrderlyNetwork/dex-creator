import React from "react";
import { toast } from "react-toastify";
import { Card } from "./Card";
import { Button } from "./Button";

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
}) => {
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
            toast.error("Please complete the previous required steps first.");
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
              <span className="text-sm text-gray-500">(Optional)</span>
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
        <div className="p-3 md:p-6 border-t border-light/10 slide-fade-in bg-base-8/30">
          {children}
          <div className="mt-6 flex justify-end space-x-3">
            {showSkip && (
              <Button
                variant="secondary"
                onClick={() => onNextInternal(true)}
                type="button"
                size="sm"
              >
                Skip
              </Button>
            )}
            <Button
              variant="primary"
              onClick={() => onNextInternal(false)}
              type="button"
              size="sm"
              disabled={!isOptional && !isStepContentValidTest}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default AccordionItem;
