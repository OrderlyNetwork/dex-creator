import { Button } from "~/components/Button";
import { Card } from "~/components/Card";
import { useTranslation } from "~/i18n";

interface OrderlyKeyRequiredCardProps {
  isCreatingKey: boolean;
  onCreateOrderlyKey: () => void;
}

export default function OrderlyKeyRequiredCard({
  isCreatingKey,
  onCreateOrderlyKey,
}: OrderlyKeyRequiredCardProps) {
  const { t } = useTranslation();
  return (
    <Card className="border border-warning/20 bg-warning/5">
      <div className="flex gap-4 items-start">
        <div className="bg-warning/20 p-2 rounded-full flex-shrink-0">
          <div className="i-mdi:key text-warning w-6 h-6"></div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-warning">
            {t("referral.orderlyKeyRequired.title")}
          </h3>
          <p className="text-gray-300 mt-1 mb-4">
            {t("referral.orderlyKeyRequired.description")}
          </p>
          <Button
            onClick={onCreateOrderlyKey}
            disabled={isCreatingKey}
            className="flex items-center gap-2"
          >
            {isCreatingKey ? (
              <>
                <div className="i-svg-spinners:pulse-rings-multiple w-4 h-4"></div>
                {t("common.creatingKey")}
              </>
            ) : (
              <>
                <div className="i-mdi:key-plus w-4 h-4"></div>
                {t("referral.orderlyKeyRequired.createKey")}
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
