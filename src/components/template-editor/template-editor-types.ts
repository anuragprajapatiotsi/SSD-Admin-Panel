export type TemplateEditorMode = "create" | "edit";

export type TemplateMetadataFormValues = {
  templateName: string;
  ministryIds: string[];
};

export type TemplateConfirmationIntent = "exit" | "remove-file";
