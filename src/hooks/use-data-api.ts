import { useEffect, useState } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSelectedUnitCode, UNIT_CHANGED_EVENT } from "@/api/session.api";
import { externalApiService } from "@/services/external-api.service";

export const DATA_API_PATH = "/ingestion/data-api";
export const dataApiKeys = {
  all: ["data-api"] as const,
  list: (unit: string) => ["data-api", "list", unit] as const,
  detail: (unit: string, code: string) => ["data-api", "detail", unit, code] as const,
};

export function useDataApiUnit() {
  const [unit, setUnit] = useState(getSelectedUnitCode);
  useEffect(() => {
    const update = () => setUnit(getSelectedUnitCode());
    window.addEventListener(UNIT_CHANGED_EVENT, update);
    return () => window.removeEventListener(UNIT_CHANGED_EVENT, update);
  }, []);
  return unit;
}

export function useDataApiList(unit: string) {
  return useInfiniteQuery({
    queryKey: dataApiKeys.list(unit),
    enabled: Boolean(unit),
    initialPageParam: 0,
    queryFn: ({ pageParam }) => externalApiService.list(unit, 12, pageParam),
    getNextPageParam: (page) => {
      const next = page.page.offset + page.page.returned;
      return page.page.returned > 0 && next < page.page.total ? next : undefined;
    },
  });
}

export function useDataApiConnection(unit: string, code?: string) {
  return useQuery({
    queryKey: dataApiKeys.detail(unit, code ?? ""),
    enabled: Boolean(unit && code),
    queryFn: () => externalApiService.get(code!, unit),
    // A background fetch must never reset a partially edited connection.
    refetchOnWindowFocus: false,
  });
}

export function useInvalidateDataApis() {
  const client = useQueryClient();
  return () => Promise.all([
    client.invalidateQueries({ queryKey: dataApiKeys.all }),
    client.invalidateQueries({ queryKey: ["external-api-options"] }),
  ]);
}
