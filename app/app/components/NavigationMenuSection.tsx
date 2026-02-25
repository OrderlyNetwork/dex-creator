import React from "react";
import { useTranslation } from "~/i18n";
import NavigationMenuEditor from "./NavigationMenuEditor";
import CustomMenuEditor from "./CustomMenuEditor";
import { useModal } from "../context/ModalContext";

export interface NavigationMenuProps {
  enabledMenus: string;
  setEnabledMenus: (value: string) => void;
  customMenus: string;
  setCustomMenus: (value: string) => void;
  enableCampaigns: boolean;
  setEnableCampaigns: (value: boolean) => void;
  swapFeeBps: number | null;
  setSwapFeeBps: (value: number | null) => void;
}

const NavigationMenuSection: React.FC<NavigationMenuProps> = ({
  enabledMenus,
  setEnabledMenus,
  customMenus,
  setCustomMenus,
  enableCampaigns,
  setEnableCampaigns,
  swapFeeBps,
  setSwapFeeBps,
}) => {
  const { t } = useTranslation();
  const { openModal } = useModal();

  const handleOpenSwapFeeConfig = () => {
    openModal("swapFeeConfig", {
      currentFeeBps: swapFeeBps,
      onSave: (feeBps: number) => {
        setSwapFeeBps(feeBps);
      },
    });
  };

  return (
    <div className="space-y-6">
      <NavigationMenuEditor
        value={enabledMenus}
        onChange={setEnabledMenus}
        className="slide-fade-in"
        swapFeeBps={swapFeeBps}
        onOpenSwapFeeConfig={handleOpenSwapFeeConfig}
      />

      <CustomMenuEditor
        value={customMenus}
        onChange={setCustomMenus}
        className="slide-fade-in-delayed"
      />

      <div className="space-y-4 slide-fade-in">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="enableCampaigns"
            checked={enableCampaigns}
            onChange={e => setEnableCampaigns(e.target.checked)}
            className="mt-1 h-4 w-4 text-primary accent-primary bg-background-dark border-light/30 rounded focus:ring-primary/50"
          />
          <div className="flex-1">
            <label
              htmlFor="enableCampaigns"
              className="text-sm font-medium cursor-pointer"
            >
              {t("navigationMenuSection.enableOrderTokenCampaigns")}
            </label>
            <p className="text-xs text-gray-400 mt-1">
              {t("navigationMenuSection.enableOrderTokenCampaignsDesc")}
            </p>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="i-mdi:information-outline h-5 w-5 text-blue-300 mt-0.5"></div>
            <div>
              <h4 className="text-base font-bold text-blue-300 mb-2">
                {t("navigationMenuSection.aboutOrderTokenCampaigns")}
              </h4>
              <div className="text-xs text-gray-300 space-y-2">
                <p>{t("navigationMenuSection.whenEnabledAddsLinks")}</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>{t("navigationMenuSection.orderTokenCampaignsLinks")}</li>
                  <li>{t("navigationMenuSection.linksToOrderTokenPages")}</li>
                </ul>
                <p className="pt-2 text-blue-200">
                  {t("navigationMenuSection.noteOptionalFeature")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationMenuSection;
