export type EmailRecipientOrigin = {
  type: "template" | "officer" | "manual";
  key: string;
};

export type EmailRecipient = {
  id: string;
  email: string;
  displayName?: string;
  designation?: string;
  officerCode?: string;
  organizationCode?: string;
  origins: EmailRecipientOrigin[];
};

export function normalizeRecipientEmail(email: string) {
  return email.trim().toLocaleLowerCase();
}

export function createEmailRecipient(
  email: string,
  origin: EmailRecipientOrigin,
  details: Partial<Omit<EmailRecipient, "id" | "email" | "origins">> = {},
): EmailRecipient {
  const normalizedEmail = normalizeRecipientEmail(email);
  return {
    id: normalizedEmail,
    email: email.trim(),
    origins: [origin],
    ...details,
  };
}
