import React from "react";
import ConfirmDialog from "../../components/ConfirmDialog";
import {
  useRevenueShareDetailsColumn,
  RevenueShareDetailRecord,
} from "./useRevenueShareDetailsColumn";
import { formatCurrency, getUserTimezone, splitDateTime } from "../../utils";
import { Pagination } from "../../components";
import { SearchDocumentIcon } from "../../icons";
import { useTranslation } from "~/i18n";

interface RevenueShareDetailsModalData {
  totalRevenueShare?: number;
  totalInviteeVolume?: number;
  periodStartTime?: string;
  periodEndTime?: string;
  distributionTime?: string;
}

export interface RevenueShareDetailsModalUIProps {
  open: boolean;
  onClose: () => void;
  data: RevenueShareDetailsModalData;
  dataSource: RevenueShareDetailRecord[];
  isLoading: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}

const EmptyState = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <SearchDocumentIcon className="w-16 h-16" />
      <p className="mt-6 text-center text-sm font-medium leading-[1.5] text-base-contrast-54">
        {t("distributor.noDetailDatasAvailable")}
      </p>
    </div>
  );
};

const RevenueShareDetailsModalUI: React.FC<RevenueShareDetailsModalUIProps> = ({
  open,
  onClose,
  data,
  dataSource,
  isLoading,
  pagination,
}) => {
  const { t } = useTranslation();
  const columns = useRevenueShareDetailsColumn();
  const timezone = getUserTimezone();

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center">
      <ConfirmDialog
        open={open}
        onOpenChange={isOpen => {
          if (!isOpen) {
            onClose();
          }
        }}
        title={t("distributor.revenueShareDetails")}
        onCancel={onClose}
        cancelText={t("distributor.close")}
        contentClassName="w-[900px]"
        footer={null}
      >
        <div className="flex flex-col">
          <div className="flex flex-col gap-6">
            <div className="flex gap-20">
              <div>
                <div className="mb-1 text-sm font-medium leading-[125%] text-base-contrast-54">
                  {t("distributor.totalRevenueShare")}
                </div>
                <div className="text-sm font-medium leading-[125%] text-base-contrast">
                  {formatCurrency(data?.totalRevenueShare, {
                    floor: true,
                    precison: 2,
                  })}
                </div>
              </div>
              <div>
                <div className="mb-1 text-sm font-medium leading-[125%] text-base-contrast-54">
                  {t("distributor.totalInviteeVolume")}
                </div>
                <div className="text-sm font-medium leading-[125%] text-base-contrast">
                  {formatCurrency(data?.totalInviteeVolume, {
                    floor: true,
                    precison: 2,
                  })}
                </div>
              </div>
            </div>
            <div>
              <div className="mb-1 text-sm font-medium leading-[125%] text-base-contrast-54">
                {t("distributor.period")}
              </div>
              <div className="text-sm font-medium leading-[125%] flex flex-col">
                {(() => {
                  const startParts = splitDateTime(data?.periodStartTime || "");
                  const endParts = splitDateTime(data?.periodEndTime || "");
                  return (
                    <>
                      <span>
                        {startParts ? (
                          <>
                            <span className="text-base-contrast">
                              {startParts.date}
                            </span>{" "}
                            <span className="text-base-contrast-54">
                              {startParts.time}
                            </span>
                          </>
                        ) : (
                          <span className="text-base-contrast">
                            {data?.periodStartTime || "--"}
                          </span>
                        )}
                      </span>
                      <span>
                        {endParts ? (
                          <>
                            <span className="text-base-contrast">
                              {endParts.date}
                            </span>{" "}
                            <span className="text-base-contrast-54">
                              {endParts.time}
                            </span>
                          </>
                        ) : (
                          <span className="text-base-contrast">
                            {data?.periodEndTime || "--"}
                          </span>
                        )}
                      </span>
                    </>
                  );
                })()}
              </div>
            </div>
            <div>
              <div className="mb-1 text-sm font-medium leading-[125%] text-base-contrast-54">
                {t("distributor.distributionTime", { timezone })}
              </div>
              <div className="text-sm font-medium leading-[125%]">
                {(() => {
                  const parts = splitDateTime(data?.distributionTime || "");
                  return parts ? (
                    <>
                      <span className="text-base-contrast">{parts.date}</span>{" "}
                      <span className="text-base-contrast-54">
                        {parts.time}
                      </span>
                    </>
                  ) : (
                    <span className="text-base-contrast">
                      {data?.distributionTime || "--"}
                    </span>
                  );
                })()}
              </div>
            </div>
            <div className="h-px bg-white/10" />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="animate-pulse space-y-4 py-4">
                <div className="h-8 bg-base-700 rounded" />
                <div className="h-8 bg-base-700 rounded" />
              </div>
            ) : dataSource.length === 0 ? (
              <EmptyState />
            ) : (
              <table className="w-full min-w-[600px]">
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
                      key={rowIdx}
                      className="border-b border-base-contrast-12"
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
                </tbody>
              </table>
            )}
          </div>

          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onPageChange={pagination.onPageChange}
          />
        </div>
      </ConfirmDialog>
    </div>
  );
};

export default RevenueShareDetailsModalUI;
