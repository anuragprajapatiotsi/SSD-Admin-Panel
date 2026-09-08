import { useEffect, useRef, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { IconExternalLink } from "@tabler/icons-react";
import { LinkButton } from "@/components/ui/button";
import { useConfirmation } from "@/hooks/use-confirmation";

type ExternalLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

/** External navigation is exposed only after the shared confirmation is accepted. */
export function ExternalLink({ href, children, className }: ExternalLinkProps) {
  const { t } = useTranslation("common");
  const confirm = useConfirmation();
  const pending = useRef(false);
  const active = useRef(true);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);

  let destination: string | undefined;
  try {
    const url = new URL(href);
    if (["https:", "http:"].includes(url.protocol) && !url.username && !url.password) destination = url.href;
  } catch { /* Invalid or non-web destinations must never navigate. */ }

  async function navigate() {
    if (!destination || pending.current) return;
    pending.current = true;
    try {
      const accepted = await confirm(t("externalLink.confirm", { destination }));
      if (accepted && active.current) window.location.assign(destination);
    } finally { pending.current = false; }
  }

  // Intentionally omit the native href: modified clicks and browser link menus
  // must not bypass the confirmation. React Aria retains link keyboard behavior.
  return <LinkButton variant="link" className={className} isDisabled={!destination} onPress={() => void navigate()}>
    {children}
    <IconExternalLink data-icon="inline-end" aria-hidden="true" />
    <span className="sr-only">{t("externalLink.hint")}</span>
  </LinkButton>;
}
