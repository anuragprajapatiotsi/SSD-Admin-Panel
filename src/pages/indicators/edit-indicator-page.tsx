import { Navigate, useParams } from "react-router-dom";
import { IndicatorFormPage } from "./create-indicator-page";

export function EditIndicatorPage() {
  const { indicatorCode } = useParams<{ indicatorCode: string }>();

  if (!indicatorCode) return <Navigate to="/indicators/library" replace />;

  return <IndicatorFormPage indicatorCode={decodeURIComponent(indicatorCode)} />;
}
