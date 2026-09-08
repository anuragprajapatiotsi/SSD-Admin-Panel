import { useCallback, useEffect, useRef, useState, type PropsWithChildren } from "react";
import { ConfirmationContext } from "@/hooks/use-confirmation";
import { useTranslation } from "react-i18next";
import { AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

export function ConfirmationProvider({ children }: PropsWithChildren) {
  const { t } = useTranslation("common");
  const [message, setMessage] = useState<string | null>(null);
  const resolveRef = useRef<((confirmed: boolean) => void) | null>(null);
  const confirm = useCallback((nextMessage: string) => {
    if (resolveRef.current) return Promise.resolve(false);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setMessage(nextMessage);
    });
  }, []);
  const finish = (confirmed: boolean) => {
    const resolve = resolveRef.current;
    resolveRef.current = null;
    setMessage(null);
    resolve?.(confirmed);
  };
  useEffect(() => () => { resolveRef.current?.(false); }, []);

  return <ConfirmationContext.Provider value={confirm}>
    {children}
    <AlertDialogContent isOpen={message !== null} onOpenChange={(open) => { if (!open) finish(false); }}>
      <AlertDialogHeader>
        <AlertDialogTitle>{t("confirmation.title")}</AlertDialogTitle>
        <AlertDialogDescription>{message}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel slot={null} onPress={() => finish(false)}>{t("confirmation.cancel")}</AlertDialogCancel>
        {/* Resolve first; the dialog close slot would trigger cancellation before confirmation. */}
        <AlertDialogAction slot={null} onPress={() => finish(true)}>{t("confirmation.confirm")}</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </ConfirmationContext.Provider>;
}
