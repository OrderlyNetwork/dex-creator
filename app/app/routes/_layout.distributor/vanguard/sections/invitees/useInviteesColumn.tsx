import { useMemo, ReactNode } from "react";
import { toast } from "react-toastify";
import { TableTitleWithTooltip } from "../../components";
import {
  formatAddress,
  formatCurrency,
  formatBps,
  copyText,
  formatUTCTimeToLocal,
  formatTier,
} from "../../utils";
import { CopyIcon, EditIcon, ClockIcon } from "../../icons";
import { useTranslation } from "~/i18n";

export interface Column {
  title: ReactNode;
  dataIndex: string;
  render?: (value: any, record: any) => ReactNode;
}

interface UseInviteesColumnProps {
  onEditTier: (record: any) => void;
  canEditTier: boolean;
}

export const useInviteesColumn = (props: UseInviteesColumnProps): Column[] => {
  const { onEditTier, canEditTier } = props;
  const { t } = useTranslation();
  const timeLabel = formatUTCTimeToLocal();

  const columns = useMemo(() => {
    return [
      {
        title: t("distributor.inviteeAddress"),
        dataIndex: "address",
        render: (value: string, record: any) => (
          <div className="flex items-center">
            <span>{formatAddress(value)}</span>
            <button
              onClick={() => {
                copyText(value);
                toast.success(t("distributor.copied"));
              }}
              className="ml-2 text-base-contrast-54 hover:text-base-contrast transition-colors"
              aria-label="Copy address"
            >
              <CopyIcon className="w-4 h-4" />
            </button>
            {record.status === "UNGRADUATED" && (
              <ClockIcon className="ml-2 w-4 h-4 text-base-contrast-54" />
            )}
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
                className="ml-2 text-base-contrast-54 hover:text-base-contrast transition-colors"
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
        title: t("distributor.volume30d"),
        dataIndex: "volume",
        render: (value: number) =>
          formatCurrency(value, { floor: true, precison: 2 }),
      },
      {
        title: (
          <TableTitleWithTooltip
            title={t("distributor.minTier")}
            tooltip={t("distributor.minTierTooltip", { time: timeLabel })}
          />
        ),
        dataIndex: "minTier",
        render: (value: string, record: any) => (
          <div className="flex items-center">
            <span>{formatTier(value)}</span>
            {canEditTier && (
              <button
                onClick={() => onEditTier(record)}
                className="ml-2 text-base-contrast-54 hover:text-base-contrast transition-colors"
                aria-label="Edit tier"
              >
                <EditIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        ),
      },
      {
        title: (
          <TableTitleWithTooltip
            title={t("distributor.effectiveTier")}
            tooltip={t("distributor.effectiveTierTooltip", { time: timeLabel })}
          />
        ),
        dataIndex: "effectiveTier",
        render: (value: string) => formatTier(value),
      },
      {
        title: t("distributor.baseTakerFee"),
        dataIndex: "takerFee",
        render: (value: number) => formatBps(value, 2),
      },
      {
        title: t("distributor.baseMakerFee"),
        dataIndex: "makerFee",
        render: (value: number) => formatBps(value, 2),
      },
      {
        title: t("distributor.baseTakerFeeRwa"),
        dataIndex: "rwaTakerFee",
        render: (value: number) => formatBps(value, 2),
      },
      {
        title: t("distributor.baseMakerFeeRwa"),
        dataIndex: "rwaMakerFee",
        render: (value: number) => formatBps(value, 2),
      },
    ] as Column[];
  }, [onEditTier, canEditTier, t, timeLabel]);

  return columns;
};
