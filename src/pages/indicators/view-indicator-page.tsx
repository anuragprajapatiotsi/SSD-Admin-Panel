import { Navigate, useParams } from "react-router-dom";
import { IndicatorLibraryPage } from "./indicator-library-page";

export function ViewIndicatorPage() {
  const { indicatorCode } = useParams<{ indicatorCode: string }>();

  if (!indicatorCode) return <Navigate to="/indicators/library" replace />;

  return <IndicatorLibraryPage routeIndicatorCode={decodeURIComponent(indicatorCode)} />;
}
