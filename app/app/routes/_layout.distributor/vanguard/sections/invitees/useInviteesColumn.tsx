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

  const columns = useMemo(() => {
    return [
      {
        title: "Invitee address",
        dataIndex: "address",
        render: (value: string, record: any) => (
          <div className="flex items-center">
            <span>{formatAddress(value)}</span>
            <button
              onClick={() => {
                copyText(value);
                toast.success("Copied");
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
        title: "Broker ID",
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
                  toast.success("Copied");
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
        title: "Broker name",
        dataIndex: "brokerName",
        render: (value: string) => value || "--",
      },
      {
        title: "30d volume",
        dataIndex: "volume",
        render: (value: number) =>
          formatCurrency(value, { floor: true, precison: 2 }),
      },
      {
        title: (
          <TableTitleWithTooltip
            title="Min. tier"
            tooltip={`Minimum tier guarantees your invitee the assigned tier or a higher one if they meet the requirements. Once you change the assigned tier, it will take effect at the next ${formatUTCTimeToLocal()}.`}
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
            title="Effective tier"
            tooltip={`Broker fee tier updates daily at ${formatUTCTimeToLocal()}.`}
          />
        ),
        dataIndex: "effectiveTier",
        render: (value: string) => formatTier(value),
      },
      {
        title: "Base taker fee",
        dataIndex: "takerFee",
        render: (value: number) => formatBps(value, 2),
      },
      {
        title: "Base maker fee",
        dataIndex: "makerFee",
        render: (value: number) => formatBps(value, 2),
      },
      {
        title: "Base taker fee (RWA)",
        dataIndex: "rwaTakerFee",
        render: (value: number) => formatBps(value, 2),
      },
      {
        title: "Base maker fee (RWA)",
        dataIndex: "rwaMakerFee",
        render: (value: number) => formatBps(value, 2),
      },
    ] as Column[];
  }, [onEditTier, canEditTier]);

  return columns;
};
