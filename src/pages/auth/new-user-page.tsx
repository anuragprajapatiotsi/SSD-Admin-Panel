import { PageSection, PageHeader } from "@/components/common/page-layout";

import { Button } from "@/components/ui/button";
import { IconArrowLeft } from "@tabler/icons-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { assignAuthUserRole, createAuthUser, setAuthUserPassword } from "../../api/auth-admin.api";
import { NewUserForm } from "./new-user-form";
import type { NewUserFormValues } from "./new-user-schema";

const USERS_PATH = "/authentication/users";
type AccountProgress = "pending" | "created" | "password-set";

export function NewUserPage() {
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const [accountProgress, setAccountProgress] = useState<AccountProgress>("pending");
  const [serverError, setServerError] = useState("");
  const assignedRoleKeys = useRef(new Set<string>());
  const returnToUsers = () => navigate(USERS_PATH, { replace: true });

  async function createUser(values: NewUserFormValues) {
    const username = values.username.trim().toLowerCase();
    const firstName = optionalValue(values.firstName);
    const lastName = optionalValue(values.lastName);
    const displayName = optionalValue([firstName, lastName].filter(Boolean).join(" "));
    setServerError("");

    let progress = accountProgress;
    try {
      if (progress === "pending") {
        await createAuthUser({
          username,
          email: values.email.trim().toLowerCase(),
          first_name: firstName,
          last_name: lastName,
          display_name: displayName,
          preferred_language_code: "en-IN",
          is_active: true,
          is_system_user: false,
          password_hash: `PASSWORD_SETUP_PENDING_${Date.now()}`,
        });
        progress = "created";
        setAccountProgress(progress);
      }

      if (progress === "created") {
        await setAuthUserPassword(username, values.password);
        progress = "password-set";
        setAccountProgress(progress);
      }

      for (const assignment of values.roleAssignments) {
        const roleCode = assignment.roleCode.trim();
        const unitCode = assignment.unitCode.trim() || "GLOBAL";
        const assignmentKey = `${roleCode.toUpperCase()}::${unitCode.toUpperCase()}`;
        if (assignedRoleKeys.current.has(assignmentKey)) continue;

        await assignAuthUserRole(username, roleCode, unitCode);
        assignedRoleKeys.current.add(assignmentKey);
      }
      toast.success(t("pages.userManagement.feedback.createSuccess"), {
        description: t("pages.userManagement.feedback.createSuccessDescription", { name: displayName ?? username }),
      });
      navigate(USERS_PATH, { replace: true });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : t("pages.userManagement.feedback.createErrorDescription"));
    }
  }

  return (
    <PageSection className="flex min-w-0 flex-col gap-4">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
        <Button className="w-fit" type="button" variant="outline" isDisabled={accountProgress !== "pending"} onPress={returnToUsers}>
          <IconArrowLeft data-icon="inline-start" aria-hidden="true" />
          {t("pages.userManagement.actions.back")}
        </Button>
        <PageHeader>
          <div>
            <h2>{t("pages.userManagement.createTitle")}</h2>
            <p>{t("pages.userManagement.createDescription")}</p>
          </div>
        </PageHeader>
      </div>
      <NewUserForm
        accountLocked={accountProgress !== "pending"}
        onCancel={returnToUsers}
        onSubmit={createUser}
        serverError={serverError}
      />
    </PageSection>
  );
}

function optionalValue(value: string): string | undefined {
  const normalized = value.trim();
  return normalized || undefined;
}
