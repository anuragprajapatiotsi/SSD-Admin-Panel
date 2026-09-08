# Routed UI migration

Scope: router entry points and recursively imported local modules, including create/edit/detail routes and overlays. Unrouted source files are retained without migration.

The route table is source coverage, not a record of browser visits. Runtime, keyboard, and responsive verification remain unverified; the user requested code-based review and no builds.

## Shared implementation

- PageSection and PageHeader own routed page spacing and headings.
- Existing shadcn Card, Input, NativeSelect, Textarea, Checkbox, Sheet, Dialog, Empty, and StatusBadge components provide surfaces and interactions.
- BooleanField composes the shared checkbox with its accessible label and supporting text.
- All routed tables use DataTable. DataTableReport composes it for ordered reports with rich display cells; DataTable owns expanded detail rows. TableSurface is an internal rendering primitive only.
- ConfirmationProvider replaces browser confirmation dialogs with the shared alert dialog.
- styles.css owns semantic light/dark tokens, baseline document styling, and accessibility preferences. FortuneSheet retains its own vendor stylesheet.

## Route source coverage

| Route | Entry point |
|---|---|
| `/authentication/permission-matrix` | `src/pages/auth/access-management-page.tsx` |
| `/authentication/users` | `src/pages/auth/user-administration-page.tsx` |
| `/authentication/review-workflow` | `src/pages/auth/review-workflow-page.tsx` |
| `/authentication/audit-sessions` | `src/pages/auth/audit-sessions-page.tsx` |
| `/framework` | `src/pages/framework/framework-page.tsx` |
| `/masters/ssd-pillars` | `src/pages/auth/unit-access-page.tsx` |
| `/masters/periodicities` | `src/pages/masters/masters-reference-page.tsx` |
| `/masters/uom` | `src/pages/masters/masters-reference-page.tsx` |
| `/ingestion/sources-ministries` | `src/pages/masters/masters-reference-page.tsx` |
| `/indicators/library` | `src/pages/indicators/indicator-library-page.tsx` |
| `/indicators/global` | `src/pages/indicators/global-indicators-page.tsx` |
| `/masters/dimensions` | `src/pages/masters/dimension-page/dimension-library-page.tsx` |
| `/masters/geography` | `src/pages/masters/geography-page.tsx` |
| `/masters/time-periods` | `src/pages/masters/time-periods-page.tsx` |
| `/configuration/email-templates` | `src/pages/configuration/email-templates-page.tsx` |
| `/configuration/notification-rules` | `src/pages/configuration/notification-rules-page.tsx` |
| `/ingestion/excel-templates` | `src/pages/ingestion/excel-templates-page.tsx` |
| `/ingestion/data-collection` | `src/pages/ingestion/data-collection-page.tsx` |
| `/account` | `src/pages/auth/account-profile-page.tsx` |
| `/account/change-password` | `src/pages/auth/change-password-page.tsx` |
| `/masters/dimensions/create` | `src/pages/masters/dimension-page/create-dimension-page.tsx` |
| `/masters/dimensions/:dimensionCode/edit` | `src/pages/masters/dimension-page/create-dimension-page.tsx` |
| `/masters/dimensions/:dimensionCode/members/create` | `src/pages/masters/dimension-page/create-dimension-member-page.tsx` |
| `/masters/dimensions/:dimensionCode/members/:memberCode/edit` | `src/pages/masters/dimension-page/create-dimension-member-page.tsx` |
| `/masters/dimensions/:dimensionCode/hierarchy/create` | `src/pages/masters/dimension-page/create-dimension-hierarchy-page.tsx` |
| `/masters/dimensions/:dimensionCode/hierarchy/:parentCode/:childCode/edit` | `src/pages/masters/dimension-page/create-dimension-hierarchy-page.tsx` |
| `/masters/dimensions/:dimensionCode/sets/create` | `src/pages/masters/dimension-page/create-dimension-member-set-page.tsx` |
| `/masters/dimensions/:dimensionCode/sets/:setCode/edit` | `src/pages/masters/dimension-page/create-dimension-member-set-page.tsx` |
| `/masters/dimensions/:dimensionCode/rollups/create` | `src/pages/masters/dimension-page/create-dimension-rollup-page.tsx` |
| `/masters/dimensions/:dimensionCode/rollups/:parentCode/:ruleCode/edit` | `src/pages/masters/dimension-page/create-dimension-rollup-page.tsx` |
| `/masters/dimensions/:dimensionCode/aliases/create` | `src/pages/masters/dimension-page/create-dimension-alias-page.tsx` |
| `/masters/dimensions/:dimensionCode/aliases/:memberCode/:aliasType/:aliasValue/edit` | `src/pages/masters/dimension-page/create-dimension-alias-page.tsx` |
| `/masters/locales/create` | `src/pages/masters/create-locale-page.tsx` |
| `/masters/locales/:localeCode/edit` | `src/pages/masters/edit-locale-page.tsx` |
| `/masters/periodicities/create` | `src/pages/masters/create-periodicity-page.tsx` |
| `/masters/periodicities/:periodicityCode/edit` | `src/pages/masters/edit-periodicity-page.tsx` |
| `/masters/uom/create` | `src/pages/masters/create-uom-page.tsx` |
| `/masters/uom/:uomCode/edit` | `src/pages/masters/edit-uom-page.tsx` |
| `/masters/geography/create` | `src/pages/masters/create-geography-page.tsx` |
| `/masters/geography/:geographyCode/edit` | `src/pages/masters/create-geography-page.tsx` |
| `/masters/geography/member-sets/create` | `src/pages/masters/geography-member-set-page.tsx` |
| `/masters/geography/member-sets/:setCode/edit` | `src/pages/masters/geography-member-set-page.tsx` |
| `/masters/geography/rollups/create` | `src/pages/masters/geography-rollup-page.tsx` |
| `/masters/geography/rollups/:ruleCode/edit` | `src/pages/masters/geography-rollup-page.tsx` |
| `/masters/time-periods/periods/create` | `src/pages/masters/time-period-editor-page.tsx` |
| `/masters/time-periods/periods/:timePeriodCode/edit` | `src/pages/masters/time-period-editor-page.tsx` |
| `/masters/time-periods/sets/create` | `src/pages/masters/time-period-editor-page.tsx` |
| `/masters/time-periods/sets/:setCode/edit` | `src/pages/masters/time-period-editor-page.tsx` |
| `/masters/time-periods/frequencies/create` | `src/pages/masters/time-period-editor-page.tsx` |
| `/masters/time-periods/frequencies/:frequencyCode/edit` | `src/pages/masters/time-period-editor-page.tsx` |
| `/configuration/email-templates/create` | `src/pages/configuration/email-template-editor-page.tsx` |
| `/configuration/email-templates/:emailTemplateCode/edit` | `src/pages/configuration/email-template-editor-page.tsx` |
| `/configuration/notification-rules/create` | `src/pages/configuration/notification-rule-editor-page.tsx` |
| `/configuration/notification-rules/:notificationRuleCode/edit` | `src/pages/configuration/notification-rule-editor-page.tsx` |
| `/ingestion/sources-ministries/create` | `src/pages/masters/create-unit-page.tsx` |
| `/ingestion/sources-ministries/:organizationCode/edit` | `src/pages/masters/edit-unit-page.tsx` |
| `/ingestion/sources-ministries/:organizationCode/officers` | `src/pages/masters/masters-reference-page.tsx` |
| `/ingestion/sources-ministries/:organizationCode/officers/create` | `src/pages/masters/create-officer-page.tsx` |
| `/ingestion/sources-ministries/:organizationCode/officers/:officerCode/edit` | `src/pages/masters/edit-officer-page.tsx` |
| `/authentication/users/new` | `src/pages/auth/new-user-page.tsx` |
| `/authentication/users/:username/edit` | `src/pages/auth/edit-user-page.tsx` |
| `/authentication/users/:username/roles` | `src/pages/auth/assign-role-page.tsx` |
| `/authentication/users/:username/review-levels` | `src/pages/auth/review-level-page.tsx` |
| `/framework/levels/:levelCode` | `src/pages/framework/framework-level-page.tsx` |
| `/framework/levels/:levelCode/:nodeCode` | `src/pages/framework/framework-level-page.tsx` |
| `/masters/dimensions/:dimensionCode` | `src/pages/masters/dimension-page/dimension-library-page.tsx` |
| `/indicators/library/create` | `src/pages/indicators/create-indicator-page.tsx` |
| `/indicators/library/view/:indicatorCode` | `src/pages/indicators/view-indicator-page.tsx` |
| `/indicators/library/:indicatorCode/edit` | `src/pages/indicators/edit-indicator-page.tsx` |
| `/ingestion/excel-templates/create` | `src/pages/ingestion/excel-template-create-page.tsx` |
| `/ingestion/excel-templates/:templateId/edit` | `src/pages/ingestion/excel-template-edit-page.tsx` |
| `/ingestion/data-collection/:collectionCode` | `src/pages/ingestion/data-collection-detail-page.tsx` |
| `/ingestion/data-collection/:collectionCode/upload` | `src/pages/ingestion/data-collection-upload-page.tsx` |
| `/ingestion/data-collection/:collectionCode/send-template-mail` | `src/pages/ingestion/send-template-over-mail-page.tsx` |
| `/ingestion/data-collection/:collectionCode/activities/:originType/:activityCode/preview` | `src/pages/ingestion/collection-activity-preview-page.tsx` |
| `/ingestion/templates/email-composition` | `src/pages/ingestion/template-email-composition-page.tsx` |
| `/` | `src/pages/monitoring/workflow-monitor-page.tsx` |
| `/dashboard` | `src/pages/monitoring/workflow-monitor-page.tsx` |
| `/login` | `src/pages/auth/login-page.tsx` |
| `/forgot-password` | `src/pages/auth/forgot-password-page.tsx` |
| `/new-password` | `src/pages/auth/new-password-page.tsx` |

## Tab and view source review

This supplements route coverage: each conditional panel and its imported renderer was inspected in source. It does not claim browser visits or keyboard testing.

| Page | Panels and linked views reviewed | Findings / implementation |
|---|---|---|
| Framework | Editions, Levels, Nodes, Relationships; create/edit sheets; expanded relationship rows | Replaced custom TabButton with shared Tabs; corrected level-card button height, surface and wrapping; shared loading/empty states. |
| Framework level | Grid, list, nested node detail and hierarchy links | Both data presentations use shared controls; existing view-mode buttons retain pressed semantics. |
| Dimensions | Members, Relationships, Sets, Rollups, Aliases; each create/edit route and set-item sheet | Shared Tabs and DimensionListPanel; restored row typography/spacing; secondary member controls and rollup badges; removal confirmation retained. |
| Geography | Records, Member Sets, Rollups; set selection, children, action menus and editors | Fixed clipped secondary panels, false selected styles before a set exists, missing secondary loading feedback, custom status dot and removal confirmations. |
| Time Periods | Periods, Sequences, Frequencies; sequence contents, immutable states, copy/edit routes | Added secondary loading feedback; softened selected rows; preserved scrolling; confirmed removals and handled failures. |
| Indicators | Status filters; Overview, Mapping, Measures, Usage, History; mapping accordions, mapping sheet and JSON dialog | Restored detail hierarchy; removed primary badges from metadata values; reused shared loading and empty states. |
| Account | Profile, Access | Shared cards and tabs; removed tab width constraint. |
| Audit & Sessions | Sessions, Login audit, Anonymous sessions | Each table retains its own loading/error/empty/retry state; removed duplicate card borders around tables. |
| Users and SSD Pillars | Every status filter panel; user edit/roles/review-level/reset-password views | Shared table renderers and status mapping; removed forced tab width. |
| Master references | UOM and periodicity status panels; source/ministry and officer status panels | Shared table renderer/CustomTabs and routed editors. |
| Data Collection | Collection status panels; activity status panels with source filter, history expansion and preview routes | Shared Tabs/DataTable; activity refreshing feedback remains wired; removed forced tab width. |
| Email Templates and Notification Rules | All/Active/Inactive panels; linked editors | Shared DataTable; removed forced tab width. |
| Notification Rule editor | To, Cc, Bcc | Controlled receiver selections persist between tabs; added missing receiver-group empty feedback and load-error retry; uses common Loader. |

Shared Tabs now constrain horizontal overflow and keep the selection indicator inside the scrollable strip. CustomTabs already composes that primitive. The source guard lists reachable tab owners with `node scripts/audit-routed-ui.mjs --tabs` and rejects custom tab roles/buttons and direct alternate tab imports.

## Validation

Follow-up after the Overview screenshot: corrected its PageHeader, six metric cards, search InputGroup, CardHeader composition, attention-row spacing, and full-width ministry report. Corrected missing label spacing in linked forms and the Framework node detail heading. Fourteen remaining table renderers now use DataTable through DataTableReport; master detail expansion remains supported. Source inspection is not visual acceptance: the screenshot exposed gaps missed by the earlier audit. Browser verification is still outstanding.

- TypeScript checked with no emit; no production build was run.
- Lint baseline comparison: 24 pre-existing errors, no newly introduced errors.
- 96 direct navigation targets inspected. The Time Period create target uses its routed tab names. A workbook link exists only in the unregistered published-index dashboard mode; no route was added for it.
- Hidden form fields and FortuneSheet's vendor controls are intentional exceptions to the shared visible-control audit.
- Run node scripts/audit-routed-ui.mjs to guard against legacy imports and page-owned visible controls returning.

