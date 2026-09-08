import { useOutletContext } from "react-router-dom";

export type AppShellLayoutContext = {
  collapseHeader: () => void;
  isHeaderExpanded: boolean;
  setImmersiveContent: (isActive: boolean) => void;
  toggleHeader: () => void;
};

export function useAppShellLayout() {
  return useOutletContext<AppShellLayoutContext>();
}
