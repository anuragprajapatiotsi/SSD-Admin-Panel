import { TableSurface } from "@/components/data-table/table-surface";
import { Button } from "@/components/ui/button";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Loader } from "@/components/common/loader";
import { AutoRefreshControl, type AutoRefreshControlProps } from "@/components/common/auto-refresh-control";
import { cn } from "@/lib/utils";
import { IconRefresh } from "@tabler/icons-react";
import { FlexRender, type RowData } from "@tanstack/react-table";
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "motion/react";
import { Fragment, type KeyboardEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { DataTableInstance } from "./data-table-core";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";

type DataTableProps<TData extends RowData> = {
  table: DataTableInstance<TData>;
  ariaLabel: string;
  className?: string;
  scrollContainerClassName?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  isLoading?: boolean;
  loadingMessage?: string;
  error?: ReactNode;
  emptyMessage?: ReactNode;
  noResultsMessage?: ReactNode;
  toolbarActions?: ReactNode;
  autoRefresh?: AutoRefreshControlProps;
  onRetry?: () => void;
  showPagination?: boolean;
  pageSizeOptions?: number[];
  totalCount?: number;
  tableClassName?: string;
  onRowClick?: (row: TData) => void;
  getRowClassName?: (row: TData) => string | undefined;
  animateExpansion?: boolean;
  renderRowDetail?: (row: TData) => ReactNode;
};

function isMissingCellValue(value: unknown) {
  return value === null
    || value === undefined
    || (typeof value === "string" && !value.trim())
    || (Array.isArray(value) && value.length === 0);
}

export function DataTable<TData extends RowData>({
  table,
  ariaLabel,
  className,
  scrollContainerClassName,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  isLoading = false,
  loadingMessage,
  error,
  emptyMessage,
  noResultsMessage,
  toolbarActions,
  autoRefresh,
  onRetry,
  showPagination = true,
  pageSizeOptions,
  totalCount,
  tableClassName,
  onRowClick,
  getRowClassName,
  animateExpansion = false,
  renderRowDetail,
}: DataTableProps<TData>) {
  const { t } = useTranslation("common");
  const columnCount = table.getAllLeafColumns().length;
  const resolvedLoadingMessage = loadingMessage ?? t("dataTable.loading");
  const resolvedEmptyMessage = emptyMessage ?? t("dataTable.empty");
  const resolvedNoResultsMessage = noResultsMessage ?? t("dataTable.noResults");

  return (
    <div className={`overflow-hidden rounded-md border bg-card text-card-foreground ${className ?? ""}`}>
      {searchPlaceholder || toolbarActions || autoRefresh ? (
        <DataTableToolbar
          table={table}
          searchPlaceholder={searchPlaceholder}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          actions={<>
            {toolbarActions}
            {autoRefresh ? <AutoRefreshControl {...autoRefresh} /> : null}
          </>}
        />
      ) : null}
      <div className={cn("relative w-full overflow-x-auto", scrollContainerClassName)}>
        <table.Subscribe selector={(state) => state}>
          {(state) => (
            <TableSurface className={`w-full caption-bottom text-xs ${tableClassName ?? ""}`} aria-label={ariaLabel}>
              <thead className="border-b border-border bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr className="border-b last:border-b-0" key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const sortDirection = header.column.getIsSorted();
                      return (
                        <th
                          key={header.id}
                          scope="col"
                          aria-sort={sortDirection === "asc"
                            ? "ascending"
                            : sortDirection === "desc"
                              ? "descending"
                              : undefined}
                          className="h-9 px-2 text-left align-middle font-semibold whitespace-nowrap text-foreground"
                        >
                          <DataTableColumnHeader header={header} />
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td className="px-3" colSpan={columnCount}>
                      <Loader text={resolvedLoadingMessage} />
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td className="h-24 px-3 text-center" colSpan={columnCount}>
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <span role="alert">{error}</span>
                        {onRetry ? (
                          <Button type="button" variant="outline" size="sm" onPress={onRetry}>
                            <IconRefresh data-icon="inline-start" aria-hidden="true" />
                            {t("actions.retry")}
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ) : table.getRowModel().rows.length ? (
                  <AnimatePresence initial={false}>
                    {table.getRowModel().rows.map((row) => (
                      <Fragment key={row.id}>
                      <DataTableBodyRow
                        key={row.id}
                        row={row}
                        onRowClick={onRowClick}
                        className={getRowClassName?.(row.original)}
                        animateExpansion={animateExpansion}
                      />
                      {renderRowDetail?.(row.original) ? <tr><td colSpan={columnCount} className="p-3">{renderRowDetail(row.original)}</td></tr> : null}
                      </Fragment>
                    ))}
                  </AnimatePresence>
                ) : (
                  <tr>
                    <td className="h-24 px-3 text-center text-muted-foreground" colSpan={columnCount}>
                      <Empty><EmptyHeader><EmptyTitle>{(typeof state.globalFilter === "string" && state.globalFilter.trim()) || state.columnFilters.length
                        ? resolvedNoResultsMessage
                        : resolvedEmptyMessage}</EmptyTitle></EmptyHeader></Empty>
                    </td>
                  </tr>
                )}
              </tbody>
            </TableSurface>
          )}
        </table.Subscribe>
      </div>
      {showPagination && !isLoading && !error ? (
        <DataTablePagination
          table={table}
          pageSizeOptions={pageSizeOptions}
          totalCount={totalCount}
        />
      ) : null}
    </div>
  );
}

function DataTableBodyRow<TData extends RowData>({ row, onRowClick, className, animateExpansion }: {
  row: ReturnType<DataTableInstance<TData>["getRowModel"]>["rows"][number];
  onRowClick?: (row: TData) => void;
  className?: string;
  animateExpansion: boolean;
}) {
  const isPresent = useIsPresent();
  const reduceMotion = useReducedMotion();
  const animate = animateExpansion && row.depth > 0 && !reduceMotion;
  const rowProps = {
    "data-state": row.getIsSelected() ? "selected" : undefined,
    className: cn("border-b transition-colors last:border-b-0 hover:bg-muted/50 data-[state=selected]:bg-muted", onRowClick && "cursor-pointer", className),
    onClick: onRowClick && isPresent ? () => onRowClick(row.original) : undefined,
    onKeyDown: onRowClick && isPresent ? (event: KeyboardEvent<HTMLTableRowElement>) => {
      if (event.currentTarget !== event.target) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onRowClick(row.original);
      }
    } : undefined,
    role: onRowClick ? "button" : undefined,
    tabIndex: onRowClick && isPresent ? 0 : undefined,
    inert: !isPresent ? true : undefined,
    "aria-hidden": !isPresent ? true : undefined,
  };
  const cells = row.getAllCells().map((cell) => {
    const content = ("accessorKey" in cell.column.columnDef || "accessorFn" in cell.column.columnDef) && isMissingCellValue(cell.getValue())
      ? "-" : <FlexRender cell={cell} />;
    return <td className={cn("align-middle whitespace-nowrap", animate ? "p-0!" : "px-2 py-1.5")} key={cell.id}>
      {animate ? <motion.div
        className="overflow-hidden"
        variants={{ collapsed: { height: 0 }, expanded: { height: "auto" } }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        <div className="px-3 py-2">{content}</div>
      </motion.div> : content}
    </td>;
  });
  return animate ? <motion.tr {...rowProps} initial="collapsed" animate="expanded" exit="collapsed"
    variants={{ collapsed: { opacity: 0 }, expanded: { opacity: 1 } }} transition={{ duration: 0.2 }}>
    {cells}
  </motion.tr> : <tr {...rowProps}>{cells}</tr>;
}
