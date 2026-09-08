import { createContext, useContext } from "react";

export const ConfirmationContext = createContext<((message: string) => Promise<boolean>) | null>(null);

export function useConfirmation() {
  const confirm = useContext(ConfirmationContext);
  if (!confirm) throw new Error("useConfirmation requires ConfirmationProvider");
  return confirm;
}
