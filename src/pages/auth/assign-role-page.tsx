import { PageSection, PageHeader } from "@/components/common/page-layout";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { formatCodeLabel } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CircleAlert, ShieldCheck, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  assignAuthUserRole,
  getAuthUser,
  listAuthRoles,
  listAuthUnits,
  revokeAuthUserRole,
  type AuthRole,
  type AuthUnit,
  type AuthUser,
  type AuthUserRoleAssignment,
} from "../../api/auth-admin.api";
import { createAssignRoleSchema, DEFAULT_ASSIGN_ROLE_VALUES, type AssignRoleFormValues } from "./assign-role-schema";
import { RoleAssignmentFields } from "./role-assignment-fields";

const USERS_PATH = "/authentication/users";

function userName(user: AuthUser): string {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  return fullName || user.display_name?.trim() || user.username;
}

function assignmentKey(assignment: AuthUserRoleAssignment): string {
  return `${assignment.role_code ?? "role"}:${assignment.unit_code ?? "GLOBAL"}`;
}

export function AssignRolePage() {
  const { username = "" } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const schema = useMemo(() => createAssignRoleSchema(t), [t]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [roles, setRoles] = useState<AuthRole[]>([]);
  const [units, setUnits] = useState<AuthUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [removingKey, setRemovingKey] = useState("");
  const [roleToRemove, setRoleToRemove] = useState<AuthUserRoleAssignment | null>(null);

  const { control, formState: { errors, isSubmitting }, handleSubmit, reset } = useForm<AssignRoleFormValues>({
    defaultValues: DEFAULT_ASSIGN_ROLE_VALUES,
    mode: "onSubmit",
    reValidateMode: "onChange",
    resolver: zodResolver(schema),
  });

  const loadPage = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      if (!username) throw new Error(t("pages.userManagement.assignRole.identifierRequired"));
      const [userResult, roleResult, unitResult] = await Promise.all([
        getAuthUser(username),
        listAuthRoles(false),
        listAuthUnits(false),
      ]);
      setUser(userResult);
      setRoles(roleResult);
      setUnits(unitResult);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : t("pages.userManagement.assignRole.loadError"));
    } finally {
      setIsLoading(false);
    }
  }, [t, username]);

  useEffect(() => {
    void Promise.resolve().then(loadPage);
  }, [loadPage]);

  const assignments = useMemo(
    () => user?.roles ?? user?.role_assignments ?? [],
    [user],
  );

  async function submit(values: AssignRoleFormValues) {
    if (!user) return;
    try {
      const updatedUser = await assignAuthUserRole(user.username, values.roleCode, values.unitCode);
      setUser(updatedUser);
      reset(DEFAULT_ASSIGN_ROLE_VALUES);
      toast.success(t("pages.userManagement.assignRole.success"));
    } catch (error) {
      toast.error(t("pages.userManagement.assignRole.assignError"), {
        description: error instanceof Error ? error.message : t("pages.userManagement.assignRole.reviewSelection"),
      });
    }
  }

  async function removeAssignment(assignment: AuthUserRoleAssignment) {
    if (!user || !assignment.role_code) return;
    const key = assignmentKey(assignment);
    setRemovingKey(key);
    try {
      const updatedUser = await revokeAuthUserRole(user.username, assignment.role_code, assignment.unit_code);
      setUser(updatedUser);
      toast.success(t("pages.userManagement.assignRole.removed"), {
        description: t("pages.userManagement.assignRole.removedDescription", { role: assignment.role_name ?? formatCodeLabel(assignment.role_code), name: userName(user) }),
      });
    } catch (error) {
      toast.error(t("pages.userManagement.assignRole.removeError"), {
        description: error instanceof Error ? error.message : t("pages.userManagement.feedback.tryAgain"),
      });
    } finally {
      setRemovingKey("");
    }
  }

  const returnToUsers = () => navigate(USERS_PATH);

  return (
    <PageSection className="flex min-w-0 flex-col gap-4">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-3">
        <Button className="w-fit" type="button" variant="outline" onPress={returnToUsers}>
          <ArrowLeft data-icon="inline-start" aria-hidden="true" />
          {t("pages.userManagement.actions.back")}
        </Button>
        <PageHeader>
          <div>
            <h2>{t("pages.userManagement.assignRoleTitle")}</h2>
            <p>{t("pages.userManagement.assignRoleDescription")}</p>
          </div>
        </PageHeader>
      </div>

      {isLoading ? (
        <div className="mx-auto flex min-h-48 w-full max-w-xl items-center justify-center" aria-label={t("pages.userManagement.assignRole.loading")}>
          <Spinner className="size-5" />
        </div>
      ) : loadError || !user ? (
        <Alert className="mx-auto w-full max-w-xl" variant="destructive">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>{t("pages.userManagement.assignRole.unableToLoad")}</AlertTitle>
          <AlertDescription>{loadError || t("pages.userManagement.assignRole.notFound")}</AlertDescription>
          <div className="col-start-2 mt-2 flex gap-2">
            <Button size="sm" variant="outline" onPress={() => void loadPage()}>{t("pages.userManagement.actions.tryAgain")}</Button>
            <Button size="sm" variant="ghost" onPress={returnToUsers}>{t("pages.userManagement.actions.backToUsers")}</Button>
          </div>
        </Alert>
      ) : (
        <form className="mx-auto w-full max-w-xl" noValidate onSubmit={handleSubmit(submit)}>
          <Card>
            <CardHeader>
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="size-4" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="break-words">{userName(user)}</CardTitle>
                  <CardDescription className="break-all">{user.email || user.username}</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-6">
              <RoleAssignmentFields
                allowGlobalAccess={false}
                control={control}
                idPrefix="assign"
                isDisabled={isSubmitting}
                roleError={errors.roleCode?.message}
                roleName="roleCode"
                roles={roles}
                unitError={errors.unitCode?.message}
                unitName="unitCode"
                units={units}
              />

              <section className="flex flex-col gap-3 border-t pt-5" aria-labelledby="current-roles-heading">
                <div>
                  <h3 id="current-roles-heading" className="text-sm font-medium">{t("pages.userManagement.assignRole.currentRoles")}</h3>
                  <p className="text-xs text-muted-foreground">{t("pages.userManagement.assignRole.currentRolesDescription")}</p>
                </div>
                {assignments.length === 0 ? (
                  <div className="rounded-lg border border-dashed px-3 py-5 text-center text-xs text-muted-foreground">{t("pages.userManagement.assignRole.noRoles")}</div>
                ) : (
                  <div className={`divide-y rounded-lg border ${assignments.length > 2 ? "max-h-[7.5rem] overflow-y-auto overscroll-contain" : ""}`}>
                    {assignments.map((assignment) => {
                      const key = assignmentKey(assignment);
                      return (
                        <div className="flex items-center justify-between gap-3 px-3 py-2.5" key={key}>
                          <div className="min-w-0">
                            <p className="break-words text-xs font-medium">{assignment.role_name || formatCodeLabel(assignment.role_code)}</p>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              <Badge variant="outline">{assignment.unit_name || formatCodeLabel(assignment.unit_code || "GLOBAL")}</Badge>
                              {assignment.is_active === false ? <Badge variant="destructive">{t("pages.userManagement.status.inactive")}</Badge> : null}
                            </div>
                          </div>
                          <Button aria-label={t("pages.userManagement.assignRole.removeLabel", { role: assignment.role_name ?? assignment.role_code ?? t("pages.userManagement.fields.role") })} size="icon-sm" type="button" variant="ghost" isDisabled={isSubmitting || Boolean(removingKey)} onPress={() => setRoleToRemove(assignment)}>
                            {removingKey === key ? <Spinner aria-hidden="true" /> : <Trash2 aria-hidden="true" />}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </CardContent>

            <CardFooter className="flex-col-reverse gap-2 border-t sm:flex-row sm:justify-end">
              <Button className="w-full sm:w-auto" type="button" variant="outline" isDisabled={isSubmitting || Boolean(removingKey)} onPress={returnToUsers}>{t("pages.userManagement.actions.cancel")}</Button>
              <Button className="w-full sm:w-auto" type="submit" isDisabled={isSubmitting || Boolean(removingKey)}>
                {isSubmitting ? <Spinner data-icon="inline-start" aria-hidden="true" /> : <ShieldCheck data-icon="inline-start" aria-hidden="true" />}
                {t(isSubmitting ? "pages.userManagement.actions.assigningRole" : "pages.userManagement.actions.assignRole")}
              </Button>
            </CardFooter>
          </Card>

          <AlertDialogContent isOpen={Boolean(roleToRemove)} onOpenChange={(isOpen) => { if (!isOpen) setRoleToRemove(null); }}>
            <AlertDialogHeader>
              <AlertDialogMedia className="bg-destructive/10 text-destructive">
                <Trash2 aria-hidden="true" />
              </AlertDialogMedia>
              <AlertDialogTitle>{t("pages.userManagement.assignRole.removeTitle")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("pages.userManagement.assignRole.removeDescription", { role: roleToRemove?.role_name || formatCodeLabel(roleToRemove?.role_code), name: userName(user) })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel type="button">{t("pages.userManagement.actions.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                type="button"
                variant="destructive"
                onPress={() => {
                  const assignment = roleToRemove;
                  setRoleToRemove(null);
                  if (assignment) void removeAssignment(assignment);
                }}
              >
                {t("pages.userManagement.actions.removeRole")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </form>
      )}
    </PageSection>
  );
}
