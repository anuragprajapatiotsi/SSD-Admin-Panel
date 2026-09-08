import { CardContent, CardHeader, Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

import { PageSection, PageHeader } from "@/components/common/page-layout";

import { SearchInput } from "@/components/common/search-input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, ExternalLink, Grid2X2, List, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  getFrameworkHierarchy,
  listFrameworkIndicatorMappingsByNode,
  listFrameworkEditions,
  type FrameworkHierarchy,
  type FrameworkLevel,
  type FrameworkNode,
} from "../../api/framework.api";
import { getSelectedUnitCode, LOCALE_CHANGED_EVENT, UNIT_CHANGED_EVENT } from "../../api/session.api";
import { Loader } from "../../components/common/loader";

type ViewMode = "grid" | "list";

const fallbackColors = [
  "#e91e3a",
  "#e2aa32",
  "#43a037",
  "#c8102e",
  "#ff3b25",
  "#27b8d4",
  "#f7c400",
  "#a41545",
  "#ff681f",
  "#d91772",
  "#f59e22",
  "#bd8d2b",
];

function pluralizeLabel(label?: string) {
  const safeLabel = (label || "Nodes").trim();
  if (!safeLabel) return "Nodes";
  if (safeLabel.endsWith("s")) return safeLabel;
  if (safeLabel.endsWith("y")) return `${safeLabel.slice(0, -1)}ies`;
  return `${safeLabel}s`;
}

function formatNodeNumber(node: FrameworkNode, index: number) {
  const rawNumber = node.node_number?.trim();
  if (rawNumber && /^\d+$/.test(rawNumber) && rawNumber.length === 1) {
    return rawNumber.padStart(2, "0");
  }
  return rawNumber || String(index + 1).padStart(2, "0");
}

function getNodeTitle(node: FrameworkNode) {
  return node.name || node.short_name || node.node_code;
}

function getNodeColor(node: FrameworkNode, index: number) {
  const value = node.color_value?.trim();
  if (value && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) {
    return value;
  }
  return fallbackColors[index % fallbackColors.length];
}

function getColorForeground(color: string) {
  const hex = color.slice(1);
  const expanded = hex.length === 3 ? [...hex].map((value) => value + value).join("") : hex;
  const channels = [0, 2, 4].map((offset) => {
    const value = parseInt(expanded.slice(offset, offset + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const luminance = channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  return luminance > 0.179 ? "#000000" : "#ffffff";
}

export function FrameworkLevelPage() {
  const { t } = useTranslation("common");
  const { levelCode = "", nodeCode = "" } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const decodedLevelCode = decodeURIComponent(levelCode);
  const decodedNodeCode = decodeURIComponent(nodeCode);
  const selectedChildCode = searchParams.get("selected") ?? "";
  const [hierarchy, setHierarchy] = useState<FrameworkHierarchy | null>(null);
  const [level, setLevel] = useState<FrameworkLevel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [parentFilter, setParentFilter] = useState("");

  useEffect(() => {
    void loadLevel();

    function handleContextChange() {
      void loadLevel();
    }

    window.addEventListener(UNIT_CHANGED_EVENT, handleContextChange);
    window.addEventListener(LOCALE_CHANGED_EVENT, handleContextChange);
    return () => {
      window.removeEventListener(UNIT_CHANGED_EVENT, handleContextChange);
      window.removeEventListener(LOCALE_CHANGED_EVENT, handleContextChange);
    };
  }, [decodedLevelCode]);

  const orderedLevels = useMemo(() => {
    return [...(hierarchy?.levels ?? [])]
      .filter((item) => item.is_active !== false)
      .sort((a, b) => Number(a.level_number ?? 0) - Number(b.level_number ?? 0));
  }, [hierarchy]);

  const nextLevel = useMemo(() => {
    if (!level) return null;
    return orderedLevels.find((item) => Number(item.level_number) > Number(level.level_number)) ?? null;
  }, [level, orderedLevels]);
  const parentLevel = useMemo(() => {
    if (!level) return null;
    const currentLevelNumber = Number(level.level_number);
    return [...orderedLevels]
      .reverse()
      .find((item) => Number(item.level_number) < currentLevelNumber) ?? null;
  }, [level, orderedLevels]);
  const isIndicatorMappingLevel = Boolean(level?.allows_indicator_mapping) || !nextLevel;

  const currentNodes = useMemo(() => {
    if (!hierarchy || !level) return [];
    return hierarchy.nodes
      .filter((node) => node.level_code === level.level_code && node.is_active !== false)
      .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0) || getNodeTitle(a).localeCompare(getNodeTitle(b)));
  }, [hierarchy, level]);

  const nodeByCode = useMemo(() => {
    return new Map((hierarchy?.nodes ?? []).map((node) => [node.node_code, node]));
  }, [hierarchy]);

  const childCodesByParent = useMemo(() => {
    const map = new Map<string, string[]>();
    (hierarchy?.relationships ?? [])
      .filter((relationship) => relationship.is_active !== false)
      .forEach((relationship) => {
        const childNode = nodeByCode.get(relationship.child_node_code);
        if (!childNode || childNode.is_active === false) return;
        const children = map.get(relationship.parent_node_code) ?? [];
        children.push(relationship.child_node_code);
        map.set(relationship.parent_node_code, children);
      });
    map.forEach((children, parentCode) => {
      map.set(
        parentCode,
        children.sort((leftCode, rightCode) => {
          const left = nodeByCode.get(leftCode);
          const right = nodeByCode.get(rightCode);
          return Number(left?.sort_order ?? 0) - Number(right?.sort_order ?? 0) || getNodeTitle(left ?? { node_code: leftCode, level_code: "" }).localeCompare(getNodeTitle(right ?? { node_code: rightCode, level_code: "" }));
        }),
      );
    });
    return map;
  }, [hierarchy, nodeByCode]);

  const parentCodeByChild = useMemo(() => {
    const map = new Map<string, string>();
    (hierarchy?.relationships ?? [])
      .filter((relationship) => relationship.is_active !== false)
      .forEach((relationship) => {
        map.set(relationship.child_node_code, relationship.parent_node_code);
      });
    return map;
  }, [hierarchy]);

  const parentOptions = useMemo(() => {
    if (!parentLevel) return [];
    const parentCodes = new Set(currentNodes.map((node) => parentCodeByChild.get(node.node_code)).filter(Boolean));
    return [...parentCodes]
      .map((code) => nodeByCode.get(String(code)))
      .filter((node): node is FrameworkNode => Boolean(node))
      .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0) || getNodeTitle(a).localeCompare(getNodeTitle(b)));
  }, [currentNodes, nodeByCode, parentCodeByChild, parentLevel]);

  const filteredNodes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const parentFilteredNodes =
      isIndicatorMappingLevel && parentFilter
        ? currentNodes.filter((node) => parentCodeByChild.get(node.node_code) === parentFilter)
        : currentNodes;
    if (!normalizedQuery) return parentFilteredNodes;
    return parentFilteredNodes.filter((node) => {
      const values = [node.node_number, node.node_code, node.name, node.short_name, node.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return values.includes(normalizedQuery);
    });
  }, [currentNodes, isIndicatorMappingLevel, parentCodeByChild, parentFilter, query]);

  const totalChildCount = useMemo(() => {
    return new Set(
      currentNodes.flatMap((node) =>
        (childCodesByParent.get(node.node_code) ?? []).filter((childCode) => {
          const child = nodeByCode.get(childCode);
          return !nextLevel || child?.level_code === nextLevel.level_code;
        }),
      ),
    ).size;
  }, [childCodesByParent, currentNodes, nextLevel, nodeByCode]);

  const coveragePercent = useMemo(() => {
    if (!currentNodes.length || !nextLevel) return null;
    const withChildren = currentNodes.filter((node) => (childCodesByParent.get(node.node_code) ?? []).length > 0).length;
    return Math.round((withChildren / currentNodes.length) * 100);
  }, [childCodesByParent, currentNodes, nextLevel]);

  const totalIndicatorCount = useMemo(() => {
    return currentNodes.reduce((total, node) => total + Number(node.indicator_count ?? 0), 0);
  }, [currentNodes]);

  const nodesWithoutIndicators = useMemo(() => {
    return currentNodes.filter((node) => Number(node.indicator_count ?? 0) === 0).length;
  }, [currentNodes]);

  const parentCoveredCount = useMemo(() => {
    return new Set(
      currentNodes
        .filter((node) => Number(node.indicator_count ?? 0) > 0)
        .map((node) => parentCodeByChild.get(node.node_code))
        .filter(Boolean),
    ).size;
  }, [currentNodes, parentCodeByChild]);

  const levelLabel = pluralizeLabel(level?.name);
  const childLabel = nextLevel ? pluralizeLabel(nextLevel.name) : "Child nodes";
  const isChildListLevel = Number(level?.level_number ?? 1) > 1;
  const effectiveViewMode = isChildListLevel ? "list" : viewMode;
  const selectedNode = decodedNodeCode ? nodeByCode.get(decodedNodeCode) ?? null : null;
  const selectedNodeChildren = useMemo(() => {
    if (!selectedNode) return [];
    return (childCodesByParent.get(selectedNode.node_code) ?? [])
      .map((code) => nodeByCode.get(code))
      .filter((node): node is FrameworkNode => Boolean(node))
      .filter((child) => !nextLevel || child.level_code === nextLevel.level_code)
      .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0) || getNodeTitle(a).localeCompare(getNodeTitle(b)));
  }, [childCodesByParent, nextLevel, nodeByCode, selectedNode]);
  const activeChild = selectedNodeChildren.find((node) => node.node_code === selectedChildCode) ?? selectedNodeChildren[0] ?? null;

  async function loadLevel() {
    setIsLoading(true);
    setError("");
    try {
      const editionsResponse = await listFrameworkEditions(false);
      const editions = editionsResponse.data;
      const activeEdition = editions.find((edition) => edition.is_active !== false) ?? editions[0];
      if (!activeEdition?.framework_code) {
        setHierarchy(null);
        setLevel(null);
        setError("No active framework is available for the selected unit.");
        return;
      }

      const hierarchyResponse = await getFrameworkHierarchy(activeEdition.framework_code, activeEdition.edition_code);
      const nextHierarchy = hierarchyResponse.data;
      const nextLevelForRoute =
        nextHierarchy.levels.find((item) => item.level_code === decodedLevelCode) ??
        nextHierarchy.levels.find((item) => String(item.level_number) === decodedLevelCode);

      setHierarchy(nextHierarchy);
      setLevel(nextLevelForRoute ?? null);
      setParentFilter("");
      if (!nextLevelForRoute) {
        setError("This framework level is not available for the selected unit.");
      }
    } catch {
      setHierarchy(null);
      setLevel(null);
      setError("Framework level could not be loaded. Please refresh or try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleOpenNode(node: FrameworkNode) {
    if (!level) return;
    if (Number(level.level_number) <= 1) {
      navigate(`/framework/levels/${encodeURIComponent(level.level_code)}/${encodeURIComponent(node.node_code)}`);
      return;
    }
    const parentCode = parentCodeByChild.get(node.node_code);
    const parentNode = parentCode ? nodeByCode.get(parentCode) : null;
    const parentLevel = parentNode ? hierarchy?.levels.find((item) => item.level_code === parentNode.level_code) : null;
    if (parentNode && parentLevel) {
      navigate(
        `/framework/levels/${encodeURIComponent(parentLevel.level_code)}/${encodeURIComponent(parentNode.node_code)}?selected=${encodeURIComponent(node.node_code)}`,
      );
      return;
    }
    navigate(`/framework/levels/${encodeURIComponent(level.level_code)}/${encodeURIComponent(node.node_code)}`);
  }

  if (selectedNode && level && hierarchy) {
    return (
      <FrameworkNodeDetailView
        key={`${selectedNode.node_code}:${selectedChildCode}`}
        childLabel={childLabel}
        childCodesByParent={childCodesByParent}
        childrenNodes={selectedNodeChildren}
        hierarchy={hierarchy}
        level={level}
        nodeByCode={nodeByCode}
        nextLevel={nextLevel}
        node={selectedNode}
        orderedLevels={orderedLevels}
        selectedChild={activeChild}
        onBack={() => navigate(`/framework/levels/${encodeURIComponent(level.level_code)}`)}
        onSelectChild={(child) =>
          navigate(
            `/framework/levels/${encodeURIComponent(level.level_code)}/${encodeURIComponent(selectedNode.node_code)}?selected=${encodeURIComponent(child.node_code)}`,
          )
        }
      />
    );
  }

  return (
    <PageSection className="flex min-w-0 flex-col gap-4">
      <PageHeader>
        <div>
          <h2>
            {getSelectedUnitCode()} {levelLabel}
          </h2>
          <p>
            Browse {levelLabel.toLowerCase()} from the selected unit framework hierarchy. Labels and records are loaded
            from the active framework edition.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" type="button" onClick={() => void loadLevel()}>
            <RefreshCw size={13} />
            Refresh
          </Button>
        </div>
      </PageHeader>

      {error && <div className="rounded-md bg-muted p-3 text-sm text-destructive">{error}</div>}
      {notice && <div className="rounded-md bg-muted p-3 text-sm">{notice}</div>}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="flex min-w-0 flex-col gap-1"><CardContent className="flex min-w-0 flex-col gap-3">
          <div className="font-heading text-2xl font-semibold tabular-nums text-foreground">{currentNodes.length}</div>
          <div className="text-sm font-medium text-foreground">{levelLabel}</div>
          <div className="flex items-baseline gap-1 text-xs text-muted-foreground">{currentNodes.length} active</div>
        </CardContent></Card>
        {isIndicatorMappingLevel ? (
          <>
            <Card className="flex min-w-0 flex-col gap-1"><CardContent className="flex min-w-0 flex-col gap-3">
              <div className="font-heading text-2xl font-semibold tabular-nums text-foreground">{parentCoveredCount}</div>
              <div className="text-sm font-medium text-foreground">{parentLevel ? `${pluralizeLabel(parentLevel.name)} covered` : "Parents covered"}</div>
              <div className="flex items-baseline gap-1 text-xs text-muted-foreground">mapped indicators</div>
            </CardContent></Card>
            <Card className="flex min-w-0 flex-col gap-1"><CardContent className="flex min-w-0 flex-col gap-3">
              <div className="font-heading text-2xl font-semibold tabular-nums text-foreground">{nodesWithoutIndicators}</div>
              <div className="text-sm font-medium text-foreground">{levelLabel} without indicators</div>
              <div className="flex items-baseline gap-1 text-xs text-muted-foreground">needs mapping</div>
            </CardContent></Card>
            <Card className="flex min-w-0 flex-col gap-1"><CardContent className="flex min-w-0 flex-col gap-3">
              <div className="font-heading text-2xl font-semibold tabular-nums text-foreground">{totalIndicatorCount}</div>
              <div className="text-sm font-medium text-foreground">Indicators</div>
              <div className="flex items-baseline gap-1 text-xs text-muted-foreground">mapped to this level</div>
            </CardContent></Card>
          </>
        ) : (
          <>
            <Card className="flex min-w-0 flex-col gap-1"><CardContent className="flex min-w-0 flex-col gap-3">
              <div className="font-heading text-2xl font-semibold tabular-nums text-foreground">{totalChildCount}</div>
              <div className="text-sm font-medium text-foreground">{childLabel}</div>
              <div className="flex items-baseline gap-1 text-xs text-muted-foreground">{nextLevel?.name ?? "available"}</div>
            </CardContent></Card>
            <Card className="flex min-w-0 flex-col gap-1"><CardContent className="flex min-w-0 flex-col gap-3">
              <div className="font-heading text-2xl font-semibold tabular-nums text-foreground">{totalIndicatorCount}</div>
              <div className="text-sm font-medium text-foreground">Indicators</div>
              <div className="flex items-baseline gap-1 text-xs text-muted-foreground">mapped under {level?.name ?? "level"}</div>
            </CardContent></Card>
            <Card className="flex min-w-0 flex-col gap-1"><CardContent className="flex min-w-0 flex-col gap-3">
              <div className="font-heading text-2xl font-semibold tabular-nums text-foreground">{coveragePercent === null ? "--" : `${coveragePercent}%`}</div>
              <div className="text-sm font-medium text-foreground">{nextLevel ? `${childLabel} coverage` : "Coverage"}</div>
              <div className="flex items-baseline gap-1 text-xs text-muted-foreground">{coveragePercent === null ? "pending" : "computed"}</div>
            </CardContent></Card>
          </>
        )}
      </section>

      <section className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          className="w-full sm:max-w-md"
          value={query}
          onValueChange={setQuery}
          label={t("frameworkBrowse.search", { level: levelLabel.toLowerCase() })}
          placeholder={t("frameworkBrowse.search", { level: levelLabel.toLowerCase() })}
          clearLabel={t("dataTable.clearSearch")}
        />
        {isIndicatorMappingLevel && parentOptions.length > 0 && (
          <NativeSelect
            className="w-full sm:w-48"
            value={parentFilter}
            onChange={(event) => setParentFilter(event.target.value)}
            aria-label={`Filter by ${parentLevel?.name ?? "parent"}`}
          >
            <NativeSelectOption value="">All {pluralizeLabel(parentLevel?.name)}</NativeSelectOption>
            {parentOptions.map((node) => (
              <NativeSelectOption value={node.node_code} key={node.node_code}>
                {node.node_number ? `${node.node_number} - ` : ""}
                {getNodeTitle(node)}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        )}
        {!isChildListLevel && <div className="flex shrink-0 items-center gap-1 self-start sm:ml-auto sm:self-auto" role="group" aria-label={t("frameworkBrowse.view")}>
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            type="button"
            onClick={() => setViewMode("grid")}
            aria-pressed={viewMode === "grid"}
          >
            <Grid2X2 size={14} />
            {t("frameworkBrowse.grid")}
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            type="button"
            onClick={() => setViewMode("list")}
            aria-pressed={viewMode === "list"}
          >
            <List size={15} />
            {t("frameworkBrowse.list")}
          </Button>
        </div>}
      </section>

      <section className="flex min-w-0 flex-col gap-3">
        {isLoading ? (
          <Loader text={`Loading ${levelLabel.toLowerCase()}...`} />
        ) : filteredNodes.length === 0 ? (
          <Empty><EmptyHeader><EmptyTitle>No {levelLabel.toLowerCase()} found for the selected filters.</EmptyTitle></EmptyHeader></Empty>
        ) : effectiveViewMode === "grid" ? (
          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredNodes.map((node, index) => {
              const lowerCounts = getDescendantCountsByLevel(node, orderedLevels, childCodesByParent, nodeByCode);
              const indicatorCount = getDescendantIndicatorCount(node, childCodesByParent, nodeByCode);
              const color = getNodeColor(node, index);
              const isGoalGridCard = String(level?.level_code ?? "").toUpperCase() === "GOAL";
              const goalDescription = node.description || getNodeTitle(node) || node.node_code;
              return (
                <Card className="gap-0 py-0" key={node.node_code}>
                  <CardHeader className="flex min-w-0 flex-row items-center justify-between gap-3 p-3" style={{ backgroundColor: color, color: getColorForeground(color) }}>
                    <span className="font-semibold">{level?.name} {formatNodeNumber(node, index)}</span>
                    <Button
                      variant="ghost"
                      className="text-inherit"
                      size="icon-sm"
                      type="button"
                      aria-label={t("frameworkBrowse.openNode", { name: getNodeTitle(node) })}
                      title={t("frameworkBrowse.openNode", { name: getNodeTitle(node) })}
                      onClick={() => handleOpenNode(node)}
                    >
                      <ExternalLink size={14} />
                    </Button>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-3 p-4">
                    {isGoalGridCard ? (
                      <h3 className="line-clamp-3 text-sm font-medium text-foreground" title={goalDescription}>{goalDescription}</h3>
                    ) : (
                      <>
                        <h3 title={getNodeTitle(node)}>{getNodeTitle(node)}</h3>
                        <p title={node.description || node.node_code}>{node.description || node.node_code}</p>
                      </>
                    )}
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      {orderedLevels
                        .filter((item) => Number(item.level_number) > Number(level?.level_number ?? 0))
                        .map((item) => (
                          <span className="inline-flex items-baseline gap-1" key={item.level_code}>
                            <strong>{lowerCounts.get(item.level_code) ?? 0}</strong>
                            {pluralizeLabel(item.name)}
                          </span>
                        ))}
                      <span className="inline-flex items-baseline gap-1">
                        <strong>{indicatorCount}</strong>
                        {t("frameworkBrowse.indicators")}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex min-w-0 flex-col gap-3">
            {filteredNodes.map((node, index) => {
              const childCount = (childCodesByParent.get(node.node_code) ?? []).length;
              const indicatorCount = getDescendantIndicatorCount(node, childCodesByParent, nodeByCode);
              const parentCode = parentCodeByChild.get(node.node_code);
              const parentNode = parentCode ? nodeByCode.get(parentCode) : null;
              const color = getNodeColor(node, index);
              return (
                <Card className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3 p-3 lg:grid-cols-[auto_minmax(0,1fr)_auto_auto_auto]" key={node.node_code}>
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-accent text-lg font-semibold text-accent-foreground" style={{ backgroundColor: color, color: getColorForeground(color) }}>
                    {formatNodeNumber(node, index)}
                  </div>
                  <div className="flex min-w-0 flex-col gap-1">
                    <h3 className="text-sm font-medium" title={getNodeTitle(node)}>{getNodeTitle(node)}</h3>
                    <p className="break-words text-xs text-muted-foreground" title={node.node_code}>{node.node_code}</p>
                  </div>
                  {isIndicatorMappingLevel && parentNode ? (
                    <div className="flex items-baseline gap-1 text-xs text-muted-foreground">
                      <strong>{parentNode.node_number ?? parentNode.node_code}</strong>
                      <span>{parentLevel?.name ?? "Parent"}</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1 text-xs text-muted-foreground">
                      <strong>{childCount}</strong>
                      <span>{childLabel}</span>
                    </div>
                  )}
                  <div className="flex items-baseline gap-1 text-xs text-muted-foreground">
                    <strong>{indicatorCount}</strong>
                    <span>Indicators</span>
                  </div>
                  <Button variant="ghost" type="button" onClick={() => handleOpenNode(node)}>
                    Open <ExternalLink size={12} />
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </PageSection>
  );
}

function FrameworkNodeDetailView({
  node,
  level,
  nextLevel,
  childLabel,
  childCodesByParent,
  childrenNodes,
  hierarchy,
  nodeByCode,
  orderedLevels,
  selectedChild,
  onBack,
  onSelectChild,
}: {
  node: FrameworkNode;
  level: FrameworkLevel;
  nextLevel: FrameworkLevel | null;
  childLabel: string;
  childCodesByParent: Map<string, string[]>;
  childrenNodes: FrameworkNode[];
  hierarchy: FrameworkHierarchy;
  nodeByCode: Map<string, FrameworkNode>;
  orderedLevels: FrameworkLevel[];
  selectedChild: FrameworkNode | null;
  onBack: () => void;
  onSelectChild: (node: FrameworkNode) => void;
}) {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const color = getNodeColor(node, 0);
  const [selectedCodesByLevel, setSelectedCodesByLevel] = useState<Record<string, string>>(
    selectedChild ? { [selectedChild.level_code]: selectedChild.node_code } : {},
  );
  const [collapsedLevels, setCollapsedLevels] = useState<Record<string, boolean>>({});
  const nodeIndicatorCount = getDescendantIndicatorCount(node, childCodesByParent, nodeByCode);
  const childrenWithoutIndicators = childrenNodes.filter((child) => getDescendantIndicatorCount(child, childCodesByParent, nodeByCode) === 0).length;

  const hierarchySections = useMemo(() => {
    const sections: Array<{ level: FrameworkLevel; children: FrameworkNode[]; selected: FrameworkNode | null }> = [];
    let parent: FrameworkNode | null = node;
    for (const childLevel of orderedLevels.filter((item) => Number(item.level_number) > Number(level.level_number))) {
      if (!parent) break;
      const children = getDirectChildren(parent, childLevel.level_code, childCodesByParent, nodeByCode);
      if (!children.length) break;
      const selectedCode = selectedCodesByLevel[childLevel.level_code];
      const selected = children.find((child) => child.node_code === selectedCode) ?? children[0] ?? null;
      sections.push({ level: childLevel, children, selected });
      parent = selected;
    }
    return sections;
  }, [childCodesByParent, level.level_number, node, nodeByCode, orderedLevels, selectedCodesByLevel]);

  const indicatorNode = useMemo(() => {
    const lastSection = hierarchySections[hierarchySections.length - 1];
    if (!lastSection) {
      return level.allows_indicator_mapping ? node : null;
    }
    if (lastSection.level.allows_indicator_mapping || !getDirectChildren(lastSection.selected, undefined, childCodesByParent, nodeByCode).length) {
      return lastSection.selected;
    }
    return null;
  }, [childCodesByParent, hierarchySections, level.allows_indicator_mapping, node, nodeByCode]);

  const indicatorsQuery = useQuery({
    queryKey: ["framework-indicator-mappings", getSelectedUnitCode(), indicatorNode?.node_code],
    queryFn: () => listFrameworkIndicatorMappingsByNode(indicatorNode!.node_code),
    enabled: Boolean(indicatorNode?.node_code),
  });
  const mappedIndicators = indicatorsQuery.data?.data ?? [];
  const isLoadingIndicators = indicatorsQuery.isPending && Boolean(indicatorNode);

  function handleSelectSectionNode(sectionLevel: FrameworkLevel, sectionNode: FrameworkNode) {
    setSelectedCodesByLevel((current) => {
      const next: Record<string, string> = {};
      for (const item of orderedLevels) {
        if (Number(item.level_number) < Number(sectionLevel.level_number) && current[item.level_code]) {
          next[item.level_code] = current[item.level_code];
        }
      }
      next[sectionLevel.level_code] = sectionNode.node_code;
      return next;
    });
    if (sectionLevel.level_code === nextLevel?.level_code) {
      onSelectChild(sectionNode);
    }
  }

  return (
    <PageSection className="flex min-w-0 flex-col gap-4">
      <section className="flex min-w-0 flex-wrap items-start justify-between gap-4">
        <Button variant="outline" className="framework-node-back" type="button" onClick={onBack}>
          Back to {pluralizeLabel(level.name)}
        </Button>
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-accent text-lg font-semibold text-accent-foreground" style={{ backgroundColor: color, color: getColorForeground(color) }}>
            <span>{level.name}</span>
            <strong>{formatNodeNumber(node, 0)}</strong>
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{getNodeTitle(node)}</h2>
            <div className="flex flex-wrap items-center gap-1.5">
              <span>{childrenNodes.length} {childLabel}</span>
              <span>{nodeIndicatorCount} National Indicators</span>
              <span>{childrenWithoutIndicators} {childLabel} without indicators</span>
            </div>
          </div>
        </div>
      </section>

      <div className={hierarchySections.length ? "grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2" : "grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2"}>
        {hierarchySections.map((section) => {
          const isCollapsed = collapsedLevels[section.level.level_code] ?? false;
          return (
            <section className="flex min-w-0 flex-col gap-3" key={section.level.level_code}>
              <header>
                <div>
                  <h3>{pluralizeLabel(section.level.name)}</h3>
                  <p>Select a {section.level.name ?? "level"} to continue through the hierarchy.</p>
                </div>
                <Button size="icon-sm" variant="ghost"

                  type="button"
                  onClick={() =>
                    setCollapsedLevels((current) => ({
                      ...current,
                      [section.level.level_code]: !isCollapsed,
                    }))
                  }
                  title={isCollapsed ? "Expand section" : "Collapse section"}
                >
                  {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                </Button>
              </header>
              {!isCollapsed && (
                <div className="flex min-w-0 flex-col gap-3">
                  {section.children.map((child, index) => {
                    const childCount = (childCodesByParent.get(child.node_code) ?? []).length;
                    const indicatorCount = getDescendantIndicatorCount(child, childCodesByParent, nodeByCode);
                    const childLevel = orderedLevels.find((item) => Number(item.level_number ?? 0) > Number(section.level.level_number ?? 0));
                    return (
                      <Button
                        aria-label={`${section.level.name ?? "Level"} ${child.node_number ?? index + 1}: ${indicatorCount} indicators, ${childCount} ${pluralizeLabel(childLevel?.name)}`}
                        variant={section.selected?.node_code === child.node_code ? "secondary" : "outline"}
                        className="h-auto min-w-0 flex-col items-start gap-1 whitespace-normal p-3 text-left"
                        aria-pressed={section.selected?.node_code === child.node_code}
                        key={child.node_code}
                        title={getNodeTitle(child)}
                        type="button"
                        onClick={() => handleSelectSectionNode(section.level, child)}
                      >
                        <span>{child.node_number ?? index + 1}</span>
                        <small>{indicatorCount} indicators | {childCount} {pluralizeLabel(childLevel?.name)}</small>
                      </Button>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}

        <Card className="min-w-0"><CardContent className="flex min-w-0 flex-col gap-3">
          {indicatorNode ? (
            <>
              <header>
                <span>{levelNameForNode(indicatorNode, orderedLevels)} {indicatorNode.node_number}</span>
                <h3>{getNodeTitle(indicatorNode)}</h3>
              </header>
              <div className="flex min-w-0 flex-col gap-3">
                {isLoadingIndicators ? (
                  <Loader text="Loading mapped indicators..." />
                ) : indicatorsQuery.isError ? (
                  <div className="flex flex-col items-start gap-2">
                    <p role="alert" className="text-sm text-destructive">{t("frameworkTree.indicatorError")}</p>
                    <Button variant="outline" onPress={() => void indicatorsQuery.refetch()}>{t("actions.retry")}</Button>
                  </div>
                ) : mappedIndicators.length ? (
                  mappedIndicators.map((indicator) => (
                    <Button
                      variant="outline"
                      className="h-auto min-w-0 flex-col items-start gap-2 whitespace-normal p-3 text-left"
                      key={indicator.national_indicator_code}
                      type="button"
                      onClick={() =>
                        indicator.national_indicator_code &&
                        navigate(`/indicators/library?indicator=${encodeURIComponent(indicator.national_indicator_code)}`)
                      }
                    >
                      <span>{indicator.indicator_number ?? indicator.national_indicator_code}</span>
                      <strong>{indicator.indicator_name ?? indicator.national_indicator_code}</strong>
                      <div className="flex items-baseline gap-1 text-xs text-muted-foreground">
                        <small>Mapping: {indicator.mapping_type ?? "PRIMARY"}</small>
                        <small>Status: {indicator.status ?? "ACTIVE"}</small>
                      </div>
                    </Button>
                  ))
                ) : (
                  <Empty><EmptyHeader><EmptyTitle>No mapped indicators found for this node.</EmptyTitle></EmptyHeader></Empty>
                )}
              </div>
            </>
          ) : (
            <Empty><EmptyHeader><EmptyTitle>Select the lowest configured hierarchy level to view indicators.</EmptyTitle></EmptyHeader></Empty>
          )}
        </CardContent></Card>
      </div>
    </PageSection>
  );
}

function getDirectChildren(
  parent: FrameworkNode | null | undefined,
  levelCode: string | undefined,
  childCodesByParent: Map<string, string[]>,
  nodeByCode: Map<string, FrameworkNode>,
): FrameworkNode[] {
  if (!parent) return [];
  return (childCodesByParent.get(parent.node_code) ?? [])
    .map((code) => nodeByCode.get(code))
    .filter((child): child is FrameworkNode => Boolean(child))
    .filter((child) => !levelCode || child.level_code === levelCode)
    .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0) || getNodeTitle(a).localeCompare(getNodeTitle(b)));
}

function getDescendantCountsByLevel(
  root: FrameworkNode,
  orderedLevels: FrameworkLevel[],
  childCodesByParent: Map<string, string[]>,
  nodeByCode: Map<string, FrameworkNode>,
): Map<string, number> {
  const counts = new Map<string, number>();
  const visited = new Set<string>();
  const walk = (node: FrameworkNode) => {
    for (const childCode of childCodesByParent.get(node.node_code) ?? []) {
      if (visited.has(childCode)) continue;
      visited.add(childCode);
      const child = nodeByCode.get(childCode);
      if (!child) continue;
      counts.set(child.level_code, (counts.get(child.level_code) ?? 0) + 1);
      walk(child);
    }
  };
  walk(root);
  orderedLevels.forEach((level) => {
    if (!counts.has(level.level_code)) counts.set(level.level_code, 0);
  });
  return counts;
}

function getDescendantIndicatorCount(
  root: FrameworkNode,
  childCodesByParent: Map<string, string[]>,
  nodeByCode: Map<string, FrameworkNode>,
): number {
  let total = Number(root.indicator_count ?? 0);
  const visited = new Set<string>();
  const walk = (node: FrameworkNode) => {
    for (const childCode of childCodesByParent.get(node.node_code) ?? []) {
      if (visited.has(childCode)) continue;
      visited.add(childCode);
      const child = nodeByCode.get(childCode);
      if (!child) continue;
      total += Number(child.indicator_count ?? 0);
      walk(child);
    }
  };
  walk(root);
  return total;
}

function levelNameForNode(node: FrameworkNode, levels: FrameworkLevel[]) {
  return levels.find((level) => level.level_code === node.level_code)?.name ?? "Selected";
}
