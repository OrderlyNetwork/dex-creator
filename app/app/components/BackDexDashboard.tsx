import { Link } from "@remix-run/react";
import { useTranslation } from "~/i18n";

export function BackDexDashboard() {
  const { t } = useTranslation();
  return (
    <Link
      to="/dex"
      className="text-sm text-gray-400 hover:text-primary-light mb-2 inline-flex items-center"
    >
      <div className="i-mdi:arrow-left h-4 w-4 mr-1"></div>
      {t("backDexDashboard.backToDex")}
    </Link>
  );
}
