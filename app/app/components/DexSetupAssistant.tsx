import { useState, FormEvent } from "react";
import { toast } from "react-toastify";
import { useModal } from "../context/ModalContext";
import { postFormData, createDexFormData } from "../utils/apiClient";
import { buildDexDataToSend } from "../utils/dexDataBuilder";
import { Button } from "./Button";
import Form from "./Form";
import DexSectionRenderer, {
  DEX_SECTION_KEYS,
  DEX_SECTIONS,
} from "./DexSectionRenderer";
import { useDexForm } from "../hooks/useDexForm";
import { DexData, ThemeTabType } from "../types/dex";
import { useBindDistrubutorCode } from "../hooks/useBindDistrubutorCode";
import { verifyDistributorCodeMessage } from "../service/distrubutorCode";
import { useDistributorCode } from "../hooks/useDistrubutorInfo";
import { useDistributor } from "../context/DistributorContext";

const TOTAL_STEPS = DEX_SECTIONS.length;

interface DexSetupAssistantProps {
  token: string;
  updateDexData: (data: Partial<DexData>) => void;
  refreshDexData: () => Promise<void>;
}

export default function DexSetupAssistant({
  token,
  updateDexData,
  refreshDexData,
}: DexSetupAssistantProps) {
  const form = useDexForm();
  const { openModal } = useModal();
  const { bindDistributorCode } = useBindDistrubutorCode();

  const [isSaving, setIsSaving] = useState(false);
  const [isForking] = useState(false);
  const [forkingStatus, setForkingStatus] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>(
    {}
  );
  const [isValidating, setIsValidating] = useState(false);

  const { distributorInfo } = useDistributor();
  const urlDistributorCode = useDistributorCode();

  const handleApplyGeneratedTheme = (modifiedCss: string) => {
    form.setCurrentTheme(modifiedCss);
  };

  const handleCancelGeneratedTheme = () => {};

  const handleGenerateTheme = async () => {
    if (!token) return;

    form.setIsGeneratingTheme(true);
    await form.generateTheme(
      token,
      null,
      handleApplyGeneratedTheme,
      handleCancelGeneratedTheme,
      openModal,
      undefined,
      undefined,
      "desktop"
    );
    form.setIsGeneratingTheme(false);
  };

  const handleResetTheme = () => {
    form.resetTheme(null);
    form.setTradingViewColorConfig(null);
    form.setShowThemeEditor(false);
    form.setViewCssCode(false);
  };

  const handleResetToDefault = () => {
    form.resetThemeToDefault();
    form.setShowThemeEditor(false);
    form.setViewCssCode(false);
  };

  const ThemeTabButton = ({
    tab: _tab,
    label,
  }: {
    tab: ThemeTabType;
    label: string;
  }) => (
    <button
      className="px-4 py-2 text-sm font-medium rounded-t-lg bg-transparent text-gray-400 hover:text-white"
      type="button"
      disabled
    >
      {label}
    </button>
  );

  const allRequiredPreviousStepsCompleted = (stepNumber: number) => {
    if (stepNumber === 1) return true;
    for (let i = 1; i < stepNumber; i++) {
      const stepConfig = DEX_SECTIONS.find(s => s.id === i);
      if (stepConfig && !stepConfig.isOptional && !completedSteps[i]) {
        return false;
      }
    }
    return true;
  };

  const handleNextStep = async (step: number, skip?: boolean) => {
    const currentStepConfig = DEX_SECTIONS.find(s => s.id === step);

    if (
      currentStepConfig &&
      currentStepConfig.key === DEX_SECTION_KEYS.DistributorCode &&
      !distributorInfo?.exist
    ) {
      if (skip) {
        form.setDistributorCode("");
      } else {
        // only validate distributor code if it is filled
        const distributorCode = form.distributorCode.trim();

        if (!distributorCode) {
          toast.error("Please input distributor code.");
          return;
        }

        let validationError = form.distributorCodeValidator(distributorCode);

        if (!validationError) {
          setIsValidating(true);
          validationError = await verifyDistributorCodeMessage(distributorCode);
          setIsValidating(false);
        }

        if (validationError !== null) {
          toast.error(
            typeof validationError === "string"
              ? validationError
              : "Distributor code is invalid. It must be between 4 and 10 characters."
          );
          return;
        }
      }
    }

    if (
      currentStepConfig &&
      !currentStepConfig.isOptional &&
      !skip &&
      currentStepConfig.key === DEX_SECTION_KEYS.BrokerDetails
    ) {
      const validationError = form.brokerNameValidator(form.brokerName.trim());
      if (validationError !== null) {
        toast.error(
          typeof validationError === "string"
            ? validationError
            : "Broker name is invalid. It must be between 3 and 50 characters."
        );
        return;
      }
    }

    if (
      step === DEX_SECTIONS.find(s => s.title === "Privy Configuration")?.id
    ) {
      const privyTermsOfUseFilled =
        form.privyTermsOfUse && form.privyTermsOfUse.trim() !== "";

      if (
        privyTermsOfUseFilled &&
        form.urlValidator(form.privyTermsOfUse.trim()) !== null
      ) {
        toast.error("Privy Terms of Use URL is not a valid URL.");
        return;
      }
    }

    setCompletedSteps(prev => ({ ...prev, [step]: true }));
    if (step < TOTAL_STEPS) {
      setCurrentStep(step + 1);

      setTimeout(() => {
        const id =
          currentStepConfig?.key === DEX_SECTION_KEYS.BrokerDetails
            ? `step-${step}`
            : `step-${step + 1}`;

        const nextStepElement = document.getElementById(id);
        if (nextStepElement) {
          nextStepElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "start",
          });
        }
      }, 100);
    } else {
      setCurrentStep(TOTAL_STEPS + 1);
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
  };

  const validateAllSections = async () => {
    const sectionProps = form.getSectionProps({
      handleResetTheme,
      handleResetToDefault,
      ThemeTabButton,
    });

    const validationErrors: string[] = [];

    for (const section of DEX_SECTIONS) {
      if (section.key === DEX_SECTION_KEYS.DistributorCode) {
        const code = form.distributorCode.trim();
        if (code && !distributorInfo?.exist) {
          const error =
            form.distributorCodeValidator(code) ||
            (await verifyDistributorCodeMessage(code));
          error && validationErrors.push(error);
        }
      } else if (section.getValidationTest) {
        const isValid = section.getValidationTest(sectionProps);
        if (!isValid) {
          const commonErrorMessage = `${section.title}: validation failed`;
          if (section.key === DEX_SECTION_KEYS.BrokerDetails) {
            const error = form.brokerNameValidator(form.brokerName.trim());
            validationErrors.push(error || commonErrorMessage);
          } else if (section.key === DEX_SECTION_KEYS.PrivyConfiguration) {
            validationErrors.push(
              `${section.title}: Please enter a valid Terms of Use URL`
            );
          } else {
            validationErrors.push(commonErrorMessage);
          }
        }
      }
    }

    const isSwapEnabled = form.enabledMenus.split(",").includes("Swap");
    if (isSwapEnabled && form.swapFeeBps === null) {
      validationErrors.push(
        "Navigation Menus: Swap fee configuration is required when Swap page is enabled"
      );
    }

    return validationErrors;
  };

  const createDex = async (options: {
    forkingStatus: string;
    successMessageWithRepo: string;
    successMessageWithoutRepo: string;
    onSuccess?: (savedData: DexData) => void | Promise<void>;
  }) => {
    const validationErrors = await validateAllSections();
    if (validationErrors.length > 0) {
      toast.error(validationErrors[0]);
      return;
    }

    try {
      setIsSaving(true);

      // only if it is not bound yet
      if (!distributorInfo?.exist && form.distributorCode.trim()) {
        const binded = await bindDistributorCode(form.distributorCode.trim());
        if (!binded) {
          setIsSaving(false);
          return;
        }
      }

      setForkingStatus(options.forkingStatus);
      const { formData: formValues } = await form.getFormDataWithBase64Images();

      const imageBlobs = {
        primaryLogo: form.primaryLogo,
        secondaryLogo: form.secondaryLogo,
        favicon: form.favicon,
        pnlPosters: form.pnlPosters,
      };

      const dexDataToSend = buildDexDataToSend(formValues);
      const formData = createDexFormData(dexDataToSend, imageBlobs);

      const savedData = await postFormData<DexData>(
        "api/dex",
        formData,
        token,
        {
          showToastOnError: false,
        }
      );

      if (savedData.repoUrl) {
        toast.success(options.successMessageWithRepo);
      } else {
        toast.success(options.successMessageWithoutRepo);
        toast.warning("Repository could not be forked. You can retry later.");
      }

      if (options.onSuccess) {
        await options.onSuccess(savedData);
      }

      await refreshDexData();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error creating DEX:", error);
      toast.error(errorMessage || "Failed to create DEX. Please try again.");
    } finally {
      setIsSaving(false);
      setForkingStatus("");
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    await createDex({
      forkingStatus: "Creating DEX and forking repository...",
      successMessageWithRepo: "DEX created and repository forked successfully!",
      successMessageWithoutRepo: "DEX information saved successfully!",
    });
  };

  const handleQuickSetup = async () => {
    await createDex({
      forkingStatus: "Creating DEX with current settings...",
      successMessageWithRepo:
        "DEX created with current settings! Repository is being set up.",
      successMessageWithoutRepo: "DEX created with current settings!",
      onSuccess: savedData => {
        updateDexData(savedData);
      },
    });
  };

  if ((isSaving || isForking) && forkingStatus) {
    return (
      <div className="w-full h-[calc(100vh-64px)] flex items-center justify-center px-4 mt-26 pb-52">
        <div className="text-center">
          <div className="i-svg-spinners:pulse-rings-multiple h-12 w-12 mx-auto text-primary-light mb-4"></div>
          <div className="text-lg md:text-xl mb-4 font-medium">
            {forkingStatus}
          </div>
          <div className="text-xs md:text-sm text-gray-400 max-w-sm mx-auto">
            This may take a moment. We're setting up your DEX repository and
            configuring it with your information.
          </div>
        </div>
      </div>
    );
  }

  const quickSetup = form.brokerName.trim() &&
    !(currentStep > TOTAL_STEPS && completedSteps[TOTAL_STEPS]) && (
      <div
        id="quick-setup"
        className="mb-4 p-6 bg-primary/5 border border-primary/20 rounded-lg slide-fade-in flex flex-col items-center justify-center"
      >
        <h3 className="text-lg font-semibold text-primary-light mb-2 flex items-center justify-center">
          <div className="i-mdi:lightning-bolt h-5 w-5 mr-2"></div>
          Quick Setup
        </h3>
        <p className="text-gray-300 mb-4">
          Create your DEX with current settings. You can customize it later.
        </p>
        <Button
          variant="primary"
          onClick={handleQuickSetup}
          disabled={isSaving || isForking}
          className="shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isSaving || isForking ? (
            <>
              <div className="i-svg-spinners:pulse-rings-multiple h-4 w-4 mr-2"></div>
              Creating DEX...
            </>
          ) : (
            <>
              <div className="i-mdi:rocket-launch h-4 w-4 mr-2"></div>
              Create DEX Now
            </>
          )}
        </Button>
      </div>
    );

  return (
    <div className="container mx-auto p-4 max-w-3xl mt-26 pb-52">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold gradient-text">
          Create Your DEX - Step-by-Step
        </h1>
      </div>

      <Form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
        submitText={
          currentStep > TOTAL_STEPS && completedSteps[TOTAL_STEPS]
            ? "Create Your DEX"
            : ""
        }
        isLoading={isSaving}
        loadingText="Creating DEX..."
        disabled={
          isForking ||
          isSaving ||
          !(currentStep > TOTAL_STEPS && completedSteps[TOTAL_STEPS])
        }
        enableRateLimit={false}
      >
        <DexSectionRenderer
          mode="accordion"
          sections={DEX_SECTIONS}
          sectionProps={form.getSectionProps({
            handleResetTheme,
            handleResetToDefault,
            ThemeTabButton,
          })}
          handleGenerateTheme={handleGenerateTheme}
          currentStep={currentStep}
          completedSteps={completedSteps}
          setCurrentStep={setCurrentStep}
          handleNextStep={handleNextStep}
          allRequiredPreviousStepsCompleted={allRequiredPreviousStepsCompleted}
          customRender={(children, section) => {
            if (section.key === DEX_SECTION_KEYS.Branding) {
              return (
                <div>
                  {quickSetup}
                  {children}
                </div>
              );
            }
            return children;
          }}
          shouldShowSkip={section => {
            if (section.key === DEX_SECTION_KEYS.DistributorCode) {
              const hideSkip =
                !!distributorInfo?.exist ||
                (!!urlDistributorCode &&
                  urlDistributorCode ===
                    form.distributorCode.trim().toUpperCase());

              return !hideSkip;
            }
            return false;
          }}
          customDescription={section => {
            if (section.key === DEX_SECTION_KEYS.DistributorCode) {
              return distributorInfo?.exist
                ? "You have been invited by the following distributor."
                : section.description;
            }
            return section.description;
          }}
          isValidating={isValidating}
        />
      </Form>

      {currentStep > TOTAL_STEPS &&
        completedSteps[TOTAL_STEPS] &&
        !isSaving && (
          <div className="mt-8 p-6 bg-success/10 border border-success/20 rounded-lg text-center slide-fade-in">
            <h3 className="text-lg font-semibold text-success mb-2">
              All steps completed!
            </h3>
            <p className="text-gray-300 mb-4">
              You're ready to create your DEX. Click the "Create Your DEX"
              button above to proceed.
            </p>
          </div>
        )}
    </div>
  );
}
