"use client";

import { useState, useCallback, useMemo } from "react";
import type { FieldDefinition, ToolInputs } from "@/lib/tools/types";

export function useToolForm(fields: FieldDefinition[]) {
  const initialValues = useMemo(() => {
    const vals: ToolInputs = {};
    for (const field of fields) {
      if (field.defaultValue !== undefined) {
        vals[field.key] = field.defaultValue;
      }
    }
    return vals;
  }, [fields]);

  const [values, setValues] = useState<ToolInputs>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback((key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  const setAllValues = useCallback((vals: ToolInputs) => {
    setValues(vals);
  }, []);

  return {
    values,
    errors,
    setErrors,
    handleChange,
    reset,
    setAllValues,
  };
}
