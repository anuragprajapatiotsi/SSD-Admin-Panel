import type { RequestPeriodCollectionSummary } from "@/api/template-workflow.api";
import {
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useDeleteRequestPeriodCollection } from "@/hooks/use-template-workflow";
import { IconAlertTriangle, IconTrash } from "@tabler/icons-react";
import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

type DeleteCollectionDialogProps = {
  collection: RequestPeriodCollectionSummary;
  unitCode: string;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function DeleteCollectionDialog({ collection, unitCode, trigger, open, onOpenChange }: DeleteCollectionDialogProps) {
  const { t } = useTranslation("ingestion");
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const deleteCollection = useDeleteRequestPeriodCollection();

  function handleOpenChange(open: boolean) {
    if (!open && deleteCollection.isPending) return;
    onOpenChange?.(open);
    if (!onOpenChange) setInternalOpen(open);
    if (open) deleteCollection.reset();
  }

  async function confirmDelete() {
    try {
      await deleteCollection.mutateAsync({
        collectionCode: collection.collectionCode,
        unitCode,
      });
      toast.success(t("dataCollection.delete.successTitle"));
      handleOpenChange(false);
    } catch {
      // Keep the confirmation open so the API error remains visible.
    }
  }

  const error = deleteCollection.error instanceof Error
    ? deleteCollection.error.message
    : t("dataCollection.delete.errorDescription");

  const dialog = (
    <AlertDialogContent
      isOpen={onOpenChange ? isOpen : undefined}
      onOpenChange={onOpenChange ? handleOpenChange : undefined}
      isDismissable={!deleteCollection.isPending}
    >
      <AlertDialogHeader>
        <AlertDialogMedia className="bg-destructive/10 text-destructive"><IconAlertTriangle aria-hidden="true" /></AlertDialogMedia>
        <AlertDialogTitle>{t("dataCollection.delete.title")}</AlertDialogTitle>
        <AlertDialogDescription>{t("dataCollection.delete.description", { name: collection.collectionLabel })}</AlertDialogDescription>
      </AlertDialogHeader>
      {deleteCollection.isError ? <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive" role="alert">{error}</div> : null}
      <AlertDialogFooter>
        <AlertDialogCancel isDisabled={deleteCollection.isPending} onPress={() => handleOpenChange(false)}>{t("dataCollection.delete.cancel")}</AlertDialogCancel>
        <Button variant="destructive" isDisabled={deleteCollection.isPending} onPress={() => void confirmDelete()}>
          {deleteCollection.isPending ? <Spinner data-icon="inline-start" aria-label={t("dataCollection.delete.deleting")} /> : <IconTrash data-icon="inline-start" aria-hidden="true" />}
          {deleteCollection.isPending ? t("dataCollection.delete.deleting") : t("dataCollection.delete.confirm")}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  );

  if (onOpenChange) return dialog;

  return (
    <AlertDialogTrigger isOpen={internalOpen} onOpenChange={handleOpenChange}>
      {trigger ?? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={t("dataCollection.delete.action", { name: collection.collectionLabel })}
        >
          <IconTrash aria-hidden="true" />
        </Button>
      )}
      {dialog}
    </AlertDialogTrigger>
  );
}
