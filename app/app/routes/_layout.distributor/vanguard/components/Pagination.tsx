import React from "react";
import { cn } from "../utils";
import { useTranslation } from "~/i18n";

interface PaginationProps {
  current: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

const MAX_PAGE_BUTTONS = 6;

const Pagination: React.FC<PaginationProps> = ({
  current,
  pageSize,
  total,
  onPageChange,
}) => {
  const { t } = useTranslation();
  const totalPages = Math.ceil(total / pageSize);

  // Calculate display range
  const start = (current - 1) * pageSize + 1;
  const end = Math.min(current * pageSize, total);

  // Generate page number buttons
  const generatePageNumbers = (): number[] => {
    if (totalPages <= MAX_PAGE_BUTTONS) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Calculate sliding window
    let startPage = Math.max(1, current - Math.floor(MAX_PAGE_BUTTONS / 2));
    let endPage = startPage + MAX_PAGE_BUTTONS - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - MAX_PAGE_BUTTONS + 1);
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  };

  const pageNumbers = generatePageNumbers();
  const showPrev = totalPages > MAX_PAGE_BUTTONS && pageNumbers[0] > 1;
  const showNext =
    totalPages > MAX_PAGE_BUTTONS &&
    pageNumbers[pageNumbers.length - 1] < totalPages;

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center mt-4 relative min-h-[32px]">
      {/* Left - Showing range */}
      <span className="text-sm text-base-contrast-54">
        {t("distributor.showingRange", { start, end, total })}
      </span>

      {/* Center - Page buttons (absolutely centered) */}
      <div className="absolute left-1/2 -translate-x-1/2 flex gap-2">
        {/* Previous arrow */}
        {showPrev && (
          <button
            onClick={() => onPageChange(pageNumbers[0] - 1)}
            className="w-8 h-8 rounded flex items-center justify-center bg-base-700 text-base-contrast border border-base-contrast-36 hover:bg-base-600 transition-colors"
            aria-label="Previous page"
          >
            &lt;
          </button>
        )}

        {/* Page number buttons */}
        {pageNumbers.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              "w-8 h-8 rounded flex items-center justify-center text-sm font-medium transition-colors border",
              page === current
                ? "bg-base-contrast text-black border-base-contrast"
                : "bg-base-700 text-base-contrast border-base-contrast-36 hover:bg-base-600"
            )}
            aria-label={`Page ${page}`}
            aria-current={page === current ? "page" : undefined}
          >
            {page}
          </button>
        ))}

        {/* Next arrow */}
        {showNext && (
          <button
            onClick={() =>
              onPageChange(pageNumbers[pageNumbers.length - 1] + 1)
            }
            className="w-8 h-8 rounded flex items-center justify-center bg-base-700 text-base-contrast border border-base-contrast-36 hover:bg-base-600 transition-colors"
            aria-label="Next page"
          >
            &gt;
          </button>
        )}
      </div>
    </div>
  );
};

export default Pagination;
