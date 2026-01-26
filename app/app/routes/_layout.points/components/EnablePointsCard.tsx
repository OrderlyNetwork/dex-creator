import { useEffect, useState } from "react";
import { PointSystemIcon } from "~/icons/PointSystemIcon";
import { Switch } from "../../../components/switch";
import { DexData } from "~/types/dex";
import { createDexFormData, putFormData } from "~/utils/apiClient";
import { useAuth } from "~/context/useAuth";
import { useDex } from "~/context/DexContext";
import { Card } from "../../../components/Card";
import { toast } from "react-toastify";
import { AVAILABLE_MENUS } from "~/components/NavigationMenuEditor";
import { Spinner } from "@orderly.network/ui";

type EnablePointsCardProps = {
  enabledMenus: string[];
};

export const PointsMenuId = "Points";

export function EnablePointsCard({ enabledMenus }: EnablePointsCardProps) {
  const [pointEnabled, setPointEnabled] = useState(
    enabledMenus.includes(PointsMenuId)
  );
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();

  const { dexData, updateDexData } = useDex();

  useEffect(() => {
    setPointEnabled(enabledMenus.includes(PointsMenuId));
  }, [enabledMenus]);

  const handleEnablePoints = async (checked: boolean) => {
    setIsLoading(true);

    try {
      const defaultEnabledMenus = AVAILABLE_MENUS.filter(
        menu => menu.isDefault
      ).map(menu => menu.id);

      const newEnabledMenus = enabledMenus.includes(PointsMenuId)
        ? enabledMenus.filter(menu => menu !== PointsMenuId).join(",")
        : [
            enabledMenus.length > 0 ? enabledMenus : defaultEnabledMenus,
            PointsMenuId,
          ].join(",");

      const formData = createDexFormData({
        enabledMenus: newEnabledMenus,
      });

      const savedData = await putFormData<DexData>(
        `api/dex/${dexData?.id}`,
        formData,
        token,
        { showToastOnError: false }
      );

      toast.success(
        <div>
          Point system enabled
          <div className="text-[13px] text-base-contrast-54">
            The feature will show on your DEX UI within 5 minutes.
          </div>
        </div>
      );
      setPointEnabled(checked);
      updateDexData({ enabledMenus: newEnabledMenus });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to enable point system"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onCheckedChange = (checked: boolean) => {
    handleEnablePoints(checked);
  };

  return (
    <Card className={`my-6 md:my-12 border-line-6`}>
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <PointSystemIcon className="flex-shrink-0" />

          <div>
            <h3 className="text-sm md:text-lg font-semibold mb-1">
              Enable Point System
            </h3>
            <p className="text-xs md:text-sm text-base-contrast-80">
              Once enabled, the point system will appear in the header and
              cannot be turned off for now.
            </p>
          </div>
        </div>
        {isLoading ? (
          <Spinner size="md" />
        ) : (
          <Switch
            checked={pointEnabled}
            onCheckedChange={onCheckedChange}
            className="flex-shrink-0"
            // The toggle becomes uneditable once the Point System is switched on in this phase.
            disabled={isLoading || pointEnabled}
          />
        )}
      </div>
    </Card>
  );
}
