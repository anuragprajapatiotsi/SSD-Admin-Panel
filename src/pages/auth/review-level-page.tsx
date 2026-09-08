import { PageSection, PageHeader } from "@/components/common/page-layout";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { formatCodeLabel } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CircleAlert, ClipboardCheck, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  assignAuthUserReviewLevel,
  getAuthUser,
  listAuthReviewWorkflows,
  listAuthRoles,
  listAuthUnits,
  removeAuthUserReviewLevel,
  type AuthReviewWorkflow,
  type AuthRole,
  type AuthUnit,
  type AuthUser,
  type AuthUserReviewLevel,
} from "../../api/auth-admin.api";
import { createReviewLevelSchema, DEFAULT_REVIEW_LEVEL_VALUES, type ReviewLevelFormValues } from "./review-level-schema";

const USERS_PATH = "/authentication/users";

function userName(user: AuthUser): string {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  return fullName || user.display_name?.trim() || user.username;
}

function workflowLabel(workflow: AuthReviewWorkflow): string {
  return workflow.workflow_name?.trim() || formatCodeLabel(workflow.workflow_code);
}

function roleLabel(role: AuthRole): string {
  return role.role_name?.trim() || role.display_name?.trim() || role.name?.trim() || formatCodeLabel(role.role_code);
}

function pillarLabel(pillar: AuthUnit): string {
  return pillar.unit_name?.trim() || pillar.display_name?.trim() || pillar.name?.trim() || formatCodeLabel(pillar.unit_code);
}

function levelLabel(level: NonNullable<AuthReviewWorkflow["levels"]>[number], levelPrefix: string): string {
  const name = level.level_name?.trim() || formatCodeLabel(level.level_code);
  return level.level_number ? `${levelPrefix} ${level.level_number} — ${name}` : name;
}

function assignmentKey(level: AuthUserReviewLevel): string {
  return `${level.workflow_code ?? "workflow"}:${level.level_code ?? "level"}`;
}

export function ReviewLevelPage() {
  const { username = "" } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const schema = useMemo(() => createReviewLevelSchema(t), [t]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [workflows, setWorkflows] = useState<AuthReviewWorkflow[]>([]);
  const [roles, setRoles] = useState<AuthRole[]>([]);
  const [pillars, setPillars] = useState<AuthUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [removingKey, setRemovingKey] = useState("");

  const { control, formState: { errors, isSubmitting }, handleSubmit, reset, setValue } = useForm<ReviewLevelFormValues>({
    defaultValues: DEFAULT_REVIEW_LEVEL_VALUES,
    mode: "onSubmit",
    reValidateMode: "onChange",
    resolver: zodResolver(schema),
  });
  const selectedWorkflowCode = useWatch({ control, name: "workflowCode" });
  const selectedWorkflow = useMemo(
    () => workflows.find((workflow) => workflow.workflow_code === selectedWorkflowCode),
    [selectedWorkflowCode, workflows],
  );
  const availableLevels = selectedWorkflow?.levels?.filter((level) => level.is_active !== false) ?? [];

  const loadPage = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      if (!username) throw new Error(t("pages.userManagement.reviewLevel.identifierRequired"));
      const [userResult, workflowResult, roleResult, pillarResult] = await Promise.all([
        getAuthUser(username),
        listAuthReviewWorkflows(false),
        listAuthRoles(false),
        listAuthUnits(false),
      ]);
      setUser(userResult);
      setWorkflows(workflowResult);
      setRoles(roleResult);
      setPillars(pillarResult);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : t("pages.userManagement.reviewLevel.loadError"));
    } finally {
      setIsLoading(false);
    }
  }, [t, username]);

  useEffect(() => {
    void Promise.resolve().then(loadPage);
  }, [loadPage]);

  async function submit(values: ReviewLevelFormValues) {
    if (!user) return;
    try {
      const updatedUser = await assignAuthUserReviewLevel(user.username, {
        workflow_code: values.workflowCode,
        level_code: values.levelCode,
        role_code: values.roleCode === "NONE" ? undefined : values.roleCode,
        unit_code: values.pillarCode === "GLOBAL" ? undefined : values.pillarCode,
      });
      setUser(updatedUser);
      reset(DEFAULT_REVIEW_LEVEL_VALUES);
      toast.success(t("pages.userManagement.reviewLevel.success"), {
        description: t("pages.userManagement.reviewLevel.successDescription", { name: userName(user) }),
      });
    } catch (error) {
      toast.error(t("pages.userManagement.reviewLevel.assignError"), {
        description: error instanceof Error ? error.message : t("pages.userManagement.reviewLevel.reviewSelection"),
      });
    }
  }

  async function removeAssignment(level: AuthUserReviewLevel) {
    if (!user || !level.workflow_code || !level.level_code) return;
    const key = assignmentKey(level);
    setRemovingKey(key);
    try {
      const updatedUser = await removeAuthUserReviewLevel(user.username, {
        workflow_code: level.workflow_code,
        level_code: level.level_code,
      });
      setUser(updatedUser);
      toast.success(t("pages.userManagement.reviewLevel.removed"), {
        description: t("pages.userManagement.reviewLevel.removedDescription", { level: level.level_name || formatCodeLabel(level.level_code), name: userName(user) }),
      });
    } catch (error) {
      toast.error(t("pages.userManagement.reviewLevel.removeError"), {
        description: error instanceof Error ? error.message : t("pages.userManagement.feedback.tryAgain"),
      });
    } finally {
      setRemovingKey("");
    }
  }

  const returnToUsers = () => navigate(USERS_PATH);
  const assignments = user?.review_levels ?? [];

  return (
    <PageSection className="flex min-w-0 flex-col gap-4">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-3">
        <Button className="w-fit" type="button" variant="outline" onPress={returnToUsers}>
          <ArrowLeft data-icon="inline-start" aria-hidden="true" /> {t("pages.userManagement.actions.back")}
        </Button>
        <PageHeader>
          <div><h2>{t("pages.userManagement.reviewLevelTitle")}</h2><p>{t("pages.userManagement.reviewLevelDescription")}</p></div>
        </PageHeader>
      </div>

      {isLoading ? (
        <div className="mx-auto flex min-h-48 w-full max-w-xl items-center justify-center" aria-label={t("pages.userManagement.reviewLevel.loading")}><Spinner className="size-5" /></div>
      ) : loadError || !user ? (
        <Alert className="mx-auto w-full max-w-xl" variant="destructive">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>{t("pages.userManagement.reviewLevel.unableToLoad")}</AlertTitle>
          <AlertDescription>{loadError || t("pages.userManagement.reviewLevel.notFound")}</AlertDescription>
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
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><ClipboardCheck className="size-4" aria-hidden="true" /></div>
                <div className="min-w-0">
                  <CardTitle className="break-words">{userName(user)}</CardTitle>
                  <CardDescription className="break-all">{user.email || user.username}</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-6">
              <FieldGroup>
                <Controller control={control} name="workflowCode" render={({ field }) => (
                  <Field className="gap-1" data-invalid={Boolean(errors.workflowCode)}>
                    <FieldLabel htmlFor="review-workflow">{t("pages.userManagement.fields.workflow")} <span aria-hidden="true">*</span></FieldLabel>
                    <Select aria-label={t("pages.userManagement.fields.workflow")} selectedKey={field.value || null} isDisabled={isSubmitting} onSelectionChange={(key) => { field.onChange(String(key ?? "")); setValue("levelCode", "", { shouldValidate: false }); }}>
                      <SelectTrigger id="review-workflow" aria-invalid={Boolean(errors.workflowCode)}><SelectValue /></SelectTrigger>
                      <SelectContent><SelectGroup>{workflows.map((workflow) => <SelectItem id={workflow.workflow_code} key={workflow.workflow_code}>{workflowLabel(workflow)}</SelectItem>)}</SelectGroup></SelectContent>
                    </Select>
                    <FieldDescription>{t("pages.userManagement.reviewLevel.workflowHelp")}</FieldDescription>
                    <FieldError>{errors.workflowCode?.message}</FieldError>
                  </Field>
                )} />

                <Controller control={control} name="levelCode" render={({ field }) => (
                  <Field className="gap-1" data-invalid={Boolean(errors.levelCode)}>
                    <FieldLabel htmlFor="review-level">{t("pages.userManagement.fields.reviewLevel")} <span aria-hidden="true">*</span></FieldLabel>
                    <Select aria-label={t("pages.userManagement.fields.reviewLevel")} selectedKey={field.value || null} isDisabled={isSubmitting || !selectedWorkflow} onSelectionChange={(key) => field.onChange(String(key ?? ""))}>
                      <SelectTrigger id="review-level" aria-invalid={Boolean(errors.levelCode)}><SelectValue /></SelectTrigger>
                      <SelectContent><SelectGroup>{availableLevels.map((level) => <SelectItem id={level.level_code || ""} key={level.level_code}>{levelLabel(level, t("pages.userManagement.fields.reviewLevel"))}</SelectItem>)}</SelectGroup></SelectContent>
                    </Select>
                    <FieldDescription>{t(selectedWorkflow ? "pages.userManagement.reviewLevel.levelHelp" : "pages.userManagement.reviewLevel.selectWorkflowFirst")}</FieldDescription>
                    <FieldError>{errors.levelCode?.message}</FieldError>
                  </Field>
                )} />

                <Controller control={control} name="roleCode" render={({ field }) => (
                  <Field className="gap-1">
                    <FieldLabel htmlFor="review-role">{t("pages.userManagement.fields.linkedRole")}</FieldLabel>
                    <Select aria-label={t("pages.userManagement.fields.linkedRole")} selectedKey={field.value} isDisabled={isSubmitting} onSelectionChange={(key) => field.onChange(String(key ?? "NONE"))}>
                      <SelectTrigger id="review-role"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectGroup><SelectItem id="NONE">{t("pages.userManagement.reviewLevel.noLinkedRole")}</SelectItem>{roles.map((role) => <SelectItem id={role.role_code} key={role.role_code}>{roleLabel(role)}</SelectItem>)}</SelectGroup></SelectContent>
                    </Select>
                    <FieldDescription>{t("pages.userManagement.reviewLevel.roleHelp")}</FieldDescription>
                  </Field>
                )} />

                <Controller control={control} name="pillarCode" render={({ field }) => (
                  <Field className="gap-1" data-invalid={Boolean(errors.pillarCode)}>
                    <FieldLabel htmlFor="review-pillar">{t("pages.userManagement.fields.pillar")} <span aria-hidden="true">*</span></FieldLabel>
                    <Select aria-label={t("pages.userManagement.fields.pillar")} selectedKey={field.value} isDisabled={isSubmitting} onSelectionChange={(key) => field.onChange(String(key ?? "GLOBAL"))}>
                      <SelectTrigger id="review-pillar" aria-invalid={Boolean(errors.pillarCode)}><SelectValue /></SelectTrigger>
                      <SelectContent><SelectGroup><SelectItem id="GLOBAL">{t("pages.userManagement.assignRole.globalAccess")}</SelectItem>{pillars.map((pillar) => <SelectItem id={pillar.unit_code} key={pillar.unit_code}>{pillarLabel(pillar)}</SelectItem>)}</SelectGroup></SelectContent>
                    </Select>
                    <FieldDescription>{t("pages.userManagement.reviewLevel.pillarHelp")}</FieldDescription>
                    <FieldError>{errors.pillarCode?.message}</FieldError>
                  </Field>
                )} />
              </FieldGroup>

              <section className="flex flex-col gap-3 border-t pt-5" aria-labelledby="current-review-levels-heading">
                <div><h3 id="current-review-levels-heading" className="text-sm font-medium">{t("pages.userManagement.reviewLevel.currentLevels")}</h3><p className="text-xs text-muted-foreground">{t("pages.userManagement.reviewLevel.currentLevelsDescription")}</p></div>
                {assignments.length === 0 ? (
                  <div className="rounded-lg border border-dashed px-3 py-5 text-center text-xs text-muted-foreground">{t("pages.userManagement.reviewLevel.noLevels")}</div>
                ) : (
                  <div className={`divide-y rounded-lg border ${assignments.length > 2 ? "max-h-[7.5rem] overflow-y-auto overscroll-contain" : ""}`}>
                    {assignments.map((level) => {
                      const key = assignmentKey(level);
                      return (
                        <div className="flex items-center justify-between gap-3 px-3 py-2.5" key={key}>
                          <div className="min-w-0">
                            <p className="break-words text-xs font-medium">{level.level_name || formatCodeLabel(level.level_code)}</p>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {level.workflow_code ? <Badge variant="outline">{workflows.find((workflow) => workflow.workflow_code === level.workflow_code)?.workflow_name || formatCodeLabel(level.workflow_code)}</Badge> : null}
                              {level.unit_code ? <Badge variant="secondary">{pillars.find((pillar) => pillar.unit_code === level.unit_code)?.unit_name || formatCodeLabel(level.unit_code)}</Badge> : <Badge variant="secondary">{t("pages.userManagement.reviewLevel.global")}</Badge>}
                            </div>
                          </div>
                          <Button aria-label={t("pages.userManagement.reviewLevel.removeLabel", { level: level.level_name ?? level.level_code ?? t("pages.userManagement.fields.reviewLevel") })} size="icon-sm" type="button" variant="ghost" isDisabled={isSubmitting || Boolean(removingKey)} onPress={() => void removeAssignment(level)}>
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
                {isSubmitting ? <Spinner data-icon="inline-start" aria-hidden="true" /> : <ClipboardCheck data-icon="inline-start" aria-hidden="true" />}
                {t(isSubmitting ? "pages.userManagement.actions.savingReviewLevel" : "pages.userManagement.actions.saveReviewLevel")}
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </PageSection>
  );
}
