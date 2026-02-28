import { useMemo } from "react";
import { toast } from "react-toastify";
import { TableTitleWithTooltip, TableCellWithTooltip } from "../../components";
import {
  formatCurrency,
  formatAddress,
  copyText,
  formatTier,
} from "../../utils";
import { CopyIcon } from "../../icons";
import { useTranslation } from "~/i18n";

export interface RevenueShareDetailRecord {
  inviteeAddress: string;
  brokerId: string;
  brokerName: string;
  myRevenueShare: number;
  inviteeVolume: number;
  inviteeTakerVolume?: number;
  inviteeMakerVolume?: number;
  inviteeBrokerTier: string;
}

export interface ColumnType<T = any> {
  title: React.ReactNode | string;
  dataIndex: keyof T;
  render?: (value: any, record: T) => React.ReactNode;
}

export const useRevenueShareDetailsColumn =
  (): ColumnType<RevenueShareDetailRecord>[] => {
    const { t } = useTranslation();
    const columns = useMemo<ColumnType<RevenueShareDetailRecord>[]>(
      () => [
        {
          title: t("distributor.inviteeAddress"),
          dataIndex: "inviteeAddress",
          render: (value: string) => (
            <div className="flex items-center">
              <span>{formatAddress(value)}</span>
              <button
                onClick={() => {
                  copyText(value);
                  toast.success(t("distributor.copied"));
                }}
                className="ml-2 text-base-contrast-36 hover:text-base-contrast transition-colors"
                aria-label="Copy address"
              >
                <CopyIcon className="w-4 h-4" />
              </button>
            </div>
          ),
        },
        {
          title: t("distributor.brokerId"),
          dataIndex: "brokerId",
          render: (value: string) => {
            if (!value) {
              return <span>--</span>;
            }
            return (
              <div className="flex items-center">
                <span>{value}</span>
                <button
                  onClick={() => {
                    copyText(value);
                    toast.success(t("distributor.copied"));
                  }}
                  className="ml-2 text-base-contrast-36 hover:text-base-contrast transition-colors"
                  aria-label="Copy broker ID"
                >
                  <CopyIcon className="w-4 h-4" />
                </button>
              </div>
            );
          },
        },
        {
          title: t("distributor.brokerName"),
          dataIndex: "brokerName",
          render: (value: string) => value || "--",
        },
        {
          title: (
            <TableTitleWithTooltip
              title={t("distributor.myRevenueShare")}
              tooltip={t("distributor.myRevenueShareTooltip")}
            />
          ),
          dataIndex: "myRevenueShare",
          render: (value: number) =>
            formatCurrency(value, { floor: true, precison: 2 }),
        },
        {
          title: (
            <TableTitleWithTooltip
              title={t("distributor.inviteeVolume")}
              tooltip={t("distributor.inviteeVolumeTooltip")}
            />
          ),
          dataIndex: "inviteeVolume",
          render: (value: number, record: any) => {
            const takerVolume = record.inviteeTakerVolume || 0;
            const makerVolume = record.inviteeMakerVolume || 0;
            const formattedTaker = formatCurrency(takerVolume, {
              floor: true,
              precison: 2,
            });
            const formattedMaker = formatCurrency(makerVolume, {
              floor: true,
              precison: 2,
            });
            const formattedTotal = formatCurrency(value, {
              floor: true,
              precison: 2,
            });

            return (
              <TableCellWithTooltip
                content={formattedTotal}
                tooltip={
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                      <span>{t("distributor.takerVolume")}</span>
                      <span>{formattedTaker}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span>{t("distributor.makerVolume")}</span>
                      <span>{formattedMaker}</span>
                    </div>
                  </div>
                }
              />
            );
          },
        },
        {
          title: (
            <TableTitleWithTooltip
              title={t("distributor.inviteeBrokerTier")}
              tooltip={t("distributor.inviteeBrokerTierTooltip")}
            />
          ),
          dataIndex: "inviteeBrokerTier",
          render: (value: string) => formatTier(value),
        },
      ],
      [t]
    );

    return columns;
  };
