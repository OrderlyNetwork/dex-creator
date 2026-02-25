import { useTranslation } from "~/i18n";

interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  itemName?: string;
  showPageSizeSelector?: boolean;
}

export default function Pagination({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  itemName = "items",
  showPageSizeSelector = true,
}: PaginationProps) {
  const { t } = useTranslation();
  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const maxVisiblePages = 5;
  const halfRange = Math.floor(maxVisiblePages / 2);
  let startPage = Math.max(1, currentPage - halfRange);
  let endPage = startPage + maxVisiblePages - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index
  );
  const showFirstPage = startPage > 1;
  const showLastPage = endPage < totalPages;
  const showLeadingEllipsis = startPage > 2;
  const showTrailingEllipsis = endPage < totalPages - 1;

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="mt-6 pt-4 border-t border-light/10">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Page Size Selector */}
        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">
              {t("pagination.show")}:
            </label>
            <select
              value={pageSize}
              onChange={e => {
                const newSize = parseInt(e.target.value);
                onPageSizeChange(newSize);
              }}
              className="bg-dark border border-light/20 rounded px-2 py-1 text-sm focus:border-primary-light outline-none"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-400">
              {t("pagination.perPage")}
            </span>
          </div>
        )}

        {/* Pagination Info */}
        <div className="text-sm text-gray-400">
          {t("pagination.showingRange", {
            startItem,
            endItem,
            totalItems,
            itemName,
          })}
        </div>

        {/* Pagination Navigation */}
        <div className="flex items-center gap-1">
          {showFirstPage && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className={`px-2 py-1 rounded text-sm min-w-[32px] ${
                  currentPage === 1
                    ? "bg-primary-light text-dark"
                    : "border border-light/20 hover:bg-light/10"
                }`}
              >
                1
              </button>
              {showLeadingEllipsis && (
                <span className="text-sm text-gray-400 px-2">...</span>
              )}
            </>
          )}

          {pageNumbers.map(pageNum => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`px-2 py-1 rounded text-sm min-w-[32px] ${
                currentPage === pageNum
                  ? "bg-primary-light text-dark"
                  : "border border-light/20 hover:bg-light/10"
              }`}
            >
              {pageNum}
            </button>
          ))}

          {showLastPage && (
            <>
              {showTrailingEllipsis && (
                <span className="text-sm text-gray-400 px-2">...</span>
              )}
              <button
                onClick={() => onPageChange(totalPages)}
                className={`px-2 py-1 rounded text-sm min-w-[32px] ${
                  currentPage === totalPages
                    ? "bg-primary-light text-dark"
                    : "border border-light/20 hover:bg-light/10"
                }`}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
