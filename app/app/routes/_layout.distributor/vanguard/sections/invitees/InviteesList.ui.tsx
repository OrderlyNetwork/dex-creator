import React from "react";
import { toast } from "react-toastify";
import { useInviteesColumn } from "./useInviteesColumn";
import { MinTierModalUI } from "../minTierModal";
import type { MinTierModalUIProps } from "../minTierModal";
import { Pagination, Spinner } from "../../components";
import { CopyIcon, LinkIcon, SearchDocumentIcon } from "../../icons";
import { copyText } from "../../utils";
import { useVanguardSummary } from "../../hooks/useVanguard";

interface InviteesListUIProps {
  dataSource: any[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  isLoading: boolean;
  onEditTier: (record: any) => void;
  minTierModalUiProps: MinTierModalUIProps;
  canEditTier: boolean;
}

const EmptyState = () => {
  const { data: summaryData } = useVanguardSummary();
  const distributorCode = summaryData?.distributor_code || "";
  const distributorUrl = summaryData?.distributor_url || "";

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <SearchDocumentIcon className="w-16 h-16" />
      <p
        className="mt-6 text-center"
        style={{
          fontFamily: "Atyp BL Text",
          fontWeight: 500,
          fontSize: "14px",
          lineHeight: "150%",
          color: "#FFFFFF8A",
        }}
      >
        No invitees yet. Share your distributor code to start referring now!
      </p>
      <div className="mt-4 flex items-center gap-3">
        <span
          style={{
            fontFamily: "Atyp BL Text",
            fontWeight: 500,
            fontSize: "14px",
            lineHeight: "120%",
            color: "#BC87FF",
          }}
        >
          {distributorCode || "--"}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (distributorCode) {
                copyText(distributorCode);
                toast.success("Copied to clipboard");
              }
            }}
            className="text-base-contrast-54 hover:text-base-contrast transition-colors"
            aria-label="Copy code"
          >
            <CopyIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (distributorUrl) {
                copyText(distributorUrl);
                toast.success("Copied to clipboard");
              }
            }}
            className="text-base-contrast-54 hover:text-base-contrast transition-colors"
            aria-label="Copy URL"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const InviteesListUI: React.FC<InviteesListUIProps> = ({
  dataSource,
  pagination,
  isLoading,
  onEditTier,
  minTierModalUiProps,
  canEditTier,
}) => {
  const columns = useInviteesColumn({ onEditTier, canEditTier });

  if (isLoading) {
    return (
      <div className="bg-[#0f1123] rounded-lg p-6">
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (dataSource.length === 0) {
    return (
      <div className="bg-[#0f1123] rounded-lg">
        <EmptyState />
        <MinTierModalUI {...minTierModalUiProps} />
      </div>
    );
  }

  const pageSize = pagination.pageSize;
  const emptyRowCount = Math.max(pageSize - dataSource.length, 0);

  return (
    <div className="bg-[#0f1123] rounded-lg p-6 overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-base-contrast-12">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className="h-[46px] text-left text-sm font-medium text-base-contrast-54 px-3"
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataSource.map((row, rowIdx) => (
            <tr
              key={row.id || rowIdx}
              className="border-b border-base-contrast-12 hover:bg-base-700/50"
            >
              {columns.map((col, colIdx) => (
                <td
                  key={colIdx}
                  className="py-3 px-3 text-sm text-base-contrast"
                >
                  {col.render
                    ? col.render(row[col.dataIndex], row)
                    : row[col.dataIndex]}
                </td>
              ))}
            </tr>
          ))}
          {emptyRowCount > 0 &&
            Array.from({ length: emptyRowCount }).map((_, idx) => (
              <tr
                key={`placeholder-${idx}`}
                className="border-b border-transparent"
                aria-hidden="true"
              >
                {columns.map((_, colIdx) => (
                  <td
                    key={colIdx}
                    className="py-3 px-3 text-sm text-transparent select-none"
                  >
                    &nbsp;
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>

      <Pagination
        current={pagination.current}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onPageChange={pagination.onPageChange}
      />

      <MinTierModalUI {...minTierModalUiProps} />
    </div>
  );
};

export default InviteesListUI;
