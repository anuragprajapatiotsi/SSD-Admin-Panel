import { Loader } from "@/components/common/loader";
import { PageHeader, PageSection } from "@/components/common/page-layout";
import { SearchInput } from "@/components/common/search-input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import { useConfirmation } from "@/hooks/use-confirmation";
import { cn } from "@/lib/utils";
import { IconAlertTriangle, IconArrowLeft, IconCheck, IconChevronDown, IconDeviceFloppy, IconInfoCircle, IconShieldLock } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import type { AuthPermission, AuthRole } from "../../api/auth-admin.api";
import { useAuthPermissions } from "../../hooks/use-auth-permissions";
import { useAuthRole, useCreateAuthRole, useSetAuthRolePermissions, useUpdateAuthRole } from "../../hooks/use-auth-roles";
import { getPermissionName, getRoleName, getRolePermissionCodes, groupPermissionsByModule, resolveModulePresetLevels, resolveModulePresetState } from "./permission-matrix-utils";

export function RolePermissionsEditPage() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const { roleCode = "" } = useParams<{ roleCode: string }>();
  const code = decodeURIComponent(roleCode);
  const isCreate = !code;
  const roleQuery = useAuthRole(code);
  const permissionsQuery = useAuthPermissions({ includeInactive: true });
  const error = roleQuery.error ?? permissionsQuery.error;
  const role = isCreate ? ({ role_code: "", role_scope: "UNIT", is_active: false, is_system_role: false, permissions: [] } satisfies AuthRole) : roleQuery.data;
  if (permissionsQuery.isPending || (!isCreate && roleQuery.isPending)) return <PageSection><Loader className="min-h-64" text={t("pages.roleManagement.editor.loading")} /></PageSection>;
  if (error || !role || !permissionsQuery.data) return <PageSection className="flex flex-col gap-4"><Alert variant="destructive"><IconInfoCircle aria-hidden="true" /><AlertTitle>{t("pages.roleManagement.editor.loadError")}</AlertTitle><AlertDescription>{error instanceof Error ? error.message : t("pages.roleManagement.feedback.tryAgain")}</AlertDescription></Alert><Button className="w-fit" variant="outline" onPress={() => void Promise.all([roleQuery.refetch(), permissionsQuery.refetch()])}>{t("pages.roleManagement.actions.tryAgain")}</Button></PageSection>;
  return <RoleEditor key={isCreate ? "new" : role.role_code} role={role} permissions={permissionsQuery.data?.data ?? []} isCreate={isCreate} onBack={() => navigate("/authentication/permission-matrix")} />;
}

function RoleEditor({ role, permissions, isCreate, onBack }: { role: AuthRole; permissions: AuthPermission[]; isCreate: boolean; onBack: () => void }) {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const confirm = useConfirmation();
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [showRoleDetails, setShowRoleDetails] = useState(false);
  const [roleName, setRoleName] = useState(role.role_name ?? role.display_name ?? role.name ?? "");
  const [roleCode, setRoleCode] = useState(role.role_code);
  const [scope, setScope] = useState(role.role_scope === "GLOBAL" ? "GLOBAL" : "UNIT");
  const [isActive, setIsActive] = useState(role.is_active !== false);
  const [selected, setSelected] = useState(() => new Set(getRolePermissionCodes(role)));
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [validationErrors, setValidationErrors] = useState<{ roleCode?: string; roleScope?: string }>({});
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [showEmptyConfirmation, setShowEmptyConfirmation] = useState(false);
  const createMutation = useCreateAuthRole();
  const updateMutation = useUpdateAuthRole();
  const permissionMutation = useSetAuthRolePermissions();
  const isSaving = createMutation.isPending || updateMutation.isPending || permissionMutation.isPending;
  const allGroups = useMemo(() => groupPermissionsByModule(permissions), [permissions]);
  const isDirty = useMemo(() => {
    const initialCodes = new Set(getRolePermissionCodes(role));
    const permissionsChanged = initialCodes.size !== selected.size || Array.from(initialCodes).some((code) => !selected.has(code));
    const initialName = role.role_name ?? role.display_name ?? role.name ?? "";
    const initialScope = role.role_scope === "GLOBAL" ? "GLOBAL" : "UNIT";
    return roleName.trim() !== initialName.trim() || scope !== initialScope || isActive !== (role.is_active !== false) || permissionsChanged;
  }, [isActive, role, roleName, scope, selected]);
  const riskAggregate = getRiskAggregate(allGroups, selected);
  const isHighRisk = riskAggregate.allPermissionsGranted || (riskAggregate.grantedAreaCount > 0 && riskAggregate.highPrivilegeGroups.length / riskAggregate.grantedAreaCount >= 0.5);
  const highPrivilegeModuleNames = riskAggregate.highPrivilegeGroups.map((group) => t(`pages.rolePermissionWorkspace.moduleNames.${group.moduleCode}`, { defaultValue: group.moduleName }));
  const groups = useMemo(() => { const term = search.trim().toLowerCase(); return allGroups.flatMap((group) => { const items = group.permissions.filter((permission) => (category === "ALL" || permission.category === category) && (!term || [getPermissionName(permission), permission.permission_code, permission.description, permission.module_code].some((value) => String(value ?? "").toLowerCase().includes(term)))); return items.length ? [{ ...group, permissions: items }] : []; }); }, [allGroups, category, search]);
  const visible = useMemo(() => groups.flatMap((group) => group.permissions), [groups]);
  function toggle(code: string, value: boolean) { setSelected((current) => { const next = new Set(current); if (value) next.add(code); else next.delete(code); return next; }); }
  function toggleAll(value: boolean) { setSelected((current) => { const next = new Set(current); visible.forEach((permission) => { if (permission.is_active === false) return; if (value) next.add(permission.permission_code); else next.delete(permission.permission_code); }); return next; }); }
  function applyPreset(moduleCodes: string[], presetCodes: string[]) { setSelected((current) => { const next = new Set(current); moduleCodes.forEach((code) => next.delete(code)); presetCodes.forEach((code) => next.add(code)); return next; }); }
  function validateRoleDetails() {
    const normalizedCode = roleCode.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_");
    const normalizedScope = scope.trim().toUpperCase();
    const nextErrors: { roleCode?: string; roleScope?: string } = {};
    if (!normalizedCode) nextErrors.roleCode = t("pages.roleManagement.editor.codeRequired");
    else if (normalizedCode.length > 100) nextErrors.roleCode = t("pages.rolePermissionWorkspace.validation.codeLength");
    if (!normalizedScope) nextErrors.roleScope = t("pages.rolePermissionWorkspace.validation.scopeRequired");
    else if (normalizedScope.length > 20) nextErrors.roleScope = t("pages.rolePermissionWorkspace.validation.scopeLength");
    setValidationErrors(nextErrors);
    return Object.keys(nextErrors).length ? null : { roleCode: normalizedCode, roleScope: normalizedScope };
  }
  function requestSave() {
    if (!validateRoleDetails()) return;
    if (isCreate && selected.size === 0) {
      setShowEmptyConfirmation(true);
      return;
    }
    if (isHighRisk) setShowSaveConfirmation(true);
    else void save();
  }
  function goToPermissions() {
    if (validateRoleDetails()) setWizardStep(2);
  }
  async function cancelCreate() {
    const isDirty = Boolean(roleCode.trim()) || scope !== "UNIT" || selected.size > 0;
    if (!isDirty || await confirm(t("pages.rolePermissionWorkspace.discardCreate"))) onBack();
  }
  async function save() {
    const details = validateRoleDetails();
    if (!details) return;
    try {
      if (isCreate) {
        await createMutation.mutateAsync({ role_code: details.roleCode, role_scope: details.roleScope, is_system_role: false });
        await updateMutation.mutateAsync({ roleCode: details.roleCode, payload: { role_scope: details.roleScope, is_active: false } });
        await permissionMutation.mutateAsync({ roleCode: details.roleCode, permissionCodes: Array.from(selected).sort() });
      } else {
        await updateMutation.mutateAsync({ roleCode: role.role_code, payload: { role_name: roleName.trim() || undefined, role_scope: scope, is_active: isActive } });
        await permissionMutation.mutateAsync({ roleCode: details.roleCode, permissionCodes: Array.from(selected).sort() });
      }
      toast.success(t(isCreate ? "pages.roleManagement.feedback.created" : "pages.roleManagement.feedback.saved"), { description: t(isCreate ? "pages.rolePermissionWorkspace.createdInactive" : "pages.roleManagement.feedback.savedDescription", { name: isCreate ? details.roleCode : getRoleName(role) }) });
      navigate("/authentication/permission-matrix", { replace: true, state: isCreate ? { createdRoleCode: details.roleCode } : undefined });
    } catch (error) { toast.error(t("pages.roleManagement.feedback.saveError"), { description: error instanceof Error ? error.message : t("pages.roleManagement.feedback.tryAgain") }); }
  }
  if (isCreate && wizardStep === 1) return <PageSection className="flex min-w-0 flex-col gap-4">
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
      <Button className="w-fit" type="button" variant="outline" onPress={() => void cancelCreate()}><IconArrowLeft data-icon="inline-start" aria-hidden="true" />{t("pages.roleManagement.actions.back")}</Button>
      <CreateRoleStepIndicator currentStep={1} onStepChange={setWizardStep} />
      <PageHeader><div><h2>{t("pages.roleManagement.editor.createTitle")}</h2><p>{t("pages.roleManagement.editor.createDescription")}</p></div></PageHeader>
    </div>
    <CreateRoleForm roleCode={roleCode} scope={scope} disabled={isSaving} errors={validationErrors} onCancel={() => void cancelCreate()} onCode={(value) => { setRoleCode(value.toUpperCase().replace(/[^A-Z0-9_]/g, "_")); if (validationErrors.roleCode) setValidationErrors((current) => ({ ...current, roleCode: undefined })); }} onScope={(value) => { setScope(value); if (validationErrors.roleScope) setValidationErrors((current) => ({ ...current, roleScope: undefined })); }} onSubmit={goToPermissions} />
  </PageSection>;
  if (isCreate && wizardStep === 2) return <PageSection className="flex min-w-0 flex-col gap-4">
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <CreateRoleStepIndicator currentStep={2} onStepChange={setWizardStep} />
      <PageHeader><div><h2>{t("pages.rolePermissionWorkspace.configureTitle")}</h2><p>{t("pages.rolePermissionWorkspace.configureDescription")}</p></div></PageHeader>
      <PermissionWorkspace allGroups={allGroups} groups={groups} permissions={permissions} selected={selected} search={search} category={category} visible={visible} disabled={isSaving} showEmptyGuidance onSearch={setSearch} onCategory={setCategory} onToggle={toggle} onToggleAll={toggleAll} onApplyPreset={applyPreset} />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between"><Button className="w-full sm:w-auto" variant="outline" onPress={() => setWizardStep(1)}><IconArrowLeft data-icon="inline-start" aria-hidden="true" />{t("pages.rolePermissionWorkspace.backToDetails")}</Button><Button className="w-full sm:w-auto" onPress={() => setWizardStep(3)}>{t("pages.rolePermissionWorkspace.nextReview")}</Button></div>
    </div>
  </PageSection>;
  if (isCreate && wizardStep === 3) return <PageSection className="flex min-w-0 flex-col gap-4">
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <CreateRoleStepIndicator currentStep={3} onStepChange={setWizardStep} />
      <PageHeader><div><h2>{t("pages.rolePermissionWorkspace.reviewTitle")}</h2><p>{t("pages.rolePermissionWorkspace.reviewDescription")}</p></div></PageHeader>
      <Card><CardHeader><CardTitle>{t("pages.rolePermissionWorkspace.roleSummary")}</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-3"><div><p className="text-xs text-muted-foreground">{t("pages.roleManagement.editor.code")}</p><p className="font-medium">{roleCode}</p></div><div><p className="text-xs text-muted-foreground">{t("pages.roleManagement.columns.scope")}</p><p className="font-medium">{t(scope === "GLOBAL" ? "pages.roleManagement.scopes.global" : "pages.roleManagement.scopes.unit")}</p></div><div><p className="text-xs text-muted-foreground">{t("pages.roleManagement.columns.status")}</p><p className="font-medium">{t("pages.rolePermissionWorkspace.willBeInactive")}</p></div></CardContent></Card>
      {isHighRisk ? <Alert variant="destructive"><IconAlertTriangle aria-hidden="true" /><AlertTitle>{t("pages.rolePermissionWorkspace.riskWarningTitle")}</AlertTitle><AlertDescription>{t("pages.rolePermissionWorkspace.aggregateRiskWarning", { count: riskAggregate.highPrivilegeGroups.length, granted: riskAggregate.grantedAreaCount })}</AlertDescription></Alert> : null}
      <RoleCapabilitySummary groups={allGroups} selected={selected} totalPermissions={permissions.length} showRiskWarning={false} sticky={false} />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between"><Button className="w-full sm:w-auto" variant="outline" onPress={() => setWizardStep(2)}><IconArrowLeft data-icon="inline-start" aria-hidden="true" />{t("pages.rolePermissionWorkspace.backToPermissions")}</Button><div className="flex flex-col items-end gap-1"><Button className="w-full sm:w-auto" isDisabled={isSaving} onPress={requestSave}>{isSaving ? <Spinner data-icon="inline-start" /> : <IconDeviceFloppy data-icon="inline-start" aria-hidden="true" />}{t(isSaving ? "pages.roleManagement.actions.saving" : "pages.rolePermissionWorkspace.finishCreate")}</Button><p className="max-w-sm text-right text-xs text-muted-foreground">{t("pages.rolePermissionWorkspace.inactiveNote")}</p></div></div>
    </div>
    <AlertDialogContent isOpen={showSaveConfirmation} onOpenChange={(isOpen) => { if (!isSaving) setShowSaveConfirmation(isOpen); }}><AlertDialogHeader><AlertDialogMedia className="bg-destructive/10 text-destructive"><IconAlertTriangle aria-hidden="true" /></AlertDialogMedia><AlertDialogTitle>{t("pages.rolePermissionWorkspace.saveRiskTitle")}</AlertDialogTitle><AlertDialogDescription>{t("pages.rolePermissionWorkspace.saveRiskDescription", { role: roleCode.trim().toUpperCase(), count: riskAggregate.highPrivilegeGroups.length, granted: riskAggregate.grantedAreaCount, modules: highPrivilegeModuleNames.join(", ") })}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel isDisabled={isSaving}>{t("pages.rolePermissionWorkspace.cancel")}</AlertDialogCancel><AlertDialogAction isDisabled={isSaving} onPress={() => { setShowSaveConfirmation(false); void save(); }}>{t("pages.rolePermissionWorkspace.confirm")}</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
    <AlertDialogContent isOpen={showEmptyConfirmation} onOpenChange={(isOpen) => { if (!isSaving) setShowEmptyConfirmation(isOpen); }}><AlertDialogHeader><AlertDialogMedia><IconInfoCircle aria-hidden="true" /></AlertDialogMedia><AlertDialogTitle>{t("pages.rolePermissionWorkspace.emptyCreateTitle")}</AlertDialogTitle><AlertDialogDescription>{t("pages.rolePermissionWorkspace.emptyCreateDescription")}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel isDisabled={isSaving}>{t("pages.rolePermissionWorkspace.cancel")}</AlertDialogCancel><AlertDialogAction isDisabled={isSaving} onPress={() => { setShowEmptyConfirmation(false); void save(); }}>{t("pages.rolePermissionWorkspace.createAnyway")}</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
  </PageSection>;
  return <PageSection className="flex min-w-0 flex-col gap-5">
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <Button className="w-fit" variant="ghost" onPress={isCreate ? () => setWizardStep(1) : onBack}><IconArrowLeft data-icon="inline-start" aria-hidden="true" />{t(isCreate ? "pages.rolePermissionWorkspace.backToDetails" : "pages.roleManagement.actions.back")}</Button>
      <PageHeader><div>{isCreate ? <p className="mb-1 text-sm font-medium text-primary">{t("pages.rolePermissionWorkspace.stepTwo")}</p> : null}<div className="flex min-w-0 flex-wrap items-center gap-3"><h2 className="flex min-w-0 flex-wrap items-center gap-2"><span>{t(isCreate ? "pages.roleManagement.editor.createTitle" : "pages.roleManagement.editor.editTitle")}{!isCreate ? ":" : ""}</span>{!isCreate ? <span className="truncate" title={getRoleName(role)}>{getRoleName(role)}</span> : null}</h2>{!isCreate ? <Button className="h-auto p-0 text-xs" size="sm" variant="link" aria-expanded={showRoleDetails} onPress={() => setShowRoleDetails((current) => !current)}>{t(showRoleDetails ? "pages.rolePermissionWorkspace.hideDetails" : "pages.rolePermissionWorkspace.editDetails")}<IconChevronDown className={cn(showRoleDetails && "rotate-180")} data-icon="inline-end" aria-hidden="true" /></Button> : null}</div><p>{t(isCreate ? "pages.rolePermissionWorkspace.configureDescription" : "pages.roleManagement.editor.editDescription")}</p></div><div className="flex flex-col items-end gap-1"><Button isDisabled={isSaving || (!isCreate && !isDirty)} onPress={requestSave}>{isSaving ? <Spinner data-icon="inline-start" /> : <IconDeviceFloppy data-icon="inline-start" aria-hidden="true" />}{t(isSaving ? "pages.roleManagement.actions.saving" : isCreate ? "pages.rolePermissionWorkspace.finishCreate" : "pages.roleManagement.actions.save")}</Button>{isCreate ? <p className="max-w-sm text-right text-xs text-muted-foreground">{t("pages.rolePermissionWorkspace.inactiveNote")}</p> : null}</div></PageHeader>
      {!isCreate && showRoleDetails ? <section className="flex flex-col gap-4 border-b pb-5" aria-labelledby="role-details-heading"><div><h3 className="text-base font-semibold" id="role-details-heading">{t("pages.roleManagement.editor.details")}</h3>{role.is_system_role ? <p className="mt-1 text-xs text-muted-foreground">{t("pages.rolePermissionWorkspace.systemDetailsLocked")}</p> : null}</div><div className="grid gap-4 md:grid-cols-3"><Field><FieldLabel htmlFor="edit-role-name">{t("pages.roleManagement.editor.roleName")}</FieldLabel><Input id="edit-role-name" value={roleName} disabled={isSaving || role.is_system_role} onChange={(event) => setRoleName(event.target.value)} /></Field><Field><FieldLabel>{t("pages.roleManagement.columns.scope")}</FieldLabel><ScopeSelect value={scope} disabled={isSaving || Boolean(role.is_system_role)} onChange={setScope} /></Field><Field><FieldLabel>{t("pages.roleManagement.columns.status")}</FieldLabel><div className="flex min-h-9 items-center gap-2"><Switch size="sm" isSelected={isActive} isDisabled={isSaving} aria-label={t("pages.rolePermissionWorkspace.roleStatusLabel")} onChange={setIsActive} /><span className="text-sm">{t(isActive ? "pages.roleManagement.status.active" : "pages.roleManagement.status.inactive")}</span></div></Field></div><div><p className="text-xs text-muted-foreground">{t("pages.roleManagement.editor.code")}</p><p className="mt-1 text-sm font-medium">{role.role_code}</p><p className="mt-1 text-xs text-muted-foreground">{t("pages.rolePermissionWorkspace.codeImmutable")}</p></div>{scope !== (role.role_scope === "GLOBAL" ? "GLOBAL" : "UNIT") ? <div className="flex items-start gap-2 border-l-4 border-warning pl-2.5 text-xs/relaxed" role="status"><IconAlertTriangle className="mt-0.5 text-warning" aria-hidden="true" /><p>{t("pages.rolePermissionWorkspace.scopeChangeWarning")}</p></div> : null}{!isActive && role.is_active !== false ? <div className="flex items-start gap-2 border-l-4 border-warning pl-2.5 text-xs/relaxed" role="status"><IconAlertTriangle className="mt-0.5 text-warning" aria-hidden="true" /><p>{t("pages.rolePermissionWorkspace.deactivateWarning")}</p></div> : null}</section> : null}
      {role.is_system_role ? <Alert><IconShieldLock aria-hidden="true" /><AlertTitle>{t("pages.roleManagement.editor.systemTitle")}</AlertTitle><AlertDescription>{t("pages.roleManagement.editor.systemDescription")}</AlertDescription></Alert> : null}
      <section className="w-full min-w-0" aria-labelledby="permissions-heading">
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle id="permissions-heading" className="text-base font-semibold">{t("pages.roleManagement.editor.permissions")}</CardTitle>
          <CardDescription aria-live="polite">{t("pages.rolePermissionWorkspace.permissionsGrantedCount", { selected: permissions.filter((permission) => selected.has(permission.permission_code)).length, total: permissions.length })}</CardDescription>
          <CardAction>
            <SheetTrigger>
              <Button size="sm" type="button" variant="outline">{t("pages.rolePermissionWorkspace.accessSummary")}</Button>
              <Sheet side="right" className="w-full sm:max-w-md!">
                <SheetHeader className="border-b p-4 pr-12">
                  <SheetTitle>{t("pages.rolePermissionWorkspace.accessSummary")}</SheetTitle>
                  <SheetDescription>{t("pages.rolePermissionWorkspace.accessSummaryDescription")}</SheetDescription>
                </SheetHeader>
                <div className="min-h-0 flex-1 overflow-y-auto p-4">
                  <RoleCapabilitySummary groups={allGroups} selected={selected} totalPermissions={permissions.length} sticky={false} />
                </div>
              </Sheet>
            </SheetTrigger>
          </CardAction>
        </CardHeader>
        <CardContent className="flex min-w-0 flex-col gap-4">
          <div className="flex min-w-0 flex-wrap items-center gap-3"><SearchInput className="w-full min-w-0 sm:w-56 sm:flex-none xl:w-auto xl:min-w-44 xl:flex-1" value={search} onValueChange={setSearch} label={t("pages.roleManagement.editor.searchPermissions")} placeholder={t("pages.roleManagement.editor.searchPermissions")} clearLabel={t("dataTable.clearSearch")} /><Select aria-label={t("pages.roleManagement.editor.categoryFilter")} selectedKey={category} onSelectionChange={(key) => setCategory(String(key))}><SelectTrigger className="w-full sm:w-52"><SelectValue /></SelectTrigger><SelectContent><SelectGroup><SelectItem id="ALL">{t("pages.roleManagement.editor.allCategories")}</SelectItem><SelectItem id="PAGE_ACCESS">{t("pages.roleManagement.editor.pageAccess")}</SelectItem><SelectItem id="MODULE_ACTION">{t("pages.roleManagement.editor.moduleAction")}</SelectItem></SelectGroup></SelectContent></Select><ButtonGroup aria-label={t("pages.roleManagement.editor.bulkActions")}><Button size="sm" variant="outline" isDisabled={!visible.length || isSaving} onPress={() => toggleAll(true)}>{t("pages.roleManagement.editor.selectAll")}</Button><Button size="sm" variant="outline" isDisabled={!visible.length || isSaving} onPress={() => toggleAll(false)}>{t("pages.roleManagement.editor.clearAll")}</Button></ButtonGroup></div>
          <Separator className="my-1 w-full" />
          {isCreate && selected.size === 0 ? <Alert><IconInfoCircle aria-hidden="true" /><AlertTitle>{t("pages.rolePermissionWorkspace.noAccessTitle")}</AlertTitle><AlertDescription>{t("pages.rolePermissionWorkspace.noAccessDescription")}</AlertDescription></Alert> : null}
          {groups.length ? <PermissionModules allGroups={allGroups} groups={groups} selected={selected} disabled={isSaving} onToggle={toggle} onApplyPreset={applyPreset} /> : <Empty className="min-h-40 border"><EmptyHeader><EmptyTitle>{t("pages.roleManagement.editor.noPermissions")}</EmptyTitle><EmptyDescription>{t("pages.roleManagement.editor.noPermissionsDescription")}</EmptyDescription></EmptyHeader></Empty>}
        </CardContent>
      </Card>
      </section>
    </div>
    <AlertDialogContent isOpen={showSaveConfirmation} onOpenChange={(isOpen) => { if (!isSaving) setShowSaveConfirmation(isOpen); }}><AlertDialogHeader><AlertDialogMedia className="bg-destructive/10 text-destructive"><IconAlertTriangle aria-hidden="true" /></AlertDialogMedia><AlertDialogTitle>{t("pages.rolePermissionWorkspace.saveRiskTitle")}</AlertDialogTitle><AlertDialogDescription>{t("pages.rolePermissionWorkspace.saveRiskDescription", { role: isCreate ? roleCode.trim().toUpperCase() : getRoleName(role), count: riskAggregate.highPrivilegeGroups.length, granted: riskAggregate.grantedAreaCount, modules: highPrivilegeModuleNames.join(", ") })}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel isDisabled={isSaving}>{t("pages.rolePermissionWorkspace.cancel")}</AlertDialogCancel><AlertDialogAction isDisabled={isSaving} onPress={() => { setShowSaveConfirmation(false); void save(); }}>{t("pages.rolePermissionWorkspace.confirm")}</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
    <AlertDialogContent isOpen={showEmptyConfirmation} onOpenChange={(isOpen) => { if (!isSaving) setShowEmptyConfirmation(isOpen); }}><AlertDialogHeader><AlertDialogMedia><IconInfoCircle aria-hidden="true" /></AlertDialogMedia><AlertDialogTitle>{t("pages.rolePermissionWorkspace.emptyCreateTitle")}</AlertDialogTitle><AlertDialogDescription>{t("pages.rolePermissionWorkspace.emptyCreateDescription")}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel isDisabled={isSaving}>{t("pages.rolePermissionWorkspace.cancel")}</AlertDialogCancel><AlertDialogAction isDisabled={isSaving} onPress={() => { setShowEmptyConfirmation(false); void save(); }}>{t("pages.rolePermissionWorkspace.createAnyway")}</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
  </PageSection>;
}

function CreateRoleStepIndicator({ currentStep, onStepChange }: { currentStep: 1 | 2 | 3; onStepChange: (step: 1 | 2 | 3) => void }) {
  const { t } = useTranslation("common");
  const steps = [
    { step: 1 as const, label: t("pages.rolePermissionWorkspace.roleDetailsStep") },
    { step: 2 as const, label: t("pages.rolePermissionWorkspace.permissionsStep") },
    { step: 3 as const, label: t("pages.rolePermissionWorkspace.reviewStep") },
  ];
  return <nav aria-label={t("pages.rolePermissionWorkspace.createProgress")}><ol className="flex min-w-0 items-center gap-2 sm:gap-3">{steps.map((item, index) => { const completed = item.step < currentStep; const active = item.step === currentStep; const available = item.step <= currentStep; return <li className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3" key={item.step}><button className="flex min-w-0 items-center gap-2 text-left disabled:cursor-default" type="button" disabled={!available} aria-current={active ? "step" : undefined} onClick={() => onStepChange(item.step)}><span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold", active || completed ? "border-primary bg-primary text-primary-foreground" : "border-border bg-muted text-muted-foreground")}>{completed ? <IconCheck aria-hidden="true" /> : item.step}</span><span className={cn("hidden truncate text-xs sm:block", active ? "font-semibold text-foreground" : completed ? "font-medium text-foreground" : "text-muted-foreground")}>{item.label}</span></button>{index < steps.length - 1 ? <span className={cn("h-px min-w-3 flex-1", completed ? "bg-primary" : "bg-border")} aria-hidden="true" /> : null}</li>; })}</ol></nav>;
}

function PermissionWorkspace({ allGroups, groups, permissions, selected, search, category, visible, disabled, showEmptyGuidance, onSearch, onCategory, onToggle, onToggleAll, onApplyPreset }: { allGroups: ReturnType<typeof groupPermissionsByModule>; groups: ReturnType<typeof groupPermissionsByModule>; permissions: AuthPermission[]; selected: Set<string>; search: string; category: string; visible: AuthPermission[]; disabled: boolean; showEmptyGuidance?: boolean; onSearch: (value: string) => void; onCategory: (value: string) => void; onToggle: (code: string, value: boolean) => void; onToggleAll: (value: boolean) => void; onApplyPreset: (moduleCodes: string[], presetCodes: string[]) => void }) {
  const { t } = useTranslation("common");
  return <Card className="min-w-0"><CardHeader><CardTitle className="text-base font-semibold">{t("pages.roleManagement.editor.permissions")}</CardTitle><CardDescription aria-live="polite">{t("pages.rolePermissionWorkspace.permissionsGrantedCount", { selected: permissions.filter((permission) => selected.has(permission.permission_code)).length, total: permissions.length })}</CardDescription></CardHeader><CardContent className="flex min-w-0 flex-col gap-4"><div className="flex min-w-0 flex-wrap items-center gap-3"><SearchInput className="w-full min-w-0 sm:min-w-44 sm:flex-1" value={search} onValueChange={onSearch} label={t("pages.roleManagement.editor.searchPermissions")} placeholder={t("pages.roleManagement.editor.searchPermissions")} clearLabel={t("dataTable.clearSearch")} /><Select aria-label={t("pages.roleManagement.editor.categoryFilter")} selectedKey={category} onSelectionChange={(key) => onCategory(String(key))}><SelectTrigger className="w-full sm:w-52"><SelectValue /></SelectTrigger><SelectContent><SelectGroup><SelectItem id="ALL">{t("pages.roleManagement.editor.allCategories")}</SelectItem><SelectItem id="PAGE_ACCESS">{t("pages.roleManagement.editor.pageAccess")}</SelectItem><SelectItem id="MODULE_ACTION">{t("pages.roleManagement.editor.moduleAction")}</SelectItem></SelectGroup></SelectContent></Select><ButtonGroup aria-label={t("pages.roleManagement.editor.bulkActions")}><Button size="sm" variant="outline" isDisabled={!visible.length || disabled} onPress={() => onToggleAll(true)}>{t("pages.roleManagement.editor.selectAll")}</Button><Button size="sm" variant="outline" isDisabled={!visible.length || disabled} onPress={() => onToggleAll(false)}>{t("pages.roleManagement.editor.clearAll")}</Button></ButtonGroup></div><Separator className="my-1 w-full" />{showEmptyGuidance && selected.size === 0 ? <Alert><IconInfoCircle aria-hidden="true" /><AlertTitle>{t("pages.rolePermissionWorkspace.noAccessTitle")}</AlertTitle><AlertDescription>{t("pages.rolePermissionWorkspace.noAccessDescription")}</AlertDescription></Alert> : null}{groups.length ? <PermissionModules allGroups={allGroups} groups={groups} selected={selected} disabled={disabled} onToggle={onToggle} onApplyPreset={onApplyPreset} /> : <Empty className="min-h-40 border"><EmptyHeader><EmptyTitle>{t("pages.roleManagement.editor.noPermissions")}</EmptyTitle><EmptyDescription>{t("pages.roleManagement.editor.noPermissionsDescription")}</EmptyDescription></EmptyHeader></Empty>}</CardContent></Card>;
}

function RoleCapabilitySummary({ groups, selected, totalPermissions, showRiskWarning = true, sticky = true }: { groups: ReturnType<typeof groupPermissionsByModule>; selected: Set<string>; totalPermissions: number; showRiskWarning?: boolean; sticky?: boolean }) {
  const { t } = useTranslation("common");
  const capabilities = groups.flatMap((group) => {
    const state = resolveModulePresetState(selected, group);
    if (state.levelKey === "none") return [];
    const moduleName = t(`pages.rolePermissionWorkspace.moduleNames.${group.moduleCode}`, { defaultValue: group.moduleName });
    return [{ moduleCode: group.moduleCode, moduleName, levelKey: state.isCustom ? "custom" : state.levelKey, isHighPrivilege: hasSelectedHighRiskPermission(group, selected) }];
  });
  const highPrivilegeCount = capabilities.filter((capability) => capability.isHighPrivilege).length;
  const selectedPermissionCount = groups.flatMap((group) => group.permissions).filter((permission) => selected.has(permission.permission_code)).length;
  const showHighPrivilegeWarning = highPrivilegeCount > 0;
  const levelOrder = ["full", "publisher", "custom", "approver", "contributor", "view", "reviewer", "submitter", "granted"];
  const capabilityGroups = levelOrder.flatMap((levelKey) => {
    const items = capabilities.filter((capability) => capability.levelKey === levelKey);
    return items.length ? [{ levelKey, items }] : [];
  });

  return <Alert className={cn(sticky && "lg:sticky lg:top-4")}>
    <IconInfoCircle aria-hidden="true" />
    <AlertTitle id="role-capabilities">{t("pages.roleManagement.editor.capabilitiesTitle")}</AlertTitle>
    <AlertDescription aria-labelledby="role-capabilities" aria-live="polite">
      {showRiskWarning && showHighPrivilegeWarning ? <div className="mb-4 flex items-start gap-2"><IconAlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" /><div className="flex min-w-0 flex-col gap-0.5"><p className="font-semibold text-foreground">{t("pages.rolePermissionWorkspace.riskWarningTitle")}</p><p>{t("pages.rolePermissionWorkspace.aggregateRiskSummary", { count: highPrivilegeCount, total: groups.length })}</p></div></div> : null}
      {capabilityGroups.length
        ? <div className="flex flex-col gap-3">{capabilityGroups.map(({ levelKey, items }) => <section key={levelKey} aria-labelledby={`capability-group-${levelKey}`}><h4 className="font-semibold text-foreground" id={`capability-group-${levelKey}`}>{levelKey === "custom" ? t("pages.rolePermissionWorkspace.customAccess") : t(`pages.roleManagement.editor.presetLevels.${levelKey}`)} <span className="font-normal text-muted-foreground">· {t("pages.rolePermissionWorkspace.areaCount", { count: items.length })}</span></h4><ul className="mt-1 flex list-disc flex-col gap-0.5 pl-4">{items.map((capability) => <li key={capability.moduleCode}>{capability.moduleName}</li>)}</ul></section>)}</div>
        : <p>{t("pages.roleManagement.editor.capabilitiesEmpty")}</p>}
      <Separator className="my-3" />
      <div className="grid grid-cols-2 gap-3"><p><strong className="block text-base text-foreground">{capabilities.length} {t("pages.rolePermissionWorkspace.countOf")} {groups.length}</strong><span>{t("pages.rolePermissionWorkspace.areasConfigured")}</span></p><p><strong className="block text-base text-foreground">{selectedPermissionCount} {t("pages.rolePermissionWorkspace.countOf")} {totalPermissions}</strong><span>{t("pages.rolePermissionWorkspace.permissionsGranted")}</span></p></div>
    </AlertDescription>
  </Alert>;
}

function CreateRoleForm({ roleCode, scope, disabled, errors, onCancel, onCode, onScope, onSubmit }: { roleCode: string; scope: string; disabled: boolean; errors: { roleCode?: string; roleScope?: string }; onCancel: () => void; onCode: (value: string) => void; onScope: (value: string) => void; onSubmit: () => void }) {
  const { t } = useTranslation("common");
  const canContinue = roleCode.trim().length > 0 && roleCode.trim().length <= 100 && scope.trim().length > 0 && scope.trim().length <= 20;
  return <form className="mx-auto w-full max-w-3xl" noValidate onSubmit={(event) => { event.preventDefault(); onSubmit(); }}><Card><CardHeader><CardTitle>{t("pages.roleManagement.editor.details")}</CardTitle><CardDescription>{t("pages.rolePermissionWorkspace.createDetailsDescription")}</CardDescription></CardHeader><CardContent><FieldGroup><Field data-invalid={Boolean(errors.roleCode)}><FieldLabel htmlFor="role-code">{t("pages.roleManagement.editor.code")} <span className="text-destructive" aria-hidden="true">*</span></FieldLabel><Input id="role-code" autoFocus maxLength={100} value={roleCode} disabled={disabled} aria-invalid={Boolean(errors.roleCode)} aria-required="true" onChange={(event) => onCode(event.target.value)} /><FieldDescription>{t("pages.roleManagement.editor.codeHelp")}</FieldDescription><FieldError>{errors.roleCode}</FieldError></Field><Field data-invalid={Boolean(errors.roleScope)}><FieldLabel>{t("pages.roleManagement.columns.scope")} <span className="text-destructive" aria-hidden="true">*</span></FieldLabel><ScopeSelect value={scope} disabled={disabled} invalid={Boolean(errors.roleScope)} onChange={onScope} /><FieldDescription>{t("pages.rolePermissionWorkspace.scopeHelp")}</FieldDescription><FieldError>{errors.roleScope}</FieldError></Field></FieldGroup></CardContent><CardFooter className="flex-col-reverse gap-2 border-t sm:flex-row sm:justify-end"><Button className="w-full sm:w-auto" type="button" variant="outline" isDisabled={disabled} onPress={onCancel}>{t("pages.rolePermissionWorkspace.cancel")}</Button><Button className="w-full sm:w-auto" type="submit" isDisabled={disabled || !canContinue}>{t("pages.rolePermissionWorkspace.nextPermissions")}</Button></CardFooter></Card></form>;
}
function ScopeSelect({ value, disabled, invalid = false, onChange }: { value: string; disabled: boolean; invalid?: boolean; onChange: (value: string) => void }) { const { t } = useTranslation("common"); return <Select aria-label={t("pages.roleManagement.columns.scope")} selectedKey={value} isDisabled={disabled} onSelectionChange={(key) => onChange(String(key))}><SelectTrigger className="w-full max-w-40" aria-invalid={invalid} aria-required="true"><SelectValue /></SelectTrigger><SelectContent><SelectGroup><SelectItem id="UNIT">{t("pages.roleManagement.scopes.unit")}</SelectItem><SelectItem id="GLOBAL">{t("pages.roleManagement.scopes.global")}</SelectItem></SelectGroup></SelectContent></Select>; }

function PermissionModules({ allGroups, groups, selected, disabled, onToggle, onApplyPreset }: { allGroups: ReturnType<typeof groupPermissionsByModule>; groups: ReturnType<typeof groupPermissionsByModule>; selected: Set<string>; disabled: boolean; onToggle: (code: string, value: boolean) => void; onApplyPreset: (moduleCodes: string[], presetCodes: string[]) => void }) {
  const { t } = useTranslation("common");
  const [expandedKeys, setExpandedKeys] = useState<Set<string | number>>(new Set());
  const [pendingReplacement, setPendingReplacement] = useState<{ moduleName: string; moduleCode: string; levelKey: string; moduleCodes: string[]; presetCodes: string[]; isHighPrivilege: boolean } | null>(null);
  const orderedGroups = [...groups].sort((first, second) => {
    const firstGroup = allGroups.find((item) => item.moduleCode === first.moduleCode) ?? first;
    const secondGroup = allGroups.find((item) => item.moduleCode === second.moduleCode) ?? second;
    const tierDifference = resolveModulePresetLevels(secondGroup).length - resolveModulePresetLevels(firstGroup).length;
    return tierDifference || first.moduleCode.localeCompare(second.moduleCode);
  });

  function applySelection(selection: NonNullable<typeof pendingReplacement>) {
    onApplyPreset(selection.moduleCodes, selection.presetCodes);
  }

  return <><Accordion className="rounded-none border-0" allowsMultipleExpanded expandedKeys={expandedKeys} onExpandedChange={(keys) => setExpandedKeys(new Set(keys))}>{orderedGroups.map((group) => {
    const fullGroup = allGroups.find((item) => item.moduleCode === group.moduleCode) ?? group;
    const levels = resolveModulePresetLevels(fullGroup);
    const state = resolveModulePresetState(selected, fullGroup);
    const moduleName = t(`pages.rolePermissionWorkspace.moduleNames.${group.moduleCode}`, { defaultValue: group.moduleName });
    const moduleCodes = fullGroup.permissions.map((permission) => permission.permission_code);
    const count = fullGroup.permissions.filter((permission) => selected.has(permission.permission_code)).length;
    return <AccordionItem className="border-b bg-transparent last:border-b-0 data-open:bg-transparent" id={group.moduleCode} key={group.moduleCode}>
      <div className="flex flex-col gap-3 py-4">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0"><div className="flex items-center gap-2"><span className="truncate text-sm font-semibold">{moduleName}</span><Badge variant="secondary">{t("pages.roleManagement.editor.moduleCount", { selected: count, total: fullGroup.permissions.length })}</Badge></div><p className="mt-0.5 truncate text-xs text-muted-foreground">{t(`pages.rolePermissionWorkspace.moduleDescriptions.${group.moduleCode}`, { defaultValue: t("pages.rolePermissionWorkspace.moduleDescriptionFallback") })}</p></div>
          <AccordionTrigger className="flex-none items-center p-0 text-xs no-underline hover:no-underline">{state.isCustom ? <><span className="font-semibold text-foreground">{t("pages.rolePermissionWorkspace.customAccess")}</span><span aria-hidden="true"> · </span><span>{t("pages.rolePermissionWorkspace.customize")}</span></> : t("pages.roleManagement.editor.advanced")}</AccordionTrigger>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <ToggleGroup className="flex-wrap justify-start" aria-label={t("pages.roleManagement.editor.presetsFor", { module: moduleName })} selectionMode="single" disallowEmptySelection selectedKeys={state.isCustom ? new Set() : new Set([state.levelKey])} variant="outline" size="sm" spacing={2} onSelectionChange={(keys) => { const key = Array.from(keys)[0]; const level = levels.find((item) => item.key === key); if (!level) return; const selection = { moduleName, moduleCode: group.moduleCode, levelKey: level.key, moduleCodes, presetCodes: level.permissionCodes, isHighPrivilege: isHighPrivilegePreset(group.presetType, level.key) }; if (state.isCustom) setPendingReplacement(selection); else applySelection(selection); }}>
            {levels.map((level) => { const isSelected = !state.isCustom && state.levelKey === level.key; return <TooltipTrigger key={level.key}><ToggleGroupItem className="h-8 min-w-28 border-border bg-background text-muted-foreground data-selected:border-2 data-selected:border-primary data-selected:bg-primary/15 data-selected:font-semibold data-selected:text-primary data-selected:ring-2 data-selected:ring-primary/30 data-selected:shadow-sm" id={level.key} aria-label={isHighPrivilegePreset(group.presetType, level.key) ? t("pages.rolePermissionWorkspace.highPrivilegePreset", { level: t(`pages.roleManagement.editor.presetLevels.${level.key}`), module: moduleName }) : undefined}>{isSelected ? <IconCheck className="text-primary" data-icon="inline-start" aria-hidden="true" /> : null}{t(`pages.roleManagement.editor.presetLevels.${level.key}`)}</ToggleGroupItem><Tooltip>{t(`pages.rolePermissionWorkspace.tierTooltips.${level.key}`)}</Tooltip></TooltipTrigger>; })}
          </ToggleGroup>
        </div>
      </div>
      <AccordionContent className="pb-0"><div className="flex flex-col">{group.permissions.map((permission, index) => <PermissionRow key={permission.permission_code} permission={permission} selected={selected.has(permission.permission_code)} disabled={disabled || permission.is_active === false} separator={index > 0} onToggle={onToggle} />)}</div></AccordionContent>
    </AccordionItem>;
  })}</Accordion><AlertDialogContent isOpen={Boolean(pendingReplacement)} onOpenChange={(isOpen) => { if (!isOpen) setPendingReplacement(null); }}><AlertDialogHeader><AlertDialogMedia><IconAlertTriangle aria-hidden="true" /></AlertDialogMedia><AlertDialogTitle>{t("pages.rolePermissionWorkspace.replaceCustomTitle")}</AlertDialogTitle><AlertDialogDescription>{t("pages.rolePermissionWorkspace.replaceCustomDescription", { module: pendingReplacement?.moduleName ?? "" })}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>{t("pages.rolePermissionWorkspace.cancel")}</AlertDialogCancel><AlertDialogAction onPress={() => { if (pendingReplacement) applySelection(pendingReplacement); setPendingReplacement(null); }}>{t("pages.rolePermissionWorkspace.continue")}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></>;
}

function isHighPrivilegePreset(presetType: ReturnType<typeof groupPermissionsByModule>[number]["presetType"], levelKey: string): boolean {
  return (presetType === "standard_crud" && levelKey === "full")
    || (presetType === "publication" && levelKey === "publisher")
    || (presetType === "workflow_review" && levelKey === "approver");
}

const HIGH_RISK_ACTIONS = new Set(["approve", "delete", "export", "publish", "reject"]);

function hasSelectedHighRiskPermission(group: ReturnType<typeof groupPermissionsByModule>[number], selected: Set<string>): boolean {
  return group.permissions.some((permission) => selected.has(permission.permission_code) && HIGH_RISK_ACTIONS.has(permission.action_code ?? ""));
}

function getRiskAggregate(groups: ReturnType<typeof groupPermissionsByModule>, selected: Set<string>) {
  const grantedGroups = groups.filter((group) => resolveModulePresetState(selected, group).levelKey !== "none");
  const highPrivilegeGroups = grantedGroups.filter((group) => hasSelectedHighRiskPermission(group, selected));
  const catalogPermissions = groups.flatMap((group) => group.permissions);
  const allPermissionsGranted = catalogPermissions.length > 0 && catalogPermissions.every((permission) => selected.has(permission.permission_code));

  return { grantedAreaCount: grantedGroups.length, highPrivilegeGroups, allPermissionsGranted };
}

function PermissionRow({ permission, selected, disabled, separator, onToggle }: { permission: AuthPermission; selected: boolean; disabled: boolean; separator: boolean; onToggle: (code: string, value: boolean) => void }) {
  const { t } = useTranslation("common");
  const description = permission.description || t("pages.roleManagement.editor.noDescription");
  return <>{separator ? <Separator /> : null}<label className="flex cursor-pointer items-start gap-3 px-3 py-3 transition-colors hover:bg-muted/40 has-focus-visible:bg-muted/40 has-disabled:cursor-not-allowed has-disabled:opacity-60 sm:px-4"><Checkbox className="mt-0.5" aria-label={getPermissionName(permission)} isSelected={selected} isDisabled={disabled} onChange={(value) => onToggle(permission.permission_code, value)} /><span className="min-w-0 flex-1 text-sm text-muted-foreground">{description}</span></label></>;
}
