import { IconArrowLeft, IconKey, IconLogout } from "@tabler/icons-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePassword, clearAuthSession } from "@/api/session.api";
import { PasswordField } from "@/components/auth/password-field";
import { PageSection } from "@/components/common/page-layout";
import { AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { passwordSchema } from "@/lib/password-policy";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "account.profile.password.currentRequired"),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, "account.profile.password.confirmRequired"),
}).refine((values) => values.newPassword === values.confirmPassword, {
  message: "account.profile.password.noMatch",
  path: ["confirmPassword"],
});

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export function ChangePasswordPage() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const [pendingChange, setPendingChange] = useState<ChangePasswordValues | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const form = useForm<ChangePasswordValues>({
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
    resolver: zodResolver(changePasswordSchema),
  });
  const newPassword = useWatch({ control: form.control, name: "newPassword" });
  const confirmPassword = useWatch({ control: form.control, name: "confirmPassword" });
  const returnToAccount = () => navigate("/account");

  async function confirmChange() {
    if (!pendingChange) return;
    setIsChangingPassword(true);
    try {
      const response = await changePassword(pendingChange.currentPassword, pendingChange.newPassword);
      if (!response.password_updated) throw new Error(t("account.profile.password.error"));
      form.reset();
      toast.success(t("account.profile.password.success"));
      clearAuthSession();
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(t("account.profile.password.error"), { description: error instanceof Error ? error.message : undefined });
      setPendingChange(null);
    } finally {
      setIsChangingPassword(false);
    }
  }

  return (
    <PageSection>
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
        <Button className="w-fit" type="button" variant="outline" onPress={returnToAccount}>
          <IconArrowLeft data-icon="inline-start" aria-hidden="true" />
          {t("account.profile.password.back")}
        </Button>
        <header>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-primary">{t("account.profile.password.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("account.profile.password.description")}</p>
        </header>

        <form noValidate onSubmit={form.handleSubmit(setPendingChange)}>
          <Card>
            <CardHeader className="sr-only">
              <CardTitle>{t("account.profile.password.title")}</CardTitle>
              <CardDescription>{t("account.profile.password.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <PasswordField id="current-password" label={t("account.profile.password.current")} error={form.formState.errors.currentPassword?.message ? t(form.formState.errors.currentPassword.message) : undefined} inputProps={{ autoComplete: "current-password", autoFocus: true, disabled: isChangingPassword, ...form.register("currentPassword") }} />
                <PasswordField id="account-new-password" label={t("account.profile.password.new")} showStrength value={newPassword} error={form.formState.errors.newPassword?.message ? t(form.formState.errors.newPassword.message) : undefined} inputProps={{ autoComplete: "new-password", disabled: isChangingPassword, ...form.register("newPassword") }} />
                <PasswordField id="account-confirm-password" label={t("account.profile.password.confirm")} comparisonValue={newPassword} value={confirmPassword} error={form.formState.errors.confirmPassword?.message ? t(form.formState.errors.confirmPassword.message) : undefined} inputProps={{ autoComplete: "new-password", disabled: isChangingPassword, ...form.register("confirmPassword") }} />
              </FieldGroup>
            </CardContent>
            <CardFooter className="flex-col-reverse gap-2 border-t sm:flex-row sm:justify-end">
              <Button className="w-full sm:w-auto" type="button" variant="outline" isDisabled={isChangingPassword} onPress={returnToAccount}>{t("account.profile.password.cancel")}</Button>
              <Button className="w-full sm:w-auto" type="submit" isDisabled={isChangingPassword}>
                <IconKey data-icon="inline-start" aria-hidden="true" />
                {t("account.profile.password.submit")}
              </Button>
            </CardFooter>
          </Card>
        </form>

        <AlertDialogContent isOpen={Boolean(pendingChange)} onOpenChange={(isOpen) => { if (!isOpen && !isChangingPassword) setPendingChange(null); }}>
          <AlertDialogHeader>
            <AlertDialogMedia><IconLogout aria-hidden="true" /></AlertDialogMedia>
            <AlertDialogTitle>{t("account.profile.password.confirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("account.profile.password.confirmDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel isDisabled={isChangingPassword}>{t("account.profile.password.cancel")}</AlertDialogCancel>
            <AlertDialogAction isDisabled={isChangingPassword} onPress={() => void confirmChange()}>
              {isChangingPassword ? <Spinner data-icon="inline-start" aria-hidden="true" /> : null}
              {isChangingPassword ? t("account.profile.password.saving") : t("account.profile.password.confirmAction")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </div>
    </PageSection>
  );
}
