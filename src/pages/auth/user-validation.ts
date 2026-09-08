import { z } from "zod";

export function createOptionalMobileNumberSchema(message: string) {
  return z.string().trim().refine((value) => !value || /^\d{10}$/.test(value), message);
}

export const optionalMobileNumberSchema = createOptionalMobileNumberSchema("Mobile number must contain exactly 10 digits.");
