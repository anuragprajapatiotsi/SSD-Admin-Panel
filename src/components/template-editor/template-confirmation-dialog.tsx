import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import type { TemplateConfirmationIntent } from "./template-editor-types";

type TemplateConfirmationDialogProps = {
  intent: TemplateConfirmationIntent | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export function TemplateConfirmationDialog({
  intent,
  onCancel,
  onConfirm,
}: TemplateConfirmationDialogProps) {
  const { t } = useTranslation("ingestion");
  const confirmedRef = useRef(false);
  const key = intent === "remove-file" ? "removeFile" : "leave";

  return (
    <AlertDialogContent
      isOpen={Boolean(intent)}
      onOpenChange={(isOpen) => {
        if (isOpen) return;
        if (confirmedRef.current) {
          confirmedRef.current = false;
          return;
        }
        onCancel();
      }}
    >
      <AlertDialogHeader>
        <AlertDialogMedia className="bg-destructive/10 text-destructive">
          <IconAlertTriangle aria-hidden="true" />
        </AlertDialogMedia>
        <AlertDialogTitle>{t(`templateForm.workspace.confirmation.${key}.title`)}</AlertDialogTitle>
        <AlertDialogDescription>
          {t(`templateForm.workspace.confirmation.${key}.description`)}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>
          {t(`templateForm.workspace.confirmation.${key}.cancel`)}
        </AlertDialogCancel>
        <AlertDialogAction
          variant="destructive"
          onPress={() => {
            confirmedRef.current = true;
            onConfirm();
            window.setTimeout(() => {
              confirmedRef.current = false;
            }, 0);
          }}
        >
          {t(`templateForm.workspace.confirmation.${key}.confirm`)}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}
