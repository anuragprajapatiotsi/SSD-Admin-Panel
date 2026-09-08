import {
  columnFilteringFeature,
  createFilteredRowModel,
  createExpandedRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  rowPaginationFeature,
  rowExpandingFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
} from "@tanstack/react-table";

export const dataTableFeatures = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: {
    includesString: filterFn_includesString,
  },
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
  },
  rowExpandingFeature,
  expandedRowModel: createExpandedRowModel(),
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  rowSelectionFeature,
});
