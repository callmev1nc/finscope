"use client";

import type { FieldDefinition } from "@/lib/tools/types";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface FormFieldProps {
  field: FieldDefinition;
  value: string | number | undefined;
  error?: string;
  onChange: (key: string, value: string) => void;
}

export function FormField({ field, value, error, onChange }: FormFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onChange(field.key, e.target.value);
  };

  const inputValue = value?.toString() ?? "";

  if (field.type === "select" && field.options) {
    return (
      <Select
        label={field.label}
        options={field.options}
        placeholder="Select..."
        value={inputValue}
        onChange={handleChange}
        error={error}
      />
    );
  }

  return (
    <Input
      label={field.label}
      type={field.type === "currency" || field.type === "number" ? "number" : "text"}
      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
      prefix={field.prefix}
      suffix={field.suffix}
      min={field.min}
      max={field.max}
      step={field.step ?? (field.type === "currency" ? "100" : "any")}
      value={inputValue}
      onChange={handleChange}
      error={error}
      tooltip={field.tooltip}
      required={field.required}
    />
  );
}
