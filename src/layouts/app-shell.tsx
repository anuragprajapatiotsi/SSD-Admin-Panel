import {
  IconArrowLeft,
  IconBell,
  IconChevronRight,
  IconDots,
  IconGauge,
  IconGitBranch,
  IconLayoutDashboard,
  IconLogout,
  IconStack2,
  IconUserCircle,
} from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NationalEmblem } from "@/components/branding/national-emblem";
import { LanguageSwitcher } from "@/components/language-switcher";
import { PillarSwitcher } from "@/components/navigation/pillar-switcher";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  AUTH_EXPIRED_EVENT,
  DEFAULT_UNIT_CODE,
  clearAuthSession,
  getLocalCurrentUser,
  getPillarRootCode,
  getSelectedLocale,
  getSelectedUnitCode,
  hasActiveSession,
  isPillarAdmin,
  isSessionIdleExpired,
  isUnitInPillar,
  isSuperAdmin,
  knownPillarOptions,
  listAvailableUnits,
  loadCurrentUser,
  logout,
  markSessionActivity,
  selectedUnitGlobalMappingEnabled,
  setSelectedUnitCode,
  type UnitOption,
} from "../api/session.api";
import { getFrameworkHierarchy, listFrameworkEditions } from "../api/framework.api";
import {
  getNotificationSummary,
  listUserNotifications,
  markAllNotificationsRead,
  setNotificationRead,
  type UserNotification,
} from "../api/notifications.api";
import { AccessibilityControl } from "@/components/common/accessibility-control";
import {
  bottomNavigation,
  flattenNavigationItems,
  navigationModules,
  standaloneNavigationItems,
  type NavGroupItem,
  type NavItem,
} from "../routes/navigation";
import { cn } from "@/lib/utils";

export function AppShell() {
  return (
    <SidebarProvider className="h-svh min-h-0 overflow-hidden">
      <AppShellContent />
    </SidebarProvider>
  );
}

function AppShellContent() {
  const { t } = useTranslation(["common", "accessibility"]);
  const translateNavigationLabel = useCallback(
    (entry: { label: string; labelKey?: string }) =>
      entry.labelKey ? t(entry.labelKey, { ns: "common", defaultValue: entry.label }) : entry.label,
    [t],
  );
  const [user, setUser] = useState(() => getLocalCurrentUser());
  const userDisplayName = formatUserDisplayName(user.displayName, user.email);
  const userRole = formatRoleLabel(user.roles[0]);
  const location = useLocation();
  const routeUsesFullBleedContent = /^\/ingestion\/excel-templates\/(?:create|[^/]+\/edit)$/.test(location.pathname);
  const [immersiveContentRequested, setImmersiveContentRequested] = useState(false);
  const usesFullBleedContent = routeUsesFullBleedContent || immersiveContentRequested;
  const navigate = useNavigate();
  const { state: sidebarState, setOpen: setSidebarOpen, setOpenMobile, isMobile } = useSidebar();
  const sidebarCollapsed = sidebarState === "collapsed";
  const sidebarOpenRef = useRef(!sidebarCollapsed);
  const setSidebarOpenRef = useRef(setSidebarOpen);
  const sidebarStateBeforeTemplateRef = useRef<boolean | null>(null);
  const [headerExpanded, setHeaderExpanded] = useState(true);
  const headerExpandedRef = useRef(headerExpanded);
  const headerStateBeforeTemplateRef = useRef<boolean | null>(null);
  sidebarOpenRef.current = !sidebarCollapsed;
  setSidebarOpenRef.current = setSidebarOpen;
  headerExpandedRef.current = headerExpanded;
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationSummary, setNotificationSummary] = useState({ unreadCount: 0 });
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const currentUserRefreshStartedRef = useRef(false);
  const [selectedUnitCode, setSelectedUnitCodeState] = useState(() => resolveInitialPillarSelection(user));
  const [selectedLocale, setSelectedLocaleState] = useState(() => getSelectedLocale());
  const [availableUnits, setAvailableUnits] = useState<UnitOption[]>([
    { unit_code: DEFAULT_UNIT_CODE, unit_name: "SDG", global_mapping_enabled: true, globalMappingEnabled: true },
  ]);
  const [frameworkLevelItems, setFrameworkLevelItems] = useState<NavItem[]>([]);
  const superAdmin = isSuperAdmin(user);
  const pillarAdmin = isPillarAdmin(user);
  const canSelectPillar = superAdmin || pillarAdmin;
  const userDefaultScope = (user.defaultUnitCode || user.unitCode || "").trim().toUpperCase();
  const userPillarRoot = getPillarRootCode(userDefaultScope || selectedUnitCode);
  const globalMappingEnabled = useMemo(
    () => selectedUnitGlobalMappingEnabled(availableUnits, selectedUnitCode),
    [availableUnits, selectedUnitCode],
  );
  const effectiveNavigationModules = useMemo(
    () => filterGlobalMappingNavigation(filterNavigationForUser(navigationModules, user), globalMappingEnabled),
    [globalMappingEnabled, user],
  );
  const sidebarWorkspaceTitle = useMemo(
    () => {
      const fallbackTitle = formatUnitWorkspaceTitle(availableUnits, selectedUnitCode);
      return t(`navigation.pillarSwitcher.pillars.${selectedUnitCode.trim().toUpperCase()}`, {
        ns: "common",
        defaultValue: fallbackTitle,
      });
    },
    [availableUnits, selectedUnitCode, t],
  );
  const workspaceNavigationItems = useMemo<NavItem[]>(
    () => [
      { label: "Dashboard", labelKey: "navigation.items.dashboard", path: "/dashboard", icon: IconGauge },
      ...frameworkLevelItems,
    ],
    [frameworkLevelItems],
  );
  const sidebarNavigationItems = useMemo<NavItem[]>(
    () => [
      {
        label: "Overview",
        labelKey: "navigation.items.overview",
        path: "/",
        icon: IconLayoutDashboard,
      },
      // Keep the pillar workspace navigation available for non-super-admin roles.
      // The previous unconditional entry remains here instead of being deleted:
      // { label: sidebarWorkspaceTitle, icon: IconStack2, items: workspaceNavigationItems },
      ...(!superAdmin
        ? [{
            label: sidebarWorkspaceTitle,
            icon: IconStack2,
            items: workspaceNavigationItems,
          }]
        : []),
      ...effectiveNavigationModules,
      ...standaloneNavigationItems,
    ],
    [effectiveNavigationModules, sidebarWorkspaceTitle, superAdmin, workspaceNavigationItems],
  );
  const effectiveFlatNavigation = useMemo(
    () => [
      ...effectiveNavigationModules.flatMap((module) => flattenNavigationItems(module.items)),
      ...standaloneNavigationItems,
      { label: "Overview", path: "/", icon: IconLayoutDashboard },
      ...(!superAdmin ? flattenNavigationItems(workspaceNavigationItems) : []),
      ...flattenNavigationItems(bottomNavigation),
    ],
    [effectiveNavigationModules, superAdmin, workspaceNavigationItems],
  );

  const activeTitle = useMemo(() => {
    const activeItem = effectiveFlatNavigation.find((item) => item.path === location.pathname);
    return activeItem
      ? translateNavigationLabel(activeItem)
      : t("navigation.items.overview", { ns: "common", defaultValue: "Overview" });
  }, [effectiveFlatNavigation, location.pathname, t, translateNavigationLabel]);
  useEffect(() => {
    setOpenMobile(false);
  }, [location.pathname, setOpenMobile]);

  useEffect(() => {
    if (isMobile) return;

    if (usesFullBleedContent) {
      if (sidebarStateBeforeTemplateRef.current === null) {
        sidebarStateBeforeTemplateRef.current = sidebarOpenRef.current;
      }
      setSidebarOpenRef.current(false);
      return;
    }

    if (sidebarStateBeforeTemplateRef.current !== null) {
      setSidebarOpenRef.current(sidebarStateBeforeTemplateRef.current);
      sidebarStateBeforeTemplateRef.current = null;
    }
  }, [isMobile, usesFullBleedContent]);
  useEffect(() => {
    if (usesFullBleedContent) {
      if (headerStateBeforeTemplateRef.current === null) {
        headerStateBeforeTemplateRef.current = headerExpandedRef.current;
      }
      return;
    }

    if (headerStateBeforeTemplateRef.current !== null) {
      setHeaderExpanded(headerStateBeforeTemplateRef.current);
      headerStateBeforeTemplateRef.current = null;
    }
  }, [usesFullBleedContent]);

  const toggleHeader = useCallback(() => {
    setHeaderExpanded((value) => !value);
  }, []);
  const collapseHeader = useCallback(() => {
    setHeaderExpanded(false);
  }, []);
  const setImmersiveContent = useCallback((isActive: boolean) => {
    if (isActive) {
      if (headerStateBeforeTemplateRef.current === null) {
        headerStateBeforeTemplateRef.current = headerExpandedRef.current;
      }
      setHeaderExpanded(false);
      if (!isMobile) {
        if (sidebarStateBeforeTemplateRef.current === null) {
          sidebarStateBeforeTemplateRef.current = sidebarOpenRef.current;
        }
        setSidebarOpen(false);
      }
    }
    setImmersiveContentRequested(isActive);
  }, [isMobile, setSidebarOpen]);
  useEffect(() => {
    if (!hasActiveSession() || isSessionIdleExpired()) {
      clearAuthSession();
      navigate("/login", { replace: true });
      return;
    }
    if (pillarAdmin && location.pathname === "/") {
      navigate("/dashboard", { replace: true });
      return;
    }

    markSessionActivity();
    if (!currentUserRefreshStartedRef.current) {
      currentUserRefreshStartedRef.current = true;
      void loadCurrentUser()
        .then((loadedUser) => {
          setUser(loadedUser);
        })
        .catch(() => {
          clearAuthSession();
          navigate("/login", { replace: true });
        });
    }
  }, [location.pathname, navigate, pillarAdmin]);

  useEffect(() => {
    const activityEvents = ["click", "keydown", "mousemove", "scroll", "touchstart"];
    const handleActivity = () => markSessionActivity();
    const handleAuthExpired = () => navigate("/login", { replace: true });
    const idleCheck = window.setInterval(() => {
      if (isSessionIdleExpired()) {
        clearAuthSession();
        navigate("/login", { replace: true });
      }
    }, 60_000);

    activityEvents.forEach((eventName) => window.addEventListener(eventName, handleActivity, { passive: true }));
    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);

    return () => {
      window.clearInterval(idleCheck);
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, handleActivity));
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    };
  }, [navigate]);


  useEffect(() => {
    if (pillarAdmin && !isUnitInPillar(selectedUnitCode, userPillarRoot)) {
      const preferredScope = userDefaultScope && isUnitInPillar(userDefaultScope, userPillarRoot) ? userDefaultScope : userPillarRoot;
      setSelectedUnitCode(preferredScope);
      setSelectedUnitCodeState(preferredScope);
      return;
    }

    if (!canSelectPillar) {
      setSelectedUnitCode(user.unitCode ?? DEFAULT_UNIT_CODE);
      setSelectedUnitCodeState(user.unitCode ?? DEFAULT_UNIT_CODE);
      return;
    }

    void listAvailableUnits()
      .then((units) => {
        const scopedUnits = superAdmin
          ? units
          : units.filter((unit) => isUnitInPillar(unit.unit_code, userPillarRoot));
        const fallbackUnits = scopedUnits.length > 0 ? scopedUnits : knownPillarOptions(userPillarRoot);
        const preferredUnit = superAdmin
          ? (fallbackUnits.some((unit) => unit.unit_code?.toUpperCase() === selectedUnitCode.toUpperCase())
            ? selectedUnitCode
            : userDefaultScope || DEFAULT_UNIT_CODE)
          : isUnitInPillar(selectedUnitCode, userPillarRoot)
            ? selectedUnitCode
            : userDefaultScope && isUnitInPillar(userDefaultScope, userPillarRoot)
              ? userDefaultScope
              : userPillarRoot;
        const nextUnits = ensureSelectedUnitOption(fallbackUnits, preferredUnit);
        if (preferredUnit !== selectedUnitCode) {
          setSelectedUnitCode(preferredUnit);
          setSelectedUnitCodeState(preferredUnit);
        }
        setAvailableUnits(nextUnits);
      })
      .catch(() => {
        const fallbackUnits = superAdmin
          ? [{ unit_code: selectedUnitCode || DEFAULT_UNIT_CODE, unit_name: selectedUnitCode || DEFAULT_UNIT_CODE }]
          : knownPillarOptions(userPillarRoot);
        setAvailableUnits(fallbackUnits);
      });
  }, [canSelectPillar, pillarAdmin, selectedUnitCode, superAdmin, user.unitCode, userDefaultScope, userPillarRoot]);

  useEffect(() => {
    let cancelled = false;

    async function loadFrameworkLevelNavigation() {
      try {
        const editionsResponse = await listFrameworkEditions(false);
        const editions = editionsResponse.data;
        const activeEdition = editions.find((edition) => edition.is_active !== false) ?? editions[0];

        if (!activeEdition?.framework_code) {
          if (!cancelled) setFrameworkLevelItems([]);
          return;
        }

        const hierarchyResponse = await getFrameworkHierarchy(activeEdition.framework_code, activeEdition.edition_code);
        const hierarchy = hierarchyResponse.data;
        const nextItems = [...(hierarchy.levels ?? [])]
          .filter((level) => level.is_active !== false)
          .sort((first, second) => Number(first.level_number ?? 0) - Number(second.level_number ?? 0))
          .map((level) => ({
            label: level.name || level.level_code,
            labelKey: frameworkLevelLabelKey(level.level_code, level.name),
            path: `/framework/levels/${encodeURIComponent(level.level_code)}`,
            icon: IconGitBranch,
          }));

        if (!cancelled) setFrameworkLevelItems(nextItems);
      } catch {
        if (!cancelled) setFrameworkLevelItems([]);
      }
    }

    void loadFrameworkLevelNavigation();
    return () => {
      cancelled = true;
    };
  }, [selectedLocale, selectedUnitCode]);

  useEffect(() => {
    let cancelled = false;
    void getNotificationSummary(selectedUnitCode)
      .then((summary) => {
        if (!cancelled) setNotificationSummary({ unreadCount: summary.unreadCount ?? 0 });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [selectedUnitCode]);

  function handleUnitChange(unitCode: string) {
    setSelectedUnitCode(unitCode);
    setSelectedUnitCodeState(unitCode);
    if (location.pathname !== "/framework") {
      navigate("/framework", { replace: false });
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  async function refreshNotifications() {
    const rows = await listUserNotifications({ unitCode: selectedUnitCode, limit: 20 }).catch(() => []);
    setNotifications(rows);
  }

  async function openNotification(notification: UserNotification) {
    if (notification.notificationCode && !notification.isRead) {
      await setNotificationRead(notification.notificationCode, true).catch(() => undefined);
    }
    setNotificationsOpen(false);
    await refreshNotifications();
    const summary = await getNotificationSummary(selectedUnitCode).catch(() => ({ unreadCount: 0 }));
    setNotificationSummary({ unreadCount: summary.unreadCount ?? 0 });
    if (notification.linkUrl) {
      navigate(notification.linkUrl);
    }
  }

  async function markNotificationsRead() {
    await markAllNotificationsRead(selectedUnitCode).catch(() => undefined);
    setNotificationSummary({ unreadCount: 0 });
    await refreshNotifications();
  }


  function renderNotificationControl() {
    return (
      <PopoverTrigger
        isOpen={notificationsOpen}
        onOpenChange={(isOpen) => {
          setNotificationsOpen(isOpen);
          if (isOpen) void refreshNotifications();
        }}
      >
        <Button
          className="relative overflow-visible"
          variant="ghost"
          size="icon"
          aria-label={`Notifications${notificationSummary.unreadCount > 0 ? `, ${notificationSummary.unreadCount} unread` : ""}`}
        >
          <IconBell className="size-4" stroke={1.75} />
          {notificationSummary.unreadCount > 0 ? (
            <Badge className="pointer-events-none absolute -right-1 -top-1 h-4 min-w-4 px-1 leading-none">
              {Math.min(notificationSummary.unreadCount, 99)}
            </Badge>
          ) : null}
        </Button>
        <Popover className="w-96 max-w-[calc(100vw-2rem)] max-h-[calc(100dvh-5rem)] gap-0 overflow-hidden p-0" placement="bottom end">
          <PopoverHeader className="shrink-0 flex-row flex-wrap items-center justify-between gap-2 p-3">
            <div className="flex min-w-0 items-center gap-2">
              <PopoverTitle>{t("headerNotifications.title")}</PopoverTitle>
              {notificationSummary.unreadCount > 0 ? (
                <Badge variant="secondary" aria-label={t("headerNotifications.unreadCount", { count: notificationSummary.unreadCount })}>
                  {notificationSummary.unreadCount}
                </Badge>
              ) : null}
            </div>
            <Button variant="ghost" size="sm" isDisabled={notificationSummary.unreadCount === 0} onPress={() => void markNotificationsRead()}>
              {t("headerNotifications.markAllRead")}
            </Button>
          </PopoverHeader>
          <Separator className="shrink-0" />
          <ScrollArea className="min-h-0 min-w-0 max-h-80 overflow-x-hidden overscroll-contain p-1" role="region" aria-label={t("headerNotifications.title")} tabIndex={0}>
            {notifications.length ? (
              <ul className="flex min-w-0 flex-col gap-1">
                {notifications.map((notification) => (
                  <li className="min-w-0" key={notification.notificationCode}>
                    <Button
                      className="h-auto w-full min-w-0 items-start justify-start gap-3 whitespace-normal p-3 text-left [overflow-wrap:anywhere]"
                      variant="ghost"
                      onPress={() => void openNotification(notification)}
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground" aria-hidden="true"><IconBell /></span>
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className={cn("text-sm leading-snug", notification.isRead ? "font-medium" : "font-semibold")}>
                          {notification.title || t("headerNotifications.title")}
                        </span>
                        <span className="text-xs font-normal leading-relaxed text-muted-foreground">{notification.body}</span>
                        <span className="sr-only">{t(notification.isRead ? "headerNotifications.read" : "headerNotifications.unread")}</span>
                      </span>
                      {!notification.isRead ? <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" aria-hidden="true" /> : null}
                    </Button>
                  </li>
                ))}
              </ul>
            ) : <Empty className="p-6"><EmptyHeader><EmptyTitle>{t("headerNotifications.empty")}</EmptyTitle></EmptyHeader></Empty>}
          </ScrollArea>
        </Popover>
      </PopoverTrigger>
    );
  }

  function renderSelectors() {
    return (
      <div className="flex items-center gap-2">
        {/* Previous behavior kept for reference: show this whenever canSelectPillar is true. */}
        {canSelectPillar && !superAdmin ? (
          <PillarSwitcher
            items={availableUnits}
            selectedKey={selectedUnitCode}
            onSelectionChange={handleUnitChange}
          />
        ) : null}
        <LanguageSwitcher onLanguageChange={setSelectedLocaleState} />
      </div>
    );
  }

  return (
    <>
      <Sidebar
        collapsible="icon"
      >
        <div className="relative isolate flex size-full min-h-0 flex-col overflow-hidden bg-gradient-to-br from-sidebar-gradient-start via-sidebar-gradient-middle to-sidebar-gradient-end">
          <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-20 -z-10 size-56 rounded-full border-24 border-sidebar-circle group-data-[collapsible=icon]:hidden" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -right-32 -z-10 size-72 rounded-full border-24 border-sidebar-circle-secondary group-data-[collapsible=icon]:hidden" />
        <SidebarHeader className="h-12 justify-center border-b border-sidebar-border p-1">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                className="group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:p-0!"
                tooltip={t("navigation.items.dashboard", { ns: "common", defaultValue: "Dashboard" })}
                onPress={() => navigate(pillarAdmin ? "/dashboard" : "/")}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <IconStack2 />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1 text-left leading-none">
                  <strong className="truncate leading-none">{t("navigation.brandName")}</strong>
                  <span className="truncate text-xs leading-none text-sidebar-foreground/65">
                    {t("navigation.adminPanel")}
                  </span>
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="overflow-x-hidden">
          <SidebarGroup>
            <SidebarGroupContent>
              <DrillDownSidebarNavigation
                activePath={location.pathname}
                backLabel={t("navigation.back", { ns: "common", defaultValue: "Back" })}
                isCollapsed={sidebarCollapsed}
                items={sidebarNavigationItems}
                onNavigate={(path) => navigate(path)}
                rootLabel={t("navigation.primaryLabel", { ns: "common", defaultValue: "Primary navigation" })}
                translateLabel={translateNavigationLabel}
              />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border group-data-[collapsible=icon]:p-1">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenuTrigger>
                <SidebarMenuButton
                  size="lg"
                  className="group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:p-1!"
                  tooltip={`${userDisplayName} - ${userRole}`}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary font-semibold text-sidebar-primary-foreground">
                    {userDisplayName.slice(0, 1)}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col text-left group-data-[collapsible=icon]:hidden">
                    <strong className="truncate">{userDisplayName}</strong>
                    <span className="truncate text-xs text-sidebar-foreground/65">{userRole}</span>
                  </span>
                  <IconDots className="ml-auto group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
                <DropdownMenu placement="top start">
                  <DropdownMenuItem onAction={() => navigate("/account")}><IconUserCircle />{t("account.menu", { ns: "common" })}</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onAction={() => void handleLogout()}><IconLogout />{t("account.signOut", { ns: "common" })}</DropdownMenuItem>
                </DropdownMenu>
              </DropdownMenuTrigger>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        </div>
      </Sidebar>

      <SidebarInset className="h-svh min-h-0 min-w-0 overflow-hidden">
        <header
          id="application-header"
          className={cn(
            "sticky top-0 z-30 flex shrink-0 items-center gap-1 overflow-hidden bg-background/95 px-3 backdrop-blur transition-[height,opacity] duration-200 motion-reduce:transition-none",
            headerExpanded
              ? "visible h-12 border-b border-border opacity-100"
              : "invisible h-0 border-b-0 opacity-0",
          )}
          aria-hidden={!headerExpanded}
        >
          <SidebarTrigger className="[&_svg]:size-5!" />
          <Separator orientation="vertical" className="h-6! self-center!" />
          <div
            className="flex min-w-0 flex-1 items-center gap-2"
            aria-label={t("common:government.identityLabel")}
          >
            <NationalEmblem className="h-10 w-auto shrink-0 contrast-125 dark:invert" />
            <div className="hidden min-w-0 space-y-1 leading-none sm:block">
              <strong className="block truncate text-xs leading-none">
                {t("common:government.india")}
              </strong>
              <strong className="block truncate text-xs leading-none text-foreground/80">
                {t("common:government.ministry")}
              </strong>
            </div>
          </div>

          <div className="hidden items-center gap-0 xl:flex">
            {renderSelectors()}
          </div>
          {renderNotificationControl()}

          <AccessibilityControl pageTitle={activeTitle} />
        </header>

        <section
          data-slot="content-frame"
          data-layout={usesFullBleedContent ? "full-bleed" : "default"}
          className={cn(
            "min-h-0 min-w-0 flex-1",
            usesFullBleedContent
              ? "overflow-hidden"
              : "overflow-x-hidden overflow-y-auto p-4 md:p-6",
          )}
        >
          <Outlet context={{ collapseHeader, isHeaderExpanded: headerExpanded, setImmersiveContent, toggleHeader }} />
        </section>
      </SidebarInset>
    </>
  );
}

const DRILL_DOWN_TRANSITION_MS = 200;
const BACK_CONTROL_ID = "navigation-back";
const MANAGE_NAVIGATION_KEY = "navigation.modules.manage";

type NavigationDirection = "forward" | "back";

type NavigationTransition = {
  direction: NavigationDirection;
  group: NavGroupItem;
};

type DrillDownSidebarNavigationProps = {
  activePath: string;
  backLabel: string;
  isCollapsed: boolean;
  items: readonly NavItem[];
  onNavigate: (path: string) => void;
  rootLabel: string;
  translateLabel: (entry: { label: string; labelKey?: string }) => string;
};

function DrillDownSidebarNavigation({
  activePath,
  backLabel,
  isCollapsed,
  items,
  onNavigate,
  rootLabel,
  translateLabel,
}: DrillDownSidebarNavigationProps) {
  const [activeDrillDownGroup, setActiveDrillDownGroup] = useState<NavGroupItem | null>(() =>
    findDrillDownGroupForPath(items, activePath),
  );
  const [openGroups, setOpenGroups] = useState<string[]>(() => {
    const activeGroup = findExpandableGroupForPath(items, activePath);
    return activeGroup ? [navigationGroupId(activeGroup)] : [];
  });
  const [navigationTransition, setNavigationTransition] = useState<NavigationTransition | null>(null);
  const [transitionStarted, setTransitionStarted] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const pendingFocusIdRef = useRef<string | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    setNavigationTransition(null);
    setTransitionStarted(false);
    setActiveDrillDownGroup(findDrillDownGroupForPath(items, activePath));
    const activeGroup = findExpandableGroupForPath(items, activePath);
    if (activeGroup) setOpenGroups([navigationGroupId(activeGroup)]);
  }, [activePath, items]);

  useEffect(() => {
    const transition = navigationTransition;
    if (!transition) return;

    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => setTransitionStarted(true));
    });
    const completionTimer = window.setTimeout(() => {
      pendingFocusIdRef.current = transition.direction === "forward"
        ? BACK_CONTROL_ID
        : navigationGroupId(transition.group);
      setActiveDrillDownGroup(transition.direction === "forward" ? transition.group : null);
      setNavigationTransition(null);
      setTransitionStarted(false);
    }, DRILL_DOWN_TRANSITION_MS);

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.clearTimeout(completionTimer);
    };
  }, [navigationTransition]);

  useEffect(() => {
    const focusId = pendingFocusIdRef.current;
    if (!focusId) return;
    pendingFocusIdRef.current = null;
    const frame = window.requestAnimationFrame(() => focusNavigationControl(viewportRef.current, focusId));
    return () => window.cancelAnimationFrame(frame);
  }, [activeDrillDownGroup]);

  function commitPanelChange(group: NavGroupItem, direction: NavigationDirection, focusId: string) {
    if (navigationTransition) return;
    if (prefersReducedMotion) {
      pendingFocusIdRef.current = focusId;
      setActiveDrillDownGroup(direction === "forward" ? group : null);
      return;
    }

    setTransitionStarted(false);
    setNavigationTransition({ direction, group });
  }

  function openGroup(group: NavGroupItem) {
    const defaultPath = flattenNavigationItems(group.items)[0]?.path;
    if (isCollapsed) {
      if (defaultPath) onNavigate(defaultPath);
      return;
    }

    if (group.labelKey === MANAGE_NAVIGATION_KEY) {
      commitPanelChange(group, "forward", BACK_CONTROL_ID);
      return;
    }

    const groupId = navigationGroupId(group);
    setOpenGroups((current) => current.includes(groupId) ? [] : [groupId]);
  }

  function goBack() {
    if (!activeDrillDownGroup) return;
    commitPanelChange(activeDrillDownGroup, "back", navigationGroupId(activeDrillDownGroup));
  }

  const visibleDrillDownGroup = isCollapsed ? null : activeDrillDownGroup;

  return (
    <div ref={viewportRef} className="grid w-full min-w-0 overflow-hidden">
      {navigationTransition && !isCollapsed ? (
        <>
          <div
            aria-hidden="true"
            className={getNavigationPanelTransitionClass("from", navigationTransition.direction, transitionStarted)}
            inert
          >
            {navigationTransition.direction === "forward" ? (
              <RootSidebarNavigation
                activePath={activePath}
                isCollapsed={false}
                isTransitioning
                items={items}
                onNavigate={onNavigate}
                onOpenGroup={openGroup}
                openGroups={openGroups}
                rootLabel={rootLabel}
                translateLabel={translateLabel}
              />
            ) : (
              <ManageSidebarNavigation
                activePath={activePath}
                backLabel={backLabel}
                group={navigationTransition.group}
                isTransitioning
                onBack={goBack}
                onNavigate={onNavigate}
                translateLabel={translateLabel}
              />
            )}
          </div>
          <div
            aria-hidden="true"
            className={getNavigationPanelTransitionClass("to", navigationTransition.direction, transitionStarted)}
            inert
          >
            {navigationTransition.direction === "forward" ? (
              <ManageSidebarNavigation
                activePath={activePath}
                backLabel={backLabel}
                group={navigationTransition.group}
                isTransitioning
                onBack={goBack}
                onNavigate={onNavigate}
                translateLabel={translateLabel}
              />
            ) : (
              <RootSidebarNavigation
                activePath={activePath}
                isCollapsed={false}
                isTransitioning
                items={items}
                onNavigate={onNavigate}
                onOpenGroup={openGroup}
                openGroups={openGroups}
                rootLabel={rootLabel}
                translateLabel={translateLabel}
              />
            )}
          </div>
        </>
      ) : (
        <div className="col-start-1 row-start-1 w-full min-w-0">
          {visibleDrillDownGroup ? (
            <ManageSidebarNavigation
              activePath={activePath}
              backLabel={backLabel}
              group={visibleDrillDownGroup}
              isTransitioning={false}
              onBack={goBack}
              onNavigate={onNavigate}
              translateLabel={translateLabel}
            />
          ) : (
            <RootSidebarNavigation
              activePath={activePath}
              isCollapsed={isCollapsed}
              isTransitioning={false}
              items={items}
              onNavigate={onNavigate}
              onOpenGroup={openGroup}
              openGroups={openGroups}
              rootLabel={rootLabel}
              translateLabel={translateLabel}
            />
          )}
        </div>
      )}
    </div>
  );
}

type RootSidebarNavigationProps = {
  activePath: string;
  isCollapsed: boolean;
  isTransitioning: boolean;
  items: readonly NavItem[];
  onNavigate: (path: string) => void;
  onOpenGroup: (group: NavGroupItem) => void;
  openGroups: string[];
  rootLabel: string;
  translateLabel: (entry: { label: string; labelKey?: string }) => string;
};

function RootSidebarNavigation({
  activePath,
  isCollapsed,
  isTransitioning,
  items,
  onNavigate,
  onOpenGroup,
  openGroups,
  rootLabel,
  translateLabel,
}: RootSidebarNavigationProps) {
  return (
    <SidebarMenu aria-label={rootLabel} className={cn(isTransitioning && "pointer-events-none")}>
      {items.map((item) => {
        const ItemIcon = item.icon;
        const itemLabel = translateLabel(item);

        if ("items" in item) {
          const groupId = navigationGroupId(item);
          const isManage = item.labelKey === MANAGE_NAVIGATION_KEY;
          const isOpen = !isManage && openGroups.includes(groupId);
          return (
            <SidebarMenuItem key={groupId}>
              <SidebarMenuButton
                data-drilldown-id={groupId}
                aria-expanded={isManage ? undefined : isOpen}
                tooltip={itemLabel}
                onPress={() => onOpenGroup(item)}
              >
                <ItemIcon />
                <span>{itemLabel}</span>
                <IconChevronRight className={cn(
                  "ml-auto transition-transform duration-200 motion-reduce:transition-none group-data-[collapsible=icon]:hidden",
                  isOpen && "rotate-90",
                )} />
              </SidebarMenuButton>
              {isOpen && !isCollapsed ? (
                <SidebarMenuSub className="animate-in fade-in-0 slide-in-from-top-1 duration-200 motion-reduce:animate-none">
                  {flattenNavigationItems(item.items).map((child) => {
                    const ChildIcon = child.icon;
                    return (
                      <SidebarMenuSubItem key={child.path}>
                        <SidebarMenuSubButton
                          isActive={navigationPathIsActive(activePath, child.path)}
                          onPress={() => onNavigate(child.path)}
                        >
                          <ChildIcon />
                          <span>{translateLabel(child)}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    );
                  })}
                </SidebarMenuSub>
              ) : null}
            </SidebarMenuItem>
          );
        }

        return (
          <SidebarMenuItem key={item.path}>
            <SidebarMenuButton
              data-drilldown-id={item.path}
              isActive={navigationPathIsActive(activePath, item.path)}
              tooltip={itemLabel}
              onPress={() => onNavigate(item.path)}
            >
              <ItemIcon />
              <span>{itemLabel}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

type ManageSidebarNavigationProps = {
  activePath: string;
  backLabel: string;
  group: NavGroupItem;
  isTransitioning: boolean;
  onBack: () => void;
  onNavigate: (path: string) => void;
  translateLabel: (entry: { label: string; labelKey?: string }) => string;
};

function ManageSidebarNavigation({
  activePath,
  backLabel,
  group,
  isTransitioning,
  onBack,
  onNavigate,
  translateLabel,
}: ManageSidebarNavigationProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", isTransitioning && "pointer-events-none")}>
      <SidebarMenu aria-label={translateLabel(group)}>
        <SidebarMenuItem>
          <SidebarMenuButton
            data-drilldown-id={BACK_CONTROL_ID}
            tooltip={backLabel}
            onPress={onBack}
          >
            <IconArrowLeft data-icon="inline-start" />
            <span>{backLabel}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      {group.items.map((section) => {
        if (!("items" in section)) {
          const SectionIcon = section.icon;
          return (
            <SidebarMenu key={section.path}>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={navigationPathIsActive(activePath, section.path)} onPress={() => onNavigate(section.path)}>
                  <SectionIcon />
                  <span>{translateLabel(section)}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          );
        }

        const SectionIcon = section.icon;
        return (
          <SidebarMenu key={navigationGroupId(section)} className="mt-1">
            <SidebarMenuItem>
              <div className="flex h-8 w-full min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 text-xs text-sidebar-foreground [&_svg]:size-4 [&_svg]:shrink-0">
                <SectionIcon aria-hidden="true" />
                <span className="truncate">{translateLabel(section)}</span>
              </div>
              <SidebarMenuSub>
                {flattenNavigationItems(section.items).map((child) => {
                  const ChildIcon = child.icon;
                  return (
                    <SidebarMenuSubItem key={child.path}>
                      <SidebarMenuSubButton
                        isActive={navigationPathIsActive(activePath, child.path)}
                        onPress={() => onNavigate(child.path)}
                      >
                        <ChildIcon />
                        <span>{translateLabel(child)}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  );
                })}
              </SidebarMenuSub>
            </SidebarMenuItem>
          </SidebarMenu>
        );
      })}
    </div>
  );
}

function findDrillDownGroupForPath(items: readonly NavItem[], activePath: string): NavGroupItem | null {
  return items.find((item): item is NavGroupItem =>
    "items" in item
    && item.labelKey === MANAGE_NAVIGATION_KEY
    && flattenNavigationItems(item.items).some((child) => navigationPathIsActive(activePath, child.path)),
  ) ?? null;
}

function findExpandableGroupForPath(items: readonly NavItem[], activePath: string): NavGroupItem | null {
  return items.find((item): item is NavGroupItem =>
    "items" in item
    && item.labelKey !== MANAGE_NAVIGATION_KEY
    && flattenNavigationItems(item.items).some((child) => navigationPathIsActive(activePath, child.path)),
  ) ?? null;
}

function navigationPathIsActive(activePath: string, itemPath: string): boolean {
  return activePath === itemPath || (itemPath !== "/" && activePath.startsWith(`${itemPath}/`));
}

function navigationGroupId(group: NavGroupItem): string {
  return group.labelKey ?? group.label;
}

function getNavigationPanelTransitionClass(
  role: "from" | "to",
  direction: NavigationDirection,
  started: boolean,
): string {
  const isForward = direction === "forward";
  const isOutgoing = role === "from";
  return cn(
    "col-start-1 row-start-1 w-full min-w-0 transition-[transform,opacity] duration-200 ease-out will-change-transform motion-reduce:transform-none motion-reduce:transition-none",
    !started && isOutgoing && "translate-x-0 opacity-100",
    !started && !isOutgoing && (isForward ? "translate-x-full" : "-translate-x-full"),
    !started && !isOutgoing && "opacity-0",
    started && isOutgoing && (isForward ? "-translate-x-full" : "translate-x-full"),
    started && isOutgoing && "opacity-0",
    started && !isOutgoing && "translate-x-0 opacity-100",
  );
}

function focusNavigationControl(container: HTMLDivElement | null, focusId: string) {
  const controls = container?.querySelectorAll<HTMLElement>("[data-drilldown-id]");
  const control = controls ? Array.from(controls).find((candidate) => candidate.dataset.drilldownId === focusId) : null;
  control?.focus();
}

function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

function resolveInitialPillarSelection(user: ReturnType<typeof getLocalCurrentUser>): string {
  const storedUnitCode = getSelectedUnitCode();
  if (isSuperAdmin(user)) return storedUnitCode;
  if (isPillarAdmin(user)) {
    const preferredScope = (user.defaultUnitCode || user.unitCode || "").trim().toUpperCase();
    const rootCode = getPillarRootCode(preferredScope || storedUnitCode);
    if (preferredScope && isUnitInPillar(preferredScope, rootCode) && !isUnitInPillar(storedUnitCode, rootCode)) {
      return preferredScope;
    }
    return isUnitInPillar(storedUnitCode, rootCode) ? storedUnitCode : preferredScope || rootCode;
  }
  return (user.unitCode || storedUnitCode || DEFAULT_UNIT_CODE).trim().toUpperCase();
}

function filterNavigationForUser(modules: typeof navigationModules, user: ReturnType<typeof getLocalCurrentUser>): typeof navigationModules {
  if (isSuperAdmin(user)) {
    // The module definitions and routes stay intact; only their super-admin
    // navigation entries are hidden.
    const hiddenForSuperAdmins = new Set(["/pillar-onboarding", "/ingestion"]);
    return modules.filter(
      (module) => !hiddenForSuperAdmins.has(module.basePath),
    ) as typeof navigationModules;
  }

  if (!isPillarAdmin(user)) return modules;

  const hiddenForPillarAdmins = new Set(["/authentication"]);

  return modules.filter(
    (module) => !hiddenForPillarAdmins.has(module.basePath),
  ) as typeof navigationModules;
}

function filterGlobalMappingNavigation(modules: typeof navigationModules, enabled: boolean): typeof navigationModules {
  if (enabled) return modules;
  return modules
    .map((module) =>
      module.basePath === "/pillar-onboarding"
        ? { ...module, items: module.items.filter((item) => "path" in item && item.path !== "/indicators/global") }
        : module,
    )
    .filter((module) => module.items.length > 0) as typeof navigationModules;
}

function formatUnitWorkspaceTitle(units: UnitOption[], selectedUnitCode: string): string {
  const normalizedSelected = (selectedUnitCode || DEFAULT_UNIT_CODE).toUpperCase();
  const selectedUnit = units.find((unit) => unit.unit_code?.toUpperCase() === normalizedSelected);
  const unitLabel = selectedUnit?.unit_name || selectedUnit?.display_name || selectedUnit?.name || selectedUnit?.unit_code || normalizedSelected;
  return unitLabel;
}

function frameworkLevelLabelKey(levelCode: string, levelName?: string | null): string | undefined {
  const normalized = `${levelCode} ${levelName ?? ""}`.trim().toLowerCase();
  const knownLevels = ["goal", "target", "objective", "outcome", "output"] as const;
  const matchedLevel = knownLevels.find((level) => new RegExp(`(^|[^a-z])${level}([^a-z]|$)`).test(normalized));
  return matchedLevel ? `navigation.frameworkLevels.${matchedLevel}` : undefined;
}
function ensureSelectedUnitOption(units: UnitOption[], selectedUnitCode: string): UnitOption[] {
  const normalizedSelected = (selectedUnitCode || DEFAULT_UNIT_CODE).toUpperCase();
  if (units.some((unit) => unit.unit_code?.toUpperCase() === normalizedSelected)) {
    return units;
  }
  return [
    {
      unit_code: normalizedSelected,
      unit_name: normalizedSelected,
      global_mapping_enabled: normalizedSelected === "SDG",
      globalMappingEnabled: normalizedSelected === "SDG",
    },
    ...units,
  ];
}
function formatUserDisplayName(displayName: string, email: string): string {
  const normalizedName = displayName.trim();
  if (normalizedName && normalizedName.toLowerCase() !== "string") return normalizedName;

  const emailName = email.split("@")[0]?.trim();
  return emailName && emailName.toLowerCase() !== "string" ? emailName : "SSD User";
}

function formatRoleLabel(role?: string): string {
  if (!role) return "User";
  if (["UNIT_ADMIN", "PILLAR_ADMIN"].includes(role.trim().toUpperCase())) return "Pillar Admin";
  return role
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
