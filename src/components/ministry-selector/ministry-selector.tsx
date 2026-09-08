import {
  listMinistryContactDetails,
  type MinistryContactDetail,
} from "@/api/templates.api";
import { Alert, AlertAction, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Checkbox } from "@/components/ui/checkbox";
import { CommandDialog, CommandInput } from "@/components/ui/command";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader } from "@/components/common/loader";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  IconAlertTriangle,
  IconBuilding,
  IconFilter,
  IconPlus,
  IconRefresh,
  IconX,
} from "@tabler/icons-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const MINISTRY_RESULT_LIMIT = 10;
const MINISTRY_SEARCH_DELAY = 300;
const EMPTY_MINISTRIES: MinistryContactDetail[] = [];

type SharedMinistrySelectorProps = {
  labelledBy?: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
  isOptional?: boolean;
  errorId?: string;
  onBlur?: () => void;
};

type SingleMinistrySelectorProps = SharedMinistrySelectorProps & {
  selectionMode: "single";
  value: MinistryContactDetail | null;
  onChange: (value: MinistryContactDetail | null) => void;
};

type MultipleMinistrySelectorProps = SharedMinistrySelectorProps & {
  selectionMode: "multiple";
  value: string[];
  onChange: (value: string[]) => void;
};

type MinistrySelectorProps = SingleMinistrySelectorProps | MultipleMinistrySelectorProps;

export function MinistrySelector(props: MinistrySelectorProps) {
  const { t } = useTranslation(["ingestion", "common"]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [viewport, setViewport] = useState<HTMLDivElement | null>(null);
  const lastScrollTop = useRef(0);
  const [selectedNames, setSelectedNames] = useState<Record<string, MinistryContactDetail>>({});
  const selectionStatusId = useId();
  const selectedIds = props.selectionMode === "single"
    ? props.value ? [props.value.organization_id] : []
    : props.value;
  const debouncedSearchText = useDebouncedValue(searchText, MINISTRY_SEARCH_DELAY);
  const ministriesQuery = useInfiniteQuery({
    queryKey: ["ministry-contact-details", "selector-pages", debouncedSearchText.trim()],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => listMinistryContactDetails({
      limit: MINISTRY_RESULT_LIMIT,
      offset: pageParam,
      searchText: debouncedSearchText,
    }),
    enabled: isOpen,
    getNextPageParam: (lastPage, _pages, lastOffset) => lastPage.length === MINISTRY_RESULT_LIMIT
      ? lastOffset + MINISTRY_RESULT_LIMIT : undefined,
    staleTime: 60_000,
  });
  const { fetchNextPage, hasNextPage, isFetching, isFetchNextPageError } = ministriesQuery;
  useEffect(() => {
    lastScrollTop.current = 0;
    viewport?.scrollTo({ top: 0 });
  }, [debouncedSearchText, viewport]);
  const loadedMinistries = useMemo(() => {
    if (!ministriesQuery.data) return EMPTY_MINISTRIES;
    return [...new Map(ministriesQuery.data.pages.flat().map((item) => [item.organization_id, item])).values()];
  }, [ministriesQuery.data]);
  const knownMinistries = useMemo(() => {
    const records: Record<string, MinistryContactDetail> = { ...selectedNames };
    loadedMinistries.forEach((ministry) => {
      records[ministry.organization_id] = ministry;
    });
    return records;
  }, [loadedMinistries, selectedNames]);

  const ministries = useMemo(() => {
    const results = loadedMinistries;
    if (props.selectionMode !== "single" || !props.value) return results;
    if (results.some((ministry) => ministry.organization_id === props.value?.organization_id)) {
      return results;
    }
    return [props.value, ...results];
  }, [loadedMinistries, props.selectionMode, props.value]);
  const firstSelectedMinistry = props.selectionMode === "single"
    ? props.value
    : knownMinistries[selectedIds[0]];
  const selectedLabel = firstSelectedMinistry?.ministry_name?.trim()
    || t("ingestion:ministryFilter.selectedFallback");
  const triggerDescription = [
    props.isInvalid ? props.errorId : undefined,
    selectedIds.length ? selectionStatusId : undefined,
  ].filter(Boolean).join(" ") || undefined;
  const isSearchPending = searchText.trim() !== debouncedSearchText.trim()
    || (ministriesQuery.isFetching && !ministriesQuery.isFetchingNextPage);
  const selectorLabel = props.selectionMode === "single"
    ? t("ingestion:ministryFilter.button")
    : t("ingestion:templateForm.workspace.searchMinistries");
  const dialogTitle = props.selectionMode === "single"
    ? t("ingestion:ministryFilter.title")
    : t("ingestion:templateForm.workspace.selectMinistriesTitle");
  const dialogDescription = props.selectionMode === "single"
    ? t("ingestion:ministryFilter.dialogDescription")
    : t("ingestion:templateForm.workspace.selectMinistriesDescription");
  const requiresTemplateSource = props.selectionMode === "multiple" && !props.isOptional && selectedIds.length === 0;

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) props.onBlur?.();
  }

  function clearSelection() {
    if (props.selectionMode === "single") props.onChange(null);
    else props.onChange([]);
    props.onBlur?.();
  }

  function selectSingleMinistry(organizationId: string) {
    if (props.selectionMode !== "single") return;
    const ministry = ministries.find((item) => item.organization_id === organizationId);
    if (!ministry) return;
    props.onChange(ministry);
    handleOpenChange(false);
  }

  function toggleMultipleMinistry(organizationId: string, isSelected: boolean) {
    if (props.selectionMode !== "multiple") return;
    const ministry = knownMinistries[organizationId];
    if (isSelected && ministry) setSelectedNames((current) => ({ ...current, [organizationId]: ministry }));
    const nextValue = isSelected
      ? Array.from(new Set([...props.value, organizationId]))
      : props.value.filter((id) => id !== organizationId);
    props.onChange(nextValue);
  }

  function renderSelectorTrigger() {
    return (
      <Button
        type="button"
        variant="outline"
        size={props.selectionMode === "multiple" ? "default" : "sm"}
        className="min-w-0 flex-1 justify-start"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-labelledby={props.labelledBy}
        aria-invalid={props.isInvalid}
        aria-describedby={triggerDescription}
        isDisabled={props.isDisabled}
        onPress={() => setIsOpen(true)}
      >
        {selectedIds.length
          ? <IconBuilding data-icon="inline-start" aria-hidden="true" />
          : requiresTemplateSource
            ? <IconAlertTriangle className="text-destructive" data-icon="inline-start" aria-hidden="true" />
            : <IconFilter data-icon="inline-start" aria-hidden="true" />}
        <span className="min-w-0 flex-1 truncate text-left">
          {selectedIds.length ? selectedLabel : selectorLabel}
        </span>
        {selectedIds.length > 1 ? (
          <Badge variant="secondary">+{selectedIds.length - 1}</Badge>
        ) : selectedIds.length === 0 ? (
          <IconPlus data-icon="inline-end" aria-hidden="true" />
        ) : null}
      </Button>
    );
  }

  return (
    <>
      <ButtonGroup className="w-full min-w-0">
        {requiresTemplateSource ? (
          <TooltipTrigger>
            {renderSelectorTrigger()}
            <Tooltip>{t("ingestion:templateForm.workspace.attachSourceRequired")}</Tooltip>
          </TooltipTrigger>
        ) : renderSelectorTrigger()}
        {selectedIds.length ? (
          <Button
            type="button"
            variant="outline"
            size={props.selectionMode === "multiple" ? "icon" : "icon-sm"}
            aria-label={t("ingestion:ministryFilter.clear")}
            isDisabled={props.isDisabled}
            onPress={clearSelection}
          >
            <IconX data-icon="inline-start" aria-hidden="true" />
          </Button>
        ) : null}
        {selectedIds.length ? (
          <span className="sr-only" id={selectionStatusId}>
            {selectedLabel}. {t("ingestion:templateForm.workspace.ministriesSelected", { count: selectedIds.length })}
          </span>
        ) : null}
      </ButtonGroup>

      <CommandDialog
        open={isOpen}
        onOpenChange={handleOpenChange}
        title={dialogTitle}
        description={dialogDescription}
        className="gap-0 sm:max-w-lg"
        showCloseButton
      >
        <div className="bg-muted px-4 py-2.5 pr-10">
          <h2 className="text-sm font-medium">{dialogTitle}</h2>
          <p className="text-xs text-muted-foreground">{dialogDescription}</p>
        </div>
        <div className="bg-muted px-3 pb-2.5">
          <CommandInput
            value={searchText}
            placeholder={t("ingestion:ministryFilter.search")}
            isPending={isSearchPending}
            pendingLabel={t("ingestion:ministryFilter.searching")}
            onChange={(event) => setSearchText(event.target.value)}
          />
        </div>
        <Separator />
        <ScrollArea
          ref={setViewport}
          className="max-h-72 p-1.5 [overflow-anchor:none]"
          aria-label={selectorLabel}
          onScroll={(event) => {
            const container = event.currentTarget;
            const scrollingDown = container.scrollTop > lastScrollTop.current;
            lastScrollTop.current = container.scrollTop;
            if (scrollingDown && hasNextPage && !isFetching && !isFetchNextPageError
              && searchText.trim() === debouncedSearchText.trim()
              && container.scrollHeight - container.scrollTop - container.clientHeight <= 64) {
              void fetchNextPage({ cancelRefetch: false });
            }
          }}
        >
          <span className="sr-only" role="status" aria-live="polite">
            {isSearchPending
              ? t("ingestion:ministryFilter.updating")
              : t("ingestion:ministryFilter.available", { count: ministries.length })}
          </span>
          {ministriesQuery.isPending ? (
            <Loader text={t("ingestion:ministryFilter.loading")} />
          ) : ministriesQuery.error && !ministries.length ? (
            <Alert className="m-1" variant="destructive">
              <IconAlertTriangle aria-hidden="true" />
              <AlertTitle>{t("ingestion:ministryFilter.loadError")}</AlertTitle>
              <AlertAction>
                <Button type="button" variant="outline" size="sm" onPress={() => void ministriesQuery.refetch()}>
                  <IconRefresh data-icon="inline-start" aria-hidden="true" />
                  {t("common:actions.retry")}
                </Button>
              </AlertAction>
            </Alert>
          ) : ministries.length ? (
            props.selectionMode === "single" ? (
              <RadioGroup
                aria-label={t("ingestion:ministryFilter.groupLabel")}
                value={props.value?.organization_id ?? ""}
                onChange={selectSingleMinistry}
                className="gap-0.5"
              >
                {ministries.map((ministry) => (
                  <RadioGroupItem
                    value={ministry.organization_id}
                    key={ministry.organization_id}
                    variant="card"
                  >
                    <span className="min-w-0 flex-1 truncate text-xs font-medium">
                      {ministry.ministry_name?.trim() || t("ingestion:ministryFilter.unnamed")}
                    </span>
                    {props.value?.organization_id === ministry.organization_id ? (
                      <Badge variant="secondary">{t("ingestion:ministryFilter.selected")}</Badge>
                    ) : null}
                  </RadioGroupItem>
                ))}
              </RadioGroup>
            ) : (
              <FieldSet className="gap-0.5">
                <FieldLegend className="sr-only">
                  {t("ingestion:templateForm.workspace.selectMinistriesTitle")}
                </FieldLegend>
                {ministries.map((ministry) => (
                  <FieldLabel key={ministry.organization_id}>
                    <Field orientation="horizontal">
                      <Checkbox
                        isSelected={props.value.includes(ministry.organization_id)}
                        onChange={(isSelected) => toggleMultipleMinistry(ministry.organization_id, isSelected)}
                      />
                      <FieldContent>
                        <FieldTitle>
                          {ministry.ministry_name?.trim() || t("ingestion:ministryFilter.unnamed")}
                        </FieldTitle>
                      </FieldContent>
                    </Field>
                  </FieldLabel>
                ))}
              </FieldSet>
            )
          ) : (
            <Empty className="min-h-24 gap-2 border-0 p-3">
              <EmptyHeader>
                <EmptyTitle>{t("ingestion:ministryFilter.noResults")}</EmptyTitle>
              </EmptyHeader>
            </Empty>
          )}
          {isFetchNextPageError ? (
            <Alert variant="destructive" className="my-2">
              <AlertTitle>{t("ingestion:ministryFilter.loadError")}</AlertTitle>
              <AlertAction><Button variant="outline" size="sm" isDisabled={isFetching} onPress={() => void fetchNextPage({ cancelRefetch: false })}>{t("common:actions.retry")}</Button></AlertAction>
            </Alert>
          ) : hasNextPage ? (
            <div className="py-2">
              {ministriesQuery.isFetchingNextPage ? <Loader text={t("ingestion:ministryFilter.loading")} />
                : <Button className="w-full" variant="ghost" size="sm" isDisabled={isFetching || searchText.trim() !== debouncedSearchText.trim()} onPress={() => void fetchNextPage({ cancelRefetch: false })}>{t("ingestion:ministryFilter.loadMore")}</Button>}
            </div>
          ) : null}
        </ScrollArea>
        {props.selectionMode === "multiple" ? (
          <>
            <Separator />
            <DialogFooter className="items-center px-3 py-2 sm:justify-between">
              <span className="text-xs text-muted-foreground" aria-live="polite">
                {t("ingestion:templateForm.workspace.ministriesSelected", { count: props.value.length })}
              </span>
              <Button type="button" size="sm" onPress={() => handleOpenChange(false)}>
                {t("common:actions.done")}
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </CommandDialog>
    </>
  );
}

export type { MinistryContactDetail };
