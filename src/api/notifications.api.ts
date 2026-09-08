import { apiGet, apiPatch, apiPost } from "./http-client";
import { getSelectedUnitCode } from "./session.api";

export type UserNotification = {
  notificationCode?: string;
  notificationType?: string;
  severity?: string;
  title?: string;
  body?: string;
  linkUrl?: string;
  entityType?: string;
  entityCode?: string;
  metadata?: Record<string, unknown>;
  isRead?: boolean;
  createdAt?: string;
};

export type NotificationSummary = {
  unreadCount?: number;
  latestCreatedAt?: string | null;
};

type ListResponse<T> = {
  data: T[];
  count: number;
};

type DetailResponse<T> = {
  data: T;
};

export async function listUserNotifications(params?: {
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
  unitCode?: string;
}): Promise<UserNotification[]> {
  const query = new URLSearchParams({
    unit_code: params?.unitCode ?? getSelectedUnitCode(),
    unread_only: String(params?.unreadOnly ?? false),
    limit: String(params?.limit ?? 20),
    offset: String(params?.offset ?? 0),
  });
  const result = await apiGet<ListResponse<UserNotification>>(`/notifications?${query.toString()}`);
  return result.data.data;
}

export async function getNotificationSummary(unitCode = getSelectedUnitCode()): Promise<NotificationSummary> {
  const query = new URLSearchParams({ unit_code: unitCode });
  const result = await apiGet<DetailResponse<NotificationSummary>>(`/notifications/summary?${query.toString()}`);
  return result.data.data;
}

export async function setNotificationRead(notificationCode: string, isRead = true): Promise<UserNotification> {
  const result = await apiPatch<DetailResponse<UserNotification>, { is_read: boolean }>(
    `/notifications/${encodeURIComponent(notificationCode)}/read`,
    { is_read: isRead },
  );
  return result.data.data;
}

export async function markAllNotificationsRead(unitCode = getSelectedUnitCode()): Promise<Record<string, number>> {
  const query = new URLSearchParams({ unit_code: unitCode });
  const result = await apiPost<DetailResponse<Record<string, number>>, Record<string, never>>(
    `/notifications/mark-all-read?${query.toString()}`,
    {},
  );
  return result.data.data;
}
