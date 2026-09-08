import { z } from "zod";

export const PASSWORD_REQUIREMENTS = [
  {
    label: "8 or more characters",
    message: "auth.newPassword.validation.minLength",
    test: (value: string) => value.length >= 8,
  },
  {
    label: "Uppercase letter",
    message: "auth.newPassword.validation.uppercase",
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    label: "Lowercase letter",
    message: "auth.newPassword.validation.lowercase",
    test: (value: string) => /[a-z]/.test(value),
  },
  {
    label: "Number",
    message: "auth.newPassword.validation.number",
    test: (value: string) => /\d/.test(value),
  },
  {
    label: "Special character",
    message: "auth.newPassword.validation.special",
    test: (value: string) => /[^A-Za-z0-9]/.test(value),
  },
] as const;

export const passwordSchema = z.string().superRefine((value, context) => {
  PASSWORD_REQUIREMENTS.forEach((requirement) => {
    if (!requirement.test(value)) {
      context.addIssue({ code: "custom", message: requirement.message });
    }
  });
});

export function passwordRequirementResults(value: string) {
  return PASSWORD_REQUIREMENTS.map((requirement) => ({
    ...requirement,
    met: requirement.test(value),
  }));
}
