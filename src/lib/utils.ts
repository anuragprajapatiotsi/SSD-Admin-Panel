import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts backend identifiers into readable labels without changing the
 * original value used by API requests or application state.
 */
export function formatCodeLabel(value: string | null | undefined) {
  const normalized = String(value ?? "")
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")

  if (!normalized) return ""

  return normalized
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase())
}
