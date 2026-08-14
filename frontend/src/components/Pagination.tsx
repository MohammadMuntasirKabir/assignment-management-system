"use client";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

function buildPageItems(current: number, totalPages: number): (number | "gap")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: (number | "gap")[] = [1];
  const windowStart = Math.max(2, current - 1);
  const windowEnd = Math.min(totalPages - 1, current + 1);

  if (windowStart > 2) items.push("gap");
  for (let p = windowStart; p <= windowEnd; p++) items.push(p);
  if (windowEnd < totalPages - 1) items.push("gap");
  items.push(totalPages);

  return items;
}

export default function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between gap-4 mt-4 flex-wrap">
      <span className="text-sm text-[var(--ink-soft)]">
        Showing {start}–{end} of {total}
      </span>
      <ul className="pagination">
        <li>
          <button
            type="button"
            className="pagination-btn"
            disabled={!canPrev}
            aria-label="Previous page"
            onClick={() => onPageChange(page - 1)}
          >
            PREV
          </button>
        </li>
        {buildPageItems(page, totalPages).map((item, i) =>
          item === "gap" ? (
            <li key={`gap-${i}`}>
              <span className="pagination-btn pagination-ellipsis">…</span>
            </li>
          ) : (
            <li key={item} className={item === page ? "active" : undefined}>
              <button
                type="button"
                className="pagination-btn"
                aria-label={`Page ${item}`}
                aria-current={item === page ? "page" : undefined}
                onClick={() => onPageChange(item)}
              >
                {item}
              </button>
            </li>
          )
        )}
        <li>
          <button
            type="button"
            className="pagination-btn"
            disabled={!canNext}
            aria-label="Next page"
            onClick={() => onPageChange(page + 1)}
          >
            NEXT
          </button>
        </li>
      </ul>
    </div>
  );
}
