import { PageSection, PageHeader } from "@/components/common/page-layout";

import {
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  createDataTableColumnHelper,
  DataTable,
  useDataTable,
} from "@/components/data-table";
import { MinistryFilter, type MinistryContactDetail } from "@/components/ministry-filter";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconEdit,
  IconFileText,
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  type TemplateRepositoryItem,
  type UploadedTemplateFile,
} from "../../api/templates.api";
import {
  useDeleteTemplateRepository,
  useTemplateRepositoryItems,
} from "../../hooks/use-template-repository";

type UserTemplateRecord = UploadedTemplateFile & {
  id: string;
  ministry: string;
  ministry_ids: string[];
  created_at: string;
  status: string;
};

const templateColumnHelper = createDataTableColumnHelper<UserTemplateRecord>();
const EMPTY_TEMPLATE_REPOSITORY_ITEMS: TemplateRepositoryItem[] = [];

function getTemplateRowId(template: UserTemplateRecord) {
  return template.id;
}

function formatCreatedDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ExcelTemplatesPage() {
  const { t, i18n } = useTranslation(["ingestion", "common"]);
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedMinistry, setSelectedMinistry] = useState<MinistryContactDetail | null>(null);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [listNotice, setListNotice] = useState(() => {
    const routeState = location.state as { notice?: unknown } | null;
    return typeof routeState?.notice === "string" ? routeState.notice : "";
  });
  const [templatePendingDelete, setTemplatePendingDelete] = useState<UserTemplateRecord | null>(null);
  const [deletingTemplateId, setDeletingTemplateId] = useState("");
  const [templateDeleteError, setTemplateDeleteError] = useState("");
  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedSearchText(searchText), 300);
    return () => window.clearTimeout(timeoutId);
  }, [searchText]);

  const repositoryFilters = useMemo(() => ({
    searchText: debouncedSearchText,
    ministryIds: selectedMinistry ? [selectedMinistry.organization_id] : [],
  }), [debouncedSearchText, selectedMinistry]);
  const repositoryTemplatesQuery = useTemplateRepositoryItems(repositoryFilters);
  const deleteTemplateMutation = useDeleteTemplateRepository();
  const repositoryTemplates = repositoryTemplatesQuery.data ?? EMPTY_TEMPLATE_REPOSITORY_ITEMS;
  const isLoadingTemplates = repositoryTemplatesQuery.isPending;
  const isUpdatingTemplates = repositoryTemplatesQuery.isFetching && !isLoadingTemplates;
  const templateLoadError = repositoryTemplatesQuery.error instanceof Error
    ? repositoryTemplatesQuery.error.message
    : repositoryTemplatesQuery.error ? t("ingestion:templates.loadError") : "";

  const allTemplates = useMemo<UserTemplateRecord[]>(() => {
    return repositoryTemplates.map((template) => {
      const fileName = template.latest_version?.original_file_name ?? t("ingestion:templates.noFile");
      return {
        id: template.id,
        ministry: template.ministry_ids.join(", ") || t("ingestion:templates.notAssigned"),
        ministry_ids: template.ministry_ids,
        unit: template.unit_code,
        template_name: template.template_name,
        original_filename: fileName,
        stored_filename: fileName,
        file_uri: template.latest_version?.file_path ?? undefined,
        file_size_bytes: 0,
        created_at: template.created_at,
        status: template.status ?? t("ingestion:templates.notSet"),
      };
    });
  }, [repositoryTemplates, t]);

  const openTemplateEditor = useCallback((template: UserTemplateRecord) => {
    navigate(`/ingestion/excel-templates/${encodeURIComponent(template.id)}/edit`);
  }, [navigate]);

  const requestTemplateDelete = useCallback((template: UserTemplateRecord) => {
    setTemplateDeleteError("");
    setTemplatePendingDelete(template);
  }, []);

  const templateColumns = useMemo(() => templateColumnHelper.columns([
    templateColumnHelper.accessor("template_name", {
      header: t("ingestion:templates.columns.name"),
      sortFn: "alphanumeric",
      cell: ({ getValue }) => (
        <span className="inline-flex items-center gap-2 font-medium">
          <IconFileText className="size-4 text-muted-foreground" aria-hidden="true" />
          {getValue()}
        </span>
      ),
    }),
    templateColumnHelper.accessor("created_at", {
      header: t("ingestion:templates.columns.createdDate"),
      sortFn: "alphanumeric",
      cell: ({ getValue }) => formatCreatedDate(getValue(), i18n.resolvedLanguage ?? "en-IN"),
    }),
    templateColumnHelper.display({
      id: "actions",
      header: () => <span className="block text-right">{t("ingestion:templates.columns.actions")}</span>,
      enableSorting: false,
      enableGlobalFilter: false,
      cell: ({ row }) => {
        const template = row.original;
        return (
          <div className="flex items-center justify-end gap-1" onClick={(event) => event.stopPropagation()}>
            <TooltipTrigger>
              <Button
                variant="ghost"
                size="icon-sm"
                type="button"
                aria-label={t("ingestion:templates.actions.editLabel", { name: template.template_name })}
                onPress={() => openTemplateEditor(template)}
                >
                <IconEdit data-icon="inline-start" aria-hidden="true" />
              </Button>
              <Tooltip>{t("ingestion:templates.actions.editTooltip")}</Tooltip>
            </TooltipTrigger>
            <TooltipTrigger>
              <Button
                  variant="destructive"
                size="icon-sm"
                type="button"
                aria-label={t("ingestion:templates.actions.deleteLabel", { name: template.template_name })}
                onPress={() => requestTemplateDelete(template)}
                >
                <IconTrash data-icon="inline-start" aria-hidden="true" />
              </Button>
              <Tooltip>{t("ingestion:templates.actions.deleteTooltip")}</Tooltip>
            </TooltipTrigger>
          </div>
        );
      },
    }),
  ]), [i18n.resolvedLanguage, openTemplateEditor, requestTemplateDelete, t]);

  const templateTable = useDataTable({
    columns: templateColumns,
    data: allTemplates,
    getRowId: getTemplateRowId,
    enableMultiSort: false,
    enableRowSelection: false,
    autoResetPageIndex: true,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
  });

  function closeTemplateDeleteModal() {
    if (deletingTemplateId) return;
    setTemplatePendingDelete(null);
    setTemplateDeleteError("");
  }

  async function confirmTemplateDelete() {
    if (!templatePendingDelete || deletingTemplateId) return;
    const template = templatePendingDelete;
    setDeletingTemplateId(template.id);
    setTemplateDeleteError("");
    try {
      await deleteTemplateMutation.mutateAsync(template.id);
      setTemplatePendingDelete(null);
      toast.success(t("ingestion:templates.delete.successToast", { name: template.template_name }));
    } catch (error) {
      setTemplateDeleteError(error instanceof Error ? error.message : t("ingestion:templates.delete.error"));
    } finally {
      setDeletingTemplateId("");
    }
  }

  return (
    <PageSection className="flex min-w-0 flex-col gap-4 excel-templates-list-page">
      <PageHeader>
        <div>
          <h2>{t("ingestion:templates.title")}</h2>
          <p>{t("ingestion:templates.description")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" onClick={() => navigate("/ingestion/excel-templates/create")}>
            <IconPlus data-icon="inline-start" aria-hidden="true" />
            {t("ingestion:templates.create")}
          </Button>
        </div>
      </PageHeader>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex min-w-0 flex-col gap-3">
          {listNotice ? (
            <div className="flex items-center justify-between gap-3 rounded-md bg-muted p-3 text-sm" role="status">
              <IconCircleCheck aria-hidden="true" />
              <span>{listNotice}</span>
              <TooltipTrigger>
                <Button size="icon-sm" variant="ghost"

                  type="button"
                  aria-label={t("ingestion:templates.actions.dismissSuccess")}
                  onPress={() => setListNotice("")}
                >
                  <IconX data-icon="inline-start" aria-hidden="true" />
                </Button>
                <Tooltip>{t("ingestion:templates.actions.dismiss")}</Tooltip>
              </TooltipTrigger>
            </div>
          ) : null}

          <DataTable
            scrollContainerClassName="min-h-0"
            table={templateTable}
            onRowClick={openTemplateEditor}
            ariaLabel={t("ingestion:templates.table.ariaLabel")}
            searchPlaceholder={t("ingestion:templates.table.search")}
            searchValue={searchText}
            onSearchChange={setSearchText}
            toolbarActions={(
              <div className="flex items-center gap-2">
                {isUpdatingTemplates ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground" role="status">
                    <Spinner className="size-3.5" />
                    {t("ingestion:templates.table.loading")}
                  </span>
                ) : null}
                <MinistryFilter value={selectedMinistry} onChange={setSelectedMinistry} />
              </div>
            )}
            isLoading={isLoadingTemplates}
            loadingMessage={t("ingestion:templates.table.loading")}
            error={templateLoadError || undefined}
            emptyMessage={searchText.trim() || selectedMinistry
              ? t("ingestion:templates.table.noResults")
              : t("ingestion:templates.table.empty")}
            noResultsMessage={t("ingestion:templates.table.noResults")}
            onRetry={() => void repositoryTemplatesQuery.refetch()}
          />
        </div>
      </div>

      <AlertDialogContent
        isOpen={Boolean(templatePendingDelete)}
        isDismissable={!deletingTemplateId}
        onOpenChange={(isOpen) => {
          if (!isOpen) closeTemplateDeleteModal();
        }}
      >
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive"><IconAlertTriangle aria-hidden="true" /></AlertDialogMedia>
          <AlertDialogTitle>{t("ingestion:templates.delete.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            <p>{t("ingestion:templates.delete.prompt", { name: templatePendingDelete?.template_name })}</p>
            <p className="mt-1">{t("ingestion:templates.delete.warning")}</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        {templateDeleteError ? <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive" role="alert">{templateDeleteError}</div> : null}
        <AlertDialogFooter>
          <AlertDialogCancel isDisabled={Boolean(deletingTemplateId)} onPress={closeTemplateDeleteModal}>
            {t("ingestion:templates.delete.cancel")}
          </AlertDialogCancel>
          <Button variant="destructive" isDisabled={Boolean(deletingTemplateId)} onPress={() => void confirmTemplateDelete()}>
            {deletingTemplateId
              ? <Spinner data-icon="inline-start" aria-hidden="true" />
              : <IconTrash data-icon="inline-start" aria-hidden="true" />}
            {deletingTemplateId
              ? t("ingestion:templates.delete.deleting")
              : t("ingestion:templates.delete.confirm")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </PageSection>
  );
}
