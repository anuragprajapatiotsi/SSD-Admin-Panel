import { useParams } from "react-router-dom";
import { ExcelTemplateForm } from "./excel-template-form";

export function ExcelTemplateEditPage() {
  const { templateId } = useParams<{ templateId: string }>();
  return <ExcelTemplateForm mode="edit" templateId={templateId} />;
}
