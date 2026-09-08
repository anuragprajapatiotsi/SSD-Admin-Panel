import {
  IconApi as Api,
  IconBuildingCommunity as BuildingCommunity,
  IconCalendarTime as CalendarTime,
  IconClipboardCheck as ClipboardCheck,
  IconDatabase as Database,
  IconFileText as FileText,
  IconGitBranch as GitBranch,
  IconWorld as Globe2,
  IconLayersIntersect as Layers3,
  IconListCheck as ListChecks,
  IconMail as Mail,
  IconMapPin as MapPin,
  IconRepeat as Repeat,
  IconRulerMeasure as RulerMeasure,
  IconSettings as Settings,
  IconShieldCheck as ShieldCheck,
  IconTableOptions as TableProperties,
  IconUpload as UploadCloud,
  IconUsers as Users,
  type Icon,
} from "@tabler/icons-react";

export type NavLeafItem = {
  label: string;
  labelKey?: string;
  path: string;
  icon: Icon;
};

export type NavGroupItem = {
  label: string;
  labelKey?: string;
  icon: Icon;
  items: readonly NavItem[];
};

export type NavItem = NavLeafItem | NavGroupItem;

export type NavModule = {
  label: string;
  labelKey: string;
  basePath: string;
  icon: Icon;
  items: readonly NavItem[];
};

const navigationModuleDefinitions = [
  {
    label: "Pillar Onboarding",
    labelKey: "navigation.modules.pillarOnboarding",
    basePath: "/pillar-onboarding",
    icon: GitBranch,
    items: [
      { label: "Framework Edition", labelKey: "navigation.items.frameworkEdition", path: "/framework", icon: GitBranch },
      { label: "Global Indicators", labelKey: "navigation.items.globalIndicators", path: "/indicators/global", icon: Globe2 },
      { label: "Pillar Indicators", labelKey: "navigation.items.pillarIndicators", path: "/indicators/library", icon: ListChecks },
      { label: "Data Provider", labelKey: "navigation.items.sourcesMinistries", path: "/ingestion/sources-ministries", icon: BuildingCommunity },
      { label: "Data Templates", labelKey: "navigation.items.dataTemplates", path: "/ingestion/excel-templates", icon: FileText },
      { label: "Data API", labelKey: "navigation.items.dataApi", path: "/ingestion/data-api", icon: Api },
    ],
  },
  {
    label: "Data Ingestion",
    labelKey: "navigation.modules.dataIngestion",
    basePath: "/ingestion",
    icon: UploadCloud,
    items: [
      { label: "Data Collection", labelKey: "navigation.items.dataCollection", path: "/ingestion/data-collection", icon: ClipboardCheck },
    ],
  },
  {
    label: "Users & Roles",
    labelKey: "navigation.modules.usersRoles",
    basePath: "/authentication",
    icon: ShieldCheck,
    items: [
      { label: "User Management", labelKey: "navigation.items.userManagement", path: "/authentication/users", icon: Users },
      { label: "Roles & Permissions", labelKey: "navigation.items.rolesPermissions", path: "/authentication/permission-matrix", icon: ShieldCheck },
    ],
  },
] as const satisfies readonly NavModule[];

export const standaloneNavigationItems = [
  { label: "Configuration", labelKey: "navigation.modules.configuration", path: "/configuration", icon: Settings },
  { label: "Monitoring", labelKey: "navigation.modules.monitoring", path: "/monitoring", icon: TableProperties },
] as const satisfies readonly NavLeafItem[];

// These pages remain routable but are intentionally not displayed in navigation.
const hiddenNavigationItems = [
  { label: "Access Logs", labelKey: "navigation.items.accessLogs", path: "/authentication/audit-sessions", icon: TableProperties },
  { label: "SSD Pillars", labelKey: "navigation.items.ssdPillars", path: "/masters/ssd-pillars", icon: BuildingCommunity },
  { label: "Geographies", labelKey: "navigation.items.geographies", path: "/masters/geography", icon: MapPin },
  { label: "Time Periods", labelKey: "navigation.items.timePeriods", path: "/masters/time-periods", icon: CalendarTime },
  { label: "Dimensions", labelKey: "navigation.items.dimensions", path: "/masters/dimensions", icon: Layers3 },
  { label: "Units of Measurement", labelKey: "navigation.items.unitsOfMeasurement", path: "/masters/uom", icon: RulerMeasure },
  { label: "Periodicities", labelKey: "navigation.items.periodicities", path: "/masters/periodicities", icon: Repeat },
  { label: "Email Templates", labelKey: "navigation.items.emailTemplates", path: "/configuration/email-templates", icon: Mail },
  { label: "Notification Rules", labelKey: "navigation.items.notificationRules", path: "/configuration/notification-rules", icon: Settings },
  { label: "Dispatch History", labelKey: "navigation.items.dispatchHistory", path: "/requests/dispatch-history", icon: CalendarTime },
  { label: "Dispatch Links", labelKey: "navigation.items.dispatchLinks", path: "/data-entry/dispatch-links", icon: Api },
  { label: "Assignments", labelKey: "navigation.items.assignments", path: "/data-entry/assignments", icon: ClipboardCheck },
  { label: "Review Dashboard", labelKey: "navigation.items.reviewDashboard", path: "/review/dashboard", icon: ShieldCheck },
  { label: "Review Queue", labelKey: "navigation.items.reviewQueue", path: "/review/queue", icon: ListChecks },
  { label: "Approvals", labelKey: "navigation.items.approvals", path: "/review/approvals", icon: ClipboardCheck },
  { label: "Published Index", labelKey: "navigation.items.publishedIndex", path: "/published-facts/index", icon: FileText },
  { label: "Approved Data", labelKey: "navigation.items.approvedData", path: "/published-facts/approved-data", icon: ShieldCheck },
  { label: "Observations", labelKey: "navigation.items.observations", path: "/published-facts/observations", icon: Database },
  { label: "Computed Facts", labelKey: "navigation.items.computedFacts", path: "/published-facts/computed-facts", icon: TableProperties },
] as const satisfies readonly NavLeafItem[];

export const navigationModules: readonly NavModule[] = navigationModuleDefinitions;

export const bottomNavigation: readonly NavItem[] = [];

export function flattenNavigationItems(items: readonly NavItem[]): NavLeafItem[] {
  return items.flatMap((item) => "items" in item ? flattenNavigationItems(item.items) : [item]);
}

export const flatNavigation: readonly NavLeafItem[] =
  navigationModuleDefinitions
    .flatMap((module) => flattenNavigationItems(module.items))
    .concat(hiddenNavigationItems, standaloneNavigationItems);

export type NavigationPath = (typeof flatNavigation)[number]["path"];
