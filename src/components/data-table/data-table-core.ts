import {
  createTableHook,
  type FilterFn,
  type ReactTable,
  type RowData,
} from "@tanstack/react-table";
import { dataTableFeatures } from "./data-table-features";

const dataTable = createTableHook({
  features: dataTableFeatures,
});

export const createDataTableColumnHelper = dataTable.createAppColumnHelper;
export const useDataTable = dataTable.useAppTable;

export type DataTableInstance<TData extends RowData> = ReactTable<
  typeof dataTableFeatures,
  TData,
  unknown
>;

export type DataTableFilterFn<TData extends RowData> = FilterFn<
  typeof dataTableFeatures,
  TData
>;
