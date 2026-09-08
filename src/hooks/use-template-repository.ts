import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTemplateRepositoryVersion,
  deleteTemplateRepositoryItem,
  getTemplateRepositoryFile,
  getTemplateRepositoryItem,
  getTemplateRepositoryVersionFile,
  getTemplateRepositoryItems,
  updateTemplateRepositoryItem,
  type TemplateRepositoryFilters,
  type CreateTemplateRepositoryVersionPayload,
  type UpdateTemplateRepositoryPayload,
} from "../services/template-repository.service";
import {
  uploadTemplateFile,
  type UploadTemplateFilePayload,
} from "../api/templates.api";

export const templateRepositoryKeys = {
  all: ["template-repository"] as const,
  lists: () => [...templateRepositoryKeys.all, "list"] as const,
  list: (filters: TemplateRepositoryFilters = {}) => [
    ...templateRepositoryKeys.lists(),
    {
      searchText: filters.searchText?.trim() ?? "",
      ministryIds: filters.ministryIds ?? [],
    },
  ] as const,
  detail: (templateId: string) => [...templateRepositoryKeys.all, "detail", templateId] as const,
  file: (templateId: string) => [...templateRepositoryKeys.all, "file", templateId] as const,
  versionFile: (versionId: string) => [
    ...templateRepositoryKeys.all,
    "version-file",
    versionId,
  ] as const,
};

export function useTemplateRepositoryItems(filters: TemplateRepositoryFilters = {}, enabled = true) {
  return useQuery({
    queryKey: templateRepositoryKeys.list(filters),
    queryFn: () => getTemplateRepositoryItems(filters),
    enabled,
    placeholderData: (previousData) => previousData,
  });
}

export function useTemplateRepositoryItem(templateId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: templateRepositoryKeys.detail(templateId ?? ""),
    queryFn: () => getTemplateRepositoryItem(templateId!),
    enabled: enabled && Boolean(templateId),
  });
}

export function useTemplateRepositoryFile(templateId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: templateRepositoryKeys.file(templateId ?? ""),
    queryFn: () => getTemplateRepositoryFile(templateId!),
    enabled: enabled && Boolean(templateId),
    staleTime: 5 * 60_000,
  });
}

export function useTemplateRepositoryVersionFile(versionId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: templateRepositoryKeys.versionFile(versionId ?? ""),
    queryFn: () => getTemplateRepositoryVersionFile(versionId!),
    enabled: enabled && Boolean(versionId),
    staleTime: 5 * 60_000,
  });
}

export function useUpdateTemplateRepository() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateTemplateRepositoryPayload) => updateTemplateRepositoryItem(payload),
    onSuccess: async (updated, payload) => {
      queryClient.setQueryData(templateRepositoryKeys.detail(payload.templateId), updated);
      await queryClient.invalidateQueries({ queryKey: templateRepositoryKeys.all });
    },
  });
}

export function useCreateTemplateRepositoryVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTemplateRepositoryVersionPayload) => (
      createTemplateRepositoryVersion(payload)
    ),
    onSuccess: async (_version, payload) => {
      await queryClient.invalidateQueries({ queryKey: templateRepositoryKeys.detail(payload.templateId) });
      await queryClient.invalidateQueries({ queryKey: templateRepositoryKeys.lists() });
    },
  });
}

export function useCreateTemplateRepository() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UploadTemplateFilePayload) => uploadTemplateFile(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: templateRepositoryKeys.lists() });
    },
  });
}

export function useDeleteTemplateRepository() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTemplateRepositoryItem,
    onSuccess: async (_result, templateId) => {
      queryClient.removeQueries({ queryKey: templateRepositoryKeys.detail(templateId) });
      queryClient.removeQueries({ queryKey: templateRepositoryKeys.file(templateId) });
      await queryClient.invalidateQueries({ queryKey: templateRepositoryKeys.lists() });
    },
  });
}
