import {
  useState,
  useEffect,
  useCallback,
  useReducer,
  FormEvent,
  useMemo,
  useRef,
} from "react";
import { useAccount } from "wagmi";
import { useTranslation } from "~/i18n";
import { toast } from "react-toastify";
import { postFormData, createDexFormData } from "../utils/apiClient";
import { buildDexDataToSend } from "../utils/dexDataBuilder";
import { Button } from "./Button";
import Form from "./Form";
import DexSectionRenderer, {
  DEX_SECTION_KEYS,
  getDexSections,
} from "./DexSectionRenderer";
import { useDexForm } from "../hooks/useDexForm";
import { DexData, ThemeTabType } from "../types/dex";
import { useBindDistrubutorCode } from "../hooks/useBindDistrubutorCode";
import { verifyDistributorCodeMessage } from "../service/distrubutorCode";
import { useDistributorCode } from "../hooks/useDistrubutorInfo";
import { useDistributor } from "../context/DistributorContext";
import { trackEvent } from "~/analytics/tracking";
import { useThemeHandlers } from "../hooks/useThemeHandlers";
import { setBuildPathSelectCallback } from "./BuildPathSection";
import {
  setDexCreateCallback,
  resetPaymentDone,
  setOnPaymentDoneChange,
} from "./GraduationPaymentSection";
import type { IntegrationType } from "./BuildPathSection";

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
  const { t } = useTranslation();
  const form = useDexForm();
  const { bindDistributorCode } = useBindDistrubutorCode();

  const [isSaving, setIsSaving] = useState(false);
  const [isForking] = useState(false);
  const [forkingStatus, setForkingStatus] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>(
    {}
  );
  const [isValidating, setIsValidating] = useState(false);
  const [selectedBuildPath, setSelectedBuildPath] =
    useState<IntegrationType | null>(null);
  const [hasBoundDistributorCode, setHasBoundDistributorCode] = useState(false);
  const [, forceUpdate] = useReducer(c => c + 1, 0);

  const { address } = useAccount();

  const { distributorInfo } = useDistributor();
  const urlDistributorCode = useDistributorCode();

  const isCustomPath = selectedBuildPath === "custom";
  const shouldRequireDistributorBindingForCustomBuildPath =
    selectedBuildPath === "custom" &&
    !!form.distributorCode.trim() &&
    !distributorInfo?.exist &&
    !hasBoundDistributorCode;
  const dexCreatedRef = useRef(false);

  const allSections = useMemo(() => {
    return getDexSections().filter(section => {
      return section.key !== DEX_SECTION_KEYS.AnalyticsConfiguration;
    });
  }, [t]);

  const effectiveSections = useMemo(() => {
    if (isCustomPath) {
      const coreSections = allSections.slice(0, 3);
      const graduationPaymentSection = allSections.find(
        s => s.key === DEX_SECTION_KEYS.GraduationPayment
      );
      const adminWalletSection = allSections.find(
        s => s.key === DEX_SECTION_KEYS.AdminWalletRegistration
      );
      const customSections = [
        ...coreSections,
        ...(graduationPaymentSection ? [graduationPaymentSection] : []),
        ...(adminWalletSection ? [adminWalletSection] : []),
      ];
      return customSections.map((s, i) => ({ ...s, id: i + 1 }));
    }
    return allSections.filter(s => {
      return (
        s.key !== DEX_SECTION_KEYS.GraduationPayment &&
        s.key !== DEX_SECTION_KEYS.AdminWalletRegistration
      );
    });
  }, [allSections, isCustomPath]);

  useEffect(() => {
    trackEvent("dex_form_start", {
      wallet_address: address ? `addr_${address}` : "",
    });
  }, []);

  useEffect(() => {
    if (distributorInfo?.exist) {
      setHasBoundDistributorCode(true);
    }
  }, [distributorInfo?.exist]);

  const totalSteps = useMemo(() => {
    return effectiveSections.length;
  }, [effectiveSections]);

  const { handleGenerateTheme, handleResetTheme, handleResetToDefault } =
    useThemeHandlers({
      token,
      form,
      originalThemeCSS: null,
    });

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
      const stepConfig = effectiveSections.find(s => s.id === i);
      if (stepConfig && !stepConfig.isOptional && !completedSteps[i]) {
        return false;
      }
    }
    return true;
  };

  const handleBuildPathSelect = useCallback((pathType: IntegrationType) => {
    setSelectedBuildPath(pathType);
  }, []);

  const advanceToStep = (targetStep: number) => {
    setCurrentStep(targetStep);
    setTimeout(() => {
      const nextStepElement = document.getElementById(`step-${targetStep}`);
      if (nextStepElement) {
        nextStepElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "start",
        });
      }
    }, 100);
  };

  const createDexIfNeeded = useCallback(async (): Promise<boolean> => {
    if (dexCreatedRef.current) return true;

    const brokerError = form.brokerNameValidator(form.brokerName.trim());
    if (brokerError !== null) {
      toast.error(brokerError as string);
      return false;
    }

    try {
      setIsSaving(true);

      if (
        !distributorInfo?.exist &&
        !hasBoundDistributorCode &&
        form.distributorCode.trim()
      ) {
        const binded = await bindDistributorCode(form.distributorCode.trim());
        if (!binded) return false;
        setHasBoundDistributorCode(true);
      }

      const { formData: formValues } = await form.getFormDataWithBase64Images();
      const imageBlobs = {
        primaryLogo: form.primaryLogo,
        secondaryLogo: form.secondaryLogo,
        favicon: form.favicon,
        pnlPosters: form.pnlPosters,
      };

      const dexDataToSend = buildDexDataToSend(formValues);
      const formData = createDexFormData(dexDataToSend, imageBlobs);
      formData.append("integrationType", "custom");

      await postFormData<DexData>("api/dex", formData, token, {
        showToastOnError: false,
      });

      trackEvent("create_dex_success");
      dexCreatedRef.current = true;
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error creating broker:", error);
      toast.error(errorMessage || t("dex.setupAssistant.failedToCreate"));
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [
    form,
    distributorInfo,
    hasBoundDistributorCode,
    bindDistributorCode,
    token,
    t,
  ]);

  useEffect(() => {
    setBuildPathSelectCallback(handleBuildPathSelect);
    if (isCustomPath) {
      setDexCreateCallback(createDexIfNeeded);
    }
    setOnPaymentDoneChange(() => forceUpdate());
    return () => {
      setBuildPathSelectCallback(null);
      resetPaymentDone();
      if (isCustomPath) {
        setDexCreateCallback(null);
      }
    };
  }, [handleBuildPathSelect, isCustomPath, createDexIfNeeded, forceUpdate]);

  const handleNextStep = async (step: number, skip?: boolean) => {
    const currentStepConfig = effectiveSections.find(s => s.id === step);

    if (currentStepConfig?.key === DEX_SECTION_KEYS.BuildPath) {
      if (!selectedBuildPath) {
        toast.error(t("dex.buildPath.selectRequired"));
        return;
      }

      if (shouldRequireDistributorBindingForCustomBuildPath) {
        setIsValidating(true);
        try {
          const binded = await bindDistributorCode(form.distributorCode.trim());
          if (!binded) return;
          setHasBoundDistributorCode(true);
        } finally {
          setIsValidating(false);
        }
      }

      setCompletedSteps(prev => ({ ...prev, [step]: true }));
      advanceToStep(step + 1);
      return;
    }

    if (
      currentStepConfig &&
      currentStepConfig.key === DEX_SECTION_KEYS.DistributorCode &&
      !distributorInfo?.exist
    ) {
      if (skip) {
        form.setDistributorCode("");
      } else {
        const distributorCode = form.distributorCode.trim();

        if (!distributorCode) {
          toast.error(t("dex.setupAssistant.pleaseInputDistributorCode"));
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
              : t("dex.setupAssistant.distributorCodeInvalid")
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
            : t("dex.setupAssistant.brokerNameInvalid")
        );
        return;
      }
    }

    if (
      step ===
      effectiveSections.find(s => s.title === "Privy Configuration")?.id
    ) {
      const privyTermsOfUseFilled =
        form.privyTermsOfUse && form.privyTermsOfUse.trim() !== "";

      if (
        privyTermsOfUseFilled &&
        form.urlValidator(form.privyTermsOfUse.trim()) !== null
      ) {
        toast.error(t("dex.setupAssistant.privyTermsInvalid"));
        return;
      }
    }

    setCompletedSteps(prev => ({ ...prev, [step]: true }));

    trackEvent("dex_form_step_complete", {
      step_number: step,
      step_name: currentStepConfig?.key || "",
      step_title: currentStepConfig?.title || "",
      is_skipped: !!skip,
      wallet_address: address ? `addr_${address}` : "",
      broker_name: form.brokerName.trim() || undefined,
    });

    if (isCustomPath) {
      if (currentStepConfig?.key === DEX_SECTION_KEYS.AdminWalletRegistration) {
        await refreshDexData();
        return;
      }

      if (step < totalSteps) {
        advanceToStep(step + 1);
      } else {
        await refreshDexData();
      }
    } else {
      if (step < totalSteps) {
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
        setCurrentStep(totalSteps + 1);
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  };

  const validateAllSections = async () => {
    const sectionProps = form.getSectionProps({
      handleResetTheme,
      handleResetToDefault,
      ThemeTabButton,
    });

    const validationErrors: string[] = [];

    for (const section of effectiveSections) {
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
    if (!isCustomPath && isSwapEnabled && form.swapFeeBps === null) {
      validationErrors.push(t("dex.setupAssistant.navMenusSwapFeeRequired"));
    }

    return validationErrors;
  };

  const createDex = async (options: {
    forkingStatus: string;
    successMessageWithRepo: string;
    successMessageWithoutRepo: string;
    onSuccess?: (savedData: DexData) => void | Promise<void>;
    isQuickSetup?: boolean;
  }) => {
    const validationErrors = await validateAllSections();
    if (validationErrors.length > 0) {
      toast.error(validationErrors[0]);
      return;
    }

    try {
      setIsSaving(true);

      if (
        !distributorInfo?.exist &&
        !hasBoundDistributorCode &&
        form.distributorCode.trim()
      ) {
        const binded = await bindDistributorCode(form.distributorCode.trim());
        if (!binded) {
          setIsSaving(false);
          return;
        }
        setHasBoundDistributorCode(true);
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
      formData.append("integrationType", selectedBuildPath || "low_code");

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
      } else if (!isCustomPath) {
        toast.success(options.successMessageWithoutRepo);
        toast.warning(t("dex.setupAssistant.repoCouldNotFork"));
      } else {
        toast.success(options.successMessageWithoutRepo);
      }

      trackEvent("create_dex_success", {
        broker_name: form.brokerName.trim(),
        wallet_address: address ? `addr_${address}` : "",
        is_quick_setup: !!options.isQuickSetup,
        sections_completed: Object.keys(completedSteps).length,
        total_sections: totalSteps,
      });

      if (options.onSuccess) {
        await options.onSuccess(savedData);
      }

      await refreshDexData();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error creating DEX:", error);
      toast.error(errorMessage || t("dex.setupAssistant.failedToCreate"));
    } finally {
      setIsSaving(false);
      setForkingStatus("");
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    await createDex({
      forkingStatus: t("dex.setupAssistant.creatingDex"),
      successMessageWithRepo: t("dex.setupAssistant.successWithRepo"),
      successMessageWithoutRepo: t("dex.setupAssistant.successWithoutRepo"),
    });
  };

  const handleQuickSetup = async () => {
    trackEvent("click_quick_setup", {
      wallet_address: address ? `addr_${address}` : "",
      broker_name: form.brokerName.trim(),
    });
    await createDex({
      forkingStatus: t("dex.setupAssistant.quickSetupForking"),
      successMessageWithRepo: t("dex.setupAssistant.quickSetupSuccessWithRepo"),
      successMessageWithoutRepo:
        selectedBuildPath === "custom"
          ? t("dex.custom.successMessage")
          : t("dex.setupAssistant.quickSetupSuccessWithoutRepo"),
      isQuickSetup: true,
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
            {isCustomPath
              ? t("dex.custom.settingUp")
              : t("dex.setupAssistant.settingUpDex")}
          </div>
        </div>
      </div>
    );
  }

  const quickSetup = !isCustomPath &&
    form.brokerName.trim() &&
    !(currentStep > totalSteps && completedSteps[totalSteps]) && (
      <div
        id="quick-setup"
        className="mb-4 p-6 bg-primary/5 border border-primary/20 rounded-lg slide-fade-in flex flex-col items-center justify-center"
      >
        <h3 className="text-lg font-semibold text-primary-light mb-2 flex items-center justify-center">
          <div className="i-mdi:lightning-bolt h-5 w-5 mr-2"></div>
          {t("dex.setupAssistant.quickSetup")}
        </h3>
        <p className="text-gray-300 mb-4">
          {t("dex.setupAssistant.quickSetupDesc")}
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
              {t("dex.setupAssistant.creatingDexShort")}
            </>
          ) : (
            <>
              <div className="i-mdi:rocket-launch h-4 w-4 mr-2"></div>
              {t("dex.setupAssistant.createDexNow")}
            </>
          )}
        </Button>
      </div>
    );

  return (
    <div className="container mx-auto p-4 max-w-3xl mt-26 pb-52">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold gradient-text">
          {isCustomPath ? t("dex.custom.title") : t("dex.setupAssistant.title")}
        </h1>
      </div>

      <Form
        onSubmit={isCustomPath ? () => {} : handleSubmit}
        className="flex flex-col gap-4"
        submitText={
          !isCustomPath &&
          currentStep > totalSteps &&
          completedSteps[totalSteps]
            ? t("dex.setupAssistant.createYourDex")
            : ""
        }
        isLoading={isSaving}
        loadingText={t("dex.setupAssistant.creatingDexShort")}
        disabled={
          isForking ||
          isSaving ||
          !(
            !isCustomPath &&
            currentStep > totalSteps &&
            completedSteps[totalSteps]
          )
        }
        enableRateLimit={false}
      >
        <DexSectionRenderer
          mode="accordion"
          sections={effectiveSections}
          sectionProps={form.getSectionProps({
            handleResetTheme: () => handleResetTheme(false),
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
            if (
              isCustomPath &&
              section.key === DEX_SECTION_KEYS.AdminWalletRegistration
            ) {
              return true;
            }
            return false;
          }}
          customDescription={section => {
            if (section.key === DEX_SECTION_KEYS.DistributorCode) {
              return distributorInfo?.exist
                ? t("dex.setupAssistant.invitedByDistributor")
                : section.description;
            }
            return section.description;
          }}
          getFooterNote={section => {
            if (
              section.key === DEX_SECTION_KEYS.BuildPath &&
              shouldRequireDistributorBindingForCustomBuildPath
            ) {
              return t("dex.buildPath.custom.signatureHint");
            }
            return undefined;
          }}
          isValidating={isValidating}
        />
      </Form>

      {!isCustomPath &&
        currentStep > totalSteps &&
        completedSteps[totalSteps] &&
        !isSaving && (
          <div className="mt-8 p-6 bg-success/10 border border-success/20 rounded-lg text-center slide-fade-in">
            <h3 className="text-lg font-semibold text-success mb-2">
              {t("dex.setupAssistant.allStepsCompleted")}
            </h3>
            <p className="text-gray-300 mb-4">
              {t("dex.setupAssistant.readyToCreate")}
            </p>
          </div>
        )}
    </div>
  );
}
