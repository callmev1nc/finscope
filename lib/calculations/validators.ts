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
        const numSchema = z.coerce.number();
        if (field.required) {
          schema = numSchema.min(field.min ?? 0, `${field.label} is required`);
        } else {
          schema = numSchema.optional();
        }
        if (field.max !== undefined) {
          schema = (schema as z.ZodNumber).max(field.max, `${field.label} must be at most ${field.max}`);
        }
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
