import type { z } from "zod";
import { toast } from "@/components/ui/toast";

export type FieldErrors = Record<string, string | undefined>;

export type FormValidation<T> =
  | { ok: true; data: T; errors: FieldErrors }
  | { ok: false; errors: FieldErrors };

/**
 * Validates a form with zod. On failure every field gets its first message (for the inline
 * TooltipAlert) and the first problem is shown once as a warning toast, so all customer
 * forms report errors the same way: field hint + toast.
 */
export function validateForm<S extends z.ZodType>(
  schema: S,
  values: z.input<S>,
): FormValidation<z.output<S>> {
  const result = schema.safeParse(values);
  if (result.success) return { ok: true, data: result.data, errors: {} };

  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const field = String(issue.path[0] ?? "form");
    errors[field] ??= issue.message;
  }
  toast.add({ type: "warning", description: result.error.issues[0]?.message ?? "Check the form and try again." });
  return { ok: false, errors };
}
