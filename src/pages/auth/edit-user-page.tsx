import { PageSection, PageHeader } from "@/components/common/page-layout";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, CircleAlert, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getAuthUser, updateAuthUser, type AuthUser } from "../../api/auth-admin.api";
import { EditUserForm } from "./edit-user-form";
import type { EditUserFormValues } from "./edit-user-schema";

const USERS_PATH = "/authentication/users";

export function EditUserPage() {
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const { username = "" } = useParams<{ username: string }>();
  const [user, setUser] = useState<AuthUser>();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [serverError, setServerError] = useState("");
  const returnToUsers = () => navigate(USERS_PATH);

  const loadUser = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      if (!username) throw new Error(t("pages.userManagement.feedback.identifierRequired"));
      setUser(await getAuthUser(username));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : t("pages.userManagement.feedback.loadUserError"));
    } finally {
      setIsLoading(false);
    }
  }, [t, username]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadUser(), 0);
    return () => window.clearTimeout(timer);
  }, [loadUser]);

  async function updateUser(values: EditUserFormValues) {
    if (!user) return;
    const firstName = values.firstName.trim();
    const lastName = values.lastName.trim();
    setServerError("");
    try {
      await updateAuthUser(user.username, {
        email: values.email.trim().toLowerCase(),
        first_name: firstName,
        last_name: lastName,
        display_name: `${firstName} ${lastName}`.trim(),
        mobile_number: optionalValue(values.mobileNumber),
        preferred_language_code: optionalValue(values.preferredLanguageCode),
        is_active: values.isActive,
      });
      toast.success(t("pages.userManagement.feedback.updateSuccess"), { description: t("pages.userManagement.feedback.updateSuccessDescription", { name: `${firstName} ${lastName}`.trim() }) });
      navigate(USERS_PATH, { replace: true });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : t("pages.userManagement.feedback.updateErrorDescription"));
    }
  }

  return (
    <PageSection className="flex min-w-0 flex-col gap-4">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
        <Button className="w-fit" type="button" variant="outline" onPress={returnToUsers}>
          <ArrowLeft data-icon="inline-start" aria-hidden="true" />
          {t("pages.userManagement.actions.back")}
        </Button>
        <PageHeader>
          <div><h2>{t("pages.userManagement.editTitle")}</h2><p>{t("pages.userManagement.editDescription")}</p></div>
        </PageHeader>
      </div>

      {isLoading ? (
        <Alert className="mx-auto w-full max-w-3xl">
          <Spinner aria-hidden="true" />
          <AlertTitle>{t("pages.userManagement.feedback.loadingUser")}</AlertTitle>
          <AlertDescription>{t("pages.userManagement.feedback.loadingUserDescription")}</AlertDescription>
        </Alert>
      ) : null}

      {loadError ? (
        <Alert className="mx-auto w-full max-w-3xl" variant="destructive">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>{t("pages.userManagement.feedback.loadUserErrorTitle")}</AlertTitle>
          <AlertDescription className="flex flex-col items-start gap-2">
            <span>{loadError}</span>
            <Button size="sm" type="button" variant="outline" onPress={() => void loadUser()}>
              <RefreshCw data-icon="inline-start" aria-hidden="true" />
              {t("pages.userManagement.actions.tryAgain")}
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {user && !isLoading ? (
        <EditUserForm
          key={user.username}
          defaultValues={{
            firstName: user.first_name ?? "",
            lastName: user.last_name ?? "",
            username: user.username,
            email: user.email ?? "",
            mobileNumber: user.mobile_number ?? "",
            preferredLanguageCode: user.preferred_language_code ?? "en-IN",
            isActive: user.is_active !== false,
            isSystemUser: user.is_system_user === true,
          }}
          onCancel={returnToUsers}
          onSubmit={updateUser}
          serverError={serverError}
        />
      ) : null}
    </PageSection>
  );
}

function optionalValue(value: string): string | undefined {
  const normalized = value.trim();
  return normalized || undefined;
}
