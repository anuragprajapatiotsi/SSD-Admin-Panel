import { apiGet, apiPost, apiPublicGet, apiPublicPost } from "./http-client";
import {
  AUTH_STORAGE_KEYS,
  clearStoredAuth,
  getStoredAccessToken,
  setStoredAccessToken,
  setStoredRefreshToken,
} from "./auth-storage";

export type AuthRole = {
  role_code?: string;
  code?: string;
  role_name?: string;
  name?: string;
  unit_code?: string;
};

export type AuthProfile = {
  id?: string;
  user_id?: string;
  username?: string;
  email?: string;
  status?: string;
  display_name?: string;
  displayName?: string;
  first_name?: string;
  last_name?: string;
  preferred_language_code?: string;
  owning_unit_code?: string;
  default_unit_code?: string;
  unit_code?: string;
};

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  auth_session_id: string;
  user_profile: AuthProfile;
  roles: AuthRole[];
  permissions: Record<string, unknown>[];
  pages: Record<string, unknown>[];
  review_levels: Record<string, unknown>[];
};

export type CaptchaChallengeResponse = {
  challenge_id: string;
  challenge_image: string;
  expires_in_seconds: number;
};

export type LoginRequest = {
  login_identifier: string;
  password: string;
  captcha_challenge_id: string;
  captcha_response: string;
};

export type CurrentProfileResponse = Pick<
  LoginResponse,
  "user_profile" | "roles" | "permissions" | "pages" | "review_levels"
>;

export type CurrentUser = {
  userId?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  displayName: string;
  email: string;
  status?: string;
  preferredLocale?: string;
  unitCode?: string;
  defaultUnitCode?: string;
  roles: string[];
};

export type UnitOption = {
  unit_code: string;
  unit_name?: string;
  name?: string;
  display_name?: string;
  global_mapping_enabled?: boolean;
  globalMappingEnabled?: boolean;
  is_active?: boolean;
};

export type ForgotPasswordLinkResponse = { link_sent: boolean };
export type PasswordUpdateResponse = { password_updated: boolean };

export async function changePassword(currentPassword: string, newPassword: string): Promise<PasswordUpdateResponse> {
  const result = await apiPost<PasswordUpdateResponse, { current_password: string; new_password: string }>(
    "/auth/password/change",
    { current_password: currentPassword, new_password: newPassword },
  );
  return result.data;
}

export async function requestForgotPasswordLink(email: string): Promise<ForgotPasswordLinkResponse> {
  const result = await apiPublicPost<ForgotPasswordLinkResponse, { email: string }>("/auth/password/forgot/request-link", { email });
  return result.data;
}

export async function resetForgottenPassword(resetToken: string, newPassword: string): Promise<PasswordUpdateResponse> {
  const result = await apiPublicPost<PasswordUpdateResponse, { reset_token: string; new_password: string }>("/auth/password/forgot/reset", { reset_token: resetToken, new_password: newPassword });
  return result.data;
}

const CURRENT_USER_KEY = AUTH_STORAGE_KEYS.currentUser;
const LAST_ACTIVITY_KEY = AUTH_STORAGE_KEYS.lastActivity;
const SELECTED_UNIT_CODE_KEY = AUTH_STORAGE_KEYS.selectedUnitCode;
const SELECTED_LOCALE_KEY = AUTH_STORAGE_KEYS.selectedLocale;
export const AUTH_EXPIRED_EVENT = "ssd-auth-expired";
export const UNIT_CHANGED_EVENT = "ssd-unit-changed";
export const LOCALE_CHANGED_EVENT = "ssd-locale-changed";
export const ADMIN_PORTAL_ACCESS_DENIED_ERROR = "ADMIN_PORTAL_ACCESS_DENIED";
export const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
export const DEFAULT_UNIT_CODE = "SDG";
export const DEFAULT_LOCALE = "en-IN";

export async function getCaptchaChallenge(): Promise<CaptchaChallengeResponse> {
  const result = await apiPublicGet<CaptchaChallengeResponse>("/auth/captcha/challenge");
  return result.data;
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const result = await apiPublicPost<LoginResponse, LoginRequest>("/auth/login", payload);
  const currentUser = mapCurrentUser(result.data);

  assertAdminPortalAccess(currentUser);
  storeAuthSession(result.data);
  return result.data;
}

export async function loadCurrentUser(): Promise<CurrentUser> {
  const result = await apiGet<CurrentProfileResponse>("/auth/me");
  const currentUser = mapCurrentUser(result.data);
  assertAdminPortalAccess(currentUser);
  window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
  return currentUser;
}

export function getLocalCurrentUser(): CurrentUser {
  const stored = window.localStorage.getItem(CURRENT_USER_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as CurrentUser;
    } catch {
      clearAuthSession();
    }
  }

  return {
    displayName: "",
    email: "",
    roles: [],
  };
}

export function isSuperAdmin(user: CurrentUser): boolean {
  return user.roles.some((role) => ["SUPER_ADMIN", "SUPERADMIN"].includes(role.toUpperCase()));
}

export function isAdminPortalAccessDeniedError(error: unknown): boolean {
  return error instanceof Error && error.message === ADMIN_PORTAL_ACCESS_DENIED_ERROR;
}

export function isPillarAdmin(user: CurrentUser): boolean {
  return user.roles.some((role) => ["UNIT_ADMIN", "UNITADMIN", "PILLAR_ADMIN", "PILLARADMIN"].includes(role.toUpperCase()));
}

export function getPillarRootCode(unitCode?: string): string {
  const normalized = (unitCode || DEFAULT_UNIT_CODE).trim().toUpperCase();
  if (normalized.startsWith("ENV")) return "ENV";
  if (normalized.startsWith("SWS")) return "SWS";
  if (normalized.startsWith("BRICS")) return "BRICS";
  if (normalized.startsWith("SDG")) return "SDG";
  return normalized.split("_")[0] || normalized;
}

export function isUnitInPillar(unitCode: string | undefined, pillarRootCode: string): boolean {
  const normalizedUnit = (unitCode || "").trim().toUpperCase();
  const normalizedPillar = getPillarRootCode(pillarRootCode);
  return normalizedUnit === normalizedPillar || normalizedUnit.startsWith(`${normalizedPillar}_`);
}

export function knownPillarOptions(rootCode: string): UnitOption[] {
  const root = getPillarRootCode(rootCode);
  const known: Record<string, string[]> = {
    SDG: ["SDG"],
    ENV: ["ENV", "ENV_ACC", "ENV_STATS"],
    SWS: ["SWS", "SWS_YOUTH", "SWS_WOMEN_AND_MEN", "SWS_CHILDREN", "SWS_ELDERLY"],
    BRICS: ["BRICS"],
  };
  return (known[root] ?? [root]).map((unit_code) => ({
    unit_code,
    unit_name: unit_code,
    global_mapping_enabled: unit_code === "SDG",
    globalMappingEnabled: unit_code === "SDG",
  }));
}

export function knownAllUnitOptions(): UnitOption[] {
  return ["SDG", "ENV", "SWS", "BRICS"].flatMap((rootCode) => knownPillarOptions(rootCode));
}

function mergeUnitOptions(...groups: UnitOption[][]): UnitOption[] {
  const byCode = new Map<string, UnitOption>();
  groups.flat().forEach((unit) => {
    const code = (unit.unit_code || "").trim().toUpperCase();
    if (!code) return;
    const existing = byCode.get(code);
    byCode.set(code, {
      ...unit,
      ...existing,
      unit_code: code,
      unit_name: existing?.unit_name || unit.unit_name || unit.display_name || unit.name || code,
      global_mapping_enabled: existing?.global_mapping_enabled ?? existing?.globalMappingEnabled ?? unit.global_mapping_enabled ?? unit.globalMappingEnabled ?? false,
      globalMappingEnabled: existing?.globalMappingEnabled ?? existing?.global_mapping_enabled ?? unit.globalMappingEnabled ?? unit.global_mapping_enabled ?? false,
    });
  });
  return Array.from(byCode.values()).sort((left, right) =>
    (left.unit_name || left.unit_code).localeCompare(right.unit_name || right.unit_code),
  );
}

export function unitGlobalMappingEnabled(unit?: UnitOption | null): boolean {
  return Boolean(unit?.global_mapping_enabled ?? unit?.globalMappingEnabled);
}

export function selectedUnitGlobalMappingEnabled(units: UnitOption[], selectedUnitCode = getSelectedUnitCode()): boolean {
  const normalizedUnitCode = (selectedUnitCode || DEFAULT_UNIT_CODE).trim().toUpperCase();
  const selectedUnit = units.find((unit) => unit.unit_code?.trim().toUpperCase() === normalizedUnitCode);
  if (selectedUnit) return unitGlobalMappingEnabled(selectedUnit);
  return normalizedUnitCode === "SDG";
}

export function getSelectedUnitCode(): string {
  return (
    window.localStorage.getItem(SELECTED_UNIT_CODE_KEY) ||
    getLocalCurrentUser().unitCode ||
    DEFAULT_UNIT_CODE
  )
    .trim()
    .toUpperCase();
}

export function setSelectedUnitCode(unitCode: string): void {
  const normalizedUnitCode = (unitCode || DEFAULT_UNIT_CODE).trim().toUpperCase();
  window.localStorage.setItem(SELECTED_UNIT_CODE_KEY, normalizedUnitCode);
  window.dispatchEvent(new CustomEvent(UNIT_CHANGED_EVENT, { detail: { unitCode: normalizedUnitCode } }));
}

export function getSelectedLocale(): string {
  return window.localStorage.getItem(SELECTED_LOCALE_KEY) || DEFAULT_LOCALE;
}

export function setSelectedLocale(locale: string): void {
  const normalizedLocale = locale || DEFAULT_LOCALE;
  window.localStorage.setItem(SELECTED_LOCALE_KEY, normalizedLocale);
  window.dispatchEvent(new CustomEvent(LOCALE_CHANGED_EVENT, { detail: { locale: normalizedLocale } }));
}

export async function listAvailableUnits(): Promise<UnitOption[]> {
  const knownUnits = knownAllUnitOptions();
  try {
    const result = await apiGet<{ data: UnitOption[]; count: number }>("/auth/admin/units?include_inactive=false&locale=en-IN");
    const rows = result.data.data.filter((unit) => unit.unit_code);
    return mergeUnitOptions(rows, knownUnits);
  } catch {
    // Fall through to the local catalog so unit selectors remain usable if auth-unit lookup is unavailable.
  }
  return mergeUnitOptions(knownUnits);
}

export function hasActiveSession(): boolean {
  return Boolean(getStoredAccessToken());
}

export function markSessionActivity(): void {
  window.localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
}

export function isSessionIdleExpired(): boolean {
  const lastActivity = Number(window.localStorage.getItem(LAST_ACTIVITY_KEY) ?? Date.now());
  return Date.now() - lastActivity > IDLE_TIMEOUT_MS;
}

export function getPostLoginPath(roles: string[]): string {
  const normalizedRoles = roles.map((role) => role.toUpperCase());
  if (normalizedRoles.includes("SUPER_ADMIN") || normalizedRoles.includes("SUPERADMIN")) {
    return "/";
  }
  if (
    normalizedRoles.includes("UNIT_ADMIN") ||
    normalizedRoles.includes("UNITADMIN") ||
    normalizedRoles.includes("PILLAR_ADMIN") ||
    normalizedRoles.includes("PILLARADMIN")
  ) {
    return "/dashboard";
  }
  return "/";
}

export async function logout(): Promise<void> {
  try {
    await apiPost<{ logged_out: boolean }, Record<string, never>>("/auth/logout", {});
  } finally {
    clearAuthSession();
  }
}

function storeAuthSession(response: LoginResponse): void {
  const currentUser = mapCurrentUser(response);
  setStoredAccessToken(response.access_token);
  setStoredRefreshToken(response.refresh_token);
  window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
  if (!isSuperAdmin(currentUser)) {
    const defaultPillarCode = isPillarAdmin(currentUser)
      ? (currentUser.defaultUnitCode || getPillarRootCode(currentUser.unitCode))
      : (currentUser.unitCode || DEFAULT_UNIT_CODE).trim().toUpperCase();
    window.localStorage.setItem(SELECTED_UNIT_CODE_KEY, defaultPillarCode);
  }
  markSessionActivity();
}

function assertAdminPortalAccess(user: CurrentUser): void {
  // Temporary client-side gate. The backend must ultimately enforce the same
  // role requirement before issuing tokens and on every admin endpoint.
  if (isSuperAdmin(user)) return;
  clearStoredAuth(false);
  throw new Error(ADMIN_PORTAL_ACCESS_DENIED_ERROR);
}

export function clearAuthSession(): void {
  clearStoredAuth(true);
}

function mapCurrentUser(response: CurrentProfileResponse): CurrentUser {
  const profile = response.user_profile ?? {};
  const roleUnitCode = response.roles.find((role) => role.unit_code)?.unit_code;
  const displayName =
    profile.display_name ??
    profile.displayName ??
    ([profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
      profile.username ||
      "SSD User");

  return {
    userId: profile.id ?? profile.user_id,
    username: profile.username,
    firstName: profile.first_name,
    lastName: profile.last_name,
    displayName,
    email: profile.email ?? "",
    status: profile.status,
    preferredLocale: profile.preferred_language_code,
    unitCode: profile.owning_unit_code ?? profile.default_unit_code ?? profile.unit_code ?? roleUnitCode,
    defaultUnitCode: profile.default_unit_code,
    roles: response.roles.map((role) => role.role_code ?? role.code ?? role.role_name ?? role.name ?? "USER"),
  };
}
