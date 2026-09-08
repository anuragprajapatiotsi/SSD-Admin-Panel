import { useCallback, useEffect, useRef, useState } from "react";
import { useBeforeUnload, useBlocker, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { ExternalApiConnection } from "@/api/external-api.api";
import { externalApiService } from "@/services/external-api.service";
import { DATA_API_PATH, useInvalidateDataApis } from "@/hooks/use-data-api";
import { initialDataApiValues, validateDataApi, type DataApiFormValues } from "@/utils/data-api-form";
import { dataApiTestView, type DataApiTestView } from "@/utils/data-api-test-response";

export function useDataApiEditor(unit: string, connection?: ExternalApiConnection) {
  const { t } = useTranslation("ingestion");
  const navigate = useNavigate();
  const invalidate = useInvalidateDataApis();
  const [values, setValues] = useState(() => initialDataApiValues(connection));
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [pending, setPending] = useState<"test" | "save" | null>(null);
  const [result, setResult] = useState<DataApiTestView>();
  const [testOpen, setTestOpen] = useState(false);
  const busy = useRef(false);
  const leave = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const blocker = useBlocker(() => !leave.current && (dirty || busy.current));
  useBeforeUnload(useCallback((event) => { if (!leave.current && (dirty || busy.current)) { event.preventDefault(); event.returnValue = ""; } }, [dirty]));

  function update<K extends keyof DataApiFormValues>(key: K, value: DataApiFormValues[K]) {
    if (busy.current) return;
    setValues((previous) => ({ ...previous, [key]: value }));
    setDirty(true); setResult(undefined); setError("");
    setErrors((previous) => Object.fromEntries(Object.entries(previous).filter(([path]) => path !== key && !path.startsWith(`${key}.`))));
  }

  async function send(action: "test" | "save") {
    if (busy.current || !unit) return;
    const validation = validateDataApi(values, unit);
    if (validation.errors) { setErrors(validation.errors); return validation.errors; }
    busy.current = true; setPending(action); setErrors({}); setError(""); setResult(undefined);
    if (action === "test") setTestOpen(true);
    try {
      // Do not put secret-bearing form payloads in the React Query mutation cache.
      if (action === "test") {
        const response = await externalApiService.testDefinition(validation.payload);
        if (mounted.current) setResult(dataApiTestView(response, { definition: validation.payload, redacted: t("dataApi.redacted"), omitted: t("dataApi.omitted") }));
      } else {
        const response = connection
          ? await externalApiService.update(connection.code, validation.payload)
          : await externalApiService.create(validation.payload);
        void invalidate();
        if (!mounted.current) return;
        if (response.test?.status === "FAILED") toast.warning(t("dataApi.savedTestFailed"));
        else toast.success(t(connection ? "dataApi.updated" : "dataApi.created"));
        leave.current = true;
        setDirty(false);
        navigate(DATA_API_PATH, { replace: true });
      }
    } catch {
      // API validation errors may echo credentials. Never render the raw exception/payload.
      if (mounted.current) setError(t(action === "test" ? "dataApi.testError" : "dataApi.saveError"));
    } finally {
      busy.current = false;
      if (mounted.current) setPending(null);
    }
  }

  function changeTestOpen(open: boolean) {
    if (busy.current) return;
    setTestOpen(open);
    if (!open) setError("");
  }
  return { values, update, dirty, errors, error, pending, result, testOpen, setTestOpen: changeTestOpen, send, blocker, back: () => navigate(DATA_API_PATH) };
}
