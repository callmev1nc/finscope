import { z } from "zod";
import type { FieldDefinition } from "@/lib/tools/types";

export function generateSchema(fields: FieldDefinition[]): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    let schema: z.ZodTypeAny;

    switch (field.type) {
      case "currency":
      case "percentage":
      case "number": {
        // All numeric values must be >= 0 (or field.min if specified)
        // No arbitrary upper limits — users have different financial situations
        const minVal = field.min ?? 0;
        const numSchema = z.coerce.number({
          message: `${field.label} must be a valid number`,
        });

        if (field.required) {
          schema = numSchema.min(minVal, `${field.label} must be at least ${minVal}`);
        } else {
          schema = numSchema.min(minVal, `${field.label} must be at least ${minVal}`).optional();
        }
        // No max enforcement — calculations produce warnings for unrealistic values
        break;
      }
      case "select":
        schema = field.required
          ? z.string().min(1, `${field.label} is required`)
          : z.string().optional();
        break;
      case "text":
        schema = field.required
          ? z.string().min(1, `${field.label} is required`)
          : z.string().optional();
        break;
      default:
        schema = field.required ? z.string().min(1) : z.string().optional();
    }

    shape[field.key] = schema;
  }

  return z.object(shape);
}
