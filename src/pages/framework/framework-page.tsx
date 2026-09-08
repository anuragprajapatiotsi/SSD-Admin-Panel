import { FrameworkLevelTree } from "./framework-level-tree";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { useConfirmation } from "@/hooks/use-confirmation";
import { useTranslation } from "react-i18next";
import { CustomTabs } from "@/components/common/custom-tabs";
import { CardContent, Card } from "@/components/ui/card";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

import { StatusBadge as SharedStatusBadge } from "@/components/common/status-badge";
import { normalizeStatusVariant } from "@/components/common/status-variants";
import { DataTableReport } from "@/components/data-table/data-table-report";
import { Sheet, SheetTitle } from "@/components/ui/sheet";

import { BooleanField } from "@/components/common/boolean-field";
import { PageSection, PageHeader } from "@/components/common/page-layout";

import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

import { Input } from "@/components/ui/input";

import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  GitBranch,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { FocusEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  createFrameworkEdition,
  createFrameworkLevel,
  createFrameworkNode,
  createFrameworkRelationship,
  deactivateFrameworkEdition,
  FrameworkEdition,
  FrameworkEditionPayload,
  FrameworkHierarchy,
  FrameworkLevel,
  FrameworkLevelPayload,
  FrameworkNode,
  FrameworkNodePayload,
  FrameworkRelationship,
  FrameworkRelationshipPayload,
  listFrameworkEditions,
  restoreFrameworkEdition,
  updateFrameworkEdition,
  updateFrameworkLevel,
  updateFrameworkNode,
  getFrameworkHierarchy,
} from "../../api/framework.api";
import { getSelectedUnitCode, LOCALE_CHANGED_EVENT, UNIT_CHANGED_EVENT } from "../../api/session.api";
import { Loader } from "../../components/common/loader";

type FrameworkTab = "editions" | "levels" | "nodes" | "relationships";
type DrawerMode = "edition" | "level" | "node" | "relationship";

type DrawerState =
  | { mode: "edition"; record?: FrameworkEdition }
  | { mode: "level"; record?: FrameworkLevel }
  | { mode: "node"; record?: FrameworkNode }
  | { mode: "relationship"; parentNodeCode?: string; record?: undefined };

export function FrameworkPage() {
  const { t } = useTranslation();
  const confirm = useConfirmation();
  const [editions, setEditions] = useState<FrameworkEdition[]>([]);
  const [hierarchy, setHierarchy] = useState<FrameworkHierarchy | null>(null);
  const [selectedKey, setSelectedKey] = useState("");
  const [activeTab, setActiveTab] = useState<FrameworkTab>("editions");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [drawer, setDrawer] = useState<DrawerState | null>(null);
  const [replicateSourceKey, setReplicateSourceKey] = useState("");
  const [openRelationshipParentCode, setOpenRelationshipParentCode] = useState<string | null>(null);
  const [pendingRelationshipParentCodes, setPendingRelationshipParentCodes] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const selectedEdition = useMemo(() => {
    return editions.find((edition) => getEditionKey(edition) === selectedKey) ?? editions[0];
  }, [editions, selectedKey]);
  const replicateSourceOptions = useMemo(() => {
    return editions.filter((edition) => selectedEdition && getEditionKey(edition) !== getEditionKey(selectedEdition));
  }, [editions, selectedEdition]);

  const levels = hierarchy?.levels ?? [];
  const nodes = hierarchy?.nodes ?? [];
  const relationships = (hierarchy?.relationships ?? []).filter((relationship) => relationship.is_active !== false);
  const activeEditionsCount = editions.filter((edition) => edition.is_active).length;
  const activeLevelsCount = levels.filter((level) => level.is_active !== false).length;
  const activeNodesCount = nodes.filter((node) => node.is_active !== false && normalizeStatus(node.status) === "ACTIVE").length;
  const activeRelationshipsCount = relationships.length;

  const filteredEditions = useMemo(() => {
    return editions.filter((edition) => {
      const statusMatches = statusFilter === "ALL" || normalizeStatus(edition.status) === statusFilter;
      return statusMatches && matchesSearch(
        searchText,
        edition.framework_code,
        edition.edition_code,
        edition.name,
        edition.version_label,
        edition.status,
      );
    });
  }, [editions, searchText, statusFilter]);

  const filteredLevels = useMemo(() => {
    return levels
      .filter((level) => matchesSearch(searchText, level.level_code, level.name, level.description))
      .sort((first, second) => first.level_number - second.level_number);
  }, [levels, searchText]);

  const filteredNodes = useMemo(() => {
    return nodes.filter((node) => {
      const statusMatches = statusFilter === "ALL" || normalizeStatus(node.status) === statusFilter;
      const levelMatches = levelFilter === "ALL" || node.level_code === levelFilter;
      return (
        statusMatches &&
        levelMatches &&
        matchesSearch(searchText, node.node_code, node.node_number, node.name, node.description, node.status)
      );
    });
  }, [levelFilter, nodes, searchText, statusFilter]);

  const filteredRelationships = useMemo(() => {
    return relationships.filter((relationship) => {
      const parent = findNode(nodes, relationship.parent_node_code);
      const child = findNode(nodes, relationship.child_node_code);
      return (
        matchesSearch(
          searchText,
          relationship.parent_node_code,
          relationship.child_node_code,
          relationship.relationship_type,
          parent?.name,
          parent?.node_number,
          child?.name,
          child?.node_number,
        )
      );
    });
  }, [nodes, relationships, searchText]);

  useEffect(() => {
    void loadFrameworkData();
  }, []);

  useEffect(() => {
    const handleContextChange = () => {
      setSelectedKey("");
      setReplicateSourceKey("");
      setHierarchy(null);
      setError("");
      setNotice("");
      void loadFrameworkData();
    };

    window.addEventListener(UNIT_CHANGED_EVENT, handleContextChange);
    window.addEventListener(LOCALE_CHANGED_EVENT, handleContextChange);
    return () => {
      window.removeEventListener(UNIT_CHANGED_EVENT, handleContextChange);
      window.removeEventListener(LOCALE_CHANGED_EVENT, handleContextChange);
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!selectedEdition) {
        setHierarchy(null);
        return;
      }
      setPendingRelationshipParentCodes(loadStoredRelationshipParents(selectedEdition));
      void loadHierarchy(selectedEdition.framework_code, selectedEdition.edition_code);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [selectedEdition]);

  useEffect(() => {
    if (!notice) {
      return;
    }
    const timer = window.setTimeout(() => setNotice(""), 4200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  async function loadFrameworkData(): Promise<FrameworkEdition | null> {
    setIsLoading(true);
    setError("");
    try {
      const response = await listFrameworkEditions(true);
      setEditions(response.data);
      const nextSelected =
        response.data.find((edition) => getEditionKey(edition) === selectedKey) ??
        response.data.find((edition) => edition.is_active) ??
        response.data[0] ??
        null;
      if (nextSelected) {
        setSelectedKey(getEditionKey(nextSelected));
      } else {
        setSelectedKey("");
        setHierarchy(null);
      }
      return nextSelected;
    } catch {
      setError("Framework records could not be loaded. Please refresh or try again later.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  async function loadHierarchy(frameworkCode: string, editionCode: string): Promise<boolean> {
    try {
      const response = await getFrameworkHierarchy(frameworkCode, editionCode);
      setHierarchy(response.data);
      return true;
    } catch {
      setHierarchy(null);
      setError("Framework hierarchy could not be loaded for the selected edition.");
      return false;
    }
  }

  async function refreshPage(message = "Framework data refreshed.") {
    setNotice("");
    const nextSelected = await loadFrameworkData();
    let hierarchyLoaded = false;
    if (nextSelected) {
      hierarchyLoaded = await loadHierarchy(nextSelected.framework_code, nextSelected.edition_code);
    }
    if (nextSelected && hierarchyLoaded) {
      setNotice(message);
    }
  }

  async function handleDeactivate(edition: FrameworkEdition) {
    if (!(await confirm(`Deactivate ${edition.framework_code} / ${edition.edition_code}?`))) {
      return;
    }
    try {
      await deactivateFrameworkEdition(edition.framework_code, edition.edition_code);
      await refreshPage("Framework edition deactivated.");
    } catch {
      setError("Framework edition could not be deactivated.");
    }
  }

  async function handleRestore(edition: FrameworkEdition) {
    try {
      await restoreFrameworkEdition(edition.framework_code, edition.edition_code);
      await refreshPage("Framework edition restored.");
    } catch {
      setError("Framework edition could not be restored.");
    }
  }

  async function handleDrawerSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!drawer || isSaving) {
      return;
    }
    if (drawer.mode !== "edition" && !selectedEdition) {
      return;
    }

    setIsSaving(true);
    setError("");
    const formData = new FormData(event.currentTarget);

    try {
      if (drawer.mode === "edition") {
        await saveEdition(formData, drawer.record);
      }
      if (drawer.mode === "level") {
        await saveLevel(formData, drawer.record);
      }
      if (drawer.mode === "node") {
        await saveNode(formData, drawer.record);
      }
      if (drawer.mode === "relationship") {
        await saveRelationship(formData);
      }
      setDrawer(null);
      await refreshPage("Framework changes saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Framework changes could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  async function saveEdition(formData: FormData, record?: FrameworkEdition) {
    const frameworkCode = normalizeCode(
      readString(formData, "framework_code") || record?.framework_code || generateCode(readString(formData, "name") || "FRAMEWORK"),
      "Framework code",
    );
    const editionCode = normalizeCode(
      readString(formData, "edition_code") ||
        record?.edition_code ||
        generateEditionCode(frameworkCode, readString(formData, "version_label"), readString(formData, "name")),
      "Edition code",
    );
    const payload: FrameworkEditionPayload = {
      framework_code: frameworkCode,
      edition_code: editionCode,
      name: requiredString(formData, "name", "Edition name is required."),
      description: readString(formData, "description"),
      version_label: readString(formData, "version_label"),
      effective_from: readString(formData, "effective_from"),
      effective_to: readString(formData, "effective_to"),
      status: record ? readString(formData, "status") || "DRAFT" : "DRAFT",
      is_active: record ? readBoolean(formData, "is_active") : false,
    };
    assertSingleActiveEdition(payload, record, editions);

    if (record) {
      await updateFrameworkEdition(record.framework_code, record.edition_code, payload);
      return;
    }
    await createFrameworkEdition(payload);
  }

  async function saveLevel(formData: FormData, record?: FrameworkLevel) {
    if (!selectedEdition) {
      throw new Error("Select a framework edition before saving a level.");
    }
    const payload: FrameworkLevelPayload = {
      level_code: normalizeCode(
        readString(formData, "level_code") || record?.level_code || generateCode(requiredString(formData, "name", "Level name is required.")),
        "Level code",
      ),
      level_number: requiredNumber(formData, "level_number", "Level number is required."),
      name: requiredString(formData, "name", "Level name is required."),
      description: readString(formData, "description"),
      allows_indicator_mapping: readBoolean(formData, "allows_indicator_mapping"),
      is_active: readBoolean(formData, "is_active"),
    };

    if (record) {
      await updateFrameworkLevel(
        selectedEdition.framework_code,
        selectedEdition.edition_code,
        record.level_code,
        payload,
      );
      return;
    }
    await createFrameworkLevel(selectedEdition.framework_code, selectedEdition.edition_code, payload);
  }

  async function saveNode(formData: FormData, record?: FrameworkNode) {
    if (!selectedEdition) {
      throw new Error("Select a framework edition before saving a node.");
    }
    const payload: FrameworkNodePayload = {
      level_code: requiredString(formData, "level_code", "Level is required."),
      node_code: normalizeCode(
        readString(formData, "node_code") ||
          record?.node_code ||
          generateNodeCode(readString(formData, "level_code"), readString(formData, "node_number"), readString(formData, "name")),
        "Node code",
      ),
      node_number: readString(formData, "node_number"),
      name: requiredString(formData, "name", "Node name is required."),
      short_name: readString(formData, "short_name"),
      description: readString(formData, "description"),
      color_value: readString(formData, "color_value"),
      color_method: readString(formData, "color_method"),
      icon_path: readString(formData, "icon_path"),
      sort_order: readNumber(formData, "sort_order") ?? 0,
      status: readString(formData, "status") || "ACTIVE",
      is_active: readBoolean(formData, "is_active"),
    };

    if (record) {
      await updateFrameworkNode(
        selectedEdition.framework_code,
        selectedEdition.edition_code,
        record.node_code,
        payload,
      );
      return;
    }
    await createFrameworkNode(selectedEdition.framework_code, selectedEdition.edition_code, payload);
  }

  async function saveRelationship(formData: FormData) {
    if (!selectedEdition) {
      throw new Error("Select a framework edition before saving a relationship.");
    }
    const parentNodeCode = requiredString(formData, "parent_node_code", "Parent node is required.");
    if (!findNode(nodes, parentNodeCode)) {
      throw new Error("Select a valid parent node from the node list.");
    }
    const childNodeCode = readString(formData, "child_node_code");
    if (!childNodeCode) {
      if (
        pendingRelationshipParentCodes.includes(parentNodeCode) ||
        relationships.some((relationship) => relationship.parent_node_code === parentNodeCode)
      ) {
        throw new Error("This parent is already available in the relationship list.");
      }
      setPendingRelationshipParentCodes((current) =>
        persistPendingRelationshipParents(selectedEdition, current.includes(parentNodeCode) ? current : [...current, parentNodeCode]),
      );
      setOpenRelationshipParentCode(parentNodeCode);
      return;
    }
    if (parentNodeCode === childNodeCode) {
      throw new Error("Parent and child node cannot be the same.");
    }
    if (relationshipExists(relationships, parentNodeCode, childNodeCode)) {
      throw new Error("This parent-child relationship already exists.");
    }
    if (!findNode(nodes, parentNodeCode) || !findNode(nodes, childNodeCode)) {
      throw new Error("Select valid parent and child nodes from the node list.");
    }
    const payload: FrameworkRelationshipPayload = {
      parent_node_code: parentNodeCode,
      child_node_code: childNodeCode,
      relationship_type: readString(formData, "relationship_type") || "PARENT_CHILD",
      sort_order: readNumber(formData, "sort_order") ?? 0,
      is_active: readBoolean(formData, "is_active"),
    };
    await createFrameworkRelationship(selectedEdition.framework_code, selectedEdition.edition_code, payload);
    applyRelationshipLocally(payload);
    setPendingRelationshipParentCodes((current) => persistPendingRelationshipParents(selectedEdition, current.filter((parentCode) => parentCode !== parentNodeCode)));
  }

  async function handleDeleteRelationship(parentNodeCode: string, childNodeCode: string) {
    if (!selectedEdition || !(await confirm(`Remove relationship ${parentNodeCode} -> ${childNodeCode}?`))) {
      return;
    }
    try {
      await createFrameworkRelationship(selectedEdition.framework_code, selectedEdition.edition_code, {
        parent_node_code: parentNodeCode,
        child_node_code: childNodeCode,
        relationship_type: "PARENT_CHILD",
        sort_order: 0,
        is_active: false,
      });
      removeRelationshipLocally(parentNodeCode, childNodeCode);
      await refreshPage("Relationship removed.");
    } catch {
      setError("Relationship could not be removed.");
    }
  }

  async function handleDeleteParentRelationships(parentNodeCode: string) {
    if (!selectedEdition || !(await confirm(`Remove all child relationships under ${parentNodeCode}?`))) {
      return;
    }
    const childLinks = relationships.filter((relationship) => relationship.parent_node_code === parentNodeCode);
    if (!childLinks.length) {
      setPendingRelationshipParentCodes((current) => persistPendingRelationshipParents(selectedEdition, current.filter((parentCode) => parentCode !== parentNodeCode)));
      setOpenRelationshipParentCode(null);
      setNotice("Parent removed.");
      return;
    }
    try {
      await Promise.all(
        childLinks.map((relationship) =>
          createFrameworkRelationship(selectedEdition.framework_code, selectedEdition.edition_code, {
            parent_node_code: relationship.parent_node_code,
            child_node_code: relationship.child_node_code,
            relationship_type: relationship.relationship_type ?? "PARENT_CHILD",
            sort_order: relationship.sort_order ?? 0,
            is_active: false,
          }),
        ),
      );
      removeParentRelationshipsLocally(parentNodeCode);
      setPendingRelationshipParentCodes((current) => persistPendingRelationshipParents(selectedEdition, current.filter((parentCode) => parentCode !== parentNodeCode)));
      setOpenRelationshipParentCode(null);
      await refreshPage("Parent relationships removed.");
    } catch {
      setError("Parent relationships could not be removed.");
    }
  }

  function applyRelationshipLocally(payload: FrameworkRelationshipPayload) {
    setHierarchy((current) => {
      if (!current) {
        return current;
      }
      const withoutDuplicate = current.relationships.filter(
        (relationship) =>
          relationship.parent_node_code !== payload.parent_node_code ||
          relationship.child_node_code !== payload.child_node_code,
      );
      return {
        ...current,
        relationships: [...withoutDuplicate, payload],
      };
    });
    setOpenRelationshipParentCode(payload.parent_node_code);
  }

  function removeRelationshipLocally(parentNodeCode: string, childNodeCode: string) {
    setHierarchy((current) =>
      current
        ? {
            ...current,
            relationships: current.relationships.filter(
              (relationship) =>
                relationship.parent_node_code !== parentNodeCode || relationship.child_node_code !== childNodeCode,
            ),
          }
        : current,
    );
  }

  function removeParentRelationshipsLocally(parentNodeCode: string) {
    setHierarchy((current) =>
      current
        ? {
            ...current,
            relationships: current.relationships.filter((relationship) => relationship.parent_node_code !== parentNodeCode),
          }
        : current,
    );
  }

  async function handleReplicateHierarchy() {
    if (!selectedEdition || !replicateSourceKey) {
      setError("Select a source edition to replicate from.");
      return;
    }
    const sourceEdition = editions.find((edition) => getEditionKey(edition) === replicateSourceKey);
    if (!sourceEdition) {
      setError("Selected source edition was not found.");
      return;
    }
    if (!(await confirm(`Replicate levels, nodes, and relationships from ${sourceEdition.framework_code} / ${sourceEdition.edition_code} into ${selectedEdition.framework_code} / ${selectedEdition.edition_code}? Existing matching codes will be updated.`))) {
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      const sourceHierarchy = (await getFrameworkHierarchy(sourceEdition.framework_code, sourceEdition.edition_code)).data;
      for (const level of sourceHierarchy.levels) {
        await createFrameworkLevel(selectedEdition.framework_code, selectedEdition.edition_code, {
          level_code: level.level_code,
          level_number: level.level_number,
          name: level.name ?? level.level_code,
          description: level.description,
          allows_indicator_mapping: level.allows_indicator_mapping ?? false,
          is_active: level.is_active ?? true,
        });
      }
      for (const node of sourceHierarchy.nodes) {
        await createFrameworkNode(selectedEdition.framework_code, selectedEdition.edition_code, {
          level_code: node.level_code,
          node_code: node.node_code,
          name: node.name ?? node.node_code,
          node_number: node.node_number,
          short_name: node.short_name,
          description: node.description,
          color_value: node.color_value,
          color_method: node.color_method,
          icon_path: node.icon_path ?? undefined,
          sort_order: node.sort_order ?? 0,
          status: node.status ?? "ACTIVE",
          is_active: node.is_active ?? true,
        });
      }
      for (const relationship of sourceHierarchy.relationships) {
        await createFrameworkRelationship(selectedEdition.framework_code, selectedEdition.edition_code, {
          parent_node_code: relationship.parent_node_code,
          child_node_code: relationship.child_node_code,
          relationship_type: relationship.relationship_type ?? "PARENT_CHILD",
          sort_order: relationship.sort_order ?? 0,
          is_active: relationship.is_active ?? true,
        });
      }
      await refreshPage("Hierarchy replicated into selected edition.");
    } catch (replicateError) {
      setError(replicateError instanceof Error ? replicateError.message : "Hierarchy replication could not be completed.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PageSection className="flex min-w-0 flex-col gap-4">
      <PageHeader>
        <div>
          <h2>Framework Management</h2>
          <p>Configure framework editions, dynamic hierarchy levels, nodes, and relationships.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" type="button" onClick={() => void refreshPage()}>
            <RefreshCw size={14} />
            Refresh
          </Button>
          <NativeSelect
            className="w-full sm:w-48"
            aria-label="Framework edition"
            onChange={(event) => setSelectedKey(event.target.value)}
            value={selectedEdition ? getEditionKey(selectedEdition) : ""}
          >
            {editions.map((edition) => (
              <NativeSelectOption key={getEditionKey(edition)} value={getEditionKey(edition)}>
                {edition.framework_code} / {edition.edition_code}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <Button type="button" onClick={() => setDrawer({ mode: "edition" })}>
            <Plus size={14} />
            New Edition
          </Button>
        </div>
      </PageHeader>

      {notice && <div className="rounded-md bg-muted p-3 text-sm">{notice}</div>}
      {error && <div className="rounded-md bg-muted p-3 text-sm text-destructive">{error}</div>}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Framework editions" sublabel={`${activeEditionsCount} active`} value={editions.length} />
        <MetricCard label="Hierarchy levels" sublabel={`${activeLevelsCount} active`} value={levels.length} />
        <MetricCard label="Framework nodes" sublabel={`${activeNodesCount} active`} value={nodes.length} />
        <MetricCard label="Relationships" sublabel={`${activeRelationshipsCount} active`} value={relationships.length} />
      </section>

      <CustomTabs
        className="min-w-0 gap-4"
        value={activeTab}
        onValueChange={(key) => setActiveTab(String(key) as FrameworkTab)}
        variant="underline"
        compact
        ariaLabel={t("pages.framework.tabs.label")}
        contentClassName="flex min-w-0 flex-col gap-4"
        endContent={selectedEdition && activeTab !== "editions" && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <NativeSelect
                  aria-label="Source edition for hierarchy replication"
                  onChange={(event) => setReplicateSourceKey(event.target.value)}
                  value={replicateSourceKey}
                >
                  <NativeSelectOption value="">Replicate from edition</NativeSelectOption>
                  {replicateSourceOptions.map((edition) => (
                    <NativeSelectOption key={getEditionKey(edition)} value={getEditionKey(edition)}>
                      {edition.framework_code} / {edition.edition_code}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                <Button variant="outline" disabled={!replicateSourceKey || isSaving} type="button" onClick={() => void handleReplicateHierarchy()}>
                  <GitBranch size={13} />
                  Replicate
                </Button>
              </div>
            </div>
          )}
        items={[{ value: "editions", label: t("pages.framework.tabs.editions") },
          { value: "levels", label: t("pages.framework.tabs.levels") },
          { value: "nodes", label: t("pages.framework.tabs.nodes") },
          { value: "relationships", label: t("pages.framework.tabs.relationships") }].map((tab) => ({ ...tab, content: (<><div className="flex min-w-0 flex-wrap items-center gap-3">
            <InputGroup className="w-full sm:max-w-md">
              <InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon>
              <InputGroupInput aria-label={t("frameworkFilters.search")} placeholder={t("frameworkFilters.search")} value={searchText} onChange={(event) => setSearchText(event.target.value)} />
            </InputGroup>
            <NativeSelect className="w-full sm:w-44" aria-label={t("frameworkFilters.status")} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <NativeSelectOption value="ALL">{t("frameworkFilters.all")}</NativeSelectOption>
              <NativeSelectOption value="ACTIVE">Active</NativeSelectOption>
              <NativeSelectOption value="DRAFT">Draft</NativeSelectOption>
              <NativeSelectOption value="RETIRED">Retired</NativeSelectOption>
            </NativeSelect>
          </div>
        {isLoading && <Loader text="Loading framework records..." />}
        {!isLoading && activeTab === "editions" && (
          <EditionsTable
            editions={filteredEditions}
            onDeactivate={handleDeactivate}
            onEdit={(record) => setDrawer({ mode: "edition", record })}
            onRestore={handleRestore}
          />
        )}
        {!isLoading && activeTab === "levels" && (
          <FrameworkLevelTree levels={filteredLevels} onCreate={() => setDrawer({ mode: "level" })} onEdit={(record) => setDrawer({ mode: "level", record })} />
        )}
        {!isLoading && activeTab === "nodes" && (
          <NodesTable
            levelFilter={levelFilter}
            levels={levels}
            nodes={filteredNodes}
            onCreate={() => setDrawer({ mode: "node" })}
            onEdit={(record) => setDrawer({ mode: "node", record })}
            onLevelFilterChange={setLevelFilter}
          />
        )}
        {!isLoading && activeTab === "relationships" && (
          <RelationshipsTable
            levels={levels}
            nodes={nodes}
            onDeleteParent={handleDeleteParentRelationships}
            onDeleteRelationship={handleDeleteRelationship}
            pendingParentCodes={pendingRelationshipParentCodes}
            relationships={filteredRelationships}
            openParentCode={openRelationshipParentCode}
            onCreate={(parentNodeCode) => setDrawer({ mode: "relationship", parentNodeCode })}
            onOpenParentChange={setOpenRelationshipParentCode}
          />
        )}</>) }))}
      />

      {drawer && (
        <FrameworkDrawer
          error={error}
          drawer={drawer}
          isSaving={isSaving}
          levels={levels}
          nodes={nodes}
          pendingParentCodes={pendingRelationshipParentCodes}
          relationships={relationships}
          onClose={() => setDrawer(null)}
          onSubmit={handleDrawerSubmit}
        />
      )}
    </PageSection>
  );
}

function MetricCard({ label, sublabel, value }: { label: string; sublabel?: string; value: number }) {
  return (
    <Card className="flex min-w-0 flex-col gap-1"><CardContent className="flex min-w-0 flex-col gap-3">
      <div className="font-heading text-2xl font-semibold tabular-nums text-foreground">{value}</div>
      <div className="text-sm font-medium text-foreground">{label}</div>
      {sublabel && <div className="text-xs text-muted-foreground">{sublabel}</div>}
    </CardContent></Card>
  );
}

function EditionsTable({
  editions,
  onDeactivate,
  onEdit,
  onRestore,
}: {
  editions: FrameworkEdition[];
  onDeactivate: (edition: FrameworkEdition) => void;
  onEdit: (edition: FrameworkEdition) => void;
  onRestore: (edition: FrameworkEdition) => void;
}) {
  const { t } = useTranslation("common");
  if (!editions.length) {
    return <Empty><EmptyHeader><EmptyTitle>No framework editions found.</EmptyTitle></EmptyHeader></Empty>;
  }
  return (
    <div className="min-w-0 overflow-x-auto">
      <DataTableReport ariaLabel={t("reportTable.label")} headers={["Framework",
        "Edition",
        "Name",
        "Version",
        "Status",
        "Active",
        "Actions"]} rows={editions.map((edition) => (
          ({
            id: getEditionKey(edition), cells: [<div key="cell-0" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><span className="font-mono text-xs" title={edition.framework_code}>{edition.framework_code}</span></div>,
            <div key="cell-1" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><span className="font-mono text-xs" title={edition.edition_code}>{edition.edition_code}</span></div>,
            <div key="cell-2" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><span className="text-sm" title={edition.name ?? "-"}>{edition.name ?? "-"}</span></div>,
            <div key="cell-3" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><span className="text-sm" title={edition.version_label ?? "-"}>{edition.version_label ?? "-"}</span></div>,
            <div key="cell-4" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><StatusBadge status={edition.status ?? "DRAFT"} /></div>,
            <div key="cell-5" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{edition.is_active ? "Yes" : "No"}</div>,
            <div key="cell-6" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><div className="flex flex-wrap items-center gap-2">
              <Button size="icon-sm" variant="ghost" type="button" onClick={() => onEdit(edition)} title="Edit edition">
                <Pencil size={13} />
              </Button>
              {edition.is_active ? (
                <Button variant="ghost" className="text-destructive" type="button" onClick={() => onDeactivate(edition)}>
                  Deactivate
                </Button>
              ) : (
                <Button variant="ghost" type="button" onClick={() => onRestore(edition)}>
                  <RotateCcw size={13} />
                  Restore
                </Button>
              )}
            </div></div>]
          })
        ))} />
    </div>
  );
}

function NodesTable({
  levelFilter,
  levels,
  nodes,
  onCreate,
  onEdit,
  onLevelFilterChange,
}: {
  levelFilter: string;
  levels: FrameworkLevel[];
  nodes: FrameworkNode[];
  onCreate: () => void;
  onEdit: (node: FrameworkNode) => void;
  onLevelFilterChange: (levelCode: string) => void;
}) {
  const { t } = useTranslation("common");
  return (
    <>
      <header className="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold">{t("frameworkNodes.title")}</h3>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t("frameworkNodes.description")}</p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:shrink-0">
          <NativeSelect className="min-w-0 flex-1 sm:w-48 sm:flex-none" aria-label={t("frameworkNodes.levelFilter")} onChange={(event) => onLevelFilterChange(event.target.value)} value={levelFilter}>
            <NativeSelectOption value="ALL">{t("frameworkNodes.allLevels")}</NativeSelectOption>
            {levels.map((level) => (
              <NativeSelectOption key={level.level_code} value={level.level_code}>
                {level.name ?? level.level_code}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <Button variant="outline" type="button" onClick={onCreate}>
            <Plus size={14} />
            {t("frameworkNodes.add")}
          </Button>
        </div>
      </header>
      {!nodes.length ? (
        <Empty><EmptyHeader><EmptyTitle>No nodes found for the selected filters.</EmptyTitle></EmptyHeader></Empty>
      ) : (
        <div className="min-w-0 overflow-x-auto">
            <DataTableReport ariaLabel={t("reportTable.label")} headers={["Node",
              "Name",
              "Level",
              "Color",
              "Status",
              "Sort",
              "Actions"]} rows={nodes.map((node) => (
                ({
                  id: node.node_code, cells: [<div key="cell-0" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><div className="flex min-w-0 flex-col gap-1 [&>span]:text-xs [&>span]:text-muted-foreground">
                    <strong>{node.node_number ?? node.node_code}</strong>
                    <span>{node.node_code}</span>
                  </div></div>,
                  <div key="cell-1" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{node.name ?? "-"}</div>,
                  <div key="cell-2" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{node.level_code}</div>,
                  <div key="cell-3" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{node.color_value ? (
                    <ColorSwatch node={node} />
                  ) : (
                    "-"
                  )}</div>,
                  <div key="cell-4" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><StatusBadge status={node.status ?? "ACTIVE"} /></div>,
                  <div key="cell-5" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{node.sort_order ?? 0}</div>,
                  <div key="cell-6" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><Button size="icon-sm" variant="ghost" type="button" onClick={() => onEdit(node)} title="Edit node">
                    <Pencil size={13} />
                  </Button></div>]
                })
              ))} />
        </div>
      )}
    </>
  );
}

function RelationshipsTable({
  levels,
  nodes,
  onDeleteParent,
  onDeleteRelationship,
  pendingParentCodes,
  relationships,
  openParentCode,
  onCreate,
  onOpenParentChange,
}: {
  levels: FrameworkLevel[];
  nodes: FrameworkNode[];
  onDeleteParent: (parentNodeCode: string) => void;
  onDeleteRelationship: (parentNodeCode: string, childNodeCode: string) => void;
  pendingParentCodes: string[];
  relationships: FrameworkRelationship[];
  openParentCode: string | null;
  onCreate: (parentNodeCode?: string) => void;
  onOpenParentChange: (parentNodeCode: string | null) => void;
}) {
  const { t } = useTranslation("common");
  const relationshipGroups = withParentNodeGroups(
    withPendingParentGroups(groupRelationshipsByParent(relationships), pendingParentCodes),
    parentCandidateNodes(nodes, levels),
  );
  const childNodeCodes = new Set(relationships.map((relationship) => relationship.child_node_code));
  const rootGroups = relationshipGroups.filter((group) => !childNodeCodes.has(group.parentCode) || pendingParentCodes.includes(group.parentCode));
  const groupsByParent = new Map(relationshipGroups.map((group) => [group.parentCode, group.children]));
  return (
    <>
      <header className="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold">{t("frameworkRelationships.title")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t("frameworkRelationships.description")}</p>
        </div>
        <Button variant="outline" type="button" onClick={() => onCreate()}>
          <GitBranch size={14} />
          {t("frameworkRelationships.add")}
        </Button>
      </header>
      {!relationshipGroups.length ? (
        <Empty><EmptyHeader><EmptyTitle>No parent or child relationships found.</EmptyTitle></EmptyHeader></Empty>
      ) : (
        <div className="flex min-w-0 flex-col gap-3">
          {rootGroups.map((group) => {
            const parent = findNode(nodes, group.parentCode);
            const isOpen = openParentCode === group.parentCode;
            return (
              <Card className="min-w-0 py-0 shadow-sm" key={group.parentCode}><CardContent className="flex min-w-0 flex-col gap-3 p-4">
                <Button
                  variant="ghost"
                  type="button"
                  className="h-auto w-full justify-start gap-3 text-left whitespace-normal"
                  onPress={() => onOpenParentChange(isOpen ? null : group.parentCode)}
                  aria-expanded={isOpen}
                >
                  <span className="size-4 shrink-0">
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                  <ColorSwatch node={parent} />
                  <div className="flex min-w-0 flex-1 flex-col gap-1 [&>span]:text-xs [&>span]:text-muted-foreground">
                    <strong>{formatNodeTitle(parent, group.parentCode)}</strong>
                    <span>{parent?.level_code ?? "PARENT"} / {group.parentCode}</span>
                  </div>
                  <Badge variant="secondary">{group.children.length} children</Badge>
                </Button>
                {isOpen && (
                  <div className="flex min-w-0 flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button variant="outline" type="button" onClick={() => onCreate(group.parentCode)}>
                        <Plus size={13} />
                        Add Child
                      </Button>
                      <Button variant="ghost" className="text-destructive" type="button" onClick={() => onDeleteParent(group.parentCode)}>
                        <Trash2 size={13} />
                        {group.children.length ? "Remove Parent Links" : "Remove Parent"}
                      </Button>
                    </div>
                    {!group.children.length && <div className="p-3 text-sm text-muted-foreground">No child linked yet. Use Add Child to create the first relationship.</div>}
                    {group.children.map((relationship) => (
                      <RelationshipTreeRow
                        key={`${relationship.parent_node_code}-${relationship.child_node_code}`}
                        levels={levels}
                        nodes={nodes}
                        onCreate={onCreate}
                        onDeleteRelationship={onDeleteRelationship}
                        relationship={relationship}
                        relationshipsByParent={groupsByParent}
                      />
                    ))}
                  </div>
                )}
              </CardContent></Card>
            );
          })}
        </div>
      )}
    </>
  );
}

function RelationshipTreeRow({
  levels,
  nodes,
  onCreate,
  onDeleteRelationship,
  relationship,
  relationshipsByParent,
  depth = 0,
}: {
  levels: FrameworkLevel[];
  nodes: FrameworkNode[];
  onCreate: (parentNodeCode?: string) => void;
  onDeleteRelationship: (parentNodeCode: string, childNodeCode: string) => void;
  relationship: FrameworkRelationship;
  relationshipsByParent: Map<string, FrameworkRelationship[]>;
  depth?: number;
}) {
  const child = findNode(nodes, relationship.child_node_code);
  const childLinks = relationshipsByParent.get(relationship.child_node_code) ?? [];
  return (
    <div className="flex min-w-0 flex-col gap-2 border-l pl-4">
      <Card className="min-w-0 py-0 shadow-sm"><CardContent className="flex min-w-0 flex-wrap items-center gap-3 p-3">
        <ColorSwatch node={child} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <strong className="break-words text-sm">{formatNodeTitle(child, relationship.child_node_code)}</strong>
          <span className="break-all text-xs text-muted-foreground">{relationship.child_node_code}</span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">{levelLabelForNode(child, levels)}</span>
            <Badge variant="secondary">{relationship.relationship_type ?? "PARENT_CHILD"}</Badge>
          </div>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1">
        <Button size="icon-sm" variant="ghost"

          type="button"
          onClick={() => onCreate(relationship.child_node_code)}
          title="Add child under this node"
        >
          <Plus size={13} />
        </Button>
        <Button size="icon-sm" variant="ghost"
          className="text-destructive"
          type="button"
          onClick={() => onDeleteRelationship(relationship.parent_node_code, relationship.child_node_code)}
          title="Remove child link"
        >
          <Trash2 size={13} />
        </Button>
        </div>
      </CardContent></Card>
      {childLinks.map((childRelationship) => (
        <RelationshipTreeRow
          depth={depth + 1}
          key={`${childRelationship.parent_node_code}-${childRelationship.child_node_code}`}
          levels={levels}
          nodes={nodes}
          onCreate={onCreate}
          onDeleteRelationship={onDeleteRelationship}
          relationship={childRelationship}
          relationshipsByParent={relationshipsByParent}
        />
      ))}
    </div>
  );
}

function FrameworkDrawer({
  error,
  drawer,
  isSaving,
  levels,
  nodes,
  onClose,
  onSubmit,
  pendingParentCodes,
  relationships,
}: {
  error: string;
  drawer: DrawerState;
  isSaving: boolean;
  levels: FrameworkLevel[];
  nodes: FrameworkNode[];
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  pendingParentCodes: string[];
  relationships: FrameworkRelationship[];
}) {
  return (
    <Sheet isOpen isDismissable={!isSaving} showCloseButton={false} onOpenChange={(open) => { if (!open && !isSaving) { onClose(); } }} className="w-full sm:max-w-xl">
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b p-4 [&_h3]:text-base [&_h3]:font-semibold [&_span]:text-xs [&_span]:text-muted-foreground">
          <div>
            <div className="text-xs font-medium text-muted-foreground">{drawer.record ? "Edit" : "Create"}</div>
            <SheetTitle>{getDrawerTitle(drawer.mode)}</SheetTitle>
          </div>
          <Button disabled={isSaving} size="icon-sm" variant="ghost" type="button" onClick={onClose} aria-label="Close">
            <X size={16} />
          </Button>
        </div>
        <form className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4" onSubmit={onSubmit}>
          {error && <div role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
          {drawer.mode === "edition" && <EditionFields record={drawer.record} />}
          {drawer.mode === "level" && <LevelFields record={drawer.record} nextNumber={Math.max(0, ...levels.map((level) => Number(level.level_number) || 0)) + 1} />}
          {drawer.mode === "node" && <NodeFields levels={levels} record={drawer.record} />}
          {drawer.mode === "relationship" && (
            <RelationshipFields
              levels={levels}
              nodes={nodes}
              parentNodeCode={drawer.parentNodeCode}
              pendingParentCodes={pendingParentCodes}
              relationships={relationships}
            />
          )}
          <div className="mt-auto flex shrink-0 flex-wrap items-center justify-end gap-2 border-t pt-4">
            <Button disabled={isSaving} variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={isSaving} type="submit">
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </Sheet>
  );
}

function EditionFields({ record }: { record?: FrameworkEdition }) {
  return (
    <>
      <FormField label="Framework code" name="framework_code" required codeField defaultValue={record?.framework_code} disabled={Boolean(record)} placeholder="Auto: SDG_NIF" />
      <FormField label="Edition code" name="edition_code" required codeField defaultValue={record?.edition_code} disabled={Boolean(record)} placeholder="Auto: SDG_NIF_2025" />
      <FormField label="Edition name" name="name" required defaultValue={record?.name} />
      <FormField label="Version label" name="version_label" defaultValue={record?.version_label} />
      <FormTextarea label="Description" name="description" defaultValue={record?.description} />
      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Effective from" name="effective_from" type="date" defaultValue={record?.effective_from ?? ""} />
        <FormField label="Effective to" name="effective_to" type="date" defaultValue={record?.effective_to ?? ""} />
      </div>
      {record ? (
        <>
          <FormSelect label="Lifecycle status" name="status" defaultValue={record.status ?? "DRAFT"} options={["DRAFT", "ACTIVE", "RETIRED"]} />
          <CheckboxField label="Make this the active edition for use" name="is_active" defaultChecked={record.is_active ?? false} />
          <div className="text-xs text-muted-foreground">Only one active edition is allowed per unit and framework. Deactivate the current active edition before activating another.</div>
        </>
      ) : (
        <div className="text-xs text-muted-foreground">New framework editions are created as draft. Activate the edition only after levels, nodes, and relationships are reviewed.</div>
      )}
    </>
  );
}

function LevelFields({ record, nextNumber }: { record?: FrameworkLevel; nextNumber: number }) {
  return (
    <>
      <FormField label="Level code" name="level_code" required codeField defaultValue={record?.level_code} disabled={Boolean(record)} placeholder="Auto: GOAL" />
      <FormField label="Level number" name="level_number" required type="number" defaultValue={record?.level_number ?? nextNumber} />
      <FormField label="Level name" name="name" required defaultValue={record?.name} />
      <FormTextarea label="Description" name="description" defaultValue={record?.description} />
      <CheckboxField className="framework-level-toggle" label="Allows indicator mapping" name="allows_indicator_mapping" defaultChecked={record?.allows_indicator_mapping ?? false} />
      <CheckboxField className="framework-level-toggle" label="Active" name="is_active" defaultChecked={record?.is_active ?? true} />
    </>
  );
}

function NodeFields({ levels, record }: { levels: FrameworkLevel[]; record?: FrameworkNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-5">
      <section className="flex min-w-0 flex-col gap-3">
        <div className="flex items-start justify-between gap-2 [&_h3]:text-sm [&_h3]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
          <span>Node identity</span>
          <p>Define the level and stable code used by framework mappings.</p>
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
          <FormSelect
            label="Level"
            name="level_code"
            defaultValue={record?.level_code ?? levels[0]?.level_code ?? ""}
            options={levels.map((level) => level.level_code)}
          />
          <FormField label="Node code" name="node_code" required codeField defaultValue={record?.node_code} disabled={Boolean(record)} placeholder="Auto: GOAL_01" />
          <FormField label="Node number" name="node_number" defaultValue={record?.node_number} />
          <FormField label="Sort order" name="sort_order" type="number" defaultValue={record?.sort_order ?? 0} />
        </div>
      </section>

      <section className="flex min-w-0 flex-col gap-3">
        <div className="flex items-start justify-between gap-2 [&_h3]:text-sm [&_h3]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
          <span>Display details</span>
          <p>Use concise names for cards, tables, and hierarchy views.</p>
        </div>
        <FormField label="Node name" name="name" required defaultValue={record?.name} />
        <FormField label="Short name" name="short_name" defaultValue={record?.short_name} />
        <FormTextarea label="Description" name="description" defaultValue={record?.description} />
      </section>

      <section className="flex min-w-0 flex-col gap-3">
        <div className="flex items-start justify-between gap-2 [&_h3]:text-sm [&_h3]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
          <span>Visual styling</span>
          <p>Optional color and icon references used in framework cards.</p>
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Color value" name="color_value" placeholder="#E5243B" defaultValue={record?.color_value} />
          <FormSelect
            label="Color method"
            name="color_method"
            defaultValue={record?.color_method ?? ""}
            options={["", "HEX", "RGB", "RGBA", "HSL", "TOKEN"]}
          />
        </div>
        <FormField label="Icon path" name="icon_path" defaultValue={record?.icon_path ?? ""} />
      </section>

      <section className="flex min-w-0 flex-col gap-3">
        <div className="flex items-start justify-between gap-2 [&_h3]:text-sm [&_h3]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
          <span>Publishing</span>
          <p>Control whether this node is available in active framework views.</p>
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
          <FormSelect label="Status" name="status" defaultValue={record?.status ?? "ACTIVE"} options={["DRAFT", "ACTIVE", "RETIRED"]} />
          <div className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">
            <span>Availability</span>
            <BooleanField defaultSelected={record?.is_active ?? true} name="is_active" >

              <span>Active</span>
            </BooleanField>
          </div>
        </div>
      </section>
    </div>
  );
}

function RelationshipFields({
  levels,
  nodes,
  parentNodeCode,
  pendingParentCodes,
  relationships,
}: {
  levels: FrameworkLevel[];
  nodes: FrameworkNode[];
  parentNodeCode?: string;
  pendingParentCodes: string[];
  relationships: FrameworkRelationship[];
}) {
  const orderedLevels = [...levels]
    .filter((level) => level.is_active !== false)
    .sort((a, b) => Number(a.level_number ?? 0) - Number(b.level_number ?? 0));
  const parentNode = parentNodeCode ? findNode(nodes, parentNodeCode) : undefined;
  const parentLevel = parentNode ? orderedLevels.find((level) => level.level_code === parentNode.level_code) : undefined;
  const eligibleChildLevels = parentLevel
    ? orderedLevels.filter((level) => Number(level.level_number) > Number(parentLevel.level_number))
    : orderedLevels;
  const defaultChildLevelCode = eligibleChildLevels[0]?.level_code ?? orderedLevels[0]?.level_code ?? "";
  const [childLevelCode, setChildLevelCode] = useState(defaultChildLevelCode);
  useEffect(() => {
    const timer = window.setTimeout(() => setChildLevelCode(defaultChildLevelCode), 0);
    return () => window.clearTimeout(timer);
  }, [defaultChildLevelCode]);
  const usedParentCodes = new Set([
    ...relationships.map((relationship) => relationship.parent_node_code),
    ...pendingParentCodes,
  ]);
  const parentNodes = parentNodeCode ? nodes : nodes.filter((node) => !usedParentCodes.has(node.node_code));
  const filteredChildNodes = parentNodeCode
    ? nodes.filter(
        (node) =>
          node.level_code === childLevelCode &&
          node.node_code !== parentNodeCode &&
          !relationshipExists(relationships, parentNodeCode, node.node_code),
      )
    : [];
  return (
    <>
      <NodeCodeInput label="Parent node" name="parent_node_code" nodes={parentNodes} defaultValue={parentNodeCode} />
      {parentNodeCode && (
        <>
          <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">
            <span>Child level</span>
            <NativeSelect value={childLevelCode} onChange={(event) => setChildLevelCode(event.target.value)}>
              {eligibleChildLevels.map((level) => (
                <NativeSelectOption key={level.level_code} value={level.level_code}>
                  Level {level.level_number} - {level.name ?? level.level_code}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>
          <NodeCodeInput label="Child node" name="child_node_code" nodes={filteredChildNodes} />
          <FormSelect label="Relationship type" name="relationship_type" defaultValue="PARENT_CHILD" options={["PARENT_CHILD", "RELATED"]} />
          <FormField label="Sort order" name="sort_order" type="number" defaultValue={0} />
          <CheckboxField className="framework-relationship-toggle" label="Active" name="is_active" defaultChecked />
        </>
      )}
      {!parentNodeCode && <div className="text-xs text-muted-foreground">Select a parent node first. Child links are added from the selected parent row.</div>}
    </>
  );
}

function FormField({
  codeField,
  defaultValue,
  disabled,
  label,
  name,
  placeholder,
  required,
  type = "text",
}: {
  codeField?: boolean;
  defaultValue?: string | number | null;
  disabled?: boolean;
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">
      <span>{label}</span>
      <Input
        defaultValue={defaultValue ?? ""}
        disabled={disabled}
        name={name}
        onBlur={codeField ? normalizeCodeInput : undefined}
        pattern={codeField ? "[A-Z0-9_]+" : undefined}
        placeholder={placeholder}
        required={required}
        title={codeField ? "Use uppercase letters, numbers, and underscores only." : undefined}
        type={type}
      />
    </label>
  );
}

function NodeCodeInput({
  defaultValue,
  label,
  name,
  nodes,
}: {
  defaultValue?: string;
  label: string;
  name: string;
  nodes: FrameworkNode[];
}) {
  const listId = `${name}-options`;
  return (
    <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">
      <span>{label}</span>
      <Input
        defaultValue={defaultValue ?? ""}
        list={listId}
        name={name}
        onBlur={normalizeCodeInput}
        pattern="[A-Z0-9_]+"
        placeholder="Search/select node code"
        required
        title="Select a valid node code."
      />
      <datalist id={listId}>
        {nodes.map((node) => (
          <NativeSelectOption key={node.node_code} value={node.node_code}>
            {formatNodeTitle(node, node.node_code)}
          </NativeSelectOption>
        ))}
      </datalist>
    </label>
  );
}

function FormTextarea({ defaultValue, label, name }: { defaultValue?: string | null; label: string; name: string }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">
      <span>{label}</span>
      <Textarea defaultValue={defaultValue ?? ""} name={name} rows={4} />
    </label>
  );
}

function FormSelect({
  defaultValue,
  label,
  name,
  options,
}: {
  defaultValue?: string;
  label: string;
  name: string;
  options: string[];
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">
      <span>{label}</span>
      <NativeSelect defaultValue={defaultValue} name={name} required={!options.includes("")}>
        {options.map((option) => (
          <NativeSelectOption key={option || "empty"} value={option}>
            {option || "None"}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </label>
  );
}

function CheckboxField({ className, defaultChecked, label, name }: { className?: string; defaultChecked?: boolean; label: string; name: string }) {
  return (
    <BooleanField className={className} defaultSelected={defaultChecked} name={name}>

      <span>{label}</span>
    </BooleanField>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = normalizeStatus(status);
  return <SharedStatusBadge variant={normalizeStatusVariant(normalized)}>{status}</SharedStatusBadge>;
}

function ColorSwatch({ node }: { node?: FrameworkNode }) {
  const { t } = useTranslation("common");
  return <span role="img" aria-label={t("frameworkNodes.color", { value: node?.color_value ?? "—" })} title={node?.color_value} className="inline-block size-5 shrink-0 rounded border" style={{ backgroundColor: node?.color_value || "var(--muted)" }} />;
}

function getDrawerTitle(mode: DrawerMode): string {
  const titles: Record<DrawerMode, string> = {
    edition: "Framework Edition",
    level: "Hierarchy Level",
    node: "Framework Node",
    relationship: "Node Relationship",
  };
  return titles[mode];
}

function getEditionKey(edition: FrameworkEdition): string {
  return `${edition.framework_code}::${edition.edition_code}`;
}

function relationshipParentStorageKey(edition: FrameworkEdition): string {
  return `ssd.framework.relationshipParents.${getSelectedUnitCode()}.${edition.framework_code}.${edition.edition_code}`;
}

function loadStoredRelationshipParents(edition: FrameworkEdition): string[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(relationshipParentStorageKey(edition)) ?? "[]") as unknown;
    return Array.isArray(parsed) ? parsed.map((value) => String(value)).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function persistPendingRelationshipParents(edition: FrameworkEdition, parentCodes: string[]): string[] {
  const uniqueCodes = Array.from(new Set(parentCodes.filter(Boolean)));
  try {
    if (uniqueCodes.length) {
      window.localStorage.setItem(relationshipParentStorageKey(edition), JSON.stringify(uniqueCodes));
    } else {
      window.localStorage.removeItem(relationshipParentStorageKey(edition));
    }
  } catch {
    // Local persistence is only for parent placeholders; relationship links still use governed backend tables.
  }
  return uniqueCodes;
}

function matchesSearch(searchText: string, ...values: Array<string | number | undefined | null>): boolean {
  if (!searchText.trim()) {
    return true;
  }
  const normalizedSearch = searchText.trim().toLowerCase();
  return values.some((value) => String(value ?? "").toLowerCase().includes(normalizedSearch));
}

function normalizeStatus(status?: string): string {
  return String(status ?? "").trim().toUpperCase();
}

function assertSingleActiveEdition(
  payload: FrameworkEditionPayload,
  record: FrameworkEdition | undefined,
  editions: FrameworkEdition[],
): void {
  if (!payload.is_active) {
    return;
  }
  const activeEdition = editions.find((edition) => {
    const sameRecord =
      record &&
      edition.framework_code === record.framework_code &&
      edition.edition_code === record.edition_code;
    return edition.is_active && !sameRecord;
  });
  if (activeEdition) {
    throw new Error(
      `${activeEdition.framework_code} / ${activeEdition.edition_code} is already active for this unit. Deactivate the active edition first.`,
    );
  }
}

function normalizeCode(value: string | undefined, label: string): string {
  const normalized = generateCode(value ?? "");
  if (!normalized) {
    throw new Error(`${label} is required.`);
  }
  if (!/^[A-Z0-9_]+$/.test(normalized)) {
    throw new Error(`${label} must use uppercase letters, numbers, and underscores only.`);
  }
  return normalized;
}

function normalizeCodeInput(event: FocusEvent<HTMLInputElement>) {
  event.currentTarget.value = generateCode(event.currentTarget.value);
}

function generateCode(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_{2,}/g, "_");
}

function generateEditionCode(frameworkCode: string, versionLabel?: string, name?: string): string {
  const version = generateCode(versionLabel ?? "");
  if (version) {
    return `${frameworkCode}_${version}`;
  }
  return `${frameworkCode}_${generateCode(name ?? "EDITION")}`;
}

function generateNodeCode(levelCode?: string, nodeNumber?: string, name?: string): string {
  const level = generateCode(levelCode ?? "NODE");
  const suffix = generateCode(nodeNumber || name || "ITEM");
  return `${level}_${suffix}`;
}

function findNode(nodes: FrameworkNode[], nodeCode: string): FrameworkNode | undefined {
  return nodes.find((node) => node.node_code === nodeCode);
}

function formatNodeTitle(node: FrameworkNode | undefined, fallbackCode: string): string {
  if (!node) {
    return fallbackCode;
  }
  const number = node.node_number ? `${node.node_number} - ` : "";
  return `${number}${node.name ?? node.node_code}`;
}

function levelLabelForNode(node: FrameworkNode | undefined, levels: FrameworkLevel[]): string {
  if (!node) return "-";
  const level = levels.find((candidate) => candidate.level_code === node.level_code);
  return level ? `Level ${level.level_number} - ${level.name ?? level.level_code}` : node.level_code;
}

function groupRelationshipsByParent(relationships: FrameworkRelationship[]): Array<{ parentCode: string; children: FrameworkRelationship[] }> {
  const groups = new Map<string, FrameworkRelationship[]>();
  relationships.forEach((relationship) => {
    const group = groups.get(relationship.parent_node_code) ?? [];
    group.push(relationship);
    groups.set(relationship.parent_node_code, group);
  });
  return Array.from(groups, ([parentCode, children]) => ({ parentCode, children }));
}

function parentCandidateNodes(nodes: FrameworkNode[], levels: FrameworkLevel[]): FrameworkNode[] {
  const activeLevels = [...levels]
    .filter((level) => level.is_active !== false)
    .sort((first, second) => Number(first.level_number ?? 0) - Number(second.level_number ?? 0));
  const maxLevelNumber = Math.max(...activeLevels.map((level) => Number(level.level_number ?? 0)), 0);
  const levelNumberByCode = new Map(activeLevels.map((level) => [level.level_code, Number(level.level_number ?? 0)]));
  return [...nodes]
    .filter((node) => node.is_active !== false && normalizeStatus(node.status) !== "RETIRED")
    .filter((node) => {
      const levelNumber = levelNumberByCode.get(node.level_code);
      return levelNumber !== undefined && levelNumber < maxLevelNumber;
    })
    .sort((first, second) => {
      const firstLevel = levelNumberByCode.get(first.level_code) ?? 0;
      const secondLevel = levelNumberByCode.get(second.level_code) ?? 0;
      if (firstLevel !== secondLevel) return firstLevel - secondLevel;
      return (first.sort_order ?? 0) - (second.sort_order ?? 0) || String(first.node_number ?? first.node_code).localeCompare(String(second.node_number ?? second.node_code));
    });
}

function withParentNodeGroups(
  groups: Array<{ parentCode: string; children: FrameworkRelationship[] }>,
  parentNodes: FrameworkNode[],
): Array<{ parentCode: string; children: FrameworkRelationship[] }> {
  const groupByParent = new Map(groups.map((group) => [group.parentCode, group]));
  parentNodes.forEach((node) => {
    if (!groupByParent.has(node.node_code)) {
      groupByParent.set(node.node_code, { parentCode: node.node_code, children: [] });
    }
  });
  const parentOrder = new Map(parentNodes.map((node, index) => [node.node_code, index]));
  return Array.from(groupByParent.values()).sort((first, second) => {
    const firstIndex = parentOrder.get(first.parentCode);
    const secondIndex = parentOrder.get(second.parentCode);
    if (firstIndex !== undefined && secondIndex !== undefined) return firstIndex - secondIndex;
    if (firstIndex !== undefined) return -1;
    if (secondIndex !== undefined) return 1;
    return first.parentCode.localeCompare(second.parentCode);
  });
}

function withPendingParentGroups(
  groups: Array<{ parentCode: string; children: FrameworkRelationship[] }>,
  pendingParentCodes: string[],
): Array<{ parentCode: string; children: FrameworkRelationship[] }> {
  const groupParentCodes = new Set(groups.map((group) => group.parentCode));
  const pendingGroups = pendingParentCodes
    .filter((parentCode) => !groupParentCodes.has(parentCode))
    .map((parentCode) => ({ parentCode, children: [] }));
  return [...groups, ...pendingGroups];
}

function relationshipExists(relationships: FrameworkRelationship[], parentNodeCode: string, childNodeCode: string): boolean {
  return relationships.some(
    (relationship) =>
      relationship.parent_node_code === parentNodeCode &&
      relationship.child_node_code === childNodeCode &&
      relationship.is_active !== false,
  );
}

function readString(formData: FormData, name: string): string | undefined {
  const value = String(formData.get(name) ?? "").trim();
  return value || undefined;
}

function requiredString(formData: FormData, name: string, message: string): string {
  const value = readString(formData, name);
  if (!value) {
    throw new Error(message);
  }
  return value;
}

function readNumber(formData: FormData, name: string): number | undefined {
  const value = readString(formData, name);
  if (!value) {
    return undefined;
  }
  return Number(value);
}

function requiredNumber(formData: FormData, name: string, message: string): number {
  const value = readNumber(formData, name);
  if (!value || Number.isNaN(value)) {
    throw new Error(message);
  }
  return value;
}

function readBoolean(formData: FormData, name: string): boolean {
  return formData.get(name) === "on";
}
