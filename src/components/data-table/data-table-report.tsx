import type { ReactNode } from "react";
import { createDataTableColumnHelper, useDataTable } from "./data-table-core";
import { DataTable } from "./data-table";

export type ReportRow = {
  id: string | number;
  cells: ReactNode[];
  className?: string;
  onClick?: () => void;
  detail?: ReactNode;
};

const columnHelper = createDataTableColumnHelper<ReportRow>();

/** DataTable composition for already ordered report results with rich display cells. */
export function DataTableReport({ headers, rows, ariaLabel, isLoading = false }: {
  headers: ReactNode[];
  rows: ReportRow[];
  ariaLabel: string;
  isLoading?: boolean;
}) {
  const table = useDataTable({
    columns: columnHelper.columns(headers.map((header, index) => columnHelper.display({
      id: String(index),
      header: () => header,
      cell: ({ row }) => row.original.cells[index],
      enableSorting: false,
    }))),
    data: rows,
    getRowId: (row) => String(row.id),
    enableRowSelection: false,
    manualPagination: true,
  });
  return <DataTable
    table={table}
    ariaLabel={ariaLabel}
    isLoading={isLoading}
    showPagination={false}
    getRowClassName={(row) => row.className}
    onRowClick={rows.some((row) => row.onClick) ? (row) => row.onClick?.() : undefined}
    renderRowDetail={(row) => row.detail}
  />;
}
