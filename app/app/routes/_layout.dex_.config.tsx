import { useState, useEffect, FormEvent, useMemo } from "react";
import type { MetaFunction } from "@remix-run/node";
import { toast } from "react-toastify";
import { useAuth } from "../context/useAuth";
import { putFormData, createDexFormData } from "../utils/apiClient";
import { buildDexDataToSend } from "../utils/dexDataBuilder";
import WalletConnect from "../components/WalletConnect";
import { Card } from "../components/Card";
import Form from "../components/Form";
import { useNavigate, Link } from "@remix-run/react";
import DexSectionRenderer, {
  DEX_SECTION_KEYS,
  DEX_SECTIONS,
} from "../components/DexSectionRenderer";
import { useDexForm } from "../hooks/useDexForm";
import { DexData, defaultTheme } from "../types/dex";
import { useBindDistrubutorCode } from "../hooks/useBindDistrubutorCode";
import { verifyDistributorCodeMessage } from "../service/distrubutorCode";
import { useDistributor } from "../context/DistributorContext";
import { useDex } from "../context/DexContext";
import { useThemeHandlers } from "../hooks/useThemeHandlers";

export const meta: MetaFunction = () => [
  { title: "Configure Your DEX - Orderly One" },
  {
    name: "description",
    content:
      "Customize your DEX configuration. Set up branding, wallets, networks, themes, and advanced features.",
  },
];

export default function DexConfigRoute() {
  const { isAuthenticated, token, isLoading } = useAuth();
  const navigate = useNavigate();
  const form = useDexForm();

  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDexData, setIsLoadingDexData] = useState(false);
  const { isGraduated } = useDex();
  const { distributorInfo } = useDistributor();

  // when the DEX is graduated and the distributor code is not bound, we need to hide the distributor code section because it is not allowed to change the distributor code after the DEX is graduated
  const filteredSections = useMemo(() => {
    return isGraduated && !distributorInfo?.exist
      ? DEX_SECTIONS.filter(
          section => section.key !== DEX_SECTION_KEYS.DistributorCode
        ).map((section, index) => ({
          ...section,
          // reset the id to the index + 1, others the progress tracker percentage will calculate incorrectly
          id: index + 1,
        }))
      : DEX_SECTIONS;
  }, [isGraduated, distributorInfo?.exist]);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    async function loadData() {
      setIsLoadingDexData(true);
      try {
        const response = await form.updateDexData(token);

        if (!response) {
          navigate("/dex");
          return;
        }
      } catch (error) {
        console.error("Failed to load DEX data", error);
        navigate("/dex");
      } finally {
        setIsLoadingDexData(false);
      }
    }

    loadData();
  }, [isAuthenticated, token, navigate]);

  useEffect(() => {
    if (!form.currentTheme && !form.dexData?.themeCSS) {
      form.setCurrentTheme(defaultTheme);
    }
  }, [form]);

  const { handleGenerateTheme, handleResetTheme, handleResetToDefault } =
    useThemeHandlers({
      token,
      form,
      originalThemeCSS: form.dexData?.themeCSS,
      tradingViewColorConfig: form.dexData?.tradingViewColorConfig,
    });

  const validateAllSections = async () => {
    const sectionProps = form.getSectionProps({
      handleResetTheme: () => handleResetTheme(true),
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
        // validate error
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

  const { bindDistributorCode } = useBindDistrubutorCode();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const validationErrors = await validateAllSections();
    if (validationErrors.length > 0) {
      toast.error(validationErrors[0]);
      return;
    }

    // only if it is not bound yet
    if (!distributorInfo?.exist && form.distributorCode.trim()) {
      const isBound = await bindDistributorCode(form.distributorCode.trim());
      if (!isBound) {
        return;
      }
    }

    setIsSaving(true);

    try {
      const { formData: formValues } = await form.getFormDataWithBase64Images();

      const imageBlobs = {
        primaryLogo: form.primaryLogo,
        secondaryLogo: form.secondaryLogo,
        favicon: form.favicon,
        pnlPosters: form.pnlPosters,
      };

      const dexDataToSend = buildDexDataToSend(formValues);

      const formData = createDexFormData(dexDataToSend, imageBlobs);

      if (form.dexData && form.dexData.id) {
        const savedData = await putFormData<DexData>(
          `api/dex/${form.dexData.id}`,
          formData,
          token,
          { showToastOnError: false }
        );

        form.setDexData(savedData);
        toast.success("DEX configuration updated successfully!");
        navigate("/dex#dex-creation-status");
      }
    } catch (error) {
      console.error("Error updating DEX:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update DEX configuration";

      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const ThemeTabButton = ({ label }: { label: string }) => (
    <button
      className="px-4 py-2 text-sm font-medium rounded-t-lg bg-transparent text-gray-400"
      type="button"
      disabled
    >
      {label}
    </button>
  );

  if (isLoading || isLoadingDexData) {
    return (
      <div className="w-full h-[calc(100vh-64px)] flex items-center justify-center px-4 mt-26 pb-52">
        <div className="text-center">
          <div className="i-svg-spinners:pulse-rings-multiple h-12 w-12 mx-auto text-primary-light mb-4"></div>
          <div className="text-base md:text-lg mb-2">
            Loading DEX Configuration
          </div>
          <div className="text-xs md:text-sm text-gray-400">
            Please wait while we fetch your settings
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-6 md:py-10 mt-26 pb-52">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 md:mb-6">
            DEX Configuration
          </h1>
          <Card>
            <h2 className="text-lg md:text-xl font-medium mb-3 md:mb-4">
              Authentication Required
            </h2>
            <p className="mb-4 md:mb-6 text-sm md:text-base text-gray-300">
              Please connect your wallet and login to access DEX configuration.
            </p>
            <div className="flex justify-center">
              <WalletConnect />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!form.dexData) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-6 md:py-10 mt-26 pb-52">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 md:mb-6">
            DEX Configuration
          </h1>
          <Card>
            <h2 className="text-lg md:text-xl font-medium mb-3 md:mb-4">
              No DEX Found
            </h2>
            <p className="mb-4 md:mb-6 text-sm md:text-base text-gray-300">
              You need to create a DEX first before you can configure it.
            </p>
            <div className="flex justify-center">
              <Link to="/dex" className="btn-connect">
                Create Your DEX
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl mt-26 pb-52">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <Link
            to="/dex"
            className="text-sm text-gray-400 hover:text-primary-light mb-2 inline-flex items-center"
          >
            <div className="i-mdi:arrow-left h-4 w-4 mr-1"></div>
            Back to DEX Dashboard
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold gradient-text">
            DEX Configuration
          </h1>
        </div>
      </div>

      <Form
        onSubmit={handleSubmit}
        className="space-y-6"
        submitText="Update DEX Configuration"
        isLoading={isSaving}
        loadingText="Saving"
        disabled={false}
        enableRateLimit={true}
      >
        <DexSectionRenderer
          mode="direct"
          sections={filteredSections}
          showProgressTracker={true}
          sectionProps={form.getSectionProps({
            handleResetTheme,
            handleResetToDefault,
            ThemeTabButton,
          })}
          handleGenerateTheme={handleGenerateTheme}
          idPrefix="config-"
          customDescription={section => {
            if (section.key === DEX_SECTION_KEYS.DistributorCode) {
              return distributorInfo?.exist
                ? "You have been invited by the following distributor."
                : section.description;
            }
            return section.description;
          }}
        />
      </Form>
    </div>
  );
}
