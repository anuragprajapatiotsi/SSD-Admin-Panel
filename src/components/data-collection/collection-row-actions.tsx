import type { RequestPeriodCollectionSummary } from "@/api/template-workflow.api";
import { DeleteCollectionDialog } from "@/components/data-collection/delete-collection-dialog";
import { EditCollectionDialog } from "@/components/data-collection/edit-collection-dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { IconDots, IconEdit, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type CollectionRowActionsProps = {
  collection: RequestPeriodCollectionSummary;
  unitCode: string;
};

export function CollectionRowActions({ collection, unitCode }: CollectionRowActionsProps) {
  const { t } = useTranslation("ingestion");
  const [dialog, setDialog] = useState<"edit" | "delete" | null>(null);

  return (
    <div onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
      <DropdownMenuTrigger>
        <Button type="button" variant="ghost" size="icon-sm" aria-label={t("dataCollection.actions.for", { name: collection.collectionLabel })}>
          <IconDots aria-hidden="true" />
        </Button>
        <DropdownMenu className="min-w-40" placement="bottom end" aria-label={t("dataCollection.actions.for", { name: collection.collectionLabel })}>
          <DropdownMenuGroup>
            <DropdownMenuItem id="edit" onAction={() => setDialog("edit")}>
              <IconEdit aria-hidden="true" />
              {t("dataCollection.actions.edit")}
            </DropdownMenuItem>
            <DropdownMenuItem id="delete" variant="destructive" onAction={() => setDialog("delete")}>
              <IconTrash aria-hidden="true" />
              {t("dataCollection.actions.delete")}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenu>
      </DropdownMenuTrigger>
      <EditCollectionDialog collection={collection} unitCode={unitCode} open={dialog === "edit"} onOpenChange={(open) => setDialog(open ? "edit" : null)} />
      <DeleteCollectionDialog collection={collection} unitCode={unitCode} open={dialog === "delete"} onOpenChange={(open) => setDialog(open ? "delete" : null)} />
    </div>
  );
}
