export function maxPageOffset(totalCount: number, pageSize: number): number {
  if (totalCount <= 0 || pageSize <= 0) {
    return 0;
  }

  return Math.floor((totalCount - 1) / pageSize) * pageSize;
}

export function clampPageOffset(nextOffset: number, pageSize: number, totalCount: number): number {
  return Math.min(Math.max(0, nextOffset), maxPageOffset(totalCount, pageSize));
}

export function paginationRange(offset: number, pageSize: number, totalCount: number, visibleCount: number) {
  const safePageSize = Math.max(1, pageSize);
  const safeOffset = clampPageOffset(offset, safePageSize, totalCount);
  const pageStart = totalCount === 0 ? 0 : safeOffset + 1;
  const pageEnd = totalCount === 0 ? 0 : Math.max(pageStart, Math.min(safeOffset + Math.max(0, visibleCount), totalCount));
  const totalPages = Math.max(1, Math.ceil(totalCount / safePageSize));
  const currentPage = totalCount === 0 ? 1 : Math.floor(safeOffset / safePageSize) + 1;

  return {
    pageStart,
    pageEnd,
    currentPage,
    totalPages,
    canGoPrevious: safeOffset > 0,
    canGoNext: safeOffset + safePageSize < totalCount,
  };
}
