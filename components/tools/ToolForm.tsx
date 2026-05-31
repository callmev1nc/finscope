"use client";

import type { FieldDefinition, ToolInputs } from "@/lib/tools/types";
import { FormField } from "./FormField";
import { Button } from "@/components/ui/Button";
import { Calculator, RefreshCw } from "lucide-react";

interface ToolFormProps {
  fields: FieldDefinition[];
  values: ToolInputs;
  errors: Record<string, string>;
  isCalculating: boolean;
  onChange: (key: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
}

function groupFields(fields: FieldDefinition[]): Record<string, FieldDefinition[]> {
  const groups: Record<string, FieldDefinition[]> = {};
  for (const field of fields) {
    const group = field.group || "General";
    if (!groups[group]) groups[group] = [];
    groups[group].push(field);
  }
  return groups;
}

export function ToolForm({
  fields,
  values,
  errors,
  isCalculating,
  onChange,
  onSubmit,
  onReset,
}: ToolFormProps) {
  const groups = groupFields(fields);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {Object.entries(groups).map(([group, groupFields]) => (
        <div key={group}>
          <h4 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            {group}
          </h4>
          <div className="space-y-4">
            {groupFields.map((field) => (
              <FormField
                key={field.key}
                field={field}
                value={values[field.key]}
                error={errors[field.key]}
                onChange={onChange}
              />
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isCalculating}
          leftIcon={<Calculator className="h-4 w-4" />}
        >
          Calculate
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="md"
          onClick={onReset}
          leftIcon={<RefreshCw className="h-4 w-4" />}
        >
          Reset
        </Button>
      </div>
    </form>
  );
}
