export const AUTH_STORAGE_KEYS = {
  accessToken: "ssd_access_token",
  refreshToken: "ssd_refresh_token",
  currentUser: "ssd_current_user",
  lastActivity: "ssd_last_activity_at",
  selectedUnitCode: "ssd_selected_unit_code",
  selectedLocale: "ssd_selected_locale",
} as const;

const DEFAULT_UNIT_CODE = "SDG";

export function getStoredAccessToken(): string {
  return window.localStorage.getItem(AUTH_STORAGE_KEYS.accessToken) ?? "";
}

export function getStoredRefreshToken(): string {
  return window.localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken) ?? "";
}

export function setStoredAccessToken(accessToken: string): void {
  window.localStorage.setItem(AUTH_STORAGE_KEYS.accessToken, accessToken);
}

export function setStoredRefreshToken(refreshToken: string): void {
  window.localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, refreshToken);
}

export function getStoredUnitCode(): string {
  const selectedUnitCode = window.localStorage.getItem(AUTH_STORAGE_KEYS.selectedUnitCode)?.trim();
  if (selectedUnitCode) return selectedUnitCode.toUpperCase();

  const storedUser = window.localStorage.getItem(AUTH_STORAGE_KEYS.currentUser);
  if (storedUser) {
    try {
      const currentUser = JSON.parse(storedUser) as { unitCode?: string };
      if (currentUser.unitCode?.trim()) return currentUser.unitCode.trim().toUpperCase();
    } catch {
      // Fall through to the established application default.
    }
  }

  return DEFAULT_UNIT_CODE;
}

export function clearStoredAuth(includePreferences = false): void {
  window.localStorage.removeItem(AUTH_STORAGE_KEYS.accessToken);
  window.localStorage.removeItem(AUTH_STORAGE_KEYS.refreshToken);
  window.localStorage.removeItem(AUTH_STORAGE_KEYS.currentUser);
  window.localStorage.removeItem(AUTH_STORAGE_KEYS.lastActivity);

  if (includePreferences) {
    window.localStorage.removeItem(AUTH_STORAGE_KEYS.selectedUnitCode);
    window.localStorage.removeItem(AUTH_STORAGE_KEYS.selectedLocale);
  }
}
