import React from "react";
import { useRevenueColumn } from "./useRevenueColumn";
import { RevenueShareDetailsModalUI } from "../revenueShareDetailsModal";
import type { RevenueShareDetailsModalUIProps } from "../revenueShareDetailsModal";
import { Pagination, Spinner } from "../../components";
import { SearchDocumentIcon } from "../../icons";

interface RevenueShareListUIProps {
  dataSource: any[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  isLoading: boolean;
  onViewDetails: (record: any) => void;
  revenueShareDetailsModalUiProps: RevenueShareDetailsModalUIProps;
  currentPage: number;
}

const EmptyState = () => {
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
        No revenue share yet.
      </p>
    </div>
  );
};

const RevenueShareListUI: React.FC<RevenueShareListUIProps> = ({
  dataSource,
  pagination,
  isLoading,
  onViewDetails,
  revenueShareDetailsModalUiProps,
  currentPage,
}) => {
  const columns = useRevenueColumn({ onViewDetails, currentPage });

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
        <RevenueShareDetailsModalUI {...revenueShareDetailsModalUiProps} />
      </div>
    );
  }

  const pageSize = pagination.pageSize;
  const emptyRowCount = Math.max(pageSize - dataSource.length, 0);

  return (
    <div className="bg-[#0f1123] rounded-lg p-6 overflow-x-auto">
      <table className="w-full min-w-[700px]">
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
                    ? col.render(row[col.dataIndex], row, rowIdx)
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

      <RevenueShareDetailsModalUI {...revenueShareDetailsModalUiProps} />
    </div>
  );
};

export default RevenueShareListUI;
