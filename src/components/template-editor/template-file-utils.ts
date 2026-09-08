export const supportedTemplateExtensions = [".xlsx", ".csv"];

export function templateFileExtension(fileName: string) {
  const index = fileName.lastIndexOf(".");
  return index >= 0 ? fileName.slice(index).toLowerCase() : "";
}

export function templateNameFromFile(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "").trim();
}

export function templateOutputExtension(fileName: string) {
  return templateFileExtension(fileName) === ".csv" ? ".csv" : ".xlsx";
}

export function isSupportedTemplateFile(file: File) {
  return supportedTemplateExtensions.includes(templateFileExtension(file.name));
}

export function formatTemplateFileSize(bytes: number, locale: string) {
  if (bytes < 1024) return `${bytes.toLocaleString(locale)} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024).toLocaleString(locale)} KB`;
  return `${(bytes / (1024 * 1024)).toLocaleString(locale, { maximumFractionDigits: 1 })} MB`;
}
