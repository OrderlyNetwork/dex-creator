import { useMemo, ReactNode } from "react";
import { TableTitleWithTooltip } from "../../components";
import {
  formatCurrency,
  getUserTimezone,
  formatTier,
  splitDateTime,
} from "../../utils";
import { useTranslation } from "~/i18n";

export interface Column {
  title: ReactNode;
  dataIndex: string;
  render?: (value: any, record: any, index?: number) => ReactNode;
}

export const useRevenueColumn = (props: {
  onViewDetails: (record: any) => void;
  currentPage: number;
}): Column[] => {
  const { onViewDetails, currentPage } = props;
  const { t } = useTranslation();
  const timezone = getUserTimezone();

  const columns = useMemo(() => {
    return [
      {
        title: t("distributor.distributionTime", { timezone }),
        dataIndex: "distributionTime",
        render: (value: string) => {
          if (!value || value === "--") return "--";
          const parts = splitDateTime(value);
          return parts ? (
            <>
              <span className="text-base-contrast">{parts.date}</span>{" "}
              <span className="text-base-contrast-54">{parts.time}</span>
            </>
          ) : (
            value
          );
        },
      },
      {
        title: (
          <TableTitleWithTooltip
            title={t("distributor.totalRevenueShare")}
            tooltip={t("distributor.totalRevenueShareTooltip")}
          />
        ),
        dataIndex: "totalRevenueShare",
        render: (value: number) =>
          formatCurrency(value, { floor: true, precison: 2 }),
      },
      {
        title: (
          <TableTitleWithTooltip
            title={t("distributor.totalInviteeVolume")}
            tooltip={t("distributor.totalInviteeVolumeTooltip")}
          />
        ),
        dataIndex: "totalInviteeVolume",
        render: (value: number) =>
          formatCurrency(value, { floor: true, precison: 2 }),
      },
      {
        title: (
          <TableTitleWithTooltip
            title={t("distributor.myBrokerTier")}
            tooltip={t("distributor.myBrokerTierRefTooltip")}
          />
        ),
        dataIndex: "brokerTier",
        render: (value: string) => formatTier(value),
      },
      {
        title: t("distributor.action"),
        dataIndex: "action",
        render: (_: any, record: any, index?: number) => {
          // Only the first 7 items on page 1 can be clicked
          const isDisabled =
            currentPage !== 1 || (index !== undefined && index >= 7);

          return (
            <button
              className={
                isDisabled
                  ? "text-base-contrast-36 cursor-not-allowed"
                  : "text-[#9c75ff] hover:text-[#b58fff] transition-colors"
              }
              onClick={() => {
                if (!isDisabled) {
                  onViewDetails(record);
                }
              }}
              disabled={isDisabled}
            >
              {t("distributor.view")}
            </button>
          );
        },
      },
    ] as Column[];
  }, [onViewDetails, currentPage, t, timezone]);

  return columns;
};
