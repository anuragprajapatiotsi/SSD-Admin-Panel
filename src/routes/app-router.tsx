import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader } from "../components/common/loader";
import { useDocumentTitle } from "../hooks/use-document-title";
import { AppShell } from "../layouts/app-shell";
import { AppErrorPage } from "../pages/system/app-error-page";
import { PlaceholderPage } from "../pages/system/placeholder-page";
import { flatNavigation, type NavigationPath } from "./navigation";

const DataApiPage = lazy(() => import("../pages/ingestion/data-api-page").then((module) => ({ default: module.DataApiPage })));
const DataApiEditorPage = lazy(() => import("../pages/ingestion/data-api-editor-page").then((module) => ({ default: module.DataApiEditorPage })));

const AccessManagementPage = lazy(() =>
  import("../pages/auth/access-management-page").then((module) => ({
    default: module.AccessManagementPage,
  })),
);
const AuditSessionsPage = lazy(() =>
  import("../pages/auth/audit-sessions-page").then((module) => ({
    default: module.AuditSessionsPage,
  })),
);
const LoginPage = lazy(() =>
  import("../pages/auth/login-page").then((module) => ({
    default: module.LoginPage,
  })),
);
const RequestAccessPage = lazy(() =>
  import("../pages/auth/request-access-page").then((module) => ({ default: module.RequestAccessPage })),
);
const AccountProfilePage = lazy(() =>
  import("../pages/auth/account-profile-page").then((module) => ({
    default: module.AccountProfilePage,
  })),
);
const ChangePasswordPage = lazy(() =>
  import("../pages/auth/change-password-page").then((module) => ({
    default: module.ChangePasswordPage,
  })),
);
const ForgotPasswordPage = lazy(() =>
  import("../pages/auth/forgot-password-page").then((module) => ({
    default: module.ForgotPasswordPage,
  })),
);
const NewPasswordPage = lazy(() =>
  import("../pages/auth/new-password-page").then((module) => ({
    default: module.NewPasswordPage,
  })),
);
const ReviewWorkflowPage = lazy(() =>
  import("../pages/auth/review-workflow-page").then((module) => ({
    default: module.ReviewWorkflowPage,
  })),
);
const UnitAccessPage = lazy(() =>
  import("../pages/auth/unit-access-page").then((module) => ({
    default: module.UnitAccessPage,
  })),
);
const UserAdministrationPage = lazy(() =>
  import("../pages/auth/user-administration-page").then((module) => ({
    default: module.UserAdministrationPage,
  })),
);
const NewUserPage = lazy(() =>
  import("../pages/auth/new-user-page").then((module) => ({
    default: module.NewUserPage,
  })),
);
const EditUserPage = lazy(() =>
  import("../pages/auth/edit-user-page").then((module) => ({
    default: module.EditUserPage,
  })),
);
const AssignRolePage = lazy(() =>
  import("../pages/auth/assign-role-page").then((module) => ({
    default: module.AssignRolePage,
  })),
);
const ReviewLevelPage = lazy(() =>
  import("../pages/auth/review-level-page").then((module) => ({
    default: module.ReviewLevelPage,
  })),
);
const DimensionLibraryPage = lazy(() =>
  import("../pages/masters/dimension-page/dimension-library-page").then((module) => ({
    default: module.DimensionLibraryPage,
  })),
);
const CreateDimensionPage = lazy(() =>
  import("../pages/masters/dimension-page/create-dimension-page").then((module) => ({
    default: module.CreateDimensionPage,
  })),
);
const EditDimensionPage = lazy(() =>
  import("../pages/masters/dimension-page/create-dimension-page").then((module) => ({
    default: module.EditDimensionPage,
  })),
);
const EditDimensionMemberPage = lazy(() =>
  import("../pages/masters/dimension-page/create-dimension-member-page").then((module) => ({
    default: module.EditDimensionMemberPage,
  })),
);
const CreateDimensionHierarchyPage = lazy(() =>
  import("../pages/masters/dimension-page/create-dimension-hierarchy-page").then((module) => ({ default: module.CreateDimensionHierarchyPage })),
);
const EditDimensionHierarchyPage = lazy(() =>
  import("../pages/masters/dimension-page/create-dimension-hierarchy-page").then((module) => ({ default: module.EditDimensionHierarchyPage })),
);
const CreateDimensionMemberSetPage = lazy(() =>
  import("../pages/masters/dimension-page/create-dimension-member-set-page").then((module) => ({ default: module.CreateDimensionMemberSetPage })),
);
const EditDimensionMemberSetPage = lazy(() =>
  import("../pages/masters/dimension-page/create-dimension-member-set-page").then((module) => ({ default: module.EditDimensionMemberSetPage })),
);
const CreateDimensionRollupPage = lazy(() =>
  import("../pages/masters/dimension-page/create-dimension-rollup-page").then((module) => ({ default: module.CreateDimensionRollupPage })),
);
const EditDimensionRollupPage = lazy(() =>
  import("../pages/masters/dimension-page/create-dimension-rollup-page").then((module) => ({ default: module.EditDimensionRollupPage })),
);
const CreateDimensionAliasPage = lazy(() =>
  import("../pages/masters/dimension-page/create-dimension-alias-page").then((module) => ({ default: module.CreateDimensionAliasPage })),
);
const EditDimensionAliasPage = lazy(() =>
  import("../pages/masters/dimension-page/create-dimension-alias-page").then((module) => ({ default: module.EditDimensionAliasPage })),
);
const CreateDimensionMemberPage = lazy(() =>
  import("../pages/masters/dimension-page/create-dimension-member-page").then((module) => ({
    default: module.CreateDimensionMemberPage,
  })),
);
const GeographyPage = lazy(() =>
  import("../pages/masters/geography-page").then((module) => ({
    default: module.GeographyPage,
  })),
);
const CreateGeographyPage = lazy(() =>
  import("../pages/masters/create-geography-page").then((module) => ({ default: module.CreateGeographyPage })),
);
const EditGeographyPage = lazy(() =>
  import("../pages/masters/create-geography-page").then((module) => ({ default: module.CreateGeographyPage })),
);
const GeographyMemberSetPage = lazy(() =>
  import("../pages/masters/geography-member-set-page").then((module) => ({ default: module.GeographyMemberSetPage })),
);
const GeographyRollupPage = lazy(() =>
  import("../pages/masters/geography-rollup-page").then((module) => ({ default: module.GeographyRollupPage })),
);
const TimePeriodsPage = lazy(() =>
  import("../pages/masters/time-periods-page").then((module) => ({
    default: module.TimePeriodsPage,
  })),
);
const TimePeriodEditorPage = lazy(() =>
  import("../pages/masters/time-period-editor-page").then((module) => ({ default: module.TimePeriodEditorPage })),
);
const FrameworkLevelPage = lazy(() =>
  import("../pages/framework/framework-level-page").then((module) => ({
    default: module.FrameworkLevelPage,
  })),
);
const FrameworkPage = lazy(() =>
  import("../pages/framework/framework-page").then((module) => ({
    default: module.FrameworkPage,
  })),
);
const GlobalIndicatorsPage = lazy(() =>
  import("../pages/indicators/global-indicators-page").then((module) => ({
    default: module.GlobalIndicatorsPage,
  })),
);
const IndicatorLibraryPage = lazy(() =>
  import("../pages/indicators/indicator-library-page").then((module) => ({
    default: module.IndicatorLibraryPage,
  })),
);
const CreateIndicatorPage = lazy(() =>
  import("../pages/indicators/create-indicator-page").then((module) => ({
    default: module.CreateIndicatorPage,
  })),
);
const EditIndicatorPage = lazy(() =>
  import("../pages/indicators/edit-indicator-page").then((module) => ({
    default: module.EditIndicatorPage,
  })),
);
const ViewIndicatorPage = lazy(() =>
  import("../pages/indicators/view-indicator-page").then((module) => ({
    default: module.ViewIndicatorPage,
  })),
);
const ExcelTemplateCreatePage = lazy(() =>
  import("../pages/ingestion/excel-template-create-page").then((module) => ({
    default: module.ExcelTemplateCreatePage,
  })),
);
const ExcelTemplateEditPage = lazy(() =>
  import("../pages/ingestion/excel-template-edit-page").then((module) => ({
    default: module.ExcelTemplateEditPage,
  })),
);
const ExcelTemplatesPage = lazy(() =>
  import("../pages/ingestion/excel-templates-page").then((module) => ({
    default: module.ExcelTemplatesPage,
  })),
);
const DataCollectionPage = lazy(() =>
  import("../pages/ingestion/data-collection-page").then((module) => ({
    default: module.DataCollectionPage,
  })),
);
const DataCollectionDetailPage = lazy(() =>
  import("../pages/ingestion/data-collection-detail-page").then((module) => ({
    default: module.DataCollectionDetailPage,
  })),
);
const DataCollectionUploadPage = lazy(() =>
  import("../pages/ingestion/data-collection-upload-page").then((module) => ({
    default: module.DataCollectionUploadPage,
  })),
);
const NewSubmissionPage = lazy(() =>
  import("../pages/ingestion/new-submission-page").then((module) => ({
    default: module.NewSubmissionPage,
  })),
);
const SendTemplateOverMailPage = lazy(() =>
  import("../pages/ingestion/send-template-over-mail-page").then((module) => ({
    default: module.SendTemplateOverMailPage,
  })),
);
const CollectionActivityPreviewPage = lazy(() =>
  import("../pages/ingestion/collection-activity-preview-page").then((module) => ({
    default: module.CollectionActivityPreviewPage,
  })),
);
const TemplateEmailCompositionPage = lazy(() =>
  import("../pages/ingestion/template-email-composition-page").then(
    (module) => ({ default: module.TemplateEmailCompositionPage }),
  ),
);
const MastersReferencePage = lazy(() =>
  import("../pages/masters/masters-reference-page").then((module) => ({
    default: module.MastersReferencePage,
  })),
);
const CreateLocalePage = lazy(() =>
  import("../pages/masters/create-locale-page").then((module) => ({
    default: module.CreateLocalePage,
  })),
);
const EditLocalePage = lazy(() =>
  import("../pages/masters/edit-locale-page").then((module) => ({
    default: module.EditLocalePage,
  })),
);
const CreatePeriodicityPage = lazy(() =>
  import("../pages/masters/create-periodicity-page").then((module) => ({
    default: module.CreatePeriodicityPage,
  })),
);
const EditPeriodicityPage = lazy(() =>
  import("../pages/masters/edit-periodicity-page").then((module) => ({
    default: module.EditPeriodicityPage,
  })),
);
const CreateUomPage = lazy(() =>
  import("../pages/masters/create-uom-page").then((module) => ({ default: module.CreateUomPage })),
);
const EditUomPage = lazy(() =>
  import("../pages/masters/edit-uom-page").then((module) => ({ default: module.EditUomPage })),
);
const CreateUnitPage = lazy(() => import("../pages/masters/create-unit-page").then((module) => ({ default: module.CreateUnitPage })));
const EditUnitPage = lazy(() => import("../pages/masters/edit-unit-page").then((module) => ({ default: module.EditUnitPage })));
const CreateOfficerPage = lazy(() => import("../pages/masters/create-officer-page").then((module) => ({ default: module.CreateOfficerPage })));
const EditOfficerPage = lazy(() => import("../pages/masters/edit-officer-page").then((module) => ({ default: module.EditOfficerPage })));
const WorkflowMonitorPage = lazy(() =>
  import("../pages/monitoring/workflow-monitor-page").then((module) => ({
    default: module.WorkflowMonitorPage,
  })),
);
const EmailTemplatesPage = lazy(() =>
  import("../pages/configuration/email-templates-page").then((module) => ({
    default: module.EmailTemplatesPage,
  })),
);
const EmailTemplateEditorPage = lazy(() =>
  import("../pages/configuration/email-template-editor-page").then((module) => ({
    default: module.EmailTemplateEditorPage,
  })),
);
const NotificationRulesPage = lazy(() =>
  import("../pages/configuration/notification-rules-page").then((module) => ({
    default: module.NotificationRulesPage,
  })),
);
const NotificationRuleEditorPage = lazy(() =>
  import("../pages/configuration/notification-rule-editor-page").then((module) => ({
    default: module.NotificationRuleEditorPage,
  })),
);

function PageWithTitle({
  children,
  title,
  titleKey,
}: {
  children: ReactNode;
  title: string;
  titleKey?: string;
}) {
  const { t } = useTranslation("common");
  useDocumentTitle(titleKey ? t(titleKey, { defaultValue: title }) : title);
  return children;
}

function RouteLoadingState({ layout }: { layout: "content" | "viewport" }) {
  const { t } = useTranslation("common");

  return (
    <Loader
      className={layout === "viewport" ? "min-h-svh w-full" : "h-full min-h-0 w-full"}
      text={t("loading.page", { defaultValue: "Loading page..." })}
    />
  );
}

function page(element: ReactNode, title?: string, titleKey?: string, loadingLayout: "content" | "viewport" = "content") {
  const content = (
    <Suspense fallback={<RouteLoadingState layout={loadingLayout} />}>
      {element}
    </Suspense>
  );
  return title ? (
    <PageWithTitle title={title} titleKey={titleKey}>{content}</PageWithTitle>
  ) : (
    content
  );
}

const navigationPages: Record<string, ReactNode> = {
  "/authentication/permission-matrix": page(<AccessManagementPage />),
  "/authentication/users": page(<UserAdministrationPage />),
  "/authentication/audit-sessions": page(<AuditSessionsPage />),
  "/framework": page(<FrameworkPage />),
  "/masters/ssd-pillars": page(<UnitAccessPage />),
  "/masters/periodicities": page(<MastersReferencePage />),
  "/masters/uom": page(<MastersReferencePage />),
  "/ingestion/sources-ministries": page(<MastersReferencePage />),
  "/indicators/library": page(<IndicatorLibraryPage />),
  "/indicators/global": page(<GlobalIndicatorsPage />),
  "/masters/dimensions": page(<DimensionLibraryPage />),
  "/masters/geography": page(<GeographyPage />),
  "/masters/time-periods": page(<TimePeriodsPage />),
  "/configuration/email-templates": page(<EmailTemplatesPage />),
  "/configuration/notification-rules": page(<NotificationRulesPage />),
  "/configuration": page(<PlaceholderPage moduleName="Configuration" moduleNameKey="navigation.modules.configuration" />),
  "/monitoring": page(<PlaceholderPage moduleName="Monitoring" moduleNameKey="navigation.modules.monitoring" />),
  "/requests/dispatch-history": page(<WorkflowMonitorPage mode="dispatch-history" />),
  "/data-entry/dispatch-links": page(<WorkflowMonitorPage mode="data-entry-links" />),
  "/data-entry/assignments": page(<WorkflowMonitorPage mode="data-entry-assignments" />),
  "/review/dashboard": page(<WorkflowMonitorPage mode="review-dashboard" />),
  "/review/queue": page(<WorkflowMonitorPage mode="review-queue" />),
  "/review/approvals": page(<WorkflowMonitorPage mode="review-approvals" />),
  "/published-facts/index": page(<WorkflowMonitorPage mode="published-index" />),
  "/published-facts/approved-data": page(<WorkflowMonitorPage mode="published-approved" />),
  "/published-facts/observations": page(<WorkflowMonitorPage mode="published-observations" />),
  "/published-facts/computed-facts": page(<WorkflowMonitorPage mode="published-computed" />),
  "/ingestion/excel-templates": page(<ExcelTemplatesPage />),
  "/ingestion/data-api": page(<DataApiPage />),
  "/ingestion/data-collection": page(<DataCollectionPage />),
} satisfies Record<NavigationPath, ReactNode>;

const childRoutes = flatNavigation.map((item) => ({
  ...(item.path === "/" ? { index: true as const } : { path: item.path.replace(/^\//, "") }),
  element: <PageWithTitle title={item.label} titleKey={item.labelKey}>{navigationPages[item.path]}</PageWithTitle>,
}));

type ApplicationRouteDefinition = {
  path: string;
  title: string;
  titleKey?: string;
  element: ReactNode;
};

const applicationRoutes: readonly ApplicationRouteDefinition[] = [
  { path: "authentication/review-workflow", title: "Review Workflows", titleKey: "navigation.items.reviewWorkflows", element: <ReviewWorkflowPage /> },
  { path: "ingestion/data-api/new", title: "New API Connection", titleKey: "ingestion:dataApi.createTitle", element: <DataApiEditorPage /> },
  { path: "ingestion/data-api/:connectionCode/edit", title: "Edit API Connection", titleKey: "ingestion:dataApi.editTitle", element: <DataApiEditorPage /> },
  { path: "account", title: "Account Details", titleKey: "account.profile.title", element: <AccountProfilePage /> },
  { path: "account/change-password", title: "Change Password", titleKey: "account.profile.password.title", element: <ChangePasswordPage /> },
  { path: "masters/dimensions/create", title: "Create Dimension", element: <CreateDimensionPage /> },
  { path: "masters/dimensions/:dimensionCode/edit", title: "Edit Dimension", element: <EditDimensionPage /> },
  { path: "masters/dimensions/:dimensionCode/members/create", title: "Create Dimension Member", element: <CreateDimensionMemberPage /> },
  { path: "masters/dimensions/:dimensionCode/members/:memberCode/edit", title: "Edit Dimension Member", element: <EditDimensionMemberPage /> },
  { path: "masters/dimensions/:dimensionCode/hierarchy/create", title: "Create Dimension Hierarchy", element: <CreateDimensionHierarchyPage /> },
  { path: "masters/dimensions/:dimensionCode/hierarchy/:parentCode/:childCode/edit", title: "Edit Dimension Hierarchy", element: <EditDimensionHierarchyPage /> },
  { path: "masters/dimensions/:dimensionCode/sets/create", title: "Create Dimension Member Set", element: <CreateDimensionMemberSetPage /> },
  { path: "masters/dimensions/:dimensionCode/sets/:setCode/edit", title: "Edit Dimension Member Set", element: <EditDimensionMemberSetPage /> },
  { path: "masters/dimensions/:dimensionCode/rollups/create", title: "Create Dimension Rollup", element: <CreateDimensionRollupPage /> },
  { path: "masters/dimensions/:dimensionCode/rollups/:parentCode/:ruleCode/edit", title: "Edit Dimension Rollup", element: <EditDimensionRollupPage /> },
  { path: "masters/dimensions/:dimensionCode/aliases/create", title: "Create Dimension Alias", element: <CreateDimensionAliasPage /> },
  { path: "masters/dimensions/:dimensionCode/aliases/:memberCode/:aliasType/:aliasValue/edit", title: "Edit Dimension Alias", element: <EditDimensionAliasPage /> },
  { path: "masters/locales/create", title: "Create Locale", element: <CreateLocalePage /> },
  { path: "masters/locales/:localeCode/edit", title: "Edit Locale", element: <EditLocalePage /> },
  { path: "masters/periodicities/create", title: "Create Periodicity", titleKey: "pages.periodicities.createTitle", element: <CreatePeriodicityPage /> },
  { path: "masters/periodicities/:periodicityCode/edit", title: "Edit Periodicity", titleKey: "pages.periodicities.editTitle", element: <EditPeriodicityPage /> },
  { path: "masters/uom/create", title: "Create UOM", titleKey: "pages.uom.createTitle", element: <CreateUomPage /> },
  { path: "masters/uom/:uomCode/edit", title: "Edit UOM", titleKey: "pages.uom.editTitle", element: <EditUomPage /> },
  { path: "masters/geography/create", title: "Create Geography", titleKey: "pages.geographies.create.title", element: <CreateGeographyPage /> },
  { path: "masters/geography/:geographyCode/edit", title: "Edit Geography", titleKey: "pages.geographies.create.editTitle", element: <EditGeographyPage /> },
  { path: "masters/geography/member-sets/create", title: "Create Geography Member Set", titleKey: "pages.geographies.memberSetForm.createTitle", element: <GeographyMemberSetPage /> },
  { path: "masters/geography/member-sets/:setCode/edit", title: "Edit Geography Member Set", titleKey: "pages.geographies.memberSetForm.editTitle", element: <GeographyMemberSetPage /> },
  { path: "masters/geography/rollups/create", title: "Create Geography Rollup", titleKey: "pages.geographies.rollupForm.createTitle", element: <GeographyRollupPage /> },
  { path: "masters/geography/rollups/:ruleCode/edit", title: "Edit Geography Rollup", titleKey: "pages.geographies.rollupForm.editTitle", element: <GeographyRollupPage /> },
  { path: "masters/time-periods/periods/create", title: "Create Time Period", titleKey: "pages.timePeriods.periodForm.createTitle", element: <TimePeriodEditorPage entity="period" /> },
  { path: "masters/time-periods/periods/:timePeriodCode/edit", title: "Edit Time Period", titleKey: "pages.timePeriods.periodForm.editTitle", element: <TimePeriodEditorPage entity="period" /> },
  { path: "masters/time-periods/sets/create", title: "Create Reporting Sequence", titleKey: "pages.timePeriods.add.sequence", element: <TimePeriodEditorPage entity="sequence" /> },
  { path: "masters/time-periods/sets/:setCode/edit", title: "Edit Reporting Sequence", titleKey: "pages.timePeriods.actions.editSequence", element: <TimePeriodEditorPage entity="sequence" /> },
  { path: "masters/time-periods/frequencies/create", title: "Create Time Frequency", titleKey: "pages.timePeriods.frequencyForm.createTitle", element: <TimePeriodEditorPage entity="frequency" /> },
  { path: "masters/time-periods/frequencies/:frequencyCode/edit", title: "Edit Time Frequency", titleKey: "pages.timePeriods.frequencyForm.editTitle", element: <TimePeriodEditorPage entity="frequency" /> },
  { path: "configuration/email-templates/create", title: "Create Email Template", titleKey: "pages.emailTemplates.editor.createTitle", element: <EmailTemplateEditorPage /> },
  { path: "configuration/email-templates/:emailTemplateCode/edit", title: "Edit Email Template", titleKey: "pages.emailTemplates.editor.editTitle", element: <EmailTemplateEditorPage /> },
  { path: "configuration/notification-rules/create", title: "Create Notification Rule", titleKey: "pages.notificationRules.editor.createTitle", element: <NotificationRuleEditorPage /> },
  { path: "configuration/notification-rules/:notificationRuleCode/edit", title: "Edit Notification Rule", titleKey: "pages.notificationRules.editor.editTitle", element: <NotificationRuleEditorPage /> },
  { path: "ingestion/sources-ministries/create", title: "Create Data Provider", titleKey: "pages.sourcesMinistries.createTitle", element: <CreateUnitPage /> },
  { path: "ingestion/sources-ministries/:organizationCode/edit", title: "Edit Data Provider", titleKey: "pages.sourcesMinistries.editTitle", element: <EditUnitPage /> },
  { path: "ingestion/sources-ministries/:organizationCode/officers", title: "Officers", titleKey: "pages.sourcesMinistries.officersTitle", element: <MastersReferencePage /> },
  { path: "ingestion/sources-ministries/:organizationCode/officers/create", title: "Create Officer", titleKey: "pages.sourcesMinistries.createOfficerTitle", element: <CreateOfficerPage /> },
  { path: "ingestion/sources-ministries/:organizationCode/officers/:officerCode/edit", title: "Edit Officer", titleKey: "pages.sourcesMinistries.editOfficerTitle", element: <EditOfficerPage /> },
  { path: "authentication/users/new", title: "Create New User", titleKey: "pages.userManagement.createTitle", element: <NewUserPage /> },
  { path: "authentication/users/:username/edit", title: "Edit User", titleKey: "pages.userManagement.editTitle", element: <EditUserPage /> },
  { path: "authentication/users/:username/roles", title: "Assign Role", titleKey: "pages.userManagement.assignRoleTitle", element: <AssignRolePage /> },
  { path: "authentication/users/:username/review-levels", title: "Review Level", titleKey: "pages.userManagement.reviewLevelTitle", element: <ReviewLevelPage /> },
  { path: "framework/levels/:levelCode", title: "Framework Level", element: <FrameworkLevelPage /> },
  { path: "framework/levels/:levelCode/:nodeCode", title: "Framework Level", element: <FrameworkLevelPage /> },
  { path: "masters/dimensions/:dimensionCode", title: "Dimension Details", element: <DimensionLibraryPage /> },
  { path: "indicators/library/create", title: "Create Indicator", titleKey: "ingestion:pillarIndicators.routes.create", element: <CreateIndicatorPage /> },
  { path: "indicators/library/view/:indicatorCode", title: "View Indicator", titleKey: "ingestion:pillarIndicators.routes.view", element: <ViewIndicatorPage /> },
  { path: "indicators/library/:indicatorCode/edit", title: "Edit Indicator", titleKey: "ingestion:pillarIndicators.routes.edit", element: <EditIndicatorPage /> },
  { path: "ingestion/excel-templates/create", title: "Create Data Template", element: <ExcelTemplateCreatePage /> },
  { path: "ingestion/excel-templates/:templateId/edit", title: "Edit Data Template", element: <ExcelTemplateEditPage /> },
  { path: "ingestion/data-collection/:collectionCode", title: "Data Collection", element: <DataCollectionDetailPage /> },
  { path: "ingestion/data-collection/:collectionCode/upload", title: "New Data Upload", element: <DataCollectionUploadPage /> },
  { path: "ingestion/data-collection/:collectionCode/new-submission", title: "New Submission", titleKey: "ingestion:newSubmission.title", element: <NewSubmissionPage /> },
  { path: "ingestion/data-collection/:collectionCode/send-template-mail", title: "Send Template Over Mail", titleKey: "ingestion:dataCollection.sendTemplate.routeTitle", element: <SendTemplateOverMailPage /> },
  { path: "ingestion/data-collection/:collectionCode/activities/:originType/:activityCode/preview", title: "Activity API Response", element: <CollectionActivityPreviewPage /> },
  { path: "ingestion/templates/email-composition", title: "Send Template Email", element: <TemplateEmailCompositionPage /> },
];

const router = createBrowserRouter([
  {
    path: "/request-access",
    element: page(<RequestAccessPage />, "Request Access", "ingestion:providerAccess.title", "viewport"),
    errorElement: <AppErrorPage />,
  },
  {
    path: "/login",
    element: page(<LoginPage />, "Login", "auth.pageTitles.login", "viewport"),
    errorElement: <AppErrorPage />,
  },
  {
    path: "/forgot-password",
    element: page(<ForgotPasswordPage />, "Forgot Password", "auth.pageTitles.forgotPassword", "viewport"),
    errorElement: <AppErrorPage />,
  },
  {
    path: "/new-password",
    element: page(<NewPasswordPage />, "Create New Password", "auth.pageTitles.newPassword", "viewport"),
    errorElement: <AppErrorPage />,
  },
  {
    path: "/",
    element: <AppShell />,
    errorElement: <AppErrorPage />,
    children: [
      // Previous Overview implementation is intentionally retained while this
      // screen is under construction:
      // { index: true, element: page(<WorkflowMonitorPage mode="overview-dashboard" />, "Overview", "navigation.items.overview") },
      { index: true, element: page(<PlaceholderPage moduleName="Overview" moduleNameKey="navigation.items.overview" />, "Overview", "navigation.items.overview") },
      { path: "dashboard", element: page(<WorkflowMonitorPage mode="unit-dashboard" />, "Dashboard", "navigation.items.dashboard") },
      ...childRoutes,
      ...applicationRoutes.map((route) => ({
        path: route.path,
        element: page(route.element, route.title, route.titleKey),
      })),
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
